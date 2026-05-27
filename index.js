require('dotenv').config({ path: 'secure.env' });
const { getJson } = require('serpapi');
const nodemailer = require('nodemailer');

async function generateLeadsAndEmail() {
    console.log("[*] Initiating lead generation search via SerpApi...");

    try {
        // 1. Search Google via SerpApi (Costs exactly 1 credit per script run)
        const response = await getJson({
            engine: "google",
            api_key: process.env.SERPAPI_KEY,
            q: "(site:linkedin.com/in/ OR site:facebook.com OR site:instagram.com) \"buyer\" \"singing bowls\" \"@gmail.com\"",
            num: 20
        });

        const results = response.organic_results || [];
        let foundEmails = new Set();

        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        // 2. Extract emails
        for (const result of results) {
            const snippet = result.snippet || "";
            const matches = snippet.match(emailRegex);
            if (matches) {
                matches.forEach(email => foundEmails.add(email));
            }
        }

        if (foundEmails.size === 0) {
            console.log("[!] Execution stopped: No target leads parsed from the query patterns.");
            return;
        }

        console.log(`[*] Successfully extracted ${foundEmails.size} unique leads from the web.`);

        // --- DEMO MODE RESTRICTION ---
        // Convert the Set to an Array and slice it to only keep the first 2 emails
        // const demoEmails = Array.from(foundEmails).slice(0, 2);
        const demoEmails = ["rudrakshsinghkhichi@gmail.com"];
        // for demo hard code my own address //- 
        console.log(`[*] DEMO MODE ACTIVE: Restricting email transmission to ${demoEmails.length} targets to save time and prevent spam.`);

        // 3. Configure Gmail SMTP 
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // 4. Send Emails
        for (const email of demoEmails) {
            console.log(`[*] Preparing transmission to: ${email}`);

            // --- DYNAMIC PLATFORM DETECTION ---
            let platformName = "social media";

            const matchingResult = results.find(r => r.snippet && r.snippet.includes(email));
            if (matchingResult && matchingResult.link) {
                const url = matchingResult.link.toLowerCase();
                if (url.includes("linkedin.com")) platformName = "LinkedIn";
                else if (url.includes("facebook.com")) platformName = "Facebook";
                else if (url.includes("instagram.com")) platformName = "Instagram";
            }

            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject: 'Exclusive Singing Bowls Supply - AgriSense',
                // Uses backticks (``) to dynamically drop the platform name right into the text string
                text: `Hello,\n\nI noticed your profile on ${platformName} and wanted to share our latest AgriSense catalog for premium singing bowls. Please find the presentation attached.\n\nBest regards.`,
                attachments: [
                    {
                        filename: 'AgriSense PPT.pptx',
                        path: './AgriSense PPT.pptx'
                    }
                ]
            };

            await transporter.sendMail(mailOptions);
            console.log(`[✓] Email successfully delivered to ${email} (Source: ${platformName})`);

            // Keeps your clean demo timing mechanism working smoothly!
            if (demoEmails.length > 1) {
                console.log("[*] Pausing for 5 seconds before next transmission...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log("[*] Lead generation sequence completed perfectly!");

    } catch (error) {
        console.error("[!] Error during execution:", error.message);
    }
}

generateLeadsAndEmail();