import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized", isAdmin: false },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", isAdmin: false },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Check if user has admin role (role = 1)
    // Type assertion to access role property
    const isAdmin = (user as any).role === 1;

    return NextResponse.json(
      { isAdmin },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { error: "Internal Server Error", isAdmin: false },
      { status: HttpStatusCode.InternalServerError }
    );
  }
} 