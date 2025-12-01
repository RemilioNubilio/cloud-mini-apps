import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;

interface UploadedImage {
  url: string;
  base64: string;
}

interface UploadImageResponse {
  success: boolean;
  urls?: string[];
  images?: UploadedImage[];
  message?: string;
  error?: string;
}

// Check if we're using local storage (development fallback)
const useLocalStorage = !process.env.BLOB_READ_WRITE_TOKEN;

/**
 * POST /api/upload-images
 * 
 * Upload 1-3 images to Vercel Blob storage for character avatars
 * Falls back to local file storage for development when BLOB_READ_WRITE_TOKEN is not set
 * 
 * Request: multipart/form-data with "images" field (File[])
 * Response: { success: true, urls: string[] }
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadImageResponse>> {
  try {
    // Log storage mode
    if (useLocalStorage) {
      console.log("[Upload Images] Using local file storage (development mode)");
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

    // 5. UPLOAD IMAGES (Vercel Blob or local storage) AND convert to base64
    const uploadPromises = images.map(async (image, index): Promise<UploadedImage> => {
      try {
        // Convert File to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64 data URL (always do this for reliable storage)
        const base64 = `data:${image.type};base64,${buffer.toString("base64")}`;

        // Generate safe filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const sanitizedName = image.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/_{2,}/g, "_")
          .toLowerCase();
        const filename = `${timestamp}-${randomSuffix}-${sanitizedName}`;

        let url = base64; // Default to base64 if storage fails

        if (useLocalStorage) {
          // LOCAL STORAGE: Save to public/uploads directory
          const uploadsDir = path.join(process.cwd(), "public", "uploads", "crush-avatars");

          // Create uploads directory if it doesn't exist
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
          }

          const filePath = path.join(uploadsDir, filename);
          await writeFile(filePath, buffer);

          // Return local URL (accessible via /uploads/crush-avatars/filename)
          url = `/uploads/crush-avatars/${filename}`;
          console.log(`[Upload Images] ✅ Saved locally ${index + 1}/${images.length}: ${url}`);
        } else {
          // VERCEL BLOB: Upload to cloud storage
          try {
            const blob = await put(`crush-avatars/${filename}`, buffer, {
              access: "public",
              contentType: image.type,
              addRandomSuffix: false, // We already added timestamp + random suffix
            });
            url = blob.url;
            console.log(`[Upload Images] ✅ Uploaded to Vercel Blob ${index + 1}/${images.length}: ${filename}`);
          } catch (blobError) {
            console.warn(`[Upload Images] ⚠️ Blob upload failed, using base64 fallback:`, blobError);
            // url remains as base64
          }
        }

        return { url, base64 };
      } catch (error) {
        console.error(`[Upload Images] ❌ Failed to process image ${index + 1}:`, error);
        throw new Error(
          `Failed to process "${image.name}": ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    // Wait for all uploads to complete
    let uploadedImages: UploadedImage[];
    try {
      uploadedImages = await Promise.all(uploadPromises);
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
    const storageType = useLocalStorage ? "locally" : "to Vercel Blob";
    console.log(`[Upload Images] ✅ Successfully processed ${uploadedImages.length} image(s) ${storageType}`);

    return NextResponse.json({
      success: true,
      urls: uploadedImages.map(img => img.url), // Backward compatibility
      images: uploadedImages, // New: includes both url and base64
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
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

