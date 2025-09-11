# Image Upload Setup for Vercel Deployment

## Problem
The original image upload implementation used the local file system, which doesn't work on Vercel because:
- Vercel functions are serverless and stateless
- The file system is read-only
- Files can't be persisted between function executions

## Solutions

### Option 1: Base64 Data URLs (Default - Works Immediately)
This is the current fallback method that works out of the box but has limitations:

**Pros:**
- No external services needed
- Works immediately on Vercel
- No additional configuration required

**Cons:**
- Increases bundle size
- Not suitable for large images
- URLs are very long

**Setup:** No setup required - this is the default.

### Option 2: Firebase Storage (Recommended)
Part of Google Cloud Platform with generous free tier and excellent performance.

**Setup:**
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firebase Storage:
   - Go to Storage in the Firebase console
   - Click "Get started"
   - Choose "Start in production mode" or "Start in test mode"
3. Create a service account:
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Download the JSON file
4. Add environment variables to Vercel:
   ```
   UPLOAD_METHOD=firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content\n-----END PRIVATE KEY-----"
   ```
   OR use a single service account key:
   ```
   UPLOAD_METHOD=firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
   ```

### Option 3: Cloudinary
Free tier available, excellent image optimization and CDN.

**Setup:**
1. Create a free account at [Cloudinary](https://cloudinary.com)
2. Get your cloud name from the dashboard
3. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Add Upload Preset
   - Set Signing Mode to "Unsigned"
   - Note the preset name
4. Add environment variables to Vercel:
   ```
   UPLOAD_METHOD=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

### Option 4: AWS S3
For those already using AWS ecosystem.

**Setup:**
1. Install AWS SDK: `npm install @aws-sdk/client-s3`
2. Create S3 bucket with public read access
3. Create IAM user with S3 upload permissions
4. Add environment variables to Vercel:
   ```
   UPLOAD_METHOD=aws
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

## Quick Start for Vercel Deployment

### Immediate Fix (Base64)
Your app will work immediately with base64 encoding. No setup required.

### Recommended Fix (Firebase Storage)
1. Create Firebase project and enable Storage
2. Generate service account credentials
3. Add these environment variables in Vercel dashboard:
   - `UPLOAD_METHOD=firebase`
   - `FIREBASE_PROJECT_ID=your-project-id`
   - `FIREBASE_CLIENT_EMAIL=your-service-account-email`
   - `FIREBASE_PRIVATE_KEY=your-private-key`
4. Redeploy your app

## Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add the variables based on your chosen method
5. Redeploy the application

## Testing
After deployment, test the image upload functionality:
1. Go to your admin panel
2. Try uploading an image
3. Verify the image displays correctly
4. Check browser developer tools for any errors

## Troubleshooting
- If uploads still fail, check Vercel function logs
- Ensure environment variables are correctly set
- Verify Firebase/Cloudinary/AWS credentials and permissions
- Check file size limits (max 5MB as configured)
- For Firebase: Ensure Storage rules allow public access 