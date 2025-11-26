import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;

interface UploadImageResponse {
  success: boolean;
  urls?: string[];
  message?: string;
  error?: string;
}

/**
 * POST /api/upload-images
 * 
 * Upload 1-3 images to Vercel Blob storage for character avatars
 * 
 * Request: multipart/form-data with "images" field (File[])
 * Response: { success: true, urls: string[] }
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadImageResponse>> {
  try {
    // 1. CHECK BLOB TOKEN CONFIGURATION
    // Note: BLOB_READ_WRITE_TOKEN is automatically set by Vercel when you connect Blob Storage
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[Upload Images] BLOB_READ_WRITE_TOKEN not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error. Image upload is not available.",
        },
        { status: 500 }
      );
    }

    // 2. PARSE MULTIPART FORM DATA
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("[Upload Images] Failed to parse form data:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format. Expected multipart/form-data.",
        },
        { status: 400 }
      );
    }

    // 3. EXTRACT IMAGES FROM FORM DATA
    const images = formData.getAll("images") as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No images provided. Please select at least one image.",
        },
        { status: 400 }
      );
    }

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many images. Maximum ${MAX_IMAGES} images allowed.`,
        },
        { status: 400 }
      );
    }

    // 4. VALIDATE EACH IMAGE
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // Check if it's actually a File object
      if (!(image instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file at position ${i + 1}`,
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!VALID_IMAGE_TYPES.includes(image.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type for "${image.name}". Only JPEG, PNG, and WebP images are allowed.`,
          },
          { status: 400 }
        );
      }

      // Validate file size
      if (image.size > MAX_FILE_SIZE) {
        const sizeMB = (image.size / (1024 * 1024)).toFixed(2);
        return NextResponse.json(
          {
            success: false,
            error: `File "${image.name}" is too large (${sizeMB}MB). Maximum size is 5MB.`,
          },
          { status: 400 }
        );
      }

      // Validate file name exists
      if (!image.name || image.name.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: `File at position ${i + 1} has no name`,
          },
          { status: 400 }
        );
      }
    }

    console.log(`[Upload Images] Uploading ${images.length} image(s)...`);

    // 5. UPLOAD TO VERCEL BLOB
    const uploadPromises = images.map(async (image, index) => {
      try {
        // Convert File to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate safe filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const sanitizedName = image.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/_{2,}/g, "_")
          .toLowerCase();
        const filename = `${timestamp}-${randomSuffix}-${sanitizedName}`;

        // Upload to Vercel Blob in "crush-avatars" folder
        const blob = await put(`crush-avatars/${filename}`, buffer, {
          access: "public",
          contentType: image.type,
          addRandomSuffix: false, // We already added timestamp + random suffix
        });

        console.log(`[Upload Images] ✅ Uploaded image ${index + 1}/${images.length}: ${filename}`);

        return blob.url;
      } catch (error) {
        console.error(`[Upload Images] ❌ Failed to upload image ${index + 1}:`, error);
        throw new Error(
          `Failed to upload "${image.name}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    // Wait for all uploads to complete
    let uploadedUrls: string[];
    try {
      uploadedUrls = await Promise.all(uploadPromises);
    } catch (error) {
      console.error("[Upload Images] ❌ Upload failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to upload images",
        },
        { status: 500 }
      );
    }

    // 6. RETURN SUCCESS RESPONSE
    console.log(`[Upload Images] ✅ Successfully uploaded ${uploadedUrls.length} image(s)`);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`,
    });
  } catch (error) {
    // Catch-all error handler
    console.error("[Upload Images] ❌ Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Adjust for production
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

