require('dotenv').config({ path: 'secure.env' });
const express = require('express');
const cors = require('cors');
const { getJson } = require('serpapi');
const nodemailer = require('nodemailer');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');

// Configure file uploads to reside temporarily inside device RAM buffers
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const aiKey = process.env.GEMINI_API_KEY;
const ai = aiKey ? new GoogleGenAI({ apiKey: aiKey }) : null;

/**
 * 🧼 ADVANCED PROFILE CLEANER & HUMAN NAME PARSER
 * Strips aggressive corporate aggregate titles and replaces them with standard fallback strings
 */
function extractCleanHumanName(title) {
    let rawName = title.split('-')[0].split('|')[0].split(':')[0].trim();

    const junkPatterns = [
        'jobs', 'employment', 'hiring', 'recruitment', 'work', 'careers',
        'positions', 'openings', 'top', 'best', 'resume', 'cv', 'developer'
    ];

    const containsJunk = junkPatterns.some(pattern => rawName.toLowerCase().includes(pattern));
    const hasNumbers = /\d/.test(rawName);

    if (containsJunk || hasNumbers || rawName.length > 25 || rawName.length < 2) {
        return "Hiring Team";
    }
    return rawName;
}

/**
 * 🕵️‍♂️ DEEP PAGE SCRAPER FALLBACK HANDLER
 */
async function deepScrapeContactLinks(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OutreachPro/1.0' }
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;
        const html = await response.text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = html.match(emailRegex);

        if (matches && matches.length > 0) {
            return matches.find(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.gif'));
        }
        return null;
    } catch (err) {
        return null;
    }
}

/**
 * 🎯 PRIORITY SCORING ENGINE
 * Evaluates the depth of keyword matching since the query pool is now a wider 'OR' blend
 */
function scoreAndFilterLeads(results, keywords) {
    const lowerKeywords = keywords.map(kw => kw.toLowerCase());
    const scoredLeads = results.map(result => {
        let score = 0;
        const title = (result.title || "").toLowerCase();
        const snippet = (result.snippet || "").toLowerCase();

        // Cumulative depth mapping scoring block (Matches more skills = sits higher in the queue)
        lowerKeywords.forEach(kw => {
            if (title.includes(kw)) score += 10;
            if (snippet.includes(kw)) score += 4;
        });

        const recruitmentMarkers = ['hiring', 'recruiter', 'hr', 'talent', 'acquisition', 'manager', 'founder', 'ceo', 'lead'];
        recruitmentMarkers.forEach(marker => {
            if (title.includes(marker)) score += 12;
            if (snippet.includes(marker)) score += 5;
        });

        const negativeMarkers = ['seeking', 'open to work', 'looking for roles', 'student', 'jobs in'];
        negativeMarkers.forEach(marker => {
            if (title.includes(marker) || snippet.includes(marker)) score -= 25;
        });

        return { ...result, priorityScore: score };
    });

    return scoredLeads.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * ✨ LIVE GEMINI AI TEMPLATE GENERATION ENDPOINT
 */
app.post('/api/generate-template', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt cannot be empty." });
    if (!ai) return res.status(500).json({ error: "Gemini API key missing on server." });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a crisp cold application email body for: "${prompt}". Use "{name}" for recipient name and "[Your Name]" for sign-off. Under 120 words. No subject line.`
        });
        return res.status(200).json({ text: response.text });
    } catch (error) {
        return res.status(500).json({ error: "Failed to generate AI template." });
    }
});

/**
 * 🚀 PRODUCTION PIPELINE ENDPOINT WITH GLOBAL HORIZON PRIORITY SCORING
 */
app.post('/api/execute-pipeline', upload.single('resume'), async (req, res) => {
    const {
        serpApiKey, gmailUser, gmailAppPass, keywordTags, platforms, leadLimit, subject, bodyText,
        contactedHistory
    } = req.body;

    const parsedKeywords = JSON.parse(keywordTags || '[]');
    const parsedPlatforms = JSON.parse(platforms || '{}');
    const blacklist = JSON.parse(contactedHistory || '[]');

    const activeSerpKey = serpApiKey || process.env.SERPAPI_KEY;
    const activeGmailUser = gmailUser || process.env.GMAIL_USER;
    const activeGmailPass = gmailAppPass || process.env.GMAIL_APP_PASSWORD;

    if (!activeSerpKey || !activeGmailUser || !activeGmailPass) {
        return res.status(400).json({ error: "Missing authentic credentials tokens." });
    }

    let siteQueries = [];
    if (parsedPlatforms.linkedin) siteQueries.push("site:linkedin.com/in/");
    if (parsedPlatforms.twitter) siteQueries.push("site:twitter.com", "site:x.com");
    if (parsedPlatforms.indeed) siteQueries.push("site:indeed.com/q-");
    if (parsedPlatforms.internshala) siteQueries.push("site:internshala.com");
    if (siteQueries.length === 0) siteQueries = ["site:linkedin.com/in/", "site:internshala.com"];

    const baseSitesStr = `(${siteQueries.join(' OR ')})`;
    const skillKeywordsStr = `(${parsedKeywords.map(kw => `"${kw}"`).join(' OR ')})`;
    const recruitmentConstraint = `("HR" OR "Recruiter" OR "Hiring" OR "Talent" OR "Founder" OR "CEO" OR "Manager")`;
    const finalSearchQuery = `${baseSitesStr} ${skillKeywordsStr} ${recruitmentConstraint} "@gmail.com"`;

    try {
        let globalHorizonPool = [];
        const offsetsToQuery = [0, 20, 40]; // Captures 3 full pages upfront

        console.log(`[*] Gathering Global Horizon Data Pool across 3 index layers simultaneously...`);

        for (const offset of offsetsToQuery) {
            try {
                const response = await getJson({
                    engine: "google",
                    api_key: activeSerpKey,
                    q: finalSearchQuery,
                    num: 20,
                    start: offset
                });

                const pageResults = response.organic_results || [];
                if (pageResults.length === 0) break;

                globalHorizonPool = [...globalHorizonPool, ...pageResults];
            } catch (e) {
                console.error(`[!] Failed fetching search offset batch ${offset}:`, e.message);
            }
        }

        if (globalHorizonPool.length === 0) {
            return res.status(404).json({ message: "No professional leads found matching current parameters." });
        }

        // ── 🛡️ FILTER BLACKLIST & DROPPED PROXIES FROM THE ENTIRE 60-RESULT POOL ──
        const globalSpamBlacklist = ['support@internshala.com', 'help@internshala.com', 'info@internshala.com', 'noreply@internshala.com', 'support@linkedin.com', 'support@x.com', 'feedback@', 'noreply@', 'privacy@'];
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        let validFreshLeads = [];

        for (const lead of globalHorizonPool) {
            if (blacklist.includes(lead.link)) continue;

            const snippet = lead.snippet || "";
            let foundEmail = (snippet.match(emailRegex) || [])[0];

            if (!foundEmail && lead.link && !lead.link.includes("linkedin.com")) {
                foundEmail = await deepScrapeContactLinks(lead.link);
            }

            if (!foundEmail) continue;

            const isSpam = globalSpamBlacklist.some(spam => foundEmail.toLowerCase() === spam || foundEmail.toLowerCase().startsWith('support@') || foundEmail.toLowerCase().startsWith('info@'));
            if (isSpam) continue;

            lead.extractedEmail = foundEmail.toLowerCase();
            validFreshLeads.push(lead);
        }

        if (validFreshLeads.length === 0) {
            return res.status(404).json({ message: "All targets across the global horizon pool have already been utilized." });
        }

        // ── 🏆 CROSS-PAGE GLOBAL PRIORITY RANKING ──
        const globallyRankedLeads = scoreAndFilterLeads(validFreshLeads, parsedKeywords);

        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: activeGmailUser, pass: activeGmailPass } });
        let successfulDispatches = 0;
        let newlyMessagedLinks = [];
        const targetDeliveryGoal = parseInt(leadLimit || 2, 10);

        for (const lead of globallyRankedLeads) {
            if (successfulDispatches >= targetDeliveryGoal) break;

            const recipientEmail = lead.extractedEmail;
            const targetUrl = lead.link;
            const humanName = extractCleanHumanName(lead.title || "");

            const personalizedBody = bodyText.replace(/{name}/g, humanName).replace(/\[Your Name\]/g, activeGmailUser.split('@')[0]);
            const mailOptions = { from: activeGmailUser, to: recipientEmail, subject: subject, text: personalizedBody, attachments: [] };
            if (req.file) { mailOptions.attachments.push({ filename: req.file.originalname, content: req.file.buffer }); }

            await transporter.sendMail(mailOptions);
            successfulDispatches++;
            newlyMessagedLinks.push(targetUrl);

            console.log(`[✓] Global Champion Dispatched: ${recipientEmail} | Priority Score Rank: ${lead.priorityScore}`);

            if (successfulDispatches < targetDeliveryGoal) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        return res.status(200).json({
            message: "Global Horizon Pipeline completed successfully.",
            leadsProcessed: successfulDispatches,
            emailsSent: successfulDispatches,
            newlyContacted: newlyMessagedLinks
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "An unexpected system loop anomaly occurred." });
    }
});

app.listen(PORT, () => {
    console.log(`[✓] OutreachPro API Core Engine actively deployed on port ${PORT}`);
});