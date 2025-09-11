import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/config/auth";
import { prismaClient } from "@/prisma/db";

export type FirstLoginResponse = {
  isFirstLogin: boolean;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prismaClient.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstLoginAt: true,
        lastLoginAt: true,
        createdAt: true,
        firstLoginPopupShown: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if this is a first login
    // First login popup should show only if:
    // 1. User has never seen the popup before (firstLoginPopupShown is false)
    // 2. User was created recently (within last 24 hours to handle edge cases)
    // 3. User has a firstLoginAt timestamp
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const isFirstLogin = !user.firstLoginPopupShown && 
                        user.firstLoginAt &&
                        user.createdAt &&
                        user.createdAt > oneDayAgo;

    const response: FirstLoginResponse = {
      isFirstLogin: Boolean(isFirstLogin),
      firstLoginAt: user.firstLoginAt?.toISOString() || null,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking first login status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Mark first login popup as shown
    await prismaClient.user.update({
      where: { id: session.user.id },
      data: { firstLoginPopupShown: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking first login popup as shown:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
