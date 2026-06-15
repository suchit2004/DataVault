import React, { useState } from "react";

export default function ShadowProfileMap() {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
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
  ];

  const links = [
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
  ];

  const handleNodeHover = (node) => {
    setHoveredNode(node);
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
      <div className="w-full md:w-64 bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[380px]">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">Shadow Profiling</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data brokers construct "shadow profiles" by merging public listings of your family members, friends, and co-workers.
          </p>
          <div className="border-t border-white/5 my-4" />
          
          {hoveredNode ? (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
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
              Hover over nodes in the graph to audit exposure connections.
            </div>
          )}
        </div>

        <div className="mt-4 text-[10px] text-slate-500 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
          ⚠️ <strong>Stalker threat</strong>: 3 out of 5 people search sites map Sibling / Parent locations to find private targets.
        </div>
      </div>
    </div>
  );
}
