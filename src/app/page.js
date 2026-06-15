"use client";

import React, { useState, useEffect } from "react";
import ShadowProfileMap from "@/components/ShadowProfileMap";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanMessages, setScanMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, shadow, honeypot, safeshare
  const [optOutStatus, setOptOutStatus] = useState("idle"); // idle, sending, complete
  
  // Researcher query simulation state
  const [simulatingQuery, setSimulatingQuery] = useState(false);
  const [lastBlockAdded, setLastBlockAdded] = useState(null);
  const [ledgerVerification, setLedgerVerification] = useState(null);
  const [checkingLedger, setCheckingLedger] = useState(false);

  // Check if session exists in localStorage
  useEffect(() => {
    const cachedId = localStorage.getItem("datavault_user_id");
    if (cachedId) {
      setUserId(cachedId);
      fetchDashboardData(cachedId);
    }
  }, []);

  const fetchDashboardData = async (uid) => {
    try {
      const res = await fetch(`/api/dashboard/${uid}`);
      const result = await res.json();
      if (result.success) {
        setDashboardData(result.data);
        // Sync opt-out status
        const requests = result.data.requests || [];
        if (requests.length > 0) {
          if (requests.some(r => r.status === "Pending")) {
            setOptOutStatus("sending");
          } else {
            setOptOutStatus("complete");
          }
        } else {
          setOptOutStatus("idle");
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startScan = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setScanning(true);
    setScanStep(1);
    setScanMessages(["Cross-referencing public records..."]);

    const steps = [
      { msg: "Connecting to people-search scraper engines...", delay: 800 },
      { msg: "Auditing Spokeo, Whitepages, and BeenVerified profiles...", delay: 1600 },
      { msg: "Mapping credit and financial registries...", delay: 2400 },
      { msg: "Compiling metadata threat exposure matrix...", delay: 3200 },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setScanMessages((prev) => [...prev, step.msg]);
        setScanStep((prevStep) => prevStep + 1);
      }, step.delay);
    });

    // Make the actual scan call
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      setTimeout(() => {
        if (result.success) {
          setUserId(result.userId);
          localStorage.setItem("datavault_user_id", result.userId);
          fetchDashboardData(result.userId);
        }
        setScanning(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      setScanning(false);
    }
  };

  const handleStartOptOut = async () => {
    if (!userId) return;
    setOptOutStatus("sending");

    try {
      const res = await fetch(`/api/optout/${userId}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        setOptOutStatus("complete");
        fetchDashboardData(userId);
      } else {
        setOptOutStatus("idle");
      }
    } catch (err) {
      console.error(err);
      setOptOutStatus("idle");
    }
  };

  const handleToggleSafeShare = async () => {
    if (!userId || !dashboardData) return;
    const nextState = !dashboardData.user.safeshareEnabled;

    try {
      const res = await fetch(`/api/safeshare/${userId}/enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState }),
      });
      const result = await res.json();
      if (result.success) {
        fetchDashboardData(userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateResearcherQuery = async () => {
    setSimulatingQuery(true);
    setLastBlockAdded(null);

    const researcherNames = [
      "Metropolitan Transit Authority",
      "State Epidemiological Lab",
      "Department of City Planning",
      "University Research Consortium"
    ];
    const datasets = ["Regional Commuter Flows", "Zip-level Density Aggregates", "Zonal Demographic Spreads"];
    
    const mockQuery = {
      researcherId: researcherNames[Math.floor(Math.random() * researcherNames.length)],
      datasetQueried: datasets[Math.floor(Math.random() * datasets.length)]
    };

    try {
      const res = await fetch("/api/safeshare/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockQuery),
      });
      const result = await res.json();

      setTimeout(() => {
        setSimulatingQuery(false);
        if (result.success) {
          setLastBlockAdded(result.block);
          fetchDashboardData(userId);
        } else {
          alert(result.error || "Simulation failed");
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setSimulatingQuery(false);
    }
  };

  const handleVerifyLedger = async () => {
    setCheckingLedger(true);
    setLedgerVerification(null);

    try {
      const res = await fetch("/api/safeshare/query");
      const result = await res.json();

      setTimeout(() => {
        setCheckingLedger(false);
        if (result.success) {
          setLedgerVerification(result.verification);
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setCheckingLedger(false);
    }
  };

  const handleDownloadComplaint = (req) => {
    if (!dashboardData) return;
    const honeyPot = dashboardData.honeyPots.find(hp => hp.brokerName === req.broker.name);
    const aliasEmail = honeyPot ? honeyPot.alias : "my tracking alias";

    const complaintText = `
REGULATORY COMPLAINT FORM
JURISDICTION: ${req.broker.jurisdiction}
TO: Data Protection Authority / Consumer Privacy Board / Agency

COMPLAINANT DETAILS:
- Name: ${dashboardData.user.name}
- Email: ${dashboardData.user.email}

RESPONDENT DETAILS:
- Data Broker: ${req.broker.name}
- Corporate URL: ${req.broker.url}
- Opt-Out URL: ${req.broker.optOutUrl}

VIOLATION SPECIFICATIONS:
The respondent failed to execute a statutory data removal request within the legally defined response window of ${req.broker.jurisdiction === "CCPA" ? "45 days" : "30 days"}.
The initial opt-out request was generated and submitted on ${new Date(req.submittedAt).toLocaleDateString()} with a deadline of ${new Date(req.deadline).toLocaleDateString()}.
As of today, my personal profile listings remain indexed and exposed on their servers.
Furthermore, I have recorded unsolicited marketing solicitations sent to my active data-broker honey-pot tracking alias: ${aliasEmail}.

REQUESTED ACTIONS:
1. Conduct an audit of the respondent's data erasure queues.
2. Levy appropriate statutory penalties under applicable privacy laws.
3. Order the immediate, permanent deletion of all records.

Signed: ${dashboardData.user.name}
Submitted via DataVault Regulatory Portal
Date: ${new Date().toLocaleDateString()}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([complaintText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${req.broker.name.replace(/\s+/g, "_")}_regulatory_complaint.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleResetScan = () => {
    localStorage.removeItem("datavault_user_id");
    setUserId("");
    setDashboardData(null);
    setActiveTab("dashboard");
    setOptOutStatus("idle");
    setLastBlockAdded(null);
    setLedgerVerification(null);
  };

  // Mock relisting event
  const triggerMockRelist = () => {
    alert("Re-listing Monitor triggered: Scanned Experian and found a re-activated profile! Automatically re-filing opt-out request.");
  };

  return (
    <main className="min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative pb-12">
      {/* Background glow graphics */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl -z-20 glow-glow" />
      <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-cyan-600/5 rounded-full blur-3xl -z-20" />

      {/* Navbar Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            🛡️ DataVault <span className="text-slate-400 font-normal text-sm ml-1">+ SafeShare</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {userId && (
            <button
              onClick={handleResetScan}
              className="text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
            >
              Reset Session
            </button>
          )}
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold tracking-wider uppercase">
            Active Core v1.2
          </span>
        </div>
      </header>

      {/* Initial Scan Form */}
      {!userId && !scanning && (
        <section className="max-w-6xl w-full mx-auto px-6 pt-16 flex flex-col items-center">
          <div className="text-center max-w-2xl mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Find. Fight. Firewall. <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Then Share, On Your Terms.
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Citizens can toggle SafeShare to share generalized, non-identifiable data with public safety agencies under an immutable cryptographic ledger, while purging raw identifiers from corporate databases.
            </p>
          </div>

          <div className="w-full max-w-xl glass-panel rounded-2xl p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -z-10" />
            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              <span>Interactive Exposure Scanner</span>
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Demographic Matching</span>
            </h3>
            
            <form onSubmit={startScan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name (used for directory lookups)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full glass-input rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. john@example.com"
                    required
                    className="w-full glass-input rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 555-0199"
                    className="w-full glass-input rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  City & State (for geographical zoning)
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Los Angeles, CA"
                  required
                  className="w-full glass-input rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg shadow-purple-500/10 active:scale-[0.98] cursor-pointer text-sm"
                >
                  Scan My Exposure Footprint
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Scanning Checklist Loader */}
      {scanning && (
        <section className="max-w-xl mx-auto px-6 pt-32 w-full flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" />
          </div>
          <div className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-6">
            <h3 className="text-md font-bold text-white mb-4 text-center">Analyzing Broker Ecosystems</h3>
            <div className="space-y-2.5">
              {scanMessages.map((msg, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-center space-x-2 animate-fadeIn">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>{msg}</span>
                </div>
              ))}
              {scanStep < 5 && (
                <div className="text-xs text-slate-500 flex items-center space-x-2 animate-pulse mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Cross-referencing index files...</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Active Dashboard UI */}
      {userId && dashboardData && (
        <section className="max-w-7xl mx-auto w-full px-6 pt-8 flex-1 flex flex-col">
          {/* Dashboard Header Profile Details */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{dashboardData.user.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Security ID: <span className="font-mono text-slate-300">{dashboardData.user.id}</span> • Location: {dashboardData.user.city || "Global"}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button
                onClick={triggerMockRelist}
                className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-lg px-3.5 py-2 transition-colors flex items-center space-x-1.5"
              >
                <span>🔍</span>
                <span>Audit Re-listings</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-white/5 mb-8 overflow-x-auto pb-px">
            {[
              { id: "dashboard", label: "📊 Overview" },
              { id: "shadow", label: "🕸️ Shadow Profile Map" },
              { id: "honeypot", label: "🍯 Honey-Pot & Escalation" },
              { id: "safeshare", label: "🔗 SafeShare Audit Ledger" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-semibold py-2.5 px-4 rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-400 bg-purple-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard content wrapper */}
          <div className="flex-1">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Stats and Chart */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-purple-500">{dashboardData.stats.currentRiskScore}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Current Risk</div>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-cyan-400">{dashboardData.stats.projectedRiskScore}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Projected Risk</div>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-amber-500">{dashboardData.stats.pendingCount}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Pending Opt-Outs</div>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-emerald-500">{dashboardData.stats.compliedCount}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Complied Sites</div>
                    </div>
                  </div>

                  {/* Exposure Breakdown */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Threat Registry Breakdown</h3>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {dashboardData.exposures.map((exp) => {
                        const associatedRequest = dashboardData.requests.find(r => r.brokerId === exp.brokerId);
                        const statusColor = 
                          exp.status === "Exposed" ? "text-red-500" :
                          exp.status === "Pending" ? "text-amber-500 animate-pulse" :
                          "text-emerald-500";
                        return (
                          <div key={exp.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-white">{exp.broker.name}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                                  Tier {exp.broker.tier}
                                </span>
                                <span className="text-[9px] font-semibold text-slate-400 bg-purple-500/10 border border-purple-500/10 px-1.5 py-0.5 rounded">
                                  {exp.broker.jurisdiction}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                Categories: <span className="text-slate-300">{exp.dataCategories}</span>
                              </p>
                            </div>
                            <div className="flex items-center justify-between md:justify-end space-x-4">
                              <div className="text-right">
                                <span className={`text-xs font-bold uppercase ${statusColor}`}>{exp.status}</span>
                                {associatedRequest && (
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    Deadline: {new Date(associatedRequest.deadline).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SVG Risk Trajectory Chart */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Risk Reduction Trajectory</h3>
                    <div className="relative w-full h-40">
                      <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                        {/* Grid lines */}
                        <line x1="0" y1="10" x2="500" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                        {/* Chart Line */}
                        <path
                          d={`M 25,${100 - (dashboardData.riskTrajectory[0].score || 0)} 
                              L 175,${100 - (dashboardData.riskTrajectory[1].score || 0)} 
                              L 325,${100 - (dashboardData.riskTrajectory[2].score || 0)} 
                              L 475,${100 - (dashboardData.riskTrajectory[3].score || 0)}`}
                          fill="none"
                          stroke="url(#chart-gradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Chart dots */}
                        {dashboardData.riskTrajectory.map((pt, i) => {
                          const x = i === 0 ? 25 : i === 1 ? 175 : i === 2 ? 325 : 475;
                          const y = 100 - (pt.score || 0);
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="5" fill="#a855f7" stroke="#030712" strokeWidth="1.5" />
                              <text x={x} y={y - 10} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                                {pt.score}
                              </text>
                              <text x={x} y="115" textAnchor="middle" fill="#94a3b8" fontSize="8">
                                {pt.label}
                              </text>
                            </g>
                          );
                        })}

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="50%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                </div>

                {/* Right Side: Risk Score Meter and Action Callouts */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Circular Risk Score Gauge */}
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Threat Index</h3>
                    
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                      {/* Outer Track Ring */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={dashboardData.stats.currentRiskScore > 70 ? "#ef4444" : "#f59e0b"}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - dashboardData.stats.currentRiskScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Score display */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-white">{dashboardData.stats.currentRiskScore}</span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">High Threat</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-4">
                      Your identity footprint is actively cataloged by marketing aggregators, and people registries.
                    </p>

                    {/* Opt-out action button */}
                    <button
                      onClick={handleStartOptOut}
                      disabled={optOutStatus === "complete" || optOutStatus === "sending" || dashboardData.exposures.filter(e => e.status === "Exposed").length === 0}
                      className="w-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold py-3 rounded-lg transition-all text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {optOutStatus === "idle" && "Trigger AI Legal Opt-Out Requests"}
                      {optOutStatus === "sending" && "AI Generating Opt-Out Letters..."}
                      {optOutStatus === "complete" && "✓ Requests Dispatched"}
                    </button>
                  </div>

                  {/* SafeShare Pool Status Summary */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">SafeShare Status</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        dashboardData.user.safeshareEnabled 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-slate-800 text-slate-500 border border-white/5"
                      }`}>
                        {dashboardData.user.safeshareEnabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Voluntarily contribute anonymized demographic telemetry to city grids and disease trackers.
                    </p>
                    <button
                      onClick={handleToggleSafeShare}
                      className={`w-full font-bold py-2.5 rounded-lg transition-all text-xs cursor-pointer border ${
                        dashboardData.user.safeshareEnabled
                          ? "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                      }`}
                    >
                      {dashboardData.user.safeshareEnabled ? "Withdraw Consent & Purge" : "Enable SafeShare Pooling"}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SHADOW PROFILE MAP */}
            {activeTab === "shadow" && (
              <div className="space-y-6">
                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-md font-bold text-white mb-2">Shadow Exposure Vulnerability</h3>
                  <p className="text-xs text-slate-400 mb-6 max-w-3xl">
                    Data brokers do not just look at you; they map your connections. This graph shows how database scrapers merge related records of siblings, spouses, and colleagues to bypass search limits and map private citizens.
                  </p>
                  
                  <ShadowProfileMap />
                </div>
              </div>
            )}

            {/* TAB 3: HONEY-POT & ESCALATION */}
            {activeTab === "honeypot" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                
                {/* Honey-Pot Registry Table */}
                <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="text-md font-bold text-white">Active Honey-Pot Auditing</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      DataVault injects unique email aliases (e.g. `user+shield_spokeo@datavault.com`) into deletion requests. If marketing emails are routed to these tracking addresses, we obtain cryptographic proof of broker compliance violations.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-500 font-semibold">
                          <th className="py-2">Broker</th>
                          <th className="py-2">Generated Tracker Alias</th>
                          <th className="py-2">Status</th>
                          <th className="py-2 text-right">Spam Intercepted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboardData.honeyPots.length > 0 ? (
                          dashboardData.honeyPots.map((hp) => (
                            <tr key={hp.id} className="text-slate-300">
                              <td className="py-3 font-bold text-white">{hp.brokerName}</td>
                              <td className="py-3 font-mono text-cyan-400">{hp.alias}</td>
                              <td className="py-3">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  hp.status.includes("Purged") 
                                    ? "bg-slate-800 text-slate-500" 
                                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10"
                                }`}>
                                  {hp.status}
                                </span>
                              </td>
                              <td className="py-3 text-right font-bold text-red-400">
                                {hp.detectedSpam > 0 ? `⚠️ ${hp.detectedSpam} caught` : "0"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-slate-500 italic">
                              Trigger opt-out requests first to generate tracking honey-pot aliases.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Regulatory Escalation Actions */}
                <div className="lg:col-span-4 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white">One-Click Escalations</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If brokers fail to clear your index within the statutory limits (30 days for GDPR, 45 days for CCPA), you can immediately export pre-formatted complaints loaded with compliance proof.
                  </p>

                  <div className="space-y-3.5 pt-2">
                    {dashboardData.requests.map((req) => {
                      const isOverdue = new Date() > new Date(req.deadline);
                      const isNonCompliant = req.status === "Non-Compliant" || isOverdue;

                      return (
                        <div key={req.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-white">{req.broker.name}</span>
                              <p className="text-[10px] text-slate-500 mt-0.5">Submitted: {new Date(req.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${isNonCompliant ? "text-red-400" : "text-slate-500"}`}>
                              {isNonCompliant ? "Escalation Ready" : "Pending Window"}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDownloadComplaint(req)}
                            className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
                              isNonCompliant 
                                ? "bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 cursor-pointer" 
                                : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                            }`}
                          >
                            Export Regulatory Complaint
                          </button>
                        </div>
                      );
                    })}

                    {dashboardData.requests.length === 0 && (
                      <p className="text-xs text-slate-500 italic text-center py-4">No filings dispatched.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: SAFESHARE AUDIT LEDGER */}
            {activeTab === "safeshare" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                
                {/* Left Side: Ledger status and Access activities */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Ledger block history */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-md font-bold text-white font-mono">Chained Cryptographic Logs</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Every time public health databases or city planners access the SafeShare pool, the event is sealed in a SHA-256 hash block.
                        </p>
                      </div>
                      <button
                        onClick={handleVerifyLedger}
                        disabled={checkingLedger || !dashboardData.user.safeshareEnabled}
                        className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3.5 py-2 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {checkingLedger ? "Validating Ledger..." : "Verify Ledger Integrity"}
                      </button>
                    </div>

                    {/* Ledger verification alert */}
                    {ledgerVerification && (
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        ledgerVerification.isValid 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <strong>{ledgerVerification.isValid ? "✓ Ledger Authenticated" : "⚠️ TAMPER DETECTED"}</strong>:
                        <p className="mt-1 text-[11px] text-slate-300">
                          {ledgerVerification.isValid 
                            ? `Validated ${dashboardData.ledger.length} block chain records successfully. Previous block linkage verified using SHA-256.`
                            : `Compromised Block Identified: ${ledgerVerification.compromisedBlockId}. Reason: ${ledgerVerification.reason}`}
                        </p>
                      </div>
                    )}

                    {/* Block display */}
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                      {dashboardData.ledger.map((block, i) => (
                        <div key={block.id} className="bg-slate-950/50 border border-white/5 rounded-xl p-4 relative font-mono text-[11px]">
                          <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2 mb-2.5">
                            <span className="font-bold text-white text-[10px] uppercase">Block #{dashboardData.ledger.length - i}</span>
                            <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="space-y-1.5 text-slate-300">
                            <div><span className="text-slate-500">Querying agency:</span> <span className="text-white font-bold">{block.researcherId}</span></div>
                            <div><span className="text-slate-500">Data partition:</span> <span className="text-purple-400">{block.datasetQueried}</span></div>
                            <div className="truncate"><span className="text-slate-500">Previous hash:</span> <span className="text-slate-400">{block.previousHash}</span></div>
                            <div className="truncate"><span className="text-slate-500">Current Hash:</span> <span className="text-cyan-400 font-bold">{block.hash}</span></div>
                          </div>
                        </div>
                      ))}

                      {dashboardData.ledger.length === 0 && (
                        <p className="text-xs text-slate-500 italic text-center py-6">No cryptographic logs generated yet. Enable SafeShare and trigger a researcher query query.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Simulation Panel */}
                <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white">Simulation Environment</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test the blockchain-like audit trail. When an agency fetches statistics, a block is created containing their signature and linked to the previous block's hash.
                  </p>

                  <button
                    onClick={handleSimulateResearcherQuery}
                    disabled={simulatingQuery || !dashboardData.user.safeshareEnabled}
                    className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-lg transition-all text-xs cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {simulatingQuery ? "Simulating Query Transaction..." : "Simulate Public Safety Query"}
                  </button>

                  {!dashboardData.user.safeshareEnabled && (
                    <div className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                      ⚠️ <strong>Ledger Locked</strong>: You must enable SafeShare Pooling in the Overview tab to allow agencies to query your statistics.
                    </div>
                  )}

                  {lastBlockAdded && (
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 font-mono text-[10px] space-y-2 animate-fadeIn">
                      <div className="text-cyan-400 font-bold uppercase text-[11px]">✓ Block Sealed!</div>
                      <div className="text-slate-200">
                        <span className="text-slate-500">Researcher:</span> {lastBlockAdded.researcherId}
                      </div>
                      <div className="text-slate-200 truncate">
                        <span className="text-slate-500">Prev Hash:</span> {lastBlockAdded.previousHash}
                      </div>
                      <div className="text-slate-200 truncate">
                        <span className="text-slate-500">New Hash:</span> <span className="text-cyan-400 font-bold">{lastBlockAdded.hash}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </section>
      )}

      {/* Footer copyright */}
      <footer className="w-full text-center text-xs text-slate-600 border-t border-white/5 pt-8 mt-16 max-w-7xl mx-auto px-6">
        DataVault + SafeShare Project • Hackathon Digital Rights Platform • 100% Audit-Evident Cryptography
      </footer>
    </main>
  );
}
