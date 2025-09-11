# Quick Deployment Guide for Vercel

## Immediate Deployment (Base64 Method)
Your app will work right away with the base64 fallback method:

```bash
# Deploy immediately
vercel --prod
```

The image upload will now work on Vercel using base64 encoding.

## Upgrading to Firebase Storage (Recommended)

### Step 1: Set up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com) and create a project
2. Enable Firebase Storage:
   - Navigate to Storage in the left sidebar
   - Click "Get started"
   - Choose "Start in production mode" (you can modify rules later)
3. Create a service account for server access:
   - Go to Project Settings (gear icon) → Service accounts
   - Click "Generate new private key"
   - Download the JSON file and keep it secure

### Step 2: Add Environment Variables in Vercel
```bash
# Method 1: Using Vercel CLI
vercel env add UPLOAD_METHOD
# Enter: firebase

vercel env add FIREBASE_PROJECT_ID
# Enter: your-project-id (from Firebase console)

vercel env add FIREBASE_CLIENT_EMAIL
# Enter: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

vercel env add FIREBASE_PRIVATE_KEY
# Enter: -----BEGIN PRIVATE KEY-----\nYour private key content\n-----END PRIVATE KEY-----

# Method 2: Via Vercel Dashboard
# 1. Go to your project in Vercel dashboard
# 2. Settings tab → Environment Variables
# 3. Add the four variables above

# Alternative: Use a single service account key
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
# Enter: {"type":"service_account","project_id":"your-project-id",...}
```

### Step 3: Configure Firebase Storage Rules (Optional)
In Firebase Console → Storage → Rules, you can use these rules for public uploads:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /blog-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null || true; // Allow uploads
    }
  }
}
```

### Step 4: Redeploy
```bash
vercel --prod
```

## Alternative: Cloudinary Setup

### Step 1: Set up Cloudinary
1. Go to [Cloudinary.com](https://cloudinary.com) and create a free account
2. From your dashboard, note your **Cloud Name**
3. Go to Settings → Upload → Add Upload Preset
4. Set "Signing Mode" to **Unsigned**
5. Copy the **Upload Preset Name**

### Step 2: Add Environment Variables
```bash
vercel env add UPLOAD_METHOD
# Enter: cloudinary

vercel env add CLOUDINARY_CLOUD_NAME
# Enter: your_cloud_name_from_dashboard

vercel env add CLOUDINARY_UPLOAD_PRESET
# Enter: your_unsigned_preset_name
```

### Step 3: Redeploy
```bash
vercel --prod
```

## Verifying the Fix

1. Go to your deployed admin panel: `https://your-app.vercel.app/admin`
2. Try uploading an image
3. Verify it displays correctly
4. Check that the upload doesn't show "Failed to upload image"

## Environment Variables Summary

### Base64 (Default - No setup needed)
```
# No environment variables needed
```

### Firebase Storage (Recommended)
```
UPLOAD_METHOD=firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
```

### Cloudinary
```
UPLOAD_METHOD=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### AWS S3 (Advanced)
```
UPLOAD_METHOD=aws
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

## Troubleshooting

If you still get upload errors:

1. **Check Vercel function logs:**
   ```bash
   vercel logs
   ```

2. **Verify environment variables:**
   ```bash
   vercel env ls
   ```

3. **Test locally first:**
   ```bash
   npm run dev
   # Try uploading in localhost:3000/admin
   ```

4. **Check browser console** for error messages

5. **For Firebase Storage:**
   - Verify your project ID is correct
   - Check that Storage is enabled in Firebase console
   - Ensure service account has Storage permissions
   - Verify Storage rules allow public access

The main fix is that your upload API now works with serverless environments like Vercel instead of trying to write to the local file system. 