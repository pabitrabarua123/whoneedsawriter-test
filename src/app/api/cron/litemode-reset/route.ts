import { prismaClient } from "@/prisma/db";
import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log("🚀 Litemode reset cron job started");
  
  try {
    await prismaClient.user.updateMany({
      data: { freeCredits: 30 } 
    });

      return NextResponse.json({ 
        success: true, 
        message: "Litemode reset completed successfully"
      });

  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process" 
    }, { status: 500 });
  }
}