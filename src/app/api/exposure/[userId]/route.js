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

    const exposures = await prisma.exposureRecord.findMany({
      where: { userId },
      include: {
        broker: true,
      },
    });

    return NextResponse.json({
      success: true,
      userId,
      exposures,
    });
  } catch (error) {
    console.error("Fetch exposure error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
