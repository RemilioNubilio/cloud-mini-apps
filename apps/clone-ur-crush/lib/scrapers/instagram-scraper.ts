/**
 * Instagram Profile Scraper using Playwright
 * Inspired by: https://github.com/luciomorocarnero/scraping_media
 * 
 * Scrapes public Instagram profiles for bio and recent posts
 * Uses browser automation to access publicly available data
 */

import { chromium, Browser, Page } from 'playwright';

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  recentPosts: Array<{
    caption: string;
    timestamp: string;
  }>;
  profilePicUrl: string;
  isPrivate: boolean;
}

export interface InstagramScraperOptions {
  headless?: boolean;
  timeout?: number;
  maxPosts?: number;
}

export class InstagramScraper {
  private browser: Browser | null = null;
  private options: Required<InstagramScraperOptions>;

  constructor(options: InstagramScraperOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 30000,
      maxPosts: options.maxPosts ?? 10,
    };
  }

  /**
   * Initialize browser instance
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.options.headless,
      });
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape Instagram profile
   */
  async scrapeProfile(username: string): Promise<InstagramProfile> {
    await this.initBrowser();

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    try {
      // Clean username (remove @ if present)
      const cleanUsername = username.replace(/^@/, '');
      const url = `https://www.instagram.com/${cleanUsername}/`;

      console.log(`[Instagram Scraper] Navigating to: ${url}`);

      // Intercept GraphQL responses
      const profileData: any = {};
      let interceptedData = false;

      page.on('response', async (response) => {
        const url = response.url();
        
        // Intercept both GraphQL and web_profile_info API responses
        if (url.includes('graphql/query') || url.includes('web_profile_info')) {
          try {
            const contentType = response.headers()['content-type'] || '';
            if (!contentType.includes('json')) return;

            const json = await response.json();
            
            // Method 1: web_profile_info API (most reliable)
            if (url.includes('web_profile_info') && json.data?.user) {
              console.log('[Instagram Scraper] ✅ Found data from web_profile_info API');
              profileData.user = json.data.user;
              interceptedData = true;
            }
            
            // Method 2: GraphQL query responses
            else if (json.data?.user) {
              console.log('[Instagram Scraper] ✅ Found data from GraphQL API');
              profileData.user = json.data.user;
              interceptedData = true;
            }

            // Look for timeline posts in various response formats
            if (json.data?.user?.edge_owner_to_timeline_media) {
              profileData.posts = json.data.user.edge_owner_to_timeline_media;
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      });

      // Navigate to profile
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout,
      });

      if (!response || response.status() !== 200) {
        throw new Error(`Failed to load profile: ${response?.status()}`);
      }

      // Wait for API requests to complete
      // Instagram makes the web_profile_info request after page load
      await page.waitForTimeout(5000);

      console.log('[Instagram Scraper] Waiting for data interception...');

      // Try to extract data from intercepted responses
      if (interceptedData && profileData.user) {
        return this.parseInterceptedData(profileData, cleanUsername);
      }

      // Fallback: Parse from page content
      return await this.parsePageContent(page, cleanUsername);

    } catch (error) {
      console.error(`[Instagram Scraper] Error:`, error);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * Parse data from intercepted API responses
   */
  private parseInterceptedData(data: any, username: string): InstagramProfile {
    const user = data.user;
    
    console.log('[Instagram Scraper] 🔍 Parsing user data...', {
      hasUser: !!user,
      userKeys: user ? Object.keys(user).slice(0, 10) : [],
      hasBio: !!(user?.biography || user?.bio),
      hasFollowerCount: !!(user?.follower_count),
      hasMediaCount: !!(user?.media_count),
      hasEdgeMedia: !!(user?.edge_owner_to_timeline_media),
    });
    
    // Handle both GraphQL and web_profile_info formats
    const posts = data.posts?.edges || 
                 user.edge_owner_to_timeline_media?.edges || 
                 [];

    console.log('[Instagram Scraper] 📝 Posts info:', {
      postsFromData: data.posts?.edges?.length || 0,
      postsFromUser: user.edge_owner_to_timeline_media?.edges?.length || 0,
      totalPosts: posts.length,
    });

    const parsedProfile = {
      username: user.username || username,
      fullName: user.full_name || user.name || '',
      bio: user.biography || user.bio || '',
      followersCount: user.follower_count || user.edge_followed_by?.count || 0,
      followingCount: user.following_count || user.edge_follow?.count || 0,
      postsCount: user.media_count || user.edge_owner_to_timeline_media?.count || 0,
      recentPosts: posts.slice(0, this.options.maxPosts).map((edge: any) => {
        const node = edge.node || edge;
        const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || 
                       node.caption?.text || 
                       '';
        const timestamp = node.taken_at_timestamp 
          ? new Date(node.taken_at_timestamp * 1000).toISOString()
          : new Date().toISOString();
        
        return { caption, timestamp };
      }),
      profilePicUrl: user.hd_profile_pic_url_info?.url || 
                     user.profile_pic_url_hd || 
                     user.profile_pic_url || 
                     '',
      isPrivate: user.is_private || false,
    };

    console.log('[Instagram Scraper] ✅ Parsed profile:', {
      username: parsedProfile.username,
      hasBio: !!parsedProfile.bio,
      bioLength: parsedProfile.bio.length,
      followersCount: parsedProfile.followersCount,
      postsCount: parsedProfile.postsCount,
      recentPostsCount: parsedProfile.recentPosts.length,
    });

    return parsedProfile;
  }

  /**
   * Parse data from page content (fallback method)
   */
  private async parsePageContent(page: Page, username: string): Promise<InstagramProfile> {
    console.log('[Instagram Scraper] Using fallback: parsing page content');

    // Try to find JSON data in script tags
    const jsonData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        const text = script.textContent || '';
        if (text.includes('window._sharedData')) {
          const match = text.match(/window\._sharedData\s*=\s*({.+?});/);
          if (match) {
            return JSON.parse(match[1]);
          }
        }
      }
      return null;
    });

    if (jsonData?.entry_data?.ProfilePage?.[0]?.graphql?.user) {
      const user = jsonData.entry_data.ProfilePage[0].graphql.user;
      return this.parseInterceptedData({ user }, username);
    }

    // Last resort: scrape visible text
    const bio = await page.locator('div._aa_c').first().textContent().catch(() => '');
    const fullName = await page.locator('span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x10wh9bi.x1wdrske.x8viiok.x18hxmgj').first().textContent().catch(() => '');

    return {
      username: username,
      fullName: fullName || '',
      bio: bio || '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      recentPosts: [],
      profilePicUrl: '',
      isPrivate: false,
    };
  }
}

/**
 * Convenience function to scrape a profile without managing the scraper instance
 */
export async function scrapeInstagramProfile(
  username: string,
  options?: InstagramScraperOptions
): Promise<InstagramProfile> {
  const scraper = new InstagramScraper(options);
  try {
    return await scraper.scrapeProfile(username);
  } finally {
    await scraper.close();
  }
}

