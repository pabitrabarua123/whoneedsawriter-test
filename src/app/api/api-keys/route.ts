import { prismaClient } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { nanoid } from "nanoid";

// Generate a secure API key
function generateApiKey(): string {
  return `brag_${nanoid(32)}`;
}

// GET - Fetch all API keys for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const apiKeys = await prismaClient.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        api_key: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST - Create a new API key for the logged-in user (only one per user)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Check if user already has an API key (only one allowed)
    const existingKey = await prismaClient.apiKey.findFirst({
      where: { userId },
    });

    if (existingKey) {
      return NextResponse.json(
        { error: "You can only have one API key. Delete the existing key to create a new one." },
        { status: 400 }
      );
    }

    // Generate unique API key
    let apiKey = generateApiKey();
    let keyExists = await prismaClient.apiKey.findFirst({
      where: { api_key: apiKey },
    });

    // Ensure the generated key is unique
    while (keyExists) {
      apiKey = generateApiKey();
      keyExists = await prismaClient.apiKey.findFirst({
        where: { api_key: apiKey },
      });
    }

    // Create the API key
    const newApiKey = await prismaClient.apiKey.create({
      data: {
        userId,
        api_key: apiKey,
        status: 1, // Active
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: newApiKey.id,
        api_key: newApiKey.api_key,
        status: newApiKey.status,
        createdAt: newApiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an API key
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ error: "API key ID is required" }, { status: 400 });
    }

    // Verify the API key belongs to the user
    const apiKey = await prismaClient.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Delete the API key
    await prismaClient.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ success: true, message: "API key deleted successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle API key status (activate/deactivate)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { keyId, status } = await req.json();

    if (!keyId || status === undefined) {
      return NextResponse.json({ error: "API key ID and status are required" }, { status: 400 });
    }

    // Verify the API key belongs to the user
    const apiKey = await prismaClient.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Update the status
    const updatedApiKey = await prismaClient.apiKey.update({
      where: { id: keyId },
      data: { status: status ? 1 : 0 },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: updatedApiKey.id,
        api_key: updatedApiKey.api_key,
        status: updatedApiKey.status,
        createdAt: updatedApiKey.createdAt,
        updatedAt: updatedApiKey.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}
