import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, phone, city } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: { name, phone, city },
      });
    } else {
      user = await prisma.user.create({
        data: { name, email, phone, city, riskScore: 0 },
      });
    }

    // Get all brokers in DB
    const brokers = await prisma.broker.findMany();

    // Determine exposure (simulated live scan logic)
    const exposureRecords = [];
    let calculatedScore = 35; // base score

    for (const broker of brokers) {
      let isExposed = false;
      let categories = [];

      if (broker.tier === 1) {
        // Tier 1 are people search, almost always exposed
        isExposed = true;
        categories = ["Full Name", "Phone Number", "Age", "Relatives"];
      } else if (broker.tier === 2) {
        // Tier 2 are marketing/financial
        isExposed = name.length % 2 === 0 || email.length % 2 === 0;
        categories = ["Email Address", "Purchase History", "Estimated Income"];
      } else {
        // Tier 3 are risk/legal
        isExposed = name.length % 2 === 1;
        categories = ["Public Records", "Employment History"];
      }

      if (isExposed) {
        // Check if exposure record already exists
        let record = await prisma.exposureRecord.findFirst({
          where: {
            userId: user.id,
            brokerId: broker.id,
          },
        });

        if (!record) {
          record = await prisma.exposureRecord.create({
            data: {
              userId: user.id,
              brokerId: broker.id,
              dataCategories: categories.join(", "),
              status: "Exposed",
            },
          });
        }
        exposureRecords.push({
          ...record,
          broker,
        });

        // Add to risk score
        if (broker.tier === 1) calculatedScore += 10;
        else if (broker.tier === 2) calculatedScore += 7;
        else calculatedScore += 5;
      }
    }

    // Cap score at 92
    const finalScore = Math.min(calculatedScore, 92);

    // Update user's risk score
    user = await prisma.user.update({
      where: { id: user.id },
      data: { riskScore: finalScore },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      riskScore: finalScore,
      exposures: exposureRecords,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
