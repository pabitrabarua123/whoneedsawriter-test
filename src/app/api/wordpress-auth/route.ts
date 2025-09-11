// app/api/wordpress-auth/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse JSON data from request body
    const data = await request.json();
    console.log(data);
    const { email, site_url, categories, authors } = data;

    // Validate input
    if (!email?.trim() || !site_url?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if user exists in users table
    const user = await prisma.user.findUnique({
      where: {
        email: email.trim()
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Insert or update website in websites table
    await prisma.userWebsite.create({
      data: {
        userId: user.id,
        siteUrl: site_url.trim(),
        name: site_url.trim(),
        categories: JSON.stringify(categories),
        authors: JSON.stringify(authors),
      }
    });

    return NextResponse.json(
      { success: true, message: 'Email validated and website registered.' },
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