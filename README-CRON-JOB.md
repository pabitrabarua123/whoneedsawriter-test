# Godmode Articles Cron Job

This cron job processes pending godmode articles by sending them to make.com for content generation and tracking batch completion status.

## Overview

The cron job:
- Runs every minute (when configured)
- Finds up to 5 articles with `requestProcess = 0` and `status = 0`
- Sends article data to make.com webhook
- Marks articles as processed (`requestProcess = 1`)
- Checks if all articles in a batch are processed
- Updates batch `startProcess = 1` when all articles in batch are completed

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Make.com webhook URL for processing godmode articles
MAKE_COM_WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-url-here
```

### 2. Cron Job Configuration

The endpoint is available at: `/api/cron/godmode-articles`

#### For Vercel:
Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/godmode-articles",
      "schedule": "* * * * *"
    }
  ]
}
```

#### For local development or other platforms:
You can set up a cron job to call the endpoint every minute:

```bash
# Add to your crontab (run: crontab -e)
* * * * * curl -X GET http://localhost:3000/api/cron/godmode-articles
```

## How it Works

### 1. Article Processing
- Finds articles where `requestProcess = 0` and `status = 0`
- Limits to 5 articles per run to avoid overwhelming make.com
- Processes oldest articles first (`ORDER BY createdAt ASC`)

### 2. Make.com Integration
Sends a POST request with this payload:
```json
{
  "articleId": "string",
  "keyword": "string", 
  "batchId": "string",
  "userId": "string"
}
```

### 3. Batch Completion Tracking
- After processing articles, checks each affected batch
- If all articles in a batch have `requestProcess = 1`, sets batch `startProcess = 1`
- Provides progress logging for monitoring

### 4. Error Handling
- If make.com request fails, resets `requestProcess = 0` for retry
- Comprehensive logging for debugging
- Graceful handling of missing environment variables

## API Response

Success response:
```json
{
  "success": true,
  "message": "Processed 5 articles",
  "processed": 5,
  "batchesChecked": 2
}
```

Error response:
```json
{
  "success": false,
  "error": "Failed to process articles"
}
```

## Monitoring

The cron job provides detailed console logging:
- 🚀 Job start
- ✅ Successful make.com requests  
- ❌ Failed requests with error details
- 📊 Batch progress updates
- 🎉 Batch completion notifications

## Database Schema

The cron job relies on these fields:

### GodmodeArticles table:
- `requestProcess`: 0 = pending, 1 = processed
- `status`: 0 = not completed, 1 = completed, 2 = failed
- `batchId`: Links to batch table

### batch table:
- `startProcess`: 0 = not started, 1 = all articles processed
- `status`: Overall batch status

## Testing

You can manually trigger the cron job by making a GET request:

```bash
curl -X GET http://localhost:3000/api/cron/godmode-articles
```

Or visit the URL directly in your browser during development. 