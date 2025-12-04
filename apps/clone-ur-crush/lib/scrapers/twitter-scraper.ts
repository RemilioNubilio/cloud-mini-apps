/**
 * Twitter/X Profile Scraper using Playwright
 * Inspired by: https://github.com/luciomorocarnero/scraping_media
 * 
 * Scrapes public Twitter/X profiles for bio and recent tweets
 * Uses browser automation to access publicly available data
 */

import { Browser, chromium, Page } from 'playwright';

export interface TwitterProfile {
  username: string;
  displayName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  recentTweets: Array<{
    text: string;
    timestamp: string;
  }>;
  profilePicUrl: string;
  isProtected: boolean;
}

export interface TwitterScraperOptions {
  headless?: boolean;
  timeout?: number;
  maxTweets?: number;
}

export class TwitterScraper {
  private browser: Browser | null = null;
  private options: Required<TwitterScraperOptions>;

  constructor(options: TwitterScraperOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 30000,
      maxTweets: options.maxTweets ?? 10,
    };
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      const browserlessUrl = process.env.BROWSERLESS_WS_URL;

      try {
        if (browserlessUrl) {
          console.log('[Twitter Scraper] Connecting to remote browser service...');
          this.browser = await chromium.connect(browserlessUrl, {
            timeout: 30000,
          });
          console.log('[Twitter Scraper] ✅ Connected to remote browser');
        } else {
          console.log('[Twitter Scraper] Launching local Chromium...');
          this.browser = await chromium.launch({
            headless: this.options.headless,
          });
        }
      } catch (error) {
        console.error('[Twitter Scraper] Browser initialization failed:', error);
        throw new Error(
          `Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
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
   * Scrape Twitter/X profile
   */
  async scrapeProfile(username: string): Promise<TwitterProfile> {
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
      const url = `https://twitter.com/${cleanUsername}`;

      console.log(`[Twitter Scraper] Navigating to: ${url}`);

      // Intercept API responses
      const profileData: any = {};
      let interceptedData = false;

      page.on('response', async (response) => {
        const url = response.url();
        
        // Intercept Twitter API responses (multiple possible endpoints)
        if (url.includes('UserByScreenName') || 
            url.includes('UserTweets') ||
            url.includes('UserByRestId') ||
            url.includes('graphql') && url.includes('twitter.com')) {
          try {
            const contentType = response.headers()['content-type'] || '';
            if (!contentType.includes('json')) return;

            const json = await response.json();
            
            console.log('[Twitter Scraper] Intercepted API response:', url.substring(0, 80));
            
            // Extract user data from various response formats
            if (json.data?.user?.result) {
              console.log('[Twitter Scraper] ✅ Found user data in response');
              const result = json.data.user.result;
              
              // Handle different result types
              if (result.__typename === 'User' && result.legacy) {
                profileData.user = result;
                interceptedData = true;
              } else if (result.legacy) {
                profileData.user = result;
                interceptedData = true;
              }
            }

            // Extract tweets from timeline
            if (json.data?.user?.result?.timeline?.timeline?.instructions) {
              profileData.timeline = json.data.user.result.timeline;
            }
          } catch (error) {
            // Ignore parsing errors
            console.log('[Twitter Scraper] Failed to parse response:', error);
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

      console.log('[Twitter Scraper] Waiting for API requests...');

      // Wait for initial API requests
      await page.waitForTimeout(5000);

      // Scroll to trigger more content loading
      await page.evaluate(() => {
        window.scrollBy(0, 1000);
      });

      // Wait for scroll-triggered requests
      await page.waitForTimeout(3000);

      // Try to extract data from intercepted responses
      if (interceptedData && profileData.user) {
        return this.parseInterceptedData(profileData, cleanUsername);
      }

      // Fallback: Parse from page content
      return await this.parsePageContent(page, cleanUsername);

    } catch (error) {
      console.error(`[Twitter Scraper] Error:`, error);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * Parse data from intercepted API responses
   */
  private parseInterceptedData(data: any, username: string): TwitterProfile {
    // Handle nested result structure
    const userResult = data.user?.result || data.user;
    const user = userResult?.legacy || userResult;
    
    const timeline = data.timeline?.timeline?.instructions || [];

    // Extract tweets from timeline
    const tweets: Array<{ text: string; timestamp: string }> = [];
    
    for (const instruction of timeline) {
      if (instruction.type === 'TimelineAddEntries' && instruction.entries) {
        for (const entry of instruction.entries) {
          // Handle various tweet result formats
          const tweetResult = entry.content?.itemContent?.tweet_results?.result;
          
          if (tweetResult) {
            const tweet = tweetResult.legacy || tweetResult;
            const text = tweet.full_text || tweet.text || '';
            
            if (text) {
              tweets.push({
                text: text,
                timestamp: tweet.created_at 
                  ? new Date(tweet.created_at).toISOString()
                  : new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    return {
      username: user.screen_name || username,
      displayName: user.name || '',
      bio: user.description || '',
      followersCount: user.followers_count || 0,
      followingCount: user.friends_count || 0,
      tweetsCount: user.statuses_count || 0,
      recentTweets: tweets.slice(0, this.options.maxTweets),
      profilePicUrl: user.profile_image_url_https?.replace('_normal', '_400x400') || '',
      isProtected: user.protected || false,
    };
  }

  /**
   * Parse data from page content (fallback method)
   */
  private async parsePageContent(page: Page, username: string): Promise<TwitterProfile> {
    console.log('[Twitter Scraper] Using fallback: parsing page content');

    // Extract visible information
    const displayName = await page.locator('[data-testid="UserName"] span').first().textContent().catch(() => '');
    const bio = await page.locator('[data-testid="UserDescription"]').textContent().catch(() => '');
    
    // Extract tweets
    const tweets: Array<{ text: string; timestamp: string }> = [];
    const tweetElements = await page.locator('[data-testid="tweetText"]').all();
    
    for (const element of tweetElements.slice(0, this.options.maxTweets)) {
      const text = await element.textContent().catch(() => '');
      if (text) {
        tweets.push({
          text: text,
          timestamp: new Date().toISOString(), // Fallback: use current time
        });
      }
    }

    return {
      username: username,
      displayName: displayName || '',
      bio: bio || '',
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      recentTweets: tweets,
      profilePicUrl: '',
      isProtected: false,
    };
  }
}

/**
 * Convenience function to scrape a profile without managing the scraper instance
 */
export async function scrapeTwitterProfile(
  username: string,
  options?: TwitterScraperOptions
): Promise<TwitterProfile> {
  const scraper = new TwitterScraper(options);
  try {
    return await scraper.scrapeProfile(username);
  } finally {
    await scraper.close();
  }
}

