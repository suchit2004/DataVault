import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch exposures
    const exposures = await prisma.exposureRecord.findMany({
      where: { userId },
      include: { broker: true },
    });

    // Fetch opt-out requests
    const requests = await prisma.optOutRequest.findMany({
      where: { userId },
      include: { broker: true },
      orderBy: { submittedAt: "desc" },
    });

    // Fetch ledger logs
    const ledger = await prisma.safeShareAuditLedger.findMany({
      orderBy: { timestamp: "desc" },
    });

    // Fetch relist events
    const relistEvents = await prisma.relistEvent.findMany({
      where: { userId },
      include: { broker: true },
    });

    // Calculate honey-pot aliases
    const honeyPots = requests.map((req) => {
      const brokerKey = req.broker.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const emailLocal = user.email.split("@")[0];
      const alias = `${emailLocal}+shield_${brokerKey}@datavault.com`;
      return {
        id: req.id,
        brokerName: req.broker.name,
        alias,
        status: req.status === "Complied" ? "De-active (Purged)" : "Active Auditing",
        detectedSpam: req.status === "Non-Compliant" ? 3 : 0, // Mock spam interceptions for non-compliant brokers
      };
    });

    // Stats
    const totalExposures = exposures.length;
    const exposedCount = exposures.filter((e) => e.status === "Exposed").length;
    const pendingCount = requests.filter((r) => r.status === "Pending").length;
    const compliedCount = requests.filter((r) => r.status === "Complied").length;
    const nonCompliantCount = requests.filter((r) => r.status === "Non-Compliant").length;

    // Calculate dynamic risk score trajectory
    const currentScore = user.riskScore;
    const projectedScore = Math.max(12, currentScore - (compliedCount * 10) - (requests.length * 8));

    const riskTrajectory = [
      { label: "Onboarding", score: 0 },
      { label: "Post-Scan", score: currentScore },
      { label: "Opt-Out Filed", score: Math.max(18, Math.round(currentScore * 0.78)) },
      { label: "30-Day Project.", score: Math.round(projectedScore) },
    ];

    return NextResponse.json({
      success: true,
      data: {
        user,
        exposures,
        requests,
        ledger,
        relistEvents,
        honeyPots,
        stats: {
          totalExposures,
          exposedCount,
          pendingCount,
          compliedCount,
          nonCompliantCount,
          currentRiskScore: user.riskScore,
          projectedRiskScore: projectedScore,
        },
        riskTrajectory,
      },
    });
  } catch (error) {
    console.error("Dashboard state error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
