import React, { useState, useEffect } from 'react';

function App() {
  // ──🔑 IDENTITY & CREDENTIAL STATES (With Local Auto-Load) ─────────────
  const [serpApiKey, setSerpApiKey] = useState(() => {
    return localStorage.getItem('outreachpro_serpKey') || '';
  });
  const [gmailUser, setGmailUser] = useState(() => {
    return localStorage.getItem('outreachpro_gmailUser') || '';
  });
  const [gmailAppPass, setGmailAppPass] = useState(() => {
    return localStorage.getItem('outreachpro_gmailPass') || '';
  });
  const [showPassword, setShowPassword] = useState(false);

  // ──💾 AUTO-SAVE CREDENTIALS TO LOCAL STORAGE ─────────────────────────
  useEffect(() => {
    localStorage.setItem('outreachpro_serpKey', serpApiKey);
  }, [serpApiKey]);

  useEffect(() => {
    localStorage.setItem('outreachpro_gmailUser', gmailUser);
  }, [gmailUser]);

  useEffect(() => {
    localStorage.setItem('outreachpro_gmailPass', gmailAppPass);
  }, [gmailAppPass]);

  // ──🎯 DYNAMIC SEARCH KEYWORD TAGS SYSTEM ─────────────────────────────
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordTags, setKeywordTags] = useState([]);
  const [platforms, setPlatforms] = useState({ linkedin: false, twitter: false, indeed: false, internshala: false });
  const [leadLimit, setLeadLimit] = useState(2); 

  // ──✉️ EMAIL & DELIVERY CORE BLUEPRINT STATES ─────────────────────────
  const [subject, setSubject] = useState('Application for Frontend Internship Role');
  const [bodyText, setBodyText] = useState('Hello, I came across your profile and wanted to reach out regarding open positions...\n\nUse {name} to personalise per contact.');
  const [resumeFile, setResumeFile] = useState(null);

  // ──✨ AI GENERATOR STATES ──────────────────────────────────────────
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // ──📊 MONTHLY EMAIL USAGE TRACKER ────────────────────────────────────
  const [monthlyEmailsSent, setMonthlyEmailsSent] = useState(0);

  useEffect(() => {
    const currentMonthKey = `outreachpro_usage_${new Date().getFullYear()}_${new Date().getMonth()}`;
    const storedCount = localStorage.getItem(currentMonthKey);
    if (storedCount) {
      setMonthlyEmailsSent(parseInt(storedCount, 10));
    }
  }, []);

  const updateUsageCounter = (newEmailsSent) => {
    const currentMonthKey = `outreachpro_usage_${new Date().getFullYear()}_${new Date().getMonth()}`;
    const updatedTotal = monthlyEmailsSent + newEmailsSent;
    setMonthlyEmailsSent(updatedTotal);
    localStorage.setItem(currentMonthKey, updatedTotal.toString());
  };

  // ──🎬 MODAL & TRAINING VIDEO TABS STATE ──────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('serp'); 
  const [activeTab, setActiveTab] = useState('video'); 
  const [videoLoaded, setVideoLoaded] = useState(false);

  // ──🚀 PIPELINE EXECUTION PROGRESS SIMULATOR ──────────────────────────
  const [isLaunching, setIsLaunching] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Initialising pipeline…');

  const handleGmailPassChange = (e) => {
    const cleanValue = e.target.value.replace(/\s+/g, '');
    if (cleanValue.length <= 16) {
      setGmailAppPass(cleanValue);
    }
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (keywordInput.trim() !== '') {
      setKeywordTags([...keywordTags, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (indexToRemove) => {
    setKeywordTags(keywordTags.filter((_, index) => index !== indexToRemove));
  };

  const openHelpModal = (type) => {
    setModalType(type);
    setActiveTab('video');
    setVideoLoaded(false);
    setIsModalOpen(true);
  };

  // ──✨ LIVE GEMINI AI GENERATOR VIA EXPRESS BACKEND ───────────────────
  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAi(true);
    try {
      const response = await fetch('https://outreachpro.onrender.com/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI Generation error.");
      
      setBodyText(data.text);
      setAiPrompt('');
    } catch (err) {
      alert(`AI Copywriter Error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // ──🚀 PRODUCTION FULL-STACK PIPELINE RUNNER ─────────────────────────
  const handleLaunch = async (e) => {
    if (e) e.preventDefault();
    if (keywordTags.length === 0) {
      alert("Please assign at least one keyword target tag first.");
      return;
    }

    setIsLaunching(true);
    setProgressPct(5);
    setProgressLabel('Initialising pipeline configurations…');

    try {
      setTimeout(() => { setProgressPct(20); setProgressLabel('Connecting to platform X-Ray search grids…'); }, 500);
      setTimeout(() => { setProgressPct(45); setProgressLabel('Scraping profiles & triggering deep webpage fallback crawlers…'); }, 1500);

      const campaignSignature = btoa(keywordTags.join(','));
      const contactedHistory = JSON.parse(localStorage.getItem(`outreachpro_sent_${campaignSignature}`) || '[]');

      const formData = new FormData();
      formData.append('serpApiKey', serpApiKey);
      formData.append('gmailUser', gmailUser);
      formData.append('gmailAppPass', gmailAppPass);
      formData.append('keywordTags', JSON.stringify(keywordTags));
      formData.append('platforms', JSON.stringify(platforms));
      formData.append('leadLimit', leadLimit);
      formData.append('subject', subject);
      formData.append('bodyText', bodyText);
      formData.append('contactedHistory', JSON.stringify(contactedHistory));
      
      if (resumeFile) {
        formData.append('resume', resumeFile); 
      }

      //  PROTOCOL HOTFIX: Upgraded endpoint communication to secure HTTPS layer
      const response = await fetch('https://outreachpro.onrender.com/api/execute-pipeline', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Execution pipeline failure.");

      setProgressPct(80);
      setProgressLabel(`Priority ranking isolated data streams. Wrapping SMTP delivery configurations...`);
      
      setTimeout(() => {
        setProgressPct(100);
        setProgressLabel(`🎉 Pipeline complete — Successfully delivered ${data.emailsSent} highly optimized emails!`);
        
        // ── 🔓 AUTOMATIC RESET LOCK RE-ACTIVATION ──
        setIsLaunching(false);
        
        if (data.newlyContacted && data.newlyContacted.length > 0) {
          const updatedHistory = [...contactedHistory, ...data.newlyContacted];
          localStorage.setItem(`outreachpro_sent_${campaignSignature}`, JSON.stringify(updatedHistory));
        }

        updateUsageCounter(data.emailsSent); 
      }, 1200);

    } catch (error) {
      console.error(error);
      setProgressPct(0);
      setProgressLabel(`❌ Pipeline Failed: ${error.message}`);
      setIsLaunching(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06060f] text-[#f1f0ff] font-sans antialiased selection:bg-[#6c63ff]/30 selection:text-white flex flex-col justify-between">
      
      <div className="relative z-10 w-full flex-grow">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(108,99,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <div className="pointer-events-none fixed -left-[150px] -top-[150px] z-0 h-[500px] w-[500px] rounded-full bg-[#6c63ff]/12 blur-[100px]" />
        <div className="pointer-events-none fixed right-0 bottom-0 z-0 h-[400px] w-[400px] rounded-full bg-[#38bdf8]/0.07 blur-[100px]" />

        {/* HEADER NAVIGATION */}
        <nav className="sticky top-0 z-40 bg-[#06060f]/80 backdrop-blur-xl border-b border-white/8">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
            
            {/* VECTOR LOGO */}
            <div className="flex items-center gap-3 select-none">
              <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 50 20 A 25 25 0 1 0 68 68 L 82 82 A 5 5 0 0 0 89 75 L 75 61 A 25 25 0 0 0 50 20 Z M 50 28 A 17 17 0 1 1 62 62 A 17 17 0 0 1 50 28 Z" 
                  fill="url(#logoGrad)" 
                />
                <path 
                  d="M 42 61 C 45 54 41 45 49 37 C 52 34 57 32 63 31 C 62 37 60 42 57 45 C 49 53 40 49 33 52 C 37 54 39 58 42 61 Z M 60 36 A 2 2 0 1 1 56 40 A 2 2 0 0 1 60 36 Z" 
                  fill="url(#logoGrad)" 
                />
                <path 
                  d="M 33 52 C 30 55 26 62 25 67 C 29 64 36 61 38 57 C 35 56 34 54 33 52 Z" 
                  fill="url(#logoGrad)" 
                  opacity="0.8"
                />
              </svg>
              <span className="font-['Syne'] text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                Outreach<span className="font-normal text-[#f1f0ff]/90">Pro</span>
              </span>
            </div>

            {/* LIVE DATA COUNTERS DISPLAY */}
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-bold tracking-wider uppercase bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                Usage: {monthlyEmailsSent} Sent This Month
              </div>
            </div>
          </div>
        </nav>

        {/* MAIN LAYOUT WRAPPER */}
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12">
          
          {/* HERO ANCHOR BLOCK */}
          <div className="text-center pt-16 pb-12">
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[1.5px] uppercase text-[#38bdf8] bg-[#38bdf8]/8 border border-[#38bdf8]/20 px-4 py-1.5 rounded-full mb-6">
              <span className="h-1.5 w-1.5 bg-[#38bdf8] rounded-full animate-pulse" />
              Zero-Infrastructure Lead Generation
            </div>
            <h1 className="font-['Syne'] text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
              Cold outreach,<br />
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#6c63ff] to-[#38bdf8] bg-clip-text text-transparent">fully automated.</span>
            </h1>
            <div className="text-sm md:text-base text-[#f1f0ff]/50 max-w-[560px] mx-auto leading-relaxed">
              Target leads on LinkedIn, Twitter, Indeed & Internshala, personalise messages with AI, and send via your own Gmail — no servers needed.
            </div>
          </div>

          {/* SYSTEM INTERFACE WORKSPACE */}
          <form onSubmit={handleLaunch} className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[420px_1fr] gap-8 items-start pb-16">
            
            {/* LEFT COLUMN COMPONENTS */}
            <div className="space-y-6 w-full">
              
              {/* CARD 1: IDENTITY DETAILS */}
              <div className="relative overflow-hidden bg-white/[0.04] border border-white/[0.08] hover:border-[#6c63ff]/30 hover:bg-white/[0.07] rounded-2xl p-6 md:p-7 transition-all duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/5 to-transparent pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-[38px] h-[38px] bg-[#f59e0b]/12 rounded-lg flex items-center justify-center text-lg">🔑</div>
                    <h2 className="font-['Syne'] text-base font-bold text-[#f1f0ff]">Identity & Keys</h2>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">SerpAPI Key</label>
                    <input 
                      type="password" placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                      value={serpApiKey} onChange={(e) => setSerpApiKey(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/6"
                    />
                    <button 
                      type="button" onClick={() => openHelpModal('serp')}
                      className="flex items-center gap-1.5 text-xs text-[#38bdf8] mt-2 bg-none border-none p-0 cursor-pointer font-medium hover:opacity-75 transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7v5M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      How to get your SerpAPI key →
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Gmail Address</label>
                    <input 
                      type="email" placeholder="you@gmail.com"
                      value={gmailUser} onChange={(e) => setGmailUser(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/6"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Gmail App Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} placeholder="xxxxxxxxxxxxxxxx"
                        value={gmailAppPass} onChange={handleGmailPassChange}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm font-mono tracking-widest text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/6"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#f1f0ff]/35 hover:text-[#f1f0ff] transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] mt-2">
                      <span className="text-[#f1f0ff]/35 flex items-center gap-1.5">
                        <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7v5M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        No spaces allowed.
                      </span>
                      <span className={gmailAppPass.length === 16 ? "text-emerald-400 font-semibold" : "text-[#f1f0ff]/35"}>
                        {gmailAppPass.length}/16 chars
                      </span>
                    </div>

                    <button 
                      type="button" onClick={() => openHelpModal('gmail')}
                      className="flex items-center gap-1.5 text-xs text-[#38bdf8] mt-2.5 bg-none border-none p-0 cursor-pointer font-medium hover:opacity-75 transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7v5M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      How to create a Gmail App Password →
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: SEARCH TARGETS */}
              <div className="relative overflow-hidden bg-white/[0.04] border border-white/[0.08] hover:border-[#6c63ff]/30 hover:bg-white/[0.07] rounded-2xl p-6 md:p-7 transition-all duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/5 to-transparent pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-[38px] h-[38px] bg-[#38bdf8]/12 rounded-lg flex items-center justify-center text-lg">🎯</div>
                    <h2 className="font-['Syne'] text-base font-bold text-[#f1f0ff]">Search & Filter Targeting</h2>
                  </div>

                  <div className="mb-5">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Target Search Keywords</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" placeholder='Add keywords (e.g. "HR Manager")'
                        value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#6c63ff]/60"
                      />
                      <button 
                        type="button" onClick={handleAddKeyword}
                        className="bg-[#6c63ff] hover:bg-[#6c63ff]/80 text-white font-bold px-4 rounded-lg flex items-center justify-center text-lg transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywordTags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/[0.06] border border-white/10 text-[#f1f0ff]/80 pl-3 pr-2 py-1.5 rounded-md">
                          {tag}
                          <button type="button" onClick={() => handleRemoveKeyword(idx)} className="text-[#f1f0ff]/40 hover:text-red-400 font-bold transition-colors ml-1">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35">Max Emails to Deliver</label>
                      <span className="text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded-md">{leadLimit} Leads Selected</span>
                    </div>
                    <input 
                      type="range" min="1" max="6" value={leadLimit}
                      onChange={(e) => setLeadLimit(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6c63ff] mb-2"
                    />
                    {leadLimit >= 5 ? (
                      <div className="text-[11px] text-amber-400 bg-amber-400/5 border border-amber-400/20 px-3 py-2 rounded-lg flex items-start gap-1.5 transition-all">
                        <span>⚠️</span>
                        <p>Sending more than 5 cold outreach iterations sequentially increases your Google account domain blacklisting risk index.</p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#f1f0ff]/35 px-1">Priority scoring will automatically extract and sequence the top {leadLimit} highest quality leads.</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Target Networks</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div onClick={() => setPlatforms({...platforms, linkedin: !platforms.linkedin})} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer select-none truncate ${platforms.linkedin ? 'bg-[#6c63ff]/12 border-[#6c63ff]/50' : 'bg-white/[0.03] border-white/[0.08] hover:bg-[#6c63ff]/8'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full border flex-shrink-0 transition-all ${platforms.linkedin ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-[#f1f0ff]/50'}`} />
                        <span className="truncate">LinkedIn</span>
                      </div>
                      <div onClick={() => setPlatforms({...platforms, twitter: !platforms.twitter})} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer select-none truncate ${platforms.twitter ? 'bg-[#6c63ff]/12 border-[#6c63ff]/50' : 'bg-white/[0.03] border-white/[0.08] hover:bg-[#6c63ff]/8'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full border flex-shrink-0 transition-all ${platforms.twitter ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-[#f1f0ff]/50'}`} />
                        <span className="truncate">Twitter / X</span>
                      </div>
                      <div onClick={() => setPlatforms({...platforms, indeed: !platforms.indeed})} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer select-none truncate ${platforms.indeed ? 'bg-[#6c63ff]/12 border-[#6c63ff]/50' : 'bg-white/[0.03] border-white/[0.08] hover:bg-[#6c63ff]/8'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full border flex-shrink-0 transition-all ${platforms.indeed ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-[#f1f0ff]/50'}`} />
                        <span className="truncate">Indeed</span>
                      </div>
                      <div onClick={() => setPlatforms({...platforms, internshala: !platforms.internshala})} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer select-none truncate ${platforms.internshala ? 'bg-[#6c63ff]/12 border-[#6c63ff]/50' : 'bg-white/[0.03] border-white/[0.08] hover:bg-[#6c63ff]/8'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full border flex-shrink-0 transition-all ${platforms.internshala ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-[#f1f0ff]/50'}`} />
                        <span className="truncate">Internshala</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT COLUMN CONTENT PANELS */}
            <div className="flex flex-col gap-6 w-full h-full">
              
              <div className="relative overflow-hidden bg-white/[0.04] border border-white/[0.08] hover:border-[#6c63ff]/30 hover:bg-white/[0.07] rounded-2xl p-6 md:p-7 transition-all duration-200 flex-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/5 to-transparent pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-[38px] h-[38px] bg-[#6c63ff]/12 rounded-lg flex items-center justify-center text-lg">✉️</div>
                    <h2 className="font-['Syne'] text-base font-bold text-[#f1f0ff]">Email Content Blueprint</h2>
                  </div>

                  {/* SMART AI COPYWRITER PANEL */}
                  <div className="mb-5 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#a78bfa] mb-2 flex items-center gap-1.5">
                      <span>✨</span> Smart AI Copywriter
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" placeholder="e.g., Short internship request for a React developer..."
                        value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} disabled={isGeneratingAi}
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#a78bfa]/60 disabled:opacity-50"
                      />
                      <button
                        type="button" onClick={handleAiGenerate} disabled={isGeneratingAi || !aiPrompt.trim()}
                        className="bg-gradient-to-r from-[#6c63ff] to-[#a78bfa] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold px-4 py-2 sm:py-0 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        {isGeneratingAi ? "Drafting..." : "Generate Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-[18px]">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Email Subject Line</label>
                    <input 
                      type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                      placeholder="Application for Frontend Internship Role"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/6"
                    />
                  </div>

                  <div className="mb-[18px]">
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Email Message Body</label>
                    <textarea 
                      value={bodyText} onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Hello, I came across your profile and wanted to reach out regarding open positions..."
                      className="w-full min-h-[180px] bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#f1f0ff] outline-none transition-all duration-200 focus:border-[#6c63ff]/60 focus:bg-[#6c63ff]/6 resize-y leading-relaxed font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium tracking-wider uppercase text-[#f1f0ff]/35 mb-2">Asset Attachment (Resume / Deck)</label>
                    <div className="relative border-[1.5px] border-dashed border-white/10 hover:border-[#6c63ff]/50 hover:bg-[#6c63ff]/5 rounded-lg p-7 text-center transition-all duration-200 cursor-pointer">
                      <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20" />
                      <div className="w-10 h-10 bg-[#6c63ff]/10 rounded-lg flex items-center justify-center mx-auto mb-3 text-lg">📎</div>
                      <p className="text-sm text-[#f1f0ff]/50"><span className="text-[#a78bfa] font-medium">Click to upload</span> or drag & drop</p>
                      <small className="block text-xs text-[#f1f0ff]/35 mt-1">PDF, DOCX, PPTX up to 10 MB</small>
                      {resumeFile && <div className="mt-2 text-sm text-[#34d399] font-medium animate-fadeIn">✓ {resumeFile.name} Loaded</div>}
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTION PIPELINE BUTTON ROUTE */}
              <div className="relative">
                <button 
                  type="submit" disabled={isLaunching}
                  className="w-full py-[18px] px-8 font-['Syne'] text-[17px] font-bold tracking-wide text-white bg-gradient-to-r from-[#6c63ff] via-[#a78bfa] to-[#38bdf8] border-none rounded-2xl cursor-pointer shadow-xl transition-all duration-200 active:scale-[0.99] hover:opacity-90 flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none group"
                >
                  <span className="text-xl inline-block animate-[wiggle_3s_infinite] group-hover:scale-110">🚀</span>
                  Launch Automated Execution Pipeline
                </button>

                <div className={`mt-5 bg-white/[0.02] border border-white/[0.05] p-5 rounded-xl transition-all duration-300 ${isLaunching ? 'block opacity-100' : 'hidden opacity-0'}`}>
                  <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-[#6c63ff] to-[#38bdf8] transition-all duration-300 rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="text-sm text-[#f1f0ff]/50 font-medium">{progressLabel}</div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* ── 🎨 HORIZONTAL DEVELOPER BRANDING SIGNATURE FOOTER ── */}
      <footer className="relative z-20 w-full border-t border-white/5 bg-[#0a0a16]/60 backdrop-blur-md py-6 mt-auto">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            
            {/* SQUIRCLE AVATAR CONTAINER */}
            <div className="w-12 h-12 rounded-xl border border-[#6c63ff]/40 bg-white/[0.02] flex items-center justify-center shadow-inner flex-shrink-0 overflow-hidden">
              <img src="/me.png" alt="Developer Avatar" className="w-full h-full object-cover" />
            </div>
            
            <div>
              <h4 className="text-xs font-bold font-['Syne'] tracking-wide text-[#f1f0ff]">Rudraksh Singh Khichi</h4>
              <p className="text-[10px] text-[#f1f0ff]/40 font-medium mt-0.5">Full-Stack Automation Engineer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/RealRudraksh" target="_blank" rel="noreferrer" className="text-[#f1f0ff]/40 hover:text-[#a78bfa] transition-colors p-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.0.069-.608.237.1 1.006.547 1.328 1.57.444.755 1.154 1.156 2.196.44.1-.715.386-1.156.703-1.425-2.22-.254-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            </a>
            <a href="https://in.linkedin.com/in/rudraksh-singh-khichi-866099324" target="_blank" rel="noreferrer" className="text-[#f1f0ff]/40 hover:text-[#38bdf8] transition-colors p-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
            </a>
            <a href="https://www.instagram.com/_realrudraksh_" target="_blank" rel="noreferrer" className="text-[#f1f0ff]/40 hover:text-pink-400 transition-colors p-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL POPUP WINDOW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0d0d1e] border border-[#6c63ff]/25 rounded-2xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-9 shadow-2xl animate-slideUp">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 w-8 h-8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-md text-[#f1f0ff]/50 flex items-center justify-center transition-all text-sm cursor-pointer">✕</button>
            <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-lg mb-7">
              <button type="button" onClick={() => { setActiveTab('video'); setVideoLoaded(false); }} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${activeTab === 'video' ? 'bg-[#6c63ff]/20 text-[#a78bfa]' : 'text-[#f1f0ff]/50 hover:text-white'}`}>▶ Video Guide</button>
              <button type="button" onClick={() => setActiveTab('transcript')} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${activeTab === 'transcript' ? 'bg-[#6c63ff]/20 text-[#a78bfa]' : 'text-[#f1f0ff]/50 hover:text-white'}`}>📄 Transcript</button>
              <button type="button" onClick={() => setActiveTab('steps')} className={`flex-1 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${activeTab === 'steps' ? 'bg-[#6c63ff]/20 text-[#a78bfa]' : 'text-[#f1f0ff]/50 hover:text-white'}`}>⚡ Quick Steps</button>
            </div>
            {modalType === 'serp' ? (
              <div>
                <h2 className="font-['Syne'] text-2xl font-extrabold text-[#f1f0ff] mb-1">Get your SerpAPI Key</h2>
                <p className="text-sm text-[#f1f0ff]/50 mb-6">SerpAPI lets OutreachPro search LinkedIn and Twitter profiles on your behalf.</p>
                {activeTab === 'video' && (
                  <div>
                    {!videoLoaded ? (
                      <div onClick={() => setVideoLoaded(true)} className="w-full aspect-video border border-white/[0.08] rounded-lg bg-black/40 hover:bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors">
                        <div className="w-16 h-16 bg-[#6c63ff]/30 border-2 border-[#6c63ff]/50 group-hover:bg-[#6c63ff]/50 group-hover:scale-105 rounded-full flex items-center justify-center text-xl transition-all">▶</div>
                        <p className="text-sm text-[#f1f0ff]/50">Watch: Get your SerpAPI key (2 min)</p>
                      </div>
                    ) : (
                      <iframe className="w-full aspect-video rounded-lg border-none" src="https://www.youtube.com/embed/HLchnULEFlk?autoplay=1" allow="autoplay; encrypted-media; allowFullScreen" title="SerpAPI Tutorial" />
                    )}
                  </div>
                )}
                {activeTab === 'transcript' && (
                  <div className="bg-black/25 border border-white/[0.08] rounded-lg p-5 max-h-[260px] overflow-y-auto text-sm leading-relaxed text-[#f1f0ff]/50 space-y-3 font-normal">
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:00</span>Head over to <strong>serpapi.com</strong> and click <em>Sign Up Free</em> in the top right corner.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:08</span>Enter your email and choose a password, then verify your email address from the confirmation message.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:18</span>Once you're in the dashboard, look at the left sidebar — click on <em>API Key</em>.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:24</span>You'll see your secret API key. Click the copy button next to it.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:30</span>Free tier gives you 100 searches/month — enough for most campaigns.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:36</span>Paste the key into the <em>SerpAPI Key</em> field in OutreachPro. That's it!</p>
                  </div>
                )}
                {activeTab === 'steps' && (
                  <div className="flex flex-col gap-4">
                    {[
                      { n: 1, t: 'Visit SerpAPI', d: 'Go to serpapi.com and click Sign Up Free in the top-right corner.' },
                      { n: 2, t: 'Create an account', d: 'Enter your email and password. Verify your email via the confirmation message SerpAPI sends you.' },
                      { n: 3, t: 'Open Dashboard → API Key', d: 'Once logged in, open the left sidebar and click API Key. Your secret token is displayed there.' },
                      { n: 4, t: 'Copy & Paste', d: 'Click the copy icon next to your key, then paste it into the SerpAPI Key field. Free plan gives 100 queries.' }
                    ].map((s) => (
                      <div key={s.n} className="flex gap-4 p-[18px] bg-white/[0.025] border border-white/[0.08] rounded-lg">
                        <div className="w-[30px] h-[30px] bg-[#6c63ff]/15 text-[#a78bfa] rounded-md font-bold text-xs flex items-center justify-center flex-shrink-0">{s.n}</div>
                        <div><h4 className="text-sm font-semibold mb-1">{s.t}</h4><p className="text-xs text-[#f1f0ff]/50 leading-relaxed">{s.d}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="font-['Syne'] text-2xl font-extrabold text-[#f1f0ff] mb-1">Create Gmail App Password</h2>
                <p className="text-sm text-[#f1f0ff]/50 mb-6">An App Password lets OutreachPro send emails through your Gmail without storing your real account login details.</p>
                {activeTab === 'video' && (
                  <div>
                    {!videoLoaded ? (
                      <div onClick={() => setVideoLoaded(true)} className="w-full aspect-video border border-white/[0.08] rounded-lg bg-black/40 hover:bg-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors">
                        <div className="w-16 h-16 bg-[#6c63ff]/30 border-2 border-[#6c63ff]/50 group-hover:bg-[#6c63ff]/50 group-hover:scale-105 rounded-full flex items-center justify-center text-xl transition-all">▶</div>
                        <p className="text-sm text-[#f1f0ff]/50">Watch: Create Gmail App Password (3 min)</p>
                      </div>
                    ) : (
                      <iframe className="w-full aspect-video rounded-lg border-none" src="https://www.youtube.com/embed/hXiPshHn9Pw?autoplay=1" allow="autoplay; encrypted-media; allowFullScreen" title="Gmail App Password Tutorial" />
                    )}
                  </div>
                )}
                {activeTab === 'transcript' && (
                  <div className="bg-black/25 border border-white/[0.08] rounded-lg p-5 max-h-[260px] overflow-y-auto text-sm leading-relaxed text-[#f1f0ff]/50 space-y-3 font-normal">
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:00</span>First, make sure 2-Step Verification is on for your Google account — App Passwords require it.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:10</span>Go to <strong>myaccount.google.com</strong> and click <em>Security</em> in the left menu.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:18</span>Scroll down to the <em>How you sign in to Google</em> section. Click <em>2-Step Verification</em> and enable it if it's off.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:30</span>Now search for <em>App Passwords</em> in the search bar at the top of your account settings.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:38</span>Click on App Passwords. You may be asked to re-enter your password.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:46</span>Under <em>Select App</em>, type a name like <em>OutreachPro</em>, then click <em>Generate</em>.</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">0:54</span>Google shows you a 16-character password. Copy it immediately — you won't see it again!</p>
                    <p><span className="text-[#a78bfa] text-xs mr-2 font-mono">1:02</span>Paste those 16 characters into the <em>Gmail App Password</em> field. Done!</p>
                  </div>
                )}
                {activeTab === 'steps' && (
                  <div className="flex flex-col gap-4">
                    {[
                      { n: 1, t: 'Enable 2-Step Verification', d: 'Go to myaccount.google.com/security and turn on 2-Step Verification. App Passwords option will not appear without this.' },
                      { n: 2, t: 'Open App Passwords Settings', d: 'Search for "App Passwords" inside your Google account configurations search bar.' },
                      { n: 3, t: 'Create New Token Identifier', d: 'Type a signature label name like "OutreachPro" and hit Generate.' },
                      { n: 4, t: 'Secure the 16-Char String', d: 'Google will show a 16-character sequence. Copy it, strip any spaces, and enter it into the app field.' }
                    ].map((s) => (
                      <div key={s.n} className="flex gap-4 p-[18px] bg-white/[0.025] border border-white/[0.08] rounded-lg">
                        <div className="w-[30px] h-[30px] bg-[#6c63ff]/15 text-[#a78bfa] rounded-md font-bold text-xs flex items-center justify-center flex-shrink-0">{s.n}</div>
                        <div><h4 className="text-sm font-semibold mb-1">{s.t}</h4><p className="text-xs text-[#f1f0ff]/50 leading-relaxed">{s.d}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;