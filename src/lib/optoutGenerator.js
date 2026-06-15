export function calculateDeadline(jurisdiction) {
  const now = new Date();
  if (jurisdiction === "GDPR") {
    // GDPR: 30 days
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (jurisdiction === "CCPA") {
    // CCPA: 45 days
    return new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
  } else if (jurisdiction === "DPDP") {
    // DPDP: 30 days
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    // Global / General: 30 days
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

export function generateOptOutLetter(user, broker) {
  const jurisdiction = broker.jurisdiction || "GLOBAL";
  const userName = user.name;
  const userEmail = user.email;
  const userPhone = user.phone || "[Not Provided]";
  const userCity = user.city || "[Not Provided]";
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let lawReference = "";
  let rightsClauses = "";
  let responseTimeframe = "30 days";

  if (jurisdiction === "CCPA") {
    lawReference = "California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA), Cal. Civ. Code § 1798.100 et seq.";
    rightsClauses = `Under the CCPA/CPRA, I have the right to request that businesses delete personal information they have collected about me, and to opt out of the sale or sharing of my personal information. Specifically, I am requesting:
1. Deletion of all personal data collected, stored, or processed about me.
2. Direct instruction to all of your service providers, contractors, and third parties to delete my personal data.
3. Opt-out of any future sale, sharing, or processing of my personal information.`;
    responseTimeframe = "45 days";
  } else if (jurisdiction === "GDPR") {
    lawReference = "General Data Protection Regulation (GDPR) (EU) 2016/679, Article 17 (Right to Erasure / 'Right to be Forgotten')";
    rightsClauses = `Pursuant to Article 17 of the GDPR, I hereby request the immediate erasure of all personal data concerning me. Specifically:
1. You must delete all personal records, profiling data, behavioral tracking, and contact files related to my identity.
2. In accordance with Article 17(2), you must take reasonable steps to inform other controllers processing my personal data that I have requested erasure.
3. You must stop any active processing, marketing, or profiling related to my personal information immediately.`;
    responseTimeframe = "30 days";
  } else if (jurisdiction === "DPDP") {
    lawReference = "Section 12 of the Digital Personal Data Protection (DPDP) Act, 2023 (India) - Right to Correction and Erasure of Personal Data";
    rightsClauses = `Pursuant to Section 12 of the DPDP Act 2023, I request that you erase my personal data for which consent has been previously given or which is no longer necessary for the purpose for which it was processed. Please:
1. Erase all personal identifiers, demographic listings, and search results linking to my name.
2. Notify all processors or third parties with whom this data has been shared to execute the erasure request on their side.`;
    responseTimeframe = "30 days";
  } else {
    lawReference = "Applicable Privacy Protection Regulations and Data Protection Standards";
    rightsClauses = `Under prevailing consumer privacy principles, I request:
1. Complete deletion of all personal data, contact information, and behavioral records held in your databases.
2. Opt-out from any sales, sharing, or commercial redistribution of my profiles.
3. Confirmation that my data has been purged and will not be re-acquired.`;
    responseTimeframe = "30 days";
  }

  // Active honey-pot email tracking creation
  const brokerKey = broker.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const honeyPotEmail = `${userEmail.split("@")[0]}+shield_${brokerKey}@datavault.com`;

  return `
DATE: ${dateStr}
TO: ${broker.name} Compliance and Data Protection Department
ADDRESS: ${broker.url} / ${broker.optOutUrl}

SUBJECT: MANDATORY DATA DELETION AND OPT-OUT REQUEST

Dear Compliance Officer,

I am writing to formally submit a request for the deletion of my personal information under the ${lawReference}.

Please find my identification details below:
- Full Name: ${userName}
- Primary Email Address: ${userEmail}
- Compliance Tracking Alias: ${honeyPotEmail}
- Phone Number: ${userPhone}
- Location: ${userCity}

${rightsClauses}

Please be advised that this request includes any and all "shadow profiles," marketing profiles, financial tracking records, or directories indexed under my identifiers. 

In accordance with the law, I expect you to:
1. Verify my identity using the details provided above without demanding excessive documentation.
2. Confirm the complete erasure of my records in writing within ${responseTimeframe}.
3. Log my compliance tracking alias (${honeyPotEmail}) as a deleted, do-not-track record to prevent re-listing.

I am monitoring this request closely. Failure to comply within the statutory ${responseTimeframe} window will result in an immediate regulatory escalation to the appropriate authorities (e.g., California Privacy Protection Agency, EU Data Protection Authorities, or the Data Protection Board of India).

Sincerely,

${userName}
  `.trim();
}
