import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // @ts-ignore - BlogPost model exists in schema but TypeScript may not recognize it yet
    const blogPost = await prismaClient.blogPost.findUnique({
      where: { slug }
    });

    if (!blogPost) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await prismaClient.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    await prismaClient.blogPost.delete({
      where: { slug }
    });

    return NextResponse.json({ 
      message: 'Blog post deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { message: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
} 