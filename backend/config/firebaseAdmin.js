import dotenv from "dotenv";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
dotenv.config();

const serviceAccount = require("./serviceAccountKey.json");

// Singleton pattern for Firebase initialization
let firebaseApp;
let storageBucket;

const getCorrectBucketName = () => {
  // Get bucket name from environment variable
  const envBucket = process.env.FIREBASE_BUCKET?.trim();
  if (!envBucket) {
    console.warn("⚠️ FIREBASE_BUCKET not found in .env, using default");
    return `${serviceAccount.project_id}.firebasestorage.app`;
  }
  return envBucket;
};

const initializeFirebaseStorage = async () => {
  console.log("📝 Starting Firebase Storage initialization...");
  
  try {
    // Check if app is already initialized
    if (!firebaseApp) {
      const apps = getApps();
      if (apps.length === 0) {
        const bucketName = getCorrectBucketName();
        console.log(`📦 Using bucket: ${bucketName}`);
        
        firebaseApp = initializeApp({
          credential: cert(serviceAccount),
          storageBucket: bucketName
        });
        
        console.log("✅ Firebase Admin initialized successfully");
      } else {
        firebaseApp = apps[0];
        console.log("✅ Using existing Firebase Admin instance");
      }
    }

    // Get or create storage bucket instance
    if (!storageBucket) {
      const storage = getStorage(firebaseApp);
      const bucketName = getCorrectBucketName();
      
      try {
        // Try to get the bucket
        storageBucket = storage.bucket(bucketName);
        
        // Check if bucket exists
        const [exists] = await storageBucket.exists();
        if (!exists) {
          throw new Error(`Storage bucket "${bucketName}" not found. Please check:
            1. You have initialized Firebase Storage in Firebase Console
            2. Your bucket name is correct (currently using: ${bucketName})
            3. Your service account has Storage Admin or Storage Object Admin permissions`);
        }

        // Get bucket metadata
        const [metadata] = await storageBucket.getMetadata();
        console.log("✅ Connected to Firebase Storage bucket:", {
          name: metadata.name,
          location: metadata.location,
          storageClass: metadata.storageClass
        });
      } catch (error) {
        if (error.code === 403) {
          throw new Error(`Permission denied accessing bucket "${bucketName}". 
            Please verify your service account has Storage Admin or Storage Object Admin role.`);
        }
        throw error;
      }
    }

    return storageBucket;
  } catch (error) {
    console.error("❌ Firebase Storage initialization failed:", {
      message: error.message,
      code: error.code,
      details: error.details || {}
    });
    throw error;
  }
};

export const getBucket = async () => {
  try {
    return await initializeFirebaseStorage();
  } catch (error) {
    console.error("Failed to get storage bucket:", error);
    throw error;
  }
};

export const getStorageInstance = () => getStorage(firebaseApp);