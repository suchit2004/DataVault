"use client";

import React, { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [safeShareEnabled, setSafeShareEnabled] = useState(false);
  const [optOutStatus, setOptOutStatus] = useState("idle"); // idle, sending, complete

  const brokersList = [
    { name: "Spokeo", tier: 1, type: "People Search", status: "Exposed", data: ["Phone Number", "Home Address", "Relatives"] },
    { name: "Whitepages", tier: 1, type: "People Search", status: "Exposed", data: ["Full Name", "Phone Number", "Age"] },
    { name: "BeenVerified", tier: 1, type: "People Search", status: "Exposed", data: ["Property Records", "Email Address"] },
    { name: "Experian", tier: 2, type: "Financial", status: "Exposed", data: ["Credit History Range", "Income Estimate"] },
    { name: "Acxiom", tier: 2, type: "Marketing", status: "Exposed", data: ["Purchase History", "Interests"] },
    { name: "LexisNexis", tier: 3, type: "Risk/Legal", status: "Exposed", data: ["Public Filings", "Employment History"] },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startScan = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setScanning(true);
    setScanStep(1);

    // Simulate multi-stage scanning pipeline
    setTimeout(() => setScanStep(2), 1000);
    setTimeout(() => setScanStep(3), 2200);
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 3500);
  };

  const handleStartOptOut = () => {
    setOptOutStatus("sending");
    setTimeout(() => {
      setOptOutStatus("complete");
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10" />

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            DataVault <span className="text-slate-400 font-medium">+ SafeShare</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold tracking-wider uppercase">
            Development Build
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Find. Fight. Firewall. <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Then Share, On Your Terms.
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          The first AI-powered data broker opt-out agent that protects your privacy while enabling SafeShare: a secure, voluntary consent layer to share anonymized data with public safety initiatives.
        </p>
      </section>

      {/* Main Container */}
      <section className="max-w-6xl w-full mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Interactive Portal */}
        <div className="lg:col-span-7 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -z-10" />

          {/* Step 1: Scan Input Form */}
          {!scanComplete && !scanning && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Interactive Exposure Scanner</h3>
                <span className="text-xs text-slate-500">Step 1 of 3</span>
              </div>
              <form onSubmit={startScan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name (used for directory lookups)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full bg-slate-900/50 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@example.com"
                      required
                      className="w-full bg-slate-900/50 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +1 555-0199"
                      className="w-full bg-slate-900/50 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    City & State (for demographic matching)
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Los Angeles, CA"
                    className="w-full bg-slate-900/50 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg shadow-purple-500/10 active:scale-[0.98] cursor-pointer text-sm"
                  >
                    Scan My Exposure Footprint
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Scanning Progress */}
          {scanning && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analyzing Broker Ecosystems</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {scanStep === 1 && "Cross-referencing 200+ public database sources..."}
                {scanStep === 2 && "Simulating exposure lookup for data broker networks..."}
                {scanStep === 3 && "Calculating exposure matrix and privacy threat scores..."}
              </p>
            </div>
          )}

          {/* Step 2: Scan Complete Dashboard */}
          {scanComplete && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Personal Data Exposure Report</h3>
                  <p className="text-xs text-slate-400">Target: {formData.name} ({formData.email})</p>
                </div>
                <button
                  onClick={() => {
                    setScanComplete(false);
                    setOptOutStatus("idle");
                  }}
                  className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/5"
                >
                  New Scan
                </button>
              </div>

              {/* Exposure Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-red-500">82 / 100</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase mt-1">Privacy Risk Score</div>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-500">6</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase mt-1">Exposed Brokers</div>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-cyan-500">12+</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase mt-1">Exposed PII Points</div>
                </div>
              </div>

              {/* Visualizing exposed brokers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Detected Exposure Details</h4>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {brokersList.map((broker) => (
                    <div
                      key={broker.name}
                      className="bg-slate-900/40 border border-white/5 rounded-lg px-4 py-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">{broker.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/10 font-bold uppercase">
                            Tier {broker.tier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Category: {broker.type} • Data leaked: {broker.data.join(", ")}
                        </p>
                      </div>
                      <span className="text-xs text-red-500 font-semibold">Exposed</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleStartOptOut}
                  disabled={optOutStatus === "complete" || optOutStatus === "sending"}
                  className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-400 font-semibold py-3 rounded-lg transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  {optOutStatus === "idle" && "Trigger AI Legal Opt-Out Requests"}
                  {optOutStatus === "sending" && "AI Generating Opt-Out Letters..."}
                  {optOutStatus === "complete" && "✓ Opt-Out Letters Sent to Brokers"}
                </button>

                <div className="bg-slate-900/60 border border-white/5 rounded-lg px-4 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">SafeShare Pool</span>
                    <p className="text-[10px] text-slate-400">Share anonymized data for safety</p>
                  </div>
                  <button
                    onClick={() => setSafeShareEnabled(!safeShareEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      safeShareEnabled ? "bg-cyan-500" : "bg-slate-800 border border-white/10"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        safeShareEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Features and Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* SafeShare Info / LEDGER (Key USP) */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-3">SafeShare Ledger Status</h3>
            <p className="text-xs text-slate-400 mb-4">
              When enabled, generalized data is contributed to city planners & safety researchers. All accesses are tracked cryptographically.
            </p>

            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ledger Integrity</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                  Verified (Hash Chain)
                </span>
              </div>
              <div className="text-xs font-mono text-slate-500 truncate">
                Last Block Hash: <span className="text-cyan-400">e2c7a8b4f179d671b569e8ac37bd6362</span>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access Activity Logs</span>
                {safeShareEnabled ? (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-300 flex justify-between">
                      <span className="text-cyan-400 font-semibold">↳ City Planning Dept</span>
                      <span>Accessed generalized location trends</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Timestamp: 2026-06-14T21:21:30Z</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No access logs active (SafeShare disabled)</p>
                )}
              </div>
            </div>
          </div>

          {/* Hackathon USPs Highlight Card */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">How This Wins The Room</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span>
                  <strong>Dual-sided Solution:</strong> Solves both individual privacy AND voluntary contribution to public safety research (coexistence framework).
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span>
                  <strong>Cryptographic Audit Log:</strong> Cryptographic SQLite-based hash ledger tracks every research query, proving auditability without slow blockchains.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span>
                  <strong>Data-Broker Honey-Pot:</strong> Registers unique tracking emails (`user+brokerA@datavault.com`) to catch data violations and sell-offs.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto w-full border-t border-white/5 py-8 text-center text-xs text-slate-500">
        DataVault + SafeShare Project • Designed for Mass Surveillance vs Public Safety Challenge
      </footer>
    </main>
  );
}
