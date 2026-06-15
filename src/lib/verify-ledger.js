import { verifyLedgerIntegrity } from "./ledger.js";
import { prisma } from "./db.js";

async function runVerification() {
  console.log("Checking SafeShare Cryptographic Ledger integrity...");
  try {
    const result = await verifyLedgerIntegrity();
    
    // Check if ledger is empty or valid
    const count = await prisma.safeShareAuditLedger.count();
    console.log(`Total blocks in ledger: ${count}`);

    if (result.isValid) {
      console.log("--------------------------------------------------");
      console.log("✅ SUCCESS: Ledger integrity verified successfully!");
      console.log("🔒 Cryptographic Hash Chain: VALID AND INTACT");
      console.log("--------------------------------------------------");
      process.exit(0);
    } else {
      console.error("--------------------------------------------------");
      console.error("❌ ERROR: Ledger verification failed!");
      console.error(`Compromised Block ID: ${result.compromisedBlockId}`);
      console.error(`Reason: ${result.reason}`);
      console.error("--------------------------------------------------");
      process.exit(1);
    }
  } catch (error) {
    console.error("Verification execution error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
