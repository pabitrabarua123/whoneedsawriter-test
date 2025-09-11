import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";
import { ApiError } from "@/types/api.types";

export type TourStatusResponse = {
  tourKey: string;
  completed: boolean;
  skipped: boolean;
};

export type ToursResponse = {
  tours: TourStatusResponse[];
};

// GET /api/user/tours - Get tour completion status
export async function GET(
  request: NextRequest
): Promise<NextResponse<ToursResponse | TourStatusResponse | ApiError>> {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  const { searchParams } = new URL(request.url);
  const tourKey = searchParams.get('tourKey');

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email,
      },
      include: {
        UserOnboarding: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Get or create UserOnboarding record
    let userOnboarding = user.UserOnboarding[0];
    if (!userOnboarding) {
      userOnboarding = await prismaClient.userOnboarding.create({
        data: {
          userId: user.id,
        },
      });
    }

    // If specific tour requested, return only that tour
    if (tourKey) {
      if (tourKey === 'dashboard') {
        return NextResponse.json({
          tourKey: 'dashboard',
          completed: userOnboarding.dashboardTourComplete,
          skipped: userOnboarding.dashboardTourSkipped,
        }, { status: HttpStatusCode.Ok });
      } else if (tourKey === 'article-generator') {
        return NextResponse.json({
          tourKey: 'article-generator',
          completed: userOnboarding.articleGeneratorTourComplete,
          skipped: userOnboarding.articleGeneratorTourSkipped,
        }, { status: HttpStatusCode.Ok });
      } else {
        return NextResponse.json(
          { error: "Invalid tour key" },
          { status: HttpStatusCode.BadRequest }
        );
      }
    }

    // Return all tours
    const tours: TourStatusResponse[] = [
      {
        tourKey: 'dashboard',
        completed: userOnboarding.dashboardTourComplete,
        skipped: userOnboarding.dashboardTourSkipped,
      },
      {
        tourKey: 'article-generator',
        completed: userOnboarding.articleGeneratorTourComplete,
        skipped: userOnboarding.articleGeneratorTourSkipped,
      },
    ];

    return NextResponse.json({ tours }, { status: HttpStatusCode.Ok });
  } catch (error) {
    console.error("Error fetching tour status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

// POST /api/user/tours - Update tour completion status
export async function POST(
  request: NextRequest
): Promise<NextResponse<TourStatusResponse | ApiError>> {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    const body = await request.json();
    const { tourKey, completed, skipped } = body;

    if (!tourKey || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: "tourKey and completed status are required" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const user = await prismaClient.user.findFirst({
      where: {
        email: session?.user?.email,
      },
      include: {
        UserOnboarding: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Get or create UserOnboarding record
    let userOnboarding = user.UserOnboarding[0];
    if (!userOnboarding) {
      userOnboarding = await prismaClient.userOnboarding.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Update tour status based on tourKey
    if (tourKey === 'dashboard') {
      userOnboarding = await prismaClient.userOnboarding.update({
        where: { id: userOnboarding.id },
        data: {
          dashboardTourComplete: completed,
          dashboardTourSkipped: skipped || false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        tourKey: 'dashboard',
        completed: userOnboarding.dashboardTourComplete,
        skipped: userOnboarding.dashboardTourSkipped,
      }, { status: HttpStatusCode.Ok });
    } else if (tourKey === 'article-generator') {
      userOnboarding = await prismaClient.userOnboarding.update({
        where: { id: userOnboarding.id },
        data: {
          articleGeneratorTourComplete: completed,
          articleGeneratorTourSkipped: skipped || false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        tourKey: 'article-generator',
        completed: userOnboarding.articleGeneratorTourComplete,
        skipped: userOnboarding.articleGeneratorTourSkipped,
      }, { status: HttpStatusCode.Ok });
    } else {
      return NextResponse.json(
        { error: "Invalid tour key" },
        { status: HttpStatusCode.BadRequest }
      );
    }
  } catch (error) {
    console.error("Error updating tour status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}