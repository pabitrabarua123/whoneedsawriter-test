import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    const { newEmail } = await req.json();

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Check if email already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email address is already in use" },
        { status: HttpStatusCode.Conflict }
      );
    }

    // Update user email
    const updatedUser = await prismaClient.user.update({
      where: { id: session.user.id },
      data: { email: newEmail }
    });

    return NextResponse.json(
      { 
        message: "Email updated successfully",
        user: { email: updatedUser.email }
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
