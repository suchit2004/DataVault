import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateOptOutLetter, calculateDeadline } from "@/lib/optoutGenerator";

export async function POST(request, { params }) {
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

    // Find all exposed records for this user
    const exposures = await prisma.exposureRecord.findMany({
      where: {
        userId,
        status: "Exposed",
      },
      include: {
        broker: true,
      },
    });

    if (exposures.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No exposed brokers detected or opt-out already triggered.",
        requests: [],
      });
    }

    const createdRequests = [];

    for (const exp of exposures) {
      const broker = exp.broker;
      const letterText = generateOptOutLetter(user, broker);
      const deadline = calculateDeadline(broker.jurisdiction);

      // Create the OptOutRequest
      const optOutRequest = await prisma.optOutRequest.create({
        data: {
          userId,
          brokerId: broker.id,
          letterText,
          deadline,
          status: "Pending",
        },
      });

      // Update the ExposureRecord status to "Pending"
      await prisma.exposureRecord.update({
        where: { id: exp.id },
        data: { status: "Pending" },
      });

      createdRequests.push(optOutRequest);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated and sent ${createdRequests.length} opt-out letters.`,
      requests: createdRequests,
    });
  } catch (error) {
    console.error("Opt-out trigger error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
