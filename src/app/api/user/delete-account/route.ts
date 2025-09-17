import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    const userId = session.user.id;

    // Delete all user-related data in the correct order (respecting foreign key constraints)
    await prismaClient.$transaction(async (tx) => {
      // Delete user onboarding data
      await tx.userOnboarding.deleteMany({
        where: { userId: userId }
      });


      // Delete user plans
      await tx.userPlan.deleteMany({
        where: { userId: userId }
      });

      // Delete pending godmode articles
      await tx.pendingGodmodeArticles.deleteMany({
        where: { userId: userId }
      });

      // Delete godmode articles
      await tx.godmodeArticles.deleteMany({
        where: { userId: userId }
      });

      // Delete batch records
      await tx.batch.deleteMany({
        where: { userId: userId }
      });

      // Delete accounts (OAuth providers)
      await tx.account.deleteMany({
        where: { userId: userId }
      });

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
