import React, { useState } from "react";

export default function HoneyPotInbox({ honeyPot, onClose }) {
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Statically generated mock emails based on the data broker category
  const getMockEmails = (brokerName, alias) => {
    const nameOnly = honeyPot.alias.split("+")[0];
    const capitalizedName = nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);

    if (honeyPot.status.includes("Purged")) {
      return [];
    }

    return [
      {
        id: "em1",
        from: "National Credit Line Services",
        fromEmail: "offers@nationalconsumercredit.com",
        subject: `⚠️ Urgent: Pre-approved consumer line for ${capitalizedName}`,
        date: "2 hours ago",
        body: `Dear ${capitalizedName},

We obtained your profile details indicating a recent residence update. Based on credit registry demographic records, you have been pre-screened for a consumer line of credit up to $15,000. 

Your profile details matches our target demographic. To secure this promotional rate, please verify your details using your tracking alias: ${alias}.

Regards,
Consumer Credit Department`,
        isRead: false
      },
      {
        id: "em2",
        from: "PublicRecords Scout",
        fromEmail: "alerts@publicrecordsscout.com",
        subject: "We found matching court records under your name",
        date: "1 day ago",
        body: `Notice of Profile Indexing,

An index update for "${capitalizedName}" has been published to our directories. Our scrapers compiled listings including:
- Address records
- Phone numbers and relatives
- Associated contact history

Your data has been compiled via consumer broker files associated with your address registration. To edit or review the public report, click 'Manage Listing' using credentials linked to ${alias}.

Unsubscribe from further indexing sweeps by filing a suppression request.`,
        isRead: true
      },
      {
        id: "em3",
        from: "Prime Retail Aggregators",
        fromEmail: "deals@consumerretails.com",
        subject: `🎁 Personalized shopping rewards compiled for ${capitalizedName}`,
        date: "3 days ago",
        body: `Hi ${capitalizedName},

Congratulations! You have been selected for regional rewards programs based on your shopping profiles in the local area. 

These deals are customized for consumer segments matched with your tracking record: ${alias}.

Click below to claim your rewards and choose from hundreds of participating brands.`,
        isRead: true
      }
    ];
  };

  const emails = getMockEmails(honeyPot.brokerName, honeyPot.alias);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl h-[550px] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 bg-slate-950/50 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="text-purple-400">🍯 Honey-Pot Inbox:</span>
              <span className="font-mono text-cyan-400 font-semibold">{honeyPot.alias}</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Auditing Broker: <span className="text-white font-bold">{honeyPot.brokerName}</span> • Intercepted traffic serves as legal proof of non-compliance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer text-xs font-bold"
          >
            ✕ Close Inbox
          </button>
        </div>

        {/* Main section */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List (Left) */}
          <div className="w-1/2 border-r border-white/5 overflow-y-auto">
            {emails.length > 0 ? (
              <div className="divide-y divide-white/5">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white/5 flex flex-col space-y-1.5 ${
                      selectedEmail?.id === email.id ? "bg-purple-500/10 border-l-2 border-purple-500" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold ${email.isRead ? "text-slate-300" : "text-white flex items-center"}`}>
                        {!email.isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 inline-block" />}
                        {email.from}
                      </span>
                      <span className="text-[9px] text-slate-500">{email.date}</span>
                    </div>
                    <h4 className={`text-xs ${selectedEmail?.id === email.id ? "text-purple-300 font-bold" : "text-slate-200"}`}>
                      {email.subject}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{email.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="text-3xl mb-2">🔒</span>
                <h4 className="text-xs font-bold text-slate-400 uppercase">Inbox Inactive</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                  No tracking logs caught. The broker ({honeyPot.brokerName}) has successfully complied with your deletion request, purging all shadow profile indexes and links.
                </p>
              </div>
            )}
          </div>

          {/* Email Content (Right) */}
          <div className="w-1/2 bg-slate-950/20 overflow-y-auto p-6">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedEmail.from}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">&lt;{selectedEmail.fromEmail}&gt;</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{selectedEmail.date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Subject:</span>
                    <h3 className="text-xs font-bold text-purple-300">{selectedEmail.subject}</h3>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">To:</span>
                    <span className="text-[10px] font-mono text-cyan-400">{honeyPot.alias}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedEmail.body}
                </div>
                <div className="pt-6 border-t border-white/5">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 space-y-2">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">⚠️ Legal Compliance Violation</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      This unsolicited email received at your unique honey-pot alias proves that <strong>{honeyPot.brokerName}</strong> did not delete your data, or sold/shared it after your opt-out.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 italic text-xs">
                {emails.length > 0 ? "Select an email from the list to audit the compliance breach details." : "No violations detected."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
