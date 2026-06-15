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

    const requests = await prisma.optOutRequest.findMany({
      where: { userId },
      include: {
        broker: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      userId,
      requests,
    });
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
