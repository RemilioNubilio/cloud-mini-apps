import { put } from "@vercel/blob";
import { existsSync } from "fs";
import { mkdir,writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;
const MAX_BASE64_SIZE = 10 * 1024 * 1024;

export interface ImageUploadSource {
  type: "file" | "base64" | "url";
  data: string;
  filename?: string;
  mimeType?: string;
}

interface UploadedImage {
  url: string;
  base64?: string;
}

interface UploadImageResponse {
  success: boolean;
  urls?: string[];
  images?: UploadedImage[];
  message?: string;
  error?: string;
  uploadedCount?: number;
  failedCount?: number;
}

const useLocalStorage = !process.env.BLOB_READ_WRITE_TOKEN;

function isValidBase64Image(base64String: string): { valid: boolean; mimeType?: string; error?: string } {
  if (!base64String) {
    return { valid: false, error: "Empty base64 string" };
  }

  const dataUrlMatch = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);

  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1];
    if (!VALID_IMAGE_TYPES.includes(mimeType)) {
      return { valid: false, error: `Invalid image type: ${mimeType}` };
    }
    return { valid: true, mimeType };
  }

  try {
    const buffer = Buffer.from(base64String, 'base64');
    if (buffer.length === 0) {
      return { valid: false, error: "Invalid base64 encoding" };
    }
    return { valid: true, mimeType: "image/jpeg" };
  } catch {
    return { valid: false, error: "Invalid base64 encoding" };
  }
}

function base64ToBuffer(base64String: string): { buffer: Buffer; mimeType: string; base64DataUrl: string } {
  const dataUrlMatch = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);

  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1];
    const base64Data = dataUrlMatch[2];
    return {
      buffer: Buffer.from(base64Data, 'base64'),
      mimeType,
      base64DataUrl: base64String,
    };
  }

  const buffer = Buffer.from(base64String, 'base64');
  const mimeType = "image/jpeg";
  return {
    buffer,
    mimeType,
    base64DataUrl: `data:${mimeType};base64,${base64String}`,
  };
}

function getMimeTypeExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return extensions[mimeType] || "jpg";
}

async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  index: number,
  total: number
): Promise<string> {
  if (useLocalStorage) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "crush-avatars");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const localUrl = `/uploads/crush-avatars/${filename}`;
    console.log(`[Upload Images] ✅ Saved locally ${index + 1}/${total}: ${localUrl}`);

    return localUrl;
  } else {
    const blob = await put(`crush-avatars/${filename}`, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });

    console.log(`[Upload Images] ✅ Uploaded to Vercel Blob ${index + 1}/${total}: ${filename}`);

    return blob.url;
  }
}

async function fetchImageFromUrl(url: string): Promise<{ buffer: Buffer; mimeType: string; base64DataUrl: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.warn(`[Upload Images] Failed to fetch URL ${url}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();

    const validMimeTypes = [...VALID_IMAGE_TYPES, 'image/gif'];
    if (!validMimeTypes.some(type => mimeType.includes(type.split('/')[1]))) {
      console.warn(`[Upload Images] Invalid content type from URL: ${mimeType}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_FILE_SIZE) {
      console.warn(`[Upload Images] Image from URL too large: ${buffer.length} bytes`);
      return null;
    }

    const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return { buffer, mimeType, base64DataUrl };
  } catch (error) {
    console.error(`[Upload Images] Error fetching URL ${url}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadImageResponse>> {
  try {
    if (useLocalStorage) {
      console.log("[Upload Images] Using local file storage (development mode)");
    }

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await handleJsonUpload(request);
    } else if (contentType.includes('multipart/form-data')) {
      return await handleFormDataUpload(request);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid content type. Expected multipart/form-data or application/json.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
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

async function handleJsonUpload(request: NextRequest): Promise<NextResponse<UploadImageResponse>> {
  let body: { images: ImageUploadSource[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON format",
      },
      { status: 400 }
    );
  }

  if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "No images provided. Expected { images: ImageUploadSource[] }",
      },
      { status: 400 }
    );
  }

  if (body.images.length > MAX_IMAGES) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many images. Maximum ${MAX_IMAGES} images allowed.`,
      },
      { status: 400 }
    );
  }

  console.log(`[Upload Images] Processing ${body.images.length} image(s) from JSON...`);

  const uploadedImages: UploadedImage[] = [];
  let failedCount = 0;

  for (let i = 0; i < body.images.length; i++) {
    const imageSource = body.images[i];

    try {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);

      if (imageSource.type === "base64") {
        const validation = isValidBase64Image(imageSource.data);
        if (!validation.valid) {
          console.warn(`[Upload Images] Invalid base64 at index ${i}: ${validation.error}`);
          failedCount++;
          continue;
        }

        if (imageSource.data.length > MAX_BASE64_SIZE) {
          console.warn(`[Upload Images] Base64 too large at index ${i}`);
          failedCount++;
          continue;
        }

        const { buffer, mimeType, base64DataUrl } = base64ToBuffer(imageSource.data);
        const extension = getMimeTypeExtension(mimeType);
        const filename = `${timestamp}-${randomSuffix}-base64.${extension}`;

        const url = await uploadBuffer(buffer, filename, mimeType, i, body.images.length);
        uploadedImages.push({ url, base64: base64DataUrl });

      } else if (imageSource.type === "url") {
        const result = await fetchImageFromUrl(imageSource.data);
        if (!result) {
          failedCount++;
          continue;
        }

        const extension = getMimeTypeExtension(result.mimeType);
        const filename = `${timestamp}-${randomSuffix}-url.${extension}`;

        const url = await uploadBuffer(result.buffer, filename, result.mimeType, i, body.images.length);
        uploadedImages.push({ url, base64: result.base64DataUrl });

      } else {
        console.warn(`[Upload Images] Unknown image type at index ${i}: ${imageSource.type}`);
        failedCount++;
      }
    } catch (error) {
      console.error(`[Upload Images] Failed to process image at index ${i}:`, error);
      failedCount++;
    }
  }

  if (uploadedImages.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload any images",
        failedCount,
      },
      { status: 500 }
    );
  }

  const storageType = useLocalStorage ? "locally" : "to Vercel Blob";
  console.log(`[Upload Images] ✅ Successfully uploaded ${uploadedImages.length} image(s) ${storageType}`);

  return NextResponse.json({
    success: true,
    urls: uploadedImages.map(img => img.url),
    images: uploadedImages,
    message: `Successfully uploaded ${uploadedImages.length} image(s)`,
    uploadedCount: uploadedImages.length,
    failedCount,
  });
}

async function handleFormDataUpload(request: NextRequest): Promise<NextResponse<UploadImageResponse>> {
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

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file at position ${i + 1}`,
        },
        { status: 400 }
      );
    }

    if (!VALID_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type for "${image.name}". Only JPEG, PNG, WebP, and GIF images are allowed.`,
        },
        { status: 400 }
      );
    }

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

  const uploadPromises = images.map(async (image, index): Promise<UploadedImage> => {
    try {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const base64 = `data:${image.type};base64,${buffer.toString("base64")}`;

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const sanitizedName = image.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/_{2,}/g, "_")
        .toLowerCase();
      const filename = `${timestamp}-${randomSuffix}-${sanitizedName}`;

      let url = base64;

      if (useLocalStorage) {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "crush-avatars");

        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        url = `/uploads/crush-avatars/${filename}`;
        console.log(`[Upload Images] ✅ Saved locally ${index + 1}/${images.length}: ${url}`);
      } else {
        try {
          const blob = await put(`crush-avatars/${filename}`, buffer, {
            access: "public",
            contentType: image.type,
            addRandomSuffix: false,
          });
          url = blob.url;
          console.log(`[Upload Images] ✅ Uploaded to Vercel Blob ${index + 1}/${images.length}: ${filename}`);
        } catch (blobError) {
          console.warn(`[Upload Images] ⚠️ Blob upload failed, using base64 fallback:`, blobError);
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

  const storageType = useLocalStorage ? "locally" : "to Vercel Blob";
  console.log(`[Upload Images] ✅ Successfully processed ${uploadedImages.length} image(s) ${storageType}`);

  return NextResponse.json({
    success: true,
    urls: uploadedImages.map(img => img.url),
    images: uploadedImages,
    message: `Successfully uploaded ${uploadedImages.length} image(s)`,
    uploadedCount: uploadedImages.length,
    failedCount: 0,
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
