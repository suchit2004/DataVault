import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    const { enabled } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's safeshare toggle
    user = await prisma.user.update({
      where: { id: userId },
      data: { safeshareEnabled: enabled },
    });

    let contribution = null;

    if (enabled) {
      // Create generalized / anonymized payload
      // Generalize city to a region (e.g. "Los Angeles, CA" -> "CA Region / 900xx")
      let region = "Unknown Region";
      if (user.city) {
        const parts = user.city.split(",");
        if (parts.length > 1) {
          region = `${parts[parts.length - 1].trim()} Region`;
        } else {
          region = `${user.city} Region`;
        }
      }

      // Generate a mock age bracket stably
      const nameHash = user.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const brackets = ["18-24", "25-34", "35-44", "45-54", "55+"];
      const ageGroup = brackets[nameHash % brackets.length];

      const anonymized = {
        ageBracket: ageGroup,
        region: region,
        demographicsGeneral: "Anonymized Public Safety Telemetry",
        contributedAt: new Date().toISOString(),
      };

      // Check if there is an active contribution
      const existingContrib = await prisma.safeShareContribution.findFirst({
        where: {
          userId,
          withdrawnAt: null,
        },
      });

      if (!existingContrib) {
        contribution = await prisma.safeShareContribution.create({
          data: {
            userId,
            anonymizedPayload: JSON.stringify(anonymized),
            createdAt: new Date(),
          },
        });
      } else {
        contribution = existingContrib;
      }
    } else {
      // Disable contribution: set withdrawnAt
      const activeContrib = await prisma.safeShareContribution.findFirst({
        where: {
          userId,
          withdrawnAt: null,
        },
      });

      if (activeContrib) {
        contribution = await prisma.safeShareContribution.update({
          where: { id: activeContrib.id },
          data: {
            withdrawnAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      safeshareEnabled: user.safeshareEnabled,
      contribution,
    });
  } catch (error) {
    console.error("SafeShare toggle error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
