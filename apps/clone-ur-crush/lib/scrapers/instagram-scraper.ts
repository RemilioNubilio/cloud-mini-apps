/**
 * Instagram Profile Scraper using Playwright
 * Inspired by: https://github.com/luciomorocarnero/scraping_media
 *
 * Scrapes public Instagram profiles for bio, recent posts, and images
 * Uses browser automation to access publicly available data
 */

import { Browser, chromium, Page } from 'playwright';

export interface InstagramPostImage {
  url: string;
  width?: number;
  height?: number;
  isVideo?: boolean;
}

export interface InstagramPost {
  caption: string;
  timestamp: string;
  images: InstagramPostImage[];
  likeCount?: number;
  commentCount?: number;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  recentPosts: InstagramPost[];
  profilePicUrl: string;
  profilePicBase64?: string;
  isPrivate: boolean;
  isVerified?: boolean;
  postImages: InstagramPostImage[];
}

export interface InstagramScraperOptions {
  headless?: boolean;
  timeout?: number;
  maxPosts?: number;
  fetchImages?: boolean;
  convertImagesToBase64?: boolean;
}

interface InterceptedProfileData {
  user?: any;
  posts?: any;
}

export class InstagramScraper {
  private browser: Browser | null = null;
  private options: Required<InstagramScraperOptions>;

  constructor(options: InstagramScraperOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 30000,
      maxPosts: options.maxPosts ?? 10,
      fetchImages: options.fetchImages ?? true,
      convertImagesToBase64: options.convertImagesToBase64 ?? false,
    };
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      const browserlessUrl = process.env.BROWSERLESS_WS_URL;

