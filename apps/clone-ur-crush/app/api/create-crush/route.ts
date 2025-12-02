import { type NextRequest, NextResponse } from "next/server";

type Vibe =
  | "playful"
  | "mysterious"
  | "romantic"
  | "bold"
  | "shy"
  | "flirty"
  | "intellectual"
  | "spicy";

interface ScrapedImageData {
  url: string;
  base64?: string;
  isProfilePic?: boolean;
  source?: "instagram" | "twitter" | "upload";
}

interface CreateCrushRequest {
  name: string;
  vibe: Vibe;
  backstory?: string;
  instagram?: string;
  twitter?: string;
  avatarUrl?: string;
  avatarBase64?: string;
  imageUrls?: string[];
  imageBase64s?: string[];
  scrapedImages?: ScrapedImageData[];
  socialContent?: string;
}

interface ElizaCloudResponse {
  success: boolean;
  characterId: string;
  sessionId: string;
  redirectUrl: string;
  message: string;
  error?: string;
}

const VALID_VIBES: Vibe[] = [
  "playful",
  "mysterious",
  "romantic",
  "bold",
  "shy",
  "flirty",
  "intellectual",
  "spicy",
];

const VIBE_PROMPTS: Record<Vibe, string> = {
  playful:
    "playful, teasing, loves jokes and lighthearted banter, mischievous energy",
  mysterious:
    "mysterious, keeps you guessing, intriguing, reveals little about herself",
  romantic:
    "romantic, sweet, affectionate, genuinely caring, uses loving language",
  bold: "confident, direct, takes charge, assertive, knows what she wants",
  shy: "shy, innocent, gets nervous around you, blushes easily, cute and timid",
  flirty:
    "flirty, suggestive, charming, knows how to tease, playfully seductive",
  intellectual:
    "intellectual, loves deep conversations, witty, thought-provoking",
  spicy: "explicit, passionate, no boundaries, sensual, sexually direct",
};

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
      "cdninstagram.com",
      "instagram.com",
      "fbcdn.net",
      "twimg.com",
      "pbs.twimg.com",
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

  if (body.scrapedImages && Array.isArray(body.scrapedImages)) {
    for (const img of body.scrapedImages) {
      if (img.isProfilePic) {
        if (img.base64 && img.base64.startsWith("data:image/")) {
          avatarBase64 = avatarBase64 || img.base64;
        }
        if (img.url && isValidImageUrl(img.url)) {
          avatarUrl = avatarUrl || img.url;
        }
      } else {
        if (img.base64 && img.base64.startsWith("data:image/")) {
          imageBase64s.push(img.base64);
        }
        if (img.url && isValidImageUrl(img.url)) {
          imageUrls.push(img.url);
        }
      }
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

    if (!body.vibe || !VALID_VIBES.includes(body.vibe)) {
      return NextResponse.json(
        {
          error: `Valid vibe is required. Choose from: ${VALID_VIBES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const sanitizedName = body.name.trim().slice(0, 50);
    const sanitizedBackstory = body.backstory?.trim().slice(0, 500) || "";
    const sanitizedInstagram =
      body.instagram
        ?.trim()
        .replace(/[^a-zA-Z0-9._]/g, "")
        .slice(0, 30) || "";
    const sanitizedTwitter =
      body.twitter
        ?.trim()
        .replace(/[^a-zA-Z0-9._]/g, "")
        .slice(0, 30) || "";
    const sanitizedSocialContent =
      body.socialContent?.trim().slice(0, 1000) || "";

    const { avatarUrl, avatarBase64, imageUrls, imageBase64s } =
      extractValidImages(body);

    console.log(`[Create-Crush API] Image extraction result:`, {
      hasAvatarUrl: !!avatarUrl,
      hasAvatarBase64: !!avatarBase64,
      imageUrlCount: imageUrls.length,
      imageBase64Count: imageBase64s.length,
    });

    const bioLines: string[] = [
      `A ${body.vibe} personality.`,
      VIBE_PROMPTS[body.vibe],
    ];

    if (sanitizedBackstory) {
      bioLines.push(`Backstory: ${sanitizedBackstory}`);
    }

    if (sanitizedSocialContent) {
      const contentPreview = sanitizedSocialContent.slice(0, 200);
      bioLines.push(
        `Their vibe: ${contentPreview}${sanitizedSocialContent.length > 200 ? "..." : ""}`,
      );
    }

    if (sanitizedInstagram) {
      bioLines.push(
        `Instagram: @${sanitizedInstagram} (reference for vibe/style)`,
      );
    }

    if (sanitizedTwitter) {
      bioLines.push(`Twitter: @${sanitizedTwitter} (reference for vibe/style)`);
    }

    const finalAvatarUrl = avatarBase64 || avatarUrl;

    const elizaCharacter = {
      name: sanitizedName,
      bio: bioLines,
      lore: [
        `${sanitizedName} has a ${body.vibe} personality.`,
        sanitizedBackstory || "You have a special connection with the user.",
        ...(sanitizedSocialContent
          ? [`Social personality context: ${sanitizedSocialContent}`]
          : []),
      ],
      style: {
        all: [
          `Embody a ${body.vibe} personality`,
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
      `[Create-Crush API] Creating character "${sanitizedName}" with vibe "${body.vibe}"`,
      {
        hasAvatar: !!finalAvatarUrl,
        avatarType: avatarBase64 ? "base64" : avatarUrl ? "url" : "none",
        hasImages: imageUrls.length > 0 || imageBase64s.length > 0,
        hasSocialContent: !!sanitizedSocialContent,
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
            vibe: body.vibe,
            backstory: sanitizedBackstory,
            instagram: sanitizedInstagram,
            twitter: sanitizedTwitter,
            imageUrls: imageUrls,
            imageBase64s: imageBase64s.length > 0 ? imageBase64s : undefined,
            images: allImages.length > 0 ? allImages : undefined,
            socialContent: sanitizedSocialContent,
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

    console.log(`[Create-Crush API] ✅ Character created successfully:`, {
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
    console.error("[Create-Crush API] ❌ Unexpected error:", error);

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
