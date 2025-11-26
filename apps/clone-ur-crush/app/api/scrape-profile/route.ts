import { NextRequest, NextResponse } from "next/server";
import { scrapeInstagramProfile } from "@/lib/scrapers/instagram-scraper";
import { scrapeTwitterProfile } from "@/lib/scrapers/twitter-scraper";
import { instagramRateLimiter, twitterRateLimiter } from "@/lib/rate-limiter";
import { profileCache } from "@/lib/cache";

type Platform = "instagram" | "twitter";

interface ScrapeRequest {
  platform: Platform;
  username: string;
}

interface ScrapeResponse {
  success: boolean;
  data?: any;
  error?: string;
  cached?: boolean;
}

/**
 * POST /api/scrape-profile
 * 
 * Scrapes public social media profiles for bio and recent posts
 * 
 * LEGAL NOTICE:
 * This endpoint scrapes publicly available data from social media platforms.
 * While the data is public, automated scraping may violate platform Terms of Service.
 * Use at your own risk. This is for personal, non-commercial use only.
 * 
 * Features:
 * - Rate limiting (3 requests/minute per platform)
 * - Caching (24 hours)
 * - Error handling with fallbacks
 * - Respects platform rate limits
 */
export async function POST(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  try {
    // 1. PARSE AND VALIDATE REQUEST
    let body: ScrapeRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 }
      );
    }

    const { platform, username } = body;

    if (!platform || !username) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: platform and username",
        },
        { status: 400 }
      );
    }

    if (!["instagram", "twitter"].includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid platform. Supported: instagram, twitter",
        },
        { status: 400 }
      );
    }

    // Clean username
    const cleanUsername = username.trim().replace(/^@/, "");

    if (!cleanUsername) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username",
        },
        { status: 400 }
      );
    }

    // 2. CHECK CACHE
    const cacheKey = `${platform}:${cleanUsername}`.toLowerCase();
    const cachedData = profileCache.get(cacheKey);

    if (cachedData) {
      console.log(`[Scrape Profile] ✅ Cache hit for ${cacheKey}`);
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // 3. CHECK RATE LIMITING
    const rateLimiter = platform === "instagram" ? instagramRateLimiter : twitterRateLimiter;

    if (rateLimiter.isRateLimited(cacheKey)) {
      const resetTime = rateLimiter.getResetTime(cacheKey);
      const resetSeconds = Math.ceil(resetTime / 1000);

      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
        },
        { 
          status: 429,
          headers: {
            "Retry-After": resetSeconds.toString(),
          }
        }
      );
    }

    // 4. SCRAPE PROFILE
    console.log(`[Scrape Profile] 🔍 Scraping ${platform} profile: @${cleanUsername}`);

    let profileData: any;

    try {
      if (platform === "instagram") {
        profileData = await scrapeInstagramProfile(cleanUsername, {
          headless: true,
          timeout: 30000,
          maxPosts: 10,
        });
      } else if (platform === "twitter") {
        profileData = await scrapeTwitterProfile(cleanUsername, {
          headless: true,
          timeout: 30000,
          maxTweets: 10,
        });
      }

      // Record rate limit
      rateLimiter.recordRequest(cacheKey);

      // Cache result
      profileCache.set(cacheKey, profileData);

      console.log(`[Scrape Profile] ✅ Successfully scraped ${platform} profile: @${cleanUsername}`);

      return NextResponse.json({
        success: true,
        data: profileData,
        cached: false,
      });

    } catch (scrapeError) {
      console.error(`[Scrape Profile] ❌ Scraping failed for ${platform}/@${cleanUsername}:`, scrapeError);

      // Return user-friendly error
      return NextResponse.json(
        {
          success: false,
          error: scrapeError instanceof Error 
            ? `Failed to scrape profile: ${scrapeError.message}` 
            : "Failed to scrape profile. The account may be private or deleted.",
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[Scrape Profile] ❌ Unexpected error:", error);

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
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

