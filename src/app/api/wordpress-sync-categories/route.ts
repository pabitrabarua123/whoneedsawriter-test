// app/api/wordpress-auth/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse JSON data from request body
    const data = await request.json();
    console.log(data);
    const { site_url, categories } = data;


    if (!site_url) {
      return NextResponse.json(
        { success: false, message: 'Site URL not found.' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Find and update website in websites table
    const website = await prisma.userWebsite.findFirst({
      where: {
        siteUrl: site_url.trim(),
      },
    });

    if (website) {
      await prisma.userWebsite.update({
        where: {
          id: website.id,
        },
        data: {
          categories: JSON.stringify(categories),
        }
      });
    }

    return NextResponse.json(
      { success: true, message: 'Categories synced.' },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}