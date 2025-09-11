import { NextResponse } from 'next/server';
import { prismaClient } from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const websites = await prismaClient.userWebsite.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        siteUrl: true,
        userId: true,
        categories: true,
        authors: true
      }
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error('Error fetching user websites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user websites' },
      { status: 500 }
    );
  }
} 