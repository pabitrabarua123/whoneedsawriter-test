import { prismaClient } from "@/prisma/db";
import { NextResponse } from "next/server";

// CORS headers — set allowed origin carefully in production
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // ✅ Change to your allowed domain
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    // Get API key from request headers
    const apiKeyHeader = request.headers.get("x-api-key");
    if (!apiKeyHeader) {
      return new Response(JSON.stringify({ error: "API key is missing" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    console.log(apiKeyHeader);
    // Validate API key
    const apiKeyRecord = await prismaClient.apiKey.findFirst({
      where: {
        api_key: apiKeyHeader,
        status: 1, // only active keys
      },
    });

    if (!apiKeyRecord) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 403,
        headers: CORS_HEADERS,
      });
    }

    const userId = apiKeyRecord.userId;

    // Check user's lifetime balance before creating any database entries
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { lifetimeBalance: true }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    if (user.lifetimeBalance <= 0) {
      return new Response(JSON.stringify({ error: "Insufficient lifetime balance" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    let batch = "Batch_" + (Math.floor(Math.random() * 9000) + 1000);
    let finalBatchName = batch.trim();
    let suffix = 1;

    // Check if the batch name exists
    let exists = await prismaClient.batch.findFirst({
        where: { name: finalBatchName }
    });

    // If exists, keep incrementing a suffix until it's unique
    while (exists) {
        finalBatchName = `${batch}${suffix}`;
        suffix++;

        exists = await prismaClient.batch.findFirst({
            where: { name: finalBatchName }
        });
    }

    let batch_created = await prismaClient.batch.create({
      data: {
        userId,
        name: finalBatchName,
        articleType: "godmode",
        articles: 1,
        completed_articles: 0,
        pending_articles: 1,
        failed_articles: 0,
        status: 0,
      },
   });

    // Parse request body
    const { keyword, wordLimit, featuredImage, imageInArticle } = await request.json();

    if (!keyword || typeof keyword !== "string") {
      return new Response(JSON.stringify({ error: "Invalid keyword" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Apply default values for optional fields
    const finalWordLimit = wordLimit !== undefined ? parseInt(wordLimit) : 2000;
    const finalFeaturedImage = featuredImage !== undefined ? featuredImage : "Yes";
    const finalImageInArticle = imageInArticle !== undefined ? imageInArticle : "No";

    // Create article
    const article = await prismaClient.godmodeArticles.create({
      data: {
        userId,
        batchId: batch_created.id,
        keyword: keyword,
        articleType: "godmode",
        featuredImageRequired: finalFeaturedImage === "yes" || finalFeaturedImage === "Yes" ? "Yes" : "No",
        additionalImageRequired: finalImageInArticle === "yes" || finalImageInArticle === "Yes" ? "Yes" : "No",
        wordLimit: finalWordLimit,
        comment: ".",
      },
    });

    // Create pending article entry
    await prismaClient.pendingGodmodeArticles.create({
      data: {
        userId,
        keywordId: keyword,
        batchId: batch_created.id,
        cronRequest: 0,
        godmodeArticleId: article.id,
      },
    });

    // Update lifetime balance
    await prismaClient.user.update({
      where: { id: userId },
      data: {
        lifetimeBalance: {
          decrement: 1,
        },
      },
    });

    return new Response(JSON.stringify({ status: 200, message: "accepted", articleId: article.id }), {
      status: 200,
      headers: CORS_HEADERS,
    });

  } catch (error) {
    console.error("Error creating article:", error);
    return new Response(JSON.stringify({ error: "Failed to create article" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
