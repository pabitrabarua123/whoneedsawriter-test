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
    const usersEndpoint = `${baseUrl}/wp-json/wp/v2/users`;

    const response = await fetch(usersEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const users = await response.json();

    // Transform the users to match the expected format
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      slug: user.slug,
      link: user.link
    }));

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Error fetching WordPress users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from WordPress site' },
      { status: 500 }
    );
  }
} 