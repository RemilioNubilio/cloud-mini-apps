import { type NextRequest, NextResponse } from "next/server";

interface CreateCrushRequest {
  name: string;
  backstory?: string;
  personality?: string;
  avatarUrl?: string;
  avatarBase64?: string;
  imageUrls?: string[];
  imageBase64s?: string[];
}

interface ElizaCloudResponse {
  success: boolean;
  characterId: string;
  sessionId: string;
  redirectUrl: string;
  message: string;
  error?: string;
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  if (url.startsWith("data:image/")) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);
    const trustedDomains = [
      "vercel-storage.com",
      "blob.vercel-storage.com",
    ];

    return trustedDomains.some((domain) => parsedUrl.hostname.includes(domain));
  } catch {
    if (url.startsWith("/uploads/")) {
      return true;
    }
    return false;
  }
}

function extractValidImages(body: CreateCrushRequest): {
  avatarUrl: string | undefined;
  avatarBase64: string | undefined;
  imageUrls: string[];
  imageBase64s: string[];
} {
  let avatarUrl: string | undefined;
  let avatarBase64: string | undefined;
  const imageUrls: string[] = [];
  const imageBase64s: string[] = [];

  if (body.avatarBase64 && body.avatarBase64.startsWith("data:image/")) {
    avatarBase64 = body.avatarBase64;
  }

  if (body.avatarUrl && isValidImageUrl(body.avatarUrl)) {
    if (body.avatarUrl.startsWith("data:image/")) {
      avatarBase64 = avatarBase64 || body.avatarUrl;
    } else {
      avatarUrl = body.avatarUrl;
    }
  }

  if (body.imageUrls && Array.isArray(body.imageUrls)) {
    for (const url of body.imageUrls) {
      if (typeof url === "string" && isValidImageUrl(url)) {
        if (url.startsWith("data:image/")) {
          imageBase64s.push(url);
        } else if (!imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      }
    }
  }

  if (body.imageBase64s && Array.isArray(body.imageBase64s)) {
    for (const base64 of body.imageBase64s) {
      if (
        typeof base64 === "string" &&
        base64.startsWith("data:image/") &&
        !imageBase64s.includes(base64)
      ) {
        imageBase64s.push(base64);
      }
    }
  }

  return {
    avatarUrl,
    avatarBase64,
    imageUrls: imageUrls.slice(0, 10),
    imageBase64s: imageBase64s.slice(0, 10),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCrushRequest = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const sanitizedName = body.name.trim().slice(0, 50);
    const sanitizedBackstory = body.backstory?.trim().slice(0, 500) || "";
    const sanitizedPersonality = body.personality?.trim().slice(0, 1000) || "";

    const { avatarUrl, avatarBase64, imageUrls, imageBase64s } =
      extractValidImages(body);

    console.log(`[Create-Crush API] Image extraction result:`, {
      hasAvatarUrl: !!avatarUrl,
      hasAvatarBase64: !!avatarBase64,
      imageUrlCount: imageUrls.length,
      imageBase64Count: imageBase64s.length,
    });

    const bioLines: string[] = [];

    if (sanitizedBackstory) {
      bioLines.push(`Backstory: ${sanitizedBackstory}`);
    }

    if (sanitizedPersonality) {
      const personalityPreview = sanitizedPersonality.slice(0, 300);
      bioLines.push(
        `Personality traits: ${personalityPreview}${sanitizedPersonality.length > 300 ? "..." : ""}`,
      );
    }

    const finalAvatarUrl = avatarBase64 || avatarUrl;

    const elizaCharacter = {
      name: sanitizedName,
      bio: bioLines,
      lore: [
        sanitizedBackstory || "You have a special connection with the user.",
        ...(sanitizedPersonality
          ? [`Personality context: ${sanitizedPersonality}`]
          : []),
      ],
      style: {
        all: [
          "Keep responses concise and natural",
          "Be conversational, not robotic",
        ],
        chat: [
          "Use casual language",
          "Show personality in every message",
          "React emotionally to what the user says",
        ],
      },
      avatar_url: finalAvatarUrl,
    };

    const elizaCloudUrl =
      process.env.NEXT_PUBLIC_CLONEURCRUSH_ELIZA_URL || "http://localhost:3000";
    const apiKey = process.env.CLONEURCRUSH_ELIZA_API_KEY;

    if (!apiKey) {
      console.error(
        "[Create-Crush API] CLONEURCRUSH_ELIZA_API_KEY not configured",
      );
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 },
      );
    }

    console.log(
      `[Create-Crush API] Creating character "${sanitizedName}"`,
      {
        hasAvatar: !!finalAvatarUrl,
        avatarType: avatarBase64 ? "base64" : avatarUrl ? "url" : "none",
        hasImages: imageUrls.length > 0 || imageBase64s.length > 0,
        hasPersonality: !!sanitizedPersonality,
      },
    );

    const allImages = [
      ...imageUrls.map((url) => ({ type: "url" as const, data: url })),
      ...imageBase64s.map((base64) => ({ type: "base64" as const, data: base64 })),
    ];

    const response = await fetch(
      `${elizaCloudUrl}/api/affiliate/create-character`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          character: elizaCharacter,
          affiliateId: "clone-your-crush",
          metadata: {
            source: "landing-page",
            backstory: sanitizedBackstory,
            personality: sanitizedPersonality,
            imageUrls: imageUrls,
            imageBase64s: imageBase64s.length > 0 ? imageBase64s : undefined,
            images: allImages.length > 0 ? allImages : undefined,
            avatarBase64: avatarBase64,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("[Create-Crush API] ElizaOS Cloud API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Authentication failed. Please try again later." },
          { status: 502 },
        );
      } else if (response.status === 403) {
        console.error("[Create-Crush API] API key lacks required permissions");
        return NextResponse.json(
          { error: "Service configuration error. Please contact support." },
          { status: 502 },
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in a few moments." },
          { status: 429 },
        );
      } else {
        return NextResponse.json(
          { error: "Failed to create your character. Please try again." },
          { status: 502 },
        );
      }
    }

    const result: ElizaCloudResponse = await response.json();

    if (!result.success || !result.characterId) {
      console.error(
        "[Create-Crush API] Invalid response from ElizaOS Cloud:",
        result,
      );
      return NextResponse.json(
        { error: "Invalid response from server. Please try again." },
        { status: 500 },
      );
    }

    console.log(`[Create-Crush API] Character created successfully:`, {
      characterId: result.characterId,
      sessionId: result.sessionId,
    });

    return NextResponse.json({
      success: true,
      characterId: result.characterId,
      sessionId: result.sessionId,
      redirectUrl: result.redirectUrl,
      message: "Character created successfully",
    });
  } catch (error) {
    console.error("[Create-Crush API] Unexpected error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
}
