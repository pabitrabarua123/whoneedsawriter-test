import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get('siteUrl');

    if (!siteUrl) {
      return NextResponse.json(
        { error: 'Site URL is required' },
        { status: 400 }
      );
    }

    // Ensure the URL has proper format
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    const categoriesEndpoint = `${baseUrl}/wp-json/wp/v2/categories`;

    const response = await fetch(categoriesEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    const categories = await response.json();

    // Transform the categories to match the expected format
    const transformedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.count
    }));

    return NextResponse.json(transformedCategories);

  } catch (error) {
    console.error('Error fetching WordPress categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories from WordPress site' },
      { status: 500 }
    );
  }
} 