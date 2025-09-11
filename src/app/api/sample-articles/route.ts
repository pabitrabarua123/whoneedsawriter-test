import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch 3 published blog posts, ordered by creation date (newest first)
    // @ts-ignore - BlogPost model exists in schema but TypeScript may not recognize it yet
    const blogPosts = await prismaClient.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'asc' },
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        ogImageUrl: true,
        date: true
      }
    });
    
    return NextResponse.json({
      articles: blogPosts
    });
  } catch (error) {
    console.error('Error fetching sample articles:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch sample articles',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 