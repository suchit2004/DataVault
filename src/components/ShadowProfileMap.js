import React, { useState } from "react";

export default function ShadowProfileMap() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("Sibling");
  const [newExposedData, setNewExposedData] = useState("");

  const [nodes, setNodes] = useState([
    { id: "user", label: "You (User)", type: "user", x: 300, y: 200, color: "#a855f7", info: "Your profile: Name, Email, Phone, City." },
    
    // Relations
    { id: "mother", label: "Mother (Jane)", type: "relation", x: 180, y: 110, color: "#06b6d4", info: "Mother's record shares your maiden name and old addresses." },
    { id: "sibling", label: "Sister (Emily)", type: "relation", x: 150, y: 270, color: "#06b6d4", info: "Sister's voter registration lists your current home address." },
    { id: "spouse", label: "Spouse (Alex)", type: "relation", x: 420, y: 280, color: "#06b6d4", info: "Spouse's credit files link directly to your billing history." },
    { id: "coworker", label: "Coworker (Mark)", type: "relation", x: 430, y: 120, color: "#06b6d4", info: "Coworker's professional page links your business email." },

    // Threat Data Brokers
    { id: "spokeo", label: "Spokeo", type: "broker", x: 60, y: 80, color: "#ef4444", info: "Spokeo correlates Sister's address and lists it under your profile." },
    { id: "whitepages", label: "Whitepages", type: "broker", x: 50, y: 220, color: "#ef4444", info: "Whitepages exposes your home phone via Mother's listing." },
    { id: "beenverified", label: "BeenVerified", type: "broker", x: 260, y: 350, color: "#ef4444", info: "BeenVerified links Spouse and Sibling to your household." },
    { id: "experian", label: "Experian", type: "broker", x: 540, y: 150, color: "#ef4444", info: "Experian sells marketing profiles matching Coworker & Spouse." },
    { id: "lexisnexis", label: "LexisNexis", type: "broker", x: 520, y: 310, color: "#ef4444", info: "LexisNexis builds risk charts connecting your family directory." }
  ]);

  const [links, setLinks] = useState([
    // User relationships
    { source: "user", target: "mother" },
    { source: "user", target: "sibling" },
    { source: "user", target: "spouse" },
    { source: "user", target: "coworker" },

    // Exposure link threads
    { source: "sibling", target: "spokeo" },
    { source: "mother", target: "whitepages" },
    { source: "spouse", target: "beenverified" },
    { source: "coworker", target: "experian" },
    { source: "spouse", target: "lexisnexis" },
    
    // Direct exposures
    { source: "user", target: "spokeo", threat: true },
    { source: "user", target: "whitepages", threat: true },
    { source: "user", target: "beenverified", threat: true },
    { source: "user", target: "experian", threat: true },
    { source: "user", target: "lexisnexis", threat: true }
  ]);

  const handleNodeHover = (node) => {
    setHoveredNode(node);
  };

  const handleAddConnection = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const id = newName.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.random().toString(36).substr(2, 4);
    const relationCount = nodes.filter(n => n.type === "relation").length;
    // Circular angle around center (300, 200)
    const angle = ((relationCount * 72 + 36) * Math.PI) / 180;
    const radius = 100 + Math.random() * 25;
    const x = Math.round(300 + Math.cos(angle) * radius);
    const y = Math.round(200 + Math.sin(angle) * radius);

    const info = `${newRelation} (${newName})'s records are interconnected. Exposed data: ${newExposedData || "Linked address archives and phone listing matches."}`;

    const newNode = {
      id,
      label: `${newRelation} (${newName})`,
      type: "relation",
      x,
      y,
      color: "#06b6d4",
      info
    };

    const newLink1 = { source: "user", target: id };
    
    // Connect to a data broker based on relationship index
    const brokersList = nodes.filter(n => n.type === "broker");
    const targetBroker = brokersList[relationCount % brokersList.length];
    const newLink2 = { source: id, target: targetBroker.id };

    setNodes(prev => [...prev, newNode]);
    setLinks(prev => [...prev, newLink1, newLink2]);

    setNewName("");
    setNewExposedData("");
    setShowAddForm(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center">
      {/* Interactive Map */}
      <div className="flex-1 w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 relative overflow-hidden h-[380px] flex items-center justify-center">
        <svg viewBox="0 0 600 400" className="w-full h-full select-none">
          {/* Defs for gradients */}
          <defs>
            <radialGradient id="glow-purple" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-cyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-red" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Links / Connections */}
          {links.map((link, idx) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = hoveredNode && (hoveredNode.id === link.source || hoveredNode.id === link.target);

            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={link.threat ? "#ef4444" : "#475569"}
                strokeWidth={isHighlighted ? 2.5 : 1}
                strokeOpacity={isHighlighted ? 0.9 : 0.4}
                className={link.threat ? "link-line" : ""}
                style={{
                  stroke: isHighlighted ? (link.threat ? "#ef4444" : "#06b6d4") : (link.threat ? "#ef4444" : "#475569")
                }}
              />
            );
          })}

          {/* Glow Circles behind nodes */}
          {nodes.map((node) => {
            const glowId = node.type === "user" ? "glow-purple" : node.type === "relation" ? "glow-cyan" : "glow-red";
            const size = node.type === "user" ? 70 : 45;
            return (
              <circle
                key={`glow-${node.id}`}
                cx={node.x}
                cy={node.y}
                r={size}
                fill={`url(#${glowId})`}
                className="pointer-events-none"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode && hoveredNode.id === node.id;
            const r = node.type === "user" ? 14 : node.type === "relation" ? 9 : 8;

            return (
              <g
                key={node.id}
                onMouseEnter={() => handleNodeHover(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={node.color}
                  stroke="#1e293b"
                  strokeWidth={2}
                  className="node-circle"
                  style={{
                    transformOrigin: `${node.x}px ${node.y}px`,
                    transform: isHovered ? "scale(1.25)" : "scale(1)"
                  }}
                />
                <text
                  x={node.x}
                  y={node.y - r - 6}
                  textAnchor="middle"
                  fill={isHovered ? "#ffffff" : "#cbd5e1"}
                  fontSize={node.type === "user" ? 11 : 9}
                  fontWeight={node.type === "user" ? "bold" : "normal"}
                  className="transition-colors pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Info Panel */}
      <div className="w-full md:w-64 bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[380px] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Shadow Profiling</h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded transition-colors"
            >
              {showAddForm ? "Cancel" : "+ Add Link"}
            </button>
          </div>

          <div className="border-t border-white/5" />

          {showAddForm ? (
            <form onSubmit={handleAddConnection} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Robert"
                  required
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Relationship</label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Friend">Friend</option>
                  <option value="Roommate">Roommate</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Exposed Data Details</label>
                <input
                  type="text"
                  value={newExposedData}
                  onChange={(e) => setNewExposedData(e.target.value)}
                  placeholder="e.g. Shares old billing address"
                  className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 rounded text-[10px] uppercase transition-colors"
              >
                Insert Connection Node
              </button>
            </form>
          ) : hoveredNode ? (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hoveredNode.color }}
                />
                <span className="text-xs font-bold text-white uppercase">{hoveredNode.label}</span>
              </div>
              <p className="text-xs text-slate-200 bg-slate-950/40 border border-white/5 rounded-lg p-3 leading-relaxed">
                {hoveredNode.info}
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-white/5 rounded-lg">
              Hover over nodes in the graph to audit exposure connections, or click "+ Add Link" to map a new relative.
            </div>
          )}
        </div>

        {!showAddForm && (
          <div className="mt-4 text-[10px] text-slate-500 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
            ⚠️ <strong>Stalker threat</strong>: 3 out of 5 people search sites map Sibling / Parent locations to bypass target privacy limits.
          </div>
        )}
      </div>
    </div>
  );
}

