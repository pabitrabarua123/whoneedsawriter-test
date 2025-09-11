# Firebase Storage Setup Guide

## Overview
This guide will walk you through setting up Firebase Storage for your blog's image uploads. Firebase Storage provides secure, scalable object storage with a generous free tier.

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter project name (e.g., "my-blog-storage")
   - Accept Firebase terms
   - Choose whether to enable Google Analytics (optional for storage)
   - Click "Create project"

## Step 2: Enable Firebase Storage

1. **Navigate to Storage**
   - In your Firebase project dashboard
   - Click "Storage" in the left sidebar
   - Click "Get started"

2. **Choose Security Rules Mode**
   - **Production mode** (recommended): Secure by default
   - **Test mode**: Allows all reads/writes for 30 days
   - Click "Next"

3. **Select Storage Location**
   - Choose a location close to your users
   - Common choices: `us-central1`, `europe-west1`, `asia-southeast1`
   - Click "Done"

## Step 3: Configure Storage Rules

1. **Go to Storage Rules**
   - In Storage section, click "Rules" tab
   - Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to blog images
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if true; // In production, you might want to add authentication
    }
  }
}
```

2. **Publish Rules**
   - Click "Publish" to save the rules

## Step 4: Create Service Account

1. **Go to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Navigate to Service Accounts**
   - Click "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" in the confirmation dialog
   - A JSON file will download - **keep this secure!**

## Step 5: Extract Credentials

From the downloaded JSON file, you'll need these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           // ← FIREBASE_PROJECT_ID
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  // ← FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",  // ← FIREBASE_CLIENT_EMAIL
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## Step 6: Add Environment Variables to Vercel

### Option A: Via Vercel Dashboard
1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add these four variables:

| Name | Value |
|------|-------|
| `UPLOAD_METHOD` | `firebase` |
| `FIREBASE_PROJECT_ID` | Your project ID from JSON |
| `FIREBASE_CLIENT_EMAIL` | Client email from JSON |
| `FIREBASE_PRIVATE_KEY` | Private key from JSON (including `-----BEGIN...` and `-----END...`) |

### Option B: Via Vercel CLI
```bash
vercel env add UPLOAD_METHOD
# Enter: firebase

vercel env add FIREBASE_PROJECT_ID
# Enter: your-project-id

vercel env add FIREBASE_CLIENT_EMAIL
# Enter: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

vercel env add FIREBASE_PRIVATE_KEY
# Enter: -----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----
```

### Option C: Single Service Account Key (Alternative)
Instead of separate variables, you can use the entire JSON as one variable:

```bash
vercel env add UPLOAD_METHOD
# Enter: firebase

vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
# Enter: {"type":"service_account","project_id":"your-project-id",...}
```

## Step 7: Deploy and Test

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Test Upload**
   - Go to your admin panel: `https://your-app.vercel.app/admin`
   - Try uploading an image
   - Verify it appears correctly

## Troubleshooting

### Common Issues

**Error: "Firebase project not configured"**
- Check that `FIREBASE_PROJECT_ID` is set correctly
- Verify the project ID matches your Firebase console

**Error: "Permission denied"**
- Check Firebase Storage rules
- Ensure service account has proper permissions
- Verify `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are correct

**Error: "Invalid private key"**
- Ensure private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace `\n` with actual newlines in the key
- Try using the single JSON service account key option instead

**Images not displaying**
- Check browser console for CORS errors
- Verify Firebase Storage rules allow public read access
- Ensure the generated URLs are publicly accessible

### Testing Locally

1. **Create `.env.local` file**
   ```
   UPLOAD_METHOD=firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
   ```

2. **Test locally**
   ```bash
   npm run dev
   # Visit localhost:3000/admin and test upload
   ```

## Firebase Storage Benefits

- **Free Tier**: 5GB storage, 1GB/day downloads
- **Global CDN**: Fast image delivery worldwide
- **Automatic Scaling**: Handles traffic spikes
- **Security**: Fine-grained access control
- **Integration**: Works seamlessly with other Google services

## Cost Information

Firebase Storage pricing (after free tier):
- Storage: $0.026/GB/month
- Downloads: $0.12/GB
- Operations: $0.05 per 10,000 operations

For a typical blog, you'll likely stay within the free tier limits. 