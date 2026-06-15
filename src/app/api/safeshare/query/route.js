import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { addLedgerEntry, verifyLedgerIntegrity } from "@/lib/ledger";

export async function POST(request) {
  try {
    const { researcherId, datasetQueried } = await request.json();

    if (!researcherId || !datasetQueried) {
      return NextResponse.json({ error: "Researcher ID and Dataset name are required" }, { status: 400 });
    }

    // Check if there are any active contributions
    const activeContributionsCount = await prisma.safeShareContribution.count({
      where: {
        withdrawnAt: null,
      },
    });

    if (activeContributionsCount === 0) {
      return NextResponse.json({
        success: false,
        error: "Query blocked: No active contributions in the SafeShare pool. Please enable SafeShare first.",
      }, { status: 400 });
    }

    // Add a new cryptographic block to the ledger
    const block = await addLedgerEntry(researcherId, datasetQueried);

    // Verify the integrity of the ledger
    const verification = await verifyLedgerIntegrity();

    return NextResponse.json({
      success: true,
      message: "Researcher query authorized and recorded to audit ledger.",
      block,
      verification,
    });
  } catch (error) {
    console.error("SafeShare query route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET endpoint to verify ledger integrity dynamically
export async function GET() {
  try {
    const verification = await verifyLedgerIntegrity();
    const blocks = await prisma.safeShareAuditLedger.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      verification,
      blocksCount: blocks.length,
      blocks,
    });
  } catch (error) {
    console.error("SafeShare verify route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
