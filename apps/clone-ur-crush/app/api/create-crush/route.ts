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

interface CreateCrushRequest {
  name: string;
  vibe: Vibe;
  backstory?: string;
  instagram?: string;
  twitter?: string;
  avatarUrl?: string;
  imageUrls?: string[];
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

// Vibe-specific descriptions for AI character generation
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

export async function POST(request: NextRequest) {
  try {
    const body: CreateCrushRequest = await request.json();

    // 1. VALIDATE REQUIRED FIELDS
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

    // 2. SANITIZE INPUTS (prevent XSS and injection attacks)
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

    // Validate avatar URL if provided (basic URL validation)
    let avatarUrl: string | undefined;
    if (body.avatarUrl && typeof body.avatarUrl === "string") {
      try {
        const url = new URL(body.avatarUrl);
        // Ensure it's from a trusted domain (Vercel Blob)
        if (
          url.hostname.includes("vercel-storage.com") ||
          url.hostname.includes("blob.vercel-storage.com")
        ) {
          avatarUrl = body.avatarUrl;
        } else {
          console.warn(
            "[Create-Crush API] Avatar URL from untrusted domain:",
            url.hostname,
          );
        }
      } catch (error) {
        console.warn("[Create-Crush API] Invalid avatar URL:", body.avatarUrl);
      }
    }

    // Validate image URLs if provided
    const imageUrls: string[] = [];
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      for (const url of body.imageUrls) {
        if (typeof url === "string") {
          try {
            const parsedUrl = new URL(url);
            if (
              parsedUrl.hostname.includes("vercel-storage.com") ||
              parsedUrl.hostname.includes("blob.vercel-storage.com")
            ) {
              imageUrls.push(url);
            }
          } catch (error) {
            // Skip invalid URLs
            console.warn("[Create-Crush API] Skipping invalid image URL:", url);
          }
        }
      }
    }

    // 3. BUILD CHARACTER BIO
    const bioLines: string[] = [
      `A ${body.vibe} personality.`,
      VIBE_PROMPTS[body.vibe],
    ];

    if (sanitizedBackstory) {
      bioLines.push(`Backstory: ${sanitizedBackstory}`);
    }

    // Add social content context to bio (first 200 chars as a preview)
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

    // 4. BUILD ELIZA CHARACTER OBJECT
    const elizaCharacter = {
      name: sanitizedName,
      bio: bioLines,
      lore: [
        `${sanitizedName} has a ${body.vibe} personality.`,
        sanitizedBackstory || "You have a special connection with the user.",
        // Add full social content to lore for deeper context
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
      avatar_url: avatarUrl,
    };

    // 5. CALL ELIZAOS CLOUD AFFILIATE API
    const elizaCloudUrl =
      process.env.NEXT_PUBLIC_ELIZA_CLOUD_URL || "http://localhost:3000";
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
        hasAvatar: !!avatarUrl,
        hasImages: imageUrls.length > 0,
        hasSocialContent: !!sanitizedSocialContent,
      },
    );

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
            socialContent: sanitizedSocialContent,
          },
        }),
      },
    );

    // 6. HANDLE API RESPONSE
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("[Create-Crush API] ElizaOS Cloud API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      // Return user-friendly error messages
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

    // 7. RETURN SUCCESS RESPONSE
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
    // Log detailed error for debugging
    console.error("[Create-Crush API] ❌ Unexpected error:", error);

    // Return generic error to user
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
