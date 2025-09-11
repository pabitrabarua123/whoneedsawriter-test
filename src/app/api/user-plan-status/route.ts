import { authOptions } from "@/config/auth";
import { prismaClient } from "@/prisma/db";
import { HttpStatusCode } from "axios";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export interface UserPlanStatusResponse {
  planName: string;
  godModeCredits: number;
  liteModeCredits: number;
  validUntil?: string;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
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
        { error: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    let planName = "Free";
    let godModeCredits = 0;
    let liteModeCredits = 0;
    let validUntil: string | undefined;

    // First check UserPlan table using userId
    const userPlan = await prismaClient.userPlan.findFirst({
      where: {
        userId: user.id,
      },
    });

    // If UserPlan exists and has planId, fetch from SubscriptionPlan table
    if (userPlan && userPlan.planId) {
      const subscriptionPlan = await prismaClient.subscriptionPlan.findFirst({
        where: {
          id: userPlan.planId,
        },
      });

      if (subscriptionPlan) {
        planName = subscriptionPlan.name;
        godModeCredits = user.monthyBalance;
        liteModeCredits = user.LiteModeBalance;

        // Get subscription expiry date
        if (userPlan.validUntil) {
          validUntil = userPlan.validUntil.toISOString();
        }
      }
    }
    // Free plan (no active subscription or UserPlan)
    else {
      planName = "Free";
      godModeCredits = user.trialBalance || 0;
      liteModeCredits = 0; // Free plan doesn't have lite mode credits
    }

    const response: UserPlanStatusResponse = {
      planName,
      godModeCredits,
      liteModeCredits,
      validUntil,
    };

    return NextResponse.json(response, { status: HttpStatusCode.Ok });
  } catch (error) {
    console.error("Error fetching user plan status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
