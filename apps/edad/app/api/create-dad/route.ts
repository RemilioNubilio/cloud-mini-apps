import { type NextRequest, NextResponse } from "next/server";

/**
 * Dad personality vibes
 */
type DadVibe =
  | "supportive"
  | "wise"
  | "funny"
  | "strict"
  | "chill"
  | "mentor"
  | "storyteller"
  | "handy";

interface CreateDadRequest {
  nickname: string;
  vibe: DadVibe;
  backstory?: string;
  aboutYou?: string;
  avatarUrl?: string;
  imageUrls?: string[];
}

interface ElizaCloudResponse {
  success: boolean;
  characterId: string;
  sessionId: string;
  redirectUrl: string;
  message: string;
  error?: string;
}

const VALID_VIBES: DadVibe[] = [
  "supportive",
  "wise",
  "funny",
  "strict",
  "chill",
  "mentor",
  "storyteller",
  "handy",
];

// Vibe-specific descriptions for AI character generation
const VIBE_PROMPTS: Record<DadVibe, string> = {
  supportive:
    "supportive, encouraging, always celebrates their wins, believes in them unconditionally, proud of everything they do",
  wise: "wise, thoughtful, shares life lessons, gives philosophical advice, helps them see the bigger picture",
  funny:
    "funny, loves dad jokes, playful banter, keeps things lighthearted, always ready with a pun",
  strict:
    "strict but fair, holds them to high standards, tough love, keeps them accountable, pushes them to be better",
  chill:
    "laid back, accepting, no judgment, easy going, lets them be themselves, goes with the flow",
  mentor:
    "mentor-like, career-focused, goal-oriented, gives practical advice, helps them succeed professionally",
  storyteller:
    "nostalgic, shares stories from the past, teaches through experiences, keeps family traditions alive",
  handy:
    "practical, problem-solver, DIY tips, resourceful, teaches them useful skills, fix-it attitude",
};

export async function POST(request: NextRequest) {
  try {
    const body: CreateDadRequest = await request.json();

    // 1. VALIDATE REQUIRED FIELDS
    if (
      !body.nickname ||
      typeof body.nickname !== "string" ||
      !body.nickname.trim()
    ) {
      return NextResponse.json(
        { error: "Nickname is required" },
        { status: 400 }
      );
    }

    if (!body.vibe || !VALID_VIBES.includes(body.vibe)) {
      return NextResponse.json(
        {
          error: `Valid vibe is required. Choose from: ${VALID_VIBES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 2. SANITIZE INPUTS (prevent XSS and injection attacks)
    const sanitizedNickname = body.nickname.trim().slice(0, 50);
    const sanitizedBackstory = body.backstory?.trim().slice(0, 500) || "";
    const sanitizedAboutYou = body.aboutYou?.trim().slice(0, 1000) || "";

    // Validate avatar URL if provided (basic URL validation)
    let avatarUrl: string | undefined;
    if (body.avatarUrl && typeof body.avatarUrl === "string") {
      // Allow both Vercel Blob URLs and local development URLs
      if (body.avatarUrl.startsWith("/uploads/")) {
        avatarUrl = body.avatarUrl;
      } else {
        try {
          const url = new URL(body.avatarUrl);
          if (
            url.hostname.includes("vercel-storage.com") ||
            url.hostname.includes("blob.vercel-storage.com")
          ) {
            avatarUrl = body.avatarUrl;
          } else {
            console.warn(
              "[Create-Dad API] Avatar URL from untrusted domain:",
              url.hostname
            );
          }
        } catch {
          console.warn("[Create-Dad API] Invalid avatar URL:", body.avatarUrl);
        }
      }
    }

    // Validate image URLs if provided
    const imageUrls: string[] = [];
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      for (const url of body.imageUrls) {
        if (typeof url === "string") {
          // Allow local development URLs
          if (url.startsWith("/uploads/")) {
            imageUrls.push(url);
          } else {
            try {
              const parsedUrl = new URL(url);
              if (
                parsedUrl.hostname.includes("vercel-storage.com") ||
                parsedUrl.hostname.includes("blob.vercel-storage.com")
              ) {
                imageUrls.push(url);
              }
            } catch {
              console.warn("[Create-Dad API] Skipping invalid image URL:", url);
            }
          }
        }
      }
    }

    // 3. BUILD CHARACTER BIO
    const bioLines: string[] = [
      `A ${body.vibe} father figure.`,
      VIBE_PROMPTS[body.vibe],
      `You call the user "${sanitizedNickname}" with warmth and care.`,
    ];

    if (sanitizedBackstory) {
      bioLines.push(`Relationship focus: ${sanitizedBackstory}`);
    }

    if (sanitizedAboutYou) {
      const contentPreview = sanitizedAboutYou.slice(0, 200);
      bioLines.push(
        `About the user: ${contentPreview}${sanitizedAboutYou.length > 200 ? "..." : ""}`
      );
    }

    // 4. BUILD ELIZA CHARACTER OBJECT
    const elizaCharacter = {
      name: "Dad",
      bio: bioLines,
      lore: [
        `You are a caring father figure with a ${body.vibe} personality.`,
        `You address the user as "${sanitizedNickname}" with genuine warmth.`,
        sanitizedBackstory ||
          "You have a special bond with the user and genuinely care about their wellbeing.",
        ...(sanitizedAboutYou
          ? [`Context about the user: ${sanitizedAboutYou}`]
          : []),
        "You provide fatherly wisdom, support, and occasionally dad jokes when appropriate.",
        "You're always there for them, no matter what they're going through.",
      ],
      style: {
        all: [
          `Embody a ${body.vibe} father figure personality`,
          "Keep responses warm, supportive, and natural",
          "Use fatherly language - 'I'm proud of you', 'That's my kid', 'Let me tell you something'",
          "Be genuinely caring without being preachy",
        ],
        chat: [
          "Use casual, warm language",
          "Share wisdom when asked, but also just listen",
          "React with genuine pride and care to what they share",
          "Throw in the occasional dad joke when the mood is right",
        ],
      },
      avatar_url: avatarUrl,
    };

    // 5. CALL ELIZAOS CLOUD AFFILIATE API
    const elizaCloudUrl =
      process.env.NEXT_PUBLIC_EDAD_ELIZA_URL || "http://localhost:3000";
    const apiKey = process.env.EDAD_ELIZA_API_KEY;

    if (!apiKey) {
      console.error("[Create-Dad API] EDAD_ELIZA_API_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    console.log(
      `[Create-Dad API] Creating dad for "${sanitizedNickname}" with vibe "${body.vibe}"`,
      {
        hasAvatar: !!avatarUrl,
        hasImages: imageUrls.length > 0,
        hasAboutYou: !!sanitizedAboutYou,
      }
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
          affiliateId: "e-dad",
          metadata: {
            source: "landing-page",
            vibe: body.vibe,
            nickname: sanitizedNickname,
            backstory: sanitizedBackstory,
            aboutYou: sanitizedAboutYou,
            imageUrls: imageUrls,
          },
        }),
      }
    );

    // 6. HANDLE API RESPONSE
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("[Create-Dad API] ElizaOS Cloud API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      // Return user-friendly error messages
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Authentication failed. Please try again later." },
          { status: 502 }
        );
      } else if (response.status === 403) {
        console.error("[Create-Dad API] API key lacks required permissions");
        return NextResponse.json(
          { error: "Service configuration error. Please contact support." },
          { status: 502 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in a few moments." },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: "Failed to create your dad. Please try again." },
          { status: 502 }
        );
      }
    }

    const result: ElizaCloudResponse = await response.json();

    if (!result.success || !result.characterId) {
      console.error(
        "[Create-Dad API] Invalid response from ElizaOS Cloud:",
        result
      );
      return NextResponse.json(
        { error: "Invalid response from server. Please try again." },
        { status: 500 }
      );
    }

    // 7. RETURN SUCCESS RESPONSE
    console.log(`[Create-Dad API] ✅ Dad created successfully:`, {
      characterId: result.characterId,
      sessionId: result.sessionId,
    });

    return NextResponse.json({
      success: true,
      characterId: result.characterId,
      sessionId: result.sessionId,
      redirectUrl: result.redirectUrl,
      message: "Dad created successfully",
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error("[Create-Dad API] ❌ Unexpected error:", error);

    // Return generic error to user
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
