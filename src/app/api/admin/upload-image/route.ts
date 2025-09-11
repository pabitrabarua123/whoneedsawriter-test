import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Check which upload method to use
    const uploadMethod = process.env.UPLOAD_METHOD || 'base64';

    if (uploadMethod === 'firebase' && process.env.FIREBASE_PROJECT_ID) {
      return await uploadToFirebase(file);
    } else if (uploadMethod === 'cloudinary' && process.env.CLOUDINARY_URL) {
      return await uploadToCloudinary(file);
    } else if (uploadMethod === 'aws' && process.env.AWS_ACCESS_KEY_ID) {
      return await uploadToAWS(file);
    } else {
      // Fallback: convert to base64 data URL (works everywhere but not ideal for large files)
      return await uploadAsDataURL(file);
    }

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Upload to Firebase Storage
async function uploadToFirebase(file: File) {
  try {
    // Initialize Firebase Admin SDK
    const admin = await import('firebase-admin');
    
    if (!admin.apps.length) {
      // Initialize Firebase Admin
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
      });
    }

    const bucket = admin.storage().bucket();
    
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `blog-images/${timestamp}_${originalName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Firebase Storage
    const fileRef = bucket.file(filename);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    
    // Make file publicly accessible
    await fileRef.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename
    });
    
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw error;
  }
}

// Upload to Cloudinary
async function uploadToCloudinary(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      filename: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Upload to AWS S3 (you'll need to install aws-sdk)
async function uploadToAWS(file: File) {
  // Note: This requires aws-sdk to be installed
  // npm install @aws-sdk/client-s3
  try {
    // For now, return error suggesting to install AWS SDK
    return NextResponse.json(
      { error: 'AWS upload not implemented. Install @aws-sdk/client-s3 and implement this function.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('AWS upload error:', error);
    throw error;
  }
}

// Convert to base64 data URL (fallback method)
async function uploadAsDataURL(file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: `base64_${Date.now()}`
    });
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw error;
  }
} 