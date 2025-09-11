import { prismaClient } from "@/prisma/db";
import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log("🚀 Godmode Articles Cron Job Started");
  
  try {
    // Find articles that need processing (requestProcess = 0), limit to 5
    const articlesToProcess = await prismaClient.godmodeArticles.findMany({
      where: {
        requestProcess: 0,
        status: 0,
        articleType: "godmode"
      },
      take: 5,
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        keyword: true,
        batchId: true,
        userId: true,
        featuredImage: true,
        svgUrl: true,
        metaTitle: true,
        metaDescription: true
      }
    });

    if (articlesToProcess.length === 0) {
      console.log("No articles to process");
      return NextResponse.json({ 
        success: true, 
        message: "No articles to process",
        processed: 0 
      });
    }

    console.log(`Found ${articlesToProcess.length} articles to process`);

    const processedBatches = new Set<string>();

    // Process articles in parallel to avoid hanging
    const processingPromises = articlesToProcess.map(async (article) => {
      try {
        // Mark article as being processed FIRST
        await prismaClient.godmodeArticles.update({
          where: { id: article.id },
          data: { requestProcess: 1 }
        });

        // Get additional article details we might need
        const fullArticle = await prismaClient.godmodeArticles.findUnique({
          where: { id: article.id },
          select: {
            id: true,
            keyword: true,
            batchId: true,
            userId: true,
            featuredImageRequired: true,
            additionalImageRequired: true,
            wordLimit: true,
            comment: true,
          }
        });

        if (!fullArticle) return null;

        // Prepare form data for make.com API
        const params = new URLSearchParams();
        params.append('keyword', fullArticle.keyword);
        params.append('id', fullArticle.id);
        params.append('userId', fullArticle.userId);
        params.append('batchId', fullArticle.batchId);
        params.append('articleType', 'godmode');
        params.append('status', '0');
        params.append('featured_image_required', fullArticle.featuredImageRequired || 'No');
        params.append('additional_image_required', fullArticle.additionalImageRequired || 'No');
        params.append('expand_article', 'No');
        params.append('links', '.');
        params.append('secret_key', 'kdfmnids9fds0fi4nrjr(*^nII');
      //  params.append('secret_key', 'kdfmnids9fds0fi4nrjr');
        
        // Add optional fields
        if (fullArticle.wordLimit) {
          params.append('word_limit', fullArticle.wordLimit.toString());
        }
        
        if (fullArticle.comment) {
          params.append('comment', fullArticle.comment);
        } else {
          params.append('comment', '.');
        }


        console.log(params.toString());
        // Fire-and-forget API call to make.com (don't await the response)
        axios.post('https://hook.eu2.make.com/u0yss4lheap5qezqxgo3bcmhnhif517x', params.toString(), {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          },
          timeout: 5000 // Shorter timeout
        }).then(() => {
          console.log(`✅ Successfully sent request to make.com for article ${fullArticle.id} (keyword: ${fullArticle.keyword})`);
        }).catch((error) => {
          console.error(`❌ Make.com API call failed for article ${fullArticle.id}:`, error.message);
          // Don't reset requestProcess here since we already marked it as processed
        });

        // Add batch to set for checking completion
        processedBatches.add(fullArticle.batchId);
        
        return fullArticle.batchId;

      } catch (error) {
        console.error(`❌ Failed to process article ${article.id}:`, error);
        
        // Reset requestProcess if database operations failed
        try {
          await prismaClient.godmodeArticles.update({
            where: { id: article.id },
            data: { requestProcess: 0 }
          });
        } catch (resetError) {
          console.error(`❌ Failed to reset requestProcess for article ${article.id}`);
        }
        
        return null;
      }
    });

    // Wait for all database operations to complete (but not make.com API calls)
    const results = await Promise.allSettled(processingPromises);
    
    // Collect processed batches from successful operations
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        processedBatches.add(result.value);
      }
    });

    // Check batch completion for all affected batches
    const batchArray = Array.from(processedBatches);
    for (const batchId of batchArray) {
      await checkAndUpdateBatchCompletion(batchId);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${articlesToProcess.length} articles`,
      processed: articlesToProcess.length,
      batchesChecked: processedBatches.size
    });

  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process articles" 
    }, { status: 500 });
  }
}

async function checkAndUpdateBatchCompletion(batchId: string) {
  try {
    // Get all articles in this batch
    const batchArticles = await prismaClient.godmodeArticles.findMany({
      where: { batchId },
      select: { requestProcess: true }
    });

    // Check if all articles have been processed (requestProcess = 1)
    const allProcessed = batchArticles.every(article => article.requestProcess === 1);

    if (allProcessed && batchArticles.length > 0) {
      // Update batch startProcess to 1
      await prismaClient.batch.update({
        where: { id: batchId },
        data: { 
          startProcess: 1,
          updatedAt: new Date()
        }
      });

      console.log(`🎉 Batch ${batchId} completed - all ${batchArticles.length} articles processed`);
    } else {
      console.log(`📊 Batch ${batchId} progress: ${batchArticles.filter(a => a.requestProcess === 1).length}/${batchArticles.length} articles processed`);
    }

  } catch (error) {
    console.error(`❌ Failed to check batch completion for ${batchId}:`, error);
  }
} 