import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";

export async function GET(req: NextRequest) {

  try{
    const subscriptionPlans = await prismaClient.subscriptionPlan.findMany({orderBy: {price: 'asc'}});
    const lifetimePlans = await prismaClient.lifetimePlan.findMany({orderBy: {price: 'asc'}});
    return NextResponse.json({ subscriptionPlans, lifetimePlans });
  }catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }

}