      try {
        if (browserlessUrl) {
          console.log('[Instagram Scraper] Connecting to remote browser service...');
          this.browser = await chromium.connect(browserlessUrl, {
            timeout: 30000,
          });
          console.log('[Instagram Scraper] ✅ Connected to remote browser');
        } else {
          console.log('[Instagram Scraper] Launching local Chromium...');
          this.browser = await chromium.launch({
            headless: this.options.headless,
          });
        }
      } catch (error) {
        console.error('[Instagram Scraper] Browser initialization failed:', error);
        throw new Error(
          `Failed to initialize browser: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeProfile(username: string): Promise<InstagramProfile> {
    await this.initBrowser();

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    try {
      const cleanUsername = username.replace(/^@/, '');
      const url = `https://www.instagram.com/${cleanUsername}/`;

      console.log(`[Instagram Scraper] Navigating to: ${url}`);

      const profileData: InterceptedProfileData = {};
      let interceptedData = false;

      page.on('response', async (response) => {
        const responseUrl = response.url();

        if (responseUrl.includes('graphql/query') || responseUrl.includes('web_profile_info')) {
          try {
            const contentType = response.headers()['content-type'] || '';
            if (!contentType.includes('json')) return;

            const json = await response.json();

            if (responseUrl.includes('web_profile_info') && json.data?.user) {
              console.log('[Instagram Scraper] ✅ Found data from web_profile_info API');
              profileData.user = json.data.user;
              interceptedData = true;
            } else if (json.data?.user) {
              console.log('[Instagram Scraper] ✅ Found data from GraphQL API');
              profileData.user = json.data.user;
              interceptedData = true;
            }

            if (json.data?.user?.edge_owner_to_timeline_media) {
              profileData.posts = json.data.user.edge_owner_to_timeline_media;
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      });

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout,
      });

      if (!response || response.status() !== 200) {
        throw new Error(`Failed to load profile: ${response?.status()}`);
      }

      await page.waitForTimeout(5000);

      console.log('[Instagram Scraper] Waiting for data interception...');

      let profile: InstagramProfile;

      if (interceptedData && profileData.user) {
        profile = await this.parseInterceptedData(profileData, cleanUsername, page);
      } else {
        profile = await this.parsePageContent(page, cleanUsername);
      }

      if (profile.followersCount === 0 || profile.followingCount === 0) {
        const domStats = await this.scrapeStatsFromDOM(page);
        if (domStats.followersCount > 0) {
          profile.followersCount = domStats.followersCount;
        }
        if (domStats.followingCount > 0) {
          profile.followingCount = domStats.followingCount;
        }
        if (domStats.postsCount > 0) {
          profile.postsCount = domStats.postsCount;
        }
      }

      if (this.options.convertImagesToBase64 && profile.profilePicUrl) {
        try {
          const base64 = await this.fetchImageAsBase64(profile.profilePicUrl, page);
          if (base64) {
            profile.profilePicBase64 = base64;
          }
        } catch (error) {
          console.warn('[Instagram Scraper] Failed to convert profile pic to base64:', error);
        }
      }

      return profile;

    } catch (error) {
      console.error(`[Instagram Scraper] Error:`, error);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  private async scrapeStatsFromDOM(page: Page): Promise<{
    followersCount: number;
    followingCount: number;
    postsCount: number;
  }> {
    console.log('[Instagram Scraper] Attempting to scrape stats from DOM...');

    try {
      const stats = await page.evaluate(() => {
        const result = {
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        };

        const parseStatNumber = (text: string): number => {
          if (!text) return 0;
          const cleanText = text.toLowerCase().replace(/,/g, '').trim();

          if (cleanText.includes('k')) {
            return Math.round(parseFloat(cleanText.replace('k', '')) * 1000);
          }
          if (cleanText.includes('m')) {
            return Math.round(parseFloat(cleanText.replace('m', '')) * 1000000);
          }
          if (cleanText.includes('b')) {
            return Math.round(parseFloat(cleanText.replace('b', '')) * 1000000000);
          }

          return parseInt(cleanText, 10) || 0;
        };

        const selectors = [
          'ul li a span span',
          'ul li span span',
          '[class*="x78zum5"] span span',
          'header section ul li span',
          'header ul li span',
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length >= 3) {
            const texts = Array.from(elements).map(el => el.textContent || '');
            const numbers = texts.map(parseStatNumber).filter(n => n > 0);

            if (numbers.length >= 3) {
              result.postsCount = numbers[0];
              result.followersCount = numbers[1];
              result.followingCount = numbers[2];
              console.log('[DOM] Found stats via selector:', selector, numbers);
              return result;
            }
          }
        }

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          const content = metaDescription.getAttribute('content') || '';
          const followersMatch = content.match(/([\d,.]+[KkMmBb]?)\s*Followers/i);
          const followingMatch = content.match(/([\d,.]+[KkMmBb]?)\s*Following/i);
          const postsMatch = content.match(/([\d,.]+[KkMmBb]?)\s*Posts/i);

          if (followersMatch) result.followersCount = parseStatNumber(followersMatch[1]);
          if (followingMatch) result.followingCount = parseStatNumber(followingMatch[1]);
          if (postsMatch) result.postsCount = parseStatNumber(postsMatch[1]);
        }

        const allText = document.body.innerText;
        const followersTextMatch = allText.match(/([\d,.]+[KkMmBb]?)\s*followers/i);
        const followingTextMatch = allText.match(/([\d,.]+[KkMmBb]?)\s*following/i);

        if (followersTextMatch && result.followersCount === 0) {
          result.followersCount = parseStatNumber(followersTextMatch[1]);
        }
        if (followingTextMatch && result.followingCount === 0) {
          result.followingCount = parseStatNumber(followingTextMatch[1]);
        }

        return result;
      });

      console.log('[Instagram Scraper] DOM stats result:', stats);
      return stats;
    } catch (error) {
      console.error('[Instagram Scraper] DOM stats scraping failed:', error);
      return { followersCount: 0, followingCount: 0, postsCount: 0 };
    }
  }

  private async parseInterceptedData(
    data: InterceptedProfileData,
    username: string,
    page: Page
  ): Promise<InstagramProfile> {
    const user = data.user;

    console.log('[Instagram Scraper] 🔍 Parsing user data...', {
      hasUser: !!user,
      userKeys: user ? Object.keys(user).slice(0, 15) : [],
      hasBio: !!(user?.biography || user?.bio),
      hasFollowerCount: !!(user?.follower_count || user?.edge_followed_by?.count),
      hasMediaCount: !!(user?.media_count),
      hasEdgeMedia: !!(user?.edge_owner_to_timeline_media),
    });

    const posts = data.posts?.edges ||
                 user.edge_owner_to_timeline_media?.edges ||
                 [];

    console.log('[Instagram Scraper] 📝 Posts info:', {
      postsFromData: data.posts?.edges?.length || 0,
      postsFromUser: user.edge_owner_to_timeline_media?.edges?.length || 0,
      totalPosts: posts.length,
    });

    const recentPosts: InstagramPost[] = [];
    const allPostImages: InstagramPostImage[] = [];

    for (const edge of posts.slice(0, this.options.maxPosts)) {
      const node = edge.node || edge;

      const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text ||
                     node.caption?.text ||
                     node.caption ||
                     '';

      const timestamp = node.taken_at_timestamp
        ? new Date(node.taken_at_timestamp * 1000).toISOString()
        : new Date().toISOString();

      const images: InstagramPostImage[] = [];

      const isVideo = node.is_video || node.__typename === 'GraphVideo';

      if (node.display_url) {
        images.push({
          url: node.display_url,
          width: node.dimensions?.width,
          height: node.dimensions?.height,
          isVideo,
        });
      } else if (node.thumbnail_src) {
        images.push({
          url: node.thumbnail_src,
          isVideo,
        });
      }

      if (node.thumbnail_resources && Array.isArray(node.thumbnail_resources)) {
        const bestThumbnail = node.thumbnail_resources
          .sort((a: any, b: any) => (b.config_width || 0) - (a.config_width || 0))[0];

        if (bestThumbnail && !images.find(img => img.url === bestThumbnail.src)) {
          images.push({
            url: bestThumbnail.src,
            width: bestThumbnail.config_width,
            height: bestThumbnail.config_height,
            isVideo,
          });
        }
      }

      if (node.edge_sidecar_to_children?.edges) {
        for (const childEdge of node.edge_sidecar_to_children.edges) {
          const childNode = childEdge.node;
          if (childNode.display_url) {
            images.push({
              url: childNode.display_url,
              width: childNode.dimensions?.width,
              height: childNode.dimensions?.height,
              isVideo: childNode.is_video,
            });
          }
        }
      }

      recentPosts.push({
        caption,
        timestamp,
        images,
        likeCount: node.edge_liked_by?.count || node.like_count,
        commentCount: node.edge_media_to_comment?.count || node.comment_count,
      });

      allPostImages.push(...images);
    }

    let profilePicUrl = user.hd_profile_pic_url_info?.url ||
                       user.profile_pic_url_hd ||
                       user.profile_pic_url ||
                       '';

    if (!profilePicUrl) {
      try {
        profilePicUrl = await page.evaluate(() => {
          const profileImg = document.querySelector('header img[alt*="profile"]') as HTMLImageElement;
          if (profileImg) return profileImg.src;

          const headerImgs = document.querySelectorAll('header img');
          for (const img of headerImgs) {
            const src = (img as HTMLImageElement).src;
            if (src && !src.includes('logo') && !src.includes('icon')) {
              return src;
            }
          }
          return '';
        });
      } catch (error) {
        console.warn('[Instagram Scraper] Failed to get profile pic from DOM');
      }
    }

    const followersCount = user.follower_count ||
                          user.edge_followed_by?.count ||
                          0;

    const followingCount = user.following_count ||
                          user.edge_follow?.count ||
                          0;

    const postsCount = user.media_count ||
                      user.edge_owner_to_timeline_media?.count ||
                      0;

    const parsedProfile: InstagramProfile = {
      username: user.username || username,
      fullName: user.full_name || user.name || '',
      bio: user.biography || user.bio || '',
      followersCount,
      followingCount,
      postsCount,
      recentPosts,
      profilePicUrl,
      isPrivate: user.is_private || false,
      isVerified: user.is_verified || false,
      postImages: allPostImages.slice(0, 10),
    };

    console.log('[Instagram Scraper] ✅ Parsed profile:', {
      username: parsedProfile.username,
      hasBio: !!parsedProfile.bio,
      bioLength: parsedProfile.bio.length,
      followersCount: parsedProfile.followersCount,
      followingCount: parsedProfile.followingCount,
      postsCount: parsedProfile.postsCount,
      recentPostsCount: parsedProfile.recentPosts.length,
      totalPostImages: parsedProfile.postImages.length,
      hasProfilePic: !!parsedProfile.profilePicUrl,
    });

    return parsedProfile;
  }

  private async parsePageContent(page: Page, username: string): Promise<InstagramProfile> {
    console.log('[Instagram Scraper] Using fallback: parsing page content');

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
        if (text.includes('window.__additionalDataLoaded')) {
          const match = text.match(/window\.__additionalDataLoaded\s*\(\s*['"][^'"]+['"]\s*,\s*({.+?})\s*\)/);
          if (match) {
            return JSON.parse(match[1]);
          }
        }
      }
      return null;
    });

    if (jsonData?.entry_data?.ProfilePage?.[0]?.graphql?.user) {
      const user = jsonData.entry_data.ProfilePage[0].graphql.user;
      return this.parseInterceptedData({ user }, username, page);
    }

    const scrapedData = await page.evaluate(() => {
      const result: any = {
        bio: '',
        fullName: '',
        profilePicUrl: '',
        isPrivate: false,
      };

      const bioSelectors = [
        'div._aa_c',
        '[class*="x7a106z"]',
        'header section > div > span',
        'header section div span:not([class])',
      ];

      for (const selector of bioSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent?.trim()) {
          result.bio = el.textContent.trim();
          break;
        }
      }

      const nameSelectors = [
        'header section span.x1lliihq',
        'header h2',
        '[class*="x1heor9g"]',
      ];

      for (const selector of nameSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent?.trim()) {
          result.fullName = el.textContent.trim();
          break;
        }
      }

      const profileImg = document.querySelector('header img') as HTMLImageElement;
      if (profileImg?.src) {
        result.profilePicUrl = profileImg.src;
      }

      const privateIndicator = document.body.innerText.includes('This account is private') ||
                              document.body.innerText.includes('This Account is Private');
      result.isPrivate = privateIndicator;

      return result;
    });

    const domStats = await this.scrapeStatsFromDOM(page);

    return {
      username: username,
      fullName: scrapedData.fullName || '',
      bio: scrapedData.bio || '',
      followersCount: domStats.followersCount,
      followingCount: domStats.followingCount,
      postsCount: domStats.postsCount,
      recentPosts: [],
      profilePicUrl: scrapedData.profilePicUrl || '',
      isPrivate: scrapedData.isPrivate || false,
      postImages: [],
    };
  }

  private async fetchImageAsBase64(imageUrl: string, page: Page): Promise<string | null> {
    try {
      const base64 = await page.evaluate(async (url) => {
        try {
          const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit',
          });

          if (!response.ok) return null;

          const blob = await response.blob();

          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Failed to fetch image:', error);
          return null;
        }
      }, imageUrl);

      return base64;
    } catch (error) {
      console.error('[Instagram Scraper] Base64 conversion failed:', error);
      return null;
    }
  }

  async fetchMultipleImagesAsBase64(
    imageUrls: string[],
    maxImages: number = 5
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    if (!this.browser) {
      await this.initBrowser();
    }

    if (!this.browser) {
      return results;
    }

    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      for (const url of imageUrls.slice(0, maxImages)) {
        const base64 = await this.fetchImageAsBase64(url, page);
        if (base64) {
          results.set(url, base64);
        }
      }
    } finally {
      await page.close();
      await context.close();
    }

    return results;
  }
}

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
