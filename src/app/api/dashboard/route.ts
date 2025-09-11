import { authOptions } from "@/config/auth";
import { prismaClient } from "@/prisma/db";
import { HttpStatusCode } from "axios";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from 'date-fns';

export type DashboardData = {
  revenue: {
    value: number;
    increase: string;
  };
  subscriptions: {
    value: number;
    increase: string;
  };
  orders: {
    value: string;
    increase: string;
  };
  activeNow: {
    value: number;
    increase: string;
  };
  charts: {
    name: string;
    total: number;
  }[];
  trend: {
    date: string;
    total: number;
  }[];
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    const userId = session.user.id;
    const currentYear = new Date().getFullYear();

    // Get counts and monthly data in a single optimized query
    const result = await prismaClient.godmodeArticles.groupBy({
      by: ['articleType', 'batchId', 'createdAt'],
      where: { 
        userId,
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      },
      _count: true
    });

    // Process the data efficiently
    const godmodeCount = result.filter(r => r.articleType === 'godmode')
      .reduce((sum, r) => sum + (r._count || 0), 0);
    const liteModeCount = result.filter(r => r.articleType === 'liteMode')
      .reduce((sum, r) => sum + (r._count || 0), 0);
    const uniqueBatches = Array.from(new Set(result.map(r => r.batchId)));

    // Process monthly data efficiently
    const monthlyCounts = new Array(12).fill(0);
    result.forEach(r => {
      const date = new Date(r.createdAt);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()] += r._count || 0;
      }
    });

    const charts = monthlyCounts.map((total, i) => ({
      name: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
      total
    }));

    // calculate member age in years/months/days from user table
    const userProfile = await prismaClient.user.findUnique({
      where: {
        id: userId
      }
    });
    
    // Function to calculate age difference and format it
    const calculateAge = (startDate: Date, endDate: Date): string => {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const years = Math.floor(diffDays / 365);
      const remainingDays = diffDays % 365;
      const months = Math.floor(remainingDays / 30);
      const days = remainingDays % 30;
      
      let result = '';
      
      if (years > 0) {
        result += `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0 || days > 0) result += ' ';
      }
      
      if (months > 0) {
        result += `${months} month${months > 1 ? 's' : ''}`;
        if (days > 0) result += ' ';
      }
      
      if (days > 0 || (years === 0 && months === 0)) {
        result += `${days} day${days > 1 ? 's' : ''}`;
      }
      
      return result;
    };
    
    const now = new Date();
    const createdAt = userProfile?.createdAt || now;
    const ageString = calculateAge(createdAt, now);

    const data: DashboardData = {
      revenue: {
        value: godmodeCount,
        increase: "+20.1%",
      },
      subscriptions: {
        value: liteModeCount,
        increase: "+180%",
      },
      orders: {
        value: ageString,
        increase: "+19%",
      },
      activeNow: {
        value: uniqueBatches.length,
        increase: "+201",
      },
      charts,
      trend: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(currentYear, i, 1).toISOString().split('T')[0],
        total: Math.floor(Math.random() * 5000) + 1000,
      })),
    };

    return NextResponse.json({ data }, { status: HttpStatusCode.Ok });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
