import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { HttpStatusCode } from "axios";
import { prismaClient } from "@/prisma/db";
import { authOptions } from "@/config/auth";

interface CreateLifetimePurchaseRequest {
  variantId: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Parse request body
    const body: CreateLifetimePurchaseRequest = await req.json();
    const { variantId, name } = body;

    // Validate required fields
    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Get user from database
    const user = await prismaClient.user.findFirst({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Optional: Check if user already has this specific lifetime plan
    // You might want to allow multiple lifetime purchases or restrict them
    // Uncomment if you want to prevent duplicate lifetime purchases
    /*
    const existingLifetimePlan = await prismaClient.user.findFirst({
      where: {
        id: user.id,
        lifetimePlan: { gt: 0 }, // Has any lifetime plan
      },
    });

    if (existingLifetimePlan) {
      return NextResponse.json(
        { error: "User already has a lifetime plan" },
        { status: HttpStatusCode.Conflict }
      );
    }
    */

    // Create checkout using direct API call
    const apiUrl = "https://api.lemonsqueezy.com/v1/checkouts";
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      return NextResponse.json(
        { error: "Missing LemonSqueezy configuration" },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    const requestBody = {
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: `${process.env.NEXTAUTH_URL}/article-generator?payment=success&type=lifetime&plan=${name}`,
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
          },
          checkout_data: {
            email: session.user.email,
            ...(session.user.name && { name: session.user.name }),
            custom: {
              user_id: user.id.toString(),
            },
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    };

    console.log("LemonSqueezy Lifetime API request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LemonSqueezy Lifetime API error:", errorText);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    const checkout = await response.json();

    if (!checkout || !checkout.data) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    // Return checkout URL
    return NextResponse.json(
      {
        checkoutUrl: checkout.data.attributes.url,
        checkoutId: checkout.data.id,
      },
      { status: HttpStatusCode.Ok }
    );

  } catch (error) {
    console.error("Error creating lifetime purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
} 