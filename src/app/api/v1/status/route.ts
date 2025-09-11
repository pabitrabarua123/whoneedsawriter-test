import { prismaClient } from "@/prisma/db";

// Reusable CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // change to your allowed domain
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

// Handle preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const articleId = url.searchParams.get("articleId");

    if (!articleId) {
      return new Response(JSON.stringify({ error: "Missing articleId" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // API key authentication
    const apiKeyHeader = request.headers.get("x-api-key");
    if (!apiKeyHeader) {
      return new Response(JSON.stringify({ error: "API key is missing" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const apiKeyRecord = await prismaClient.apiKey.findFirst({
      where: { api_key: apiKeyHeader, status: 1 },
    });

    if (!apiKeyRecord) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 403,
        headers: CORS_HEADERS,
      });
    }

    const userId = apiKeyRecord.userId;

    // Fetch article for this user
    const article = await prismaClient.godmodeArticles.findFirst({
      where: { id: articleId, userId },
      select: { content: true },
    });

    if (!article) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    // Check if content exists
    const status = article.content && article.content.trim() !== "" ? "ready" : "pending";

    return new Response(JSON.stringify({ status, articleId, content: article.content }), {
      status: 200,
      headers: CORS_HEADERS,
    });

  } catch (error) {
    console.error("Error checking article status:", error);
    return new Response(JSON.stringify({ error: "Failed to check status" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
