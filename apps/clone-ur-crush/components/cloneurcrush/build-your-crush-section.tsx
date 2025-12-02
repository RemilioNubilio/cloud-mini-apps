"use client";

import { Instagram, Twitter,Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";

import { Button } from "@/components/ui/button";

import { ScrapedDataDisplay, type ScrapedProfileData } from "./scraped-profile-card";

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

export default function BuildYourCrushSection() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState<Vibe>("flirty");
  const [backstory, setBackstory] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [socialContent, setSocialContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isScrapingInstagram, setIsScrapingInstagram] = useState(false);
  const [isScrapingTwitter, setIsScrapingTwitter] = useState(false);
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState(true);
  const [error, setError] = useState("");

  const [instagramData, setInstagramData] = useState<ScrapedProfileData | null>(null);
  const [twitterData, setTwitterData] = useState<ScrapedProfileData | null>(null);

  const vibeDescriptions: Record<Vibe, string> = {
    playful: "Fun, teasing, lighthearted banter",
    mysterious: "Keeps you guessing, intriguing, hard to read",
    romantic: "Sweet, affectionate, genuinely caring",
    bold: "Confident, direct, takes charge",
    shy: "Innocent, nervous around you, cute energy",
    flirty: "Suggestive, charming, knows what they want",
    intellectual: "Deep conversations, witty, thought-provoking",
    spicy: "Explicit, passionate, no boundaries",
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - photos.length);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!autoScrapeEnabled) return;

    const cleanUsername = instagram.trim().replace(/^@/, "");

    const isValidUsername =
      cleanUsername.length >= 3 &&
      /^[a-zA-Z0-9._]+$/.test(cleanUsername) &&
      /[a-zA-Z0-9]/.test(cleanUsername);

    if (!isValidUsername) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log(`[Form] Triggering Instagram scrape for: ${cleanUsername}`);
      scrapeProfile("instagram", cleanUsername);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [instagram, autoScrapeEnabled]);

  useEffect(() => {
    if (!autoScrapeEnabled) return;

    const cleanUsername = twitter.trim().replace(/^@/, "");

    const isValidUsername =
      cleanUsername.length >= 3 &&
      /^[a-zA-Z0-9_]+$/.test(cleanUsername) &&
      /[a-zA-Z0-9]/.test(cleanUsername);

    if (!isValidUsername) {
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log(`[Form] Triggering Twitter scrape for: ${cleanUsername}`);
      scrapeProfile("twitter", cleanUsername);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [twitter, autoScrapeEnabled]);

  const scrapeProfile = async (platform: "instagram" | "twitter", username: string) => {
    const setLoading = platform === "instagram" ? setIsScrapingInstagram : setIsScrapingTwitter;

    if (platform === "instagram" && isScrapingInstagram) {
      console.log(`[Form] Already scraping Instagram, skipping...`);
      return;
    }
    if (platform === "twitter" && isScrapingTwitter) {
      console.log(`[Form] Already scraping Twitter, skipping...`);
      return;
    }

    setLoading(true);

    try {
      console.log(`[Form] 🔍 Scraping ${platform} profile: @${username}`);

      const response = await fetch("/api/scrape-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to scrape profile" }));
        console.warn(`[Form] ⚠️ Failed to scrape ${platform}:`, errorData.error);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log(`[Form] ✅ Successfully scraped ${platform} profile:`, {
          username: result.data.username,
          hasBio: !!result.data.bio,
          followersCount: result.data.followersCount,
          postsCount: result.data.recentPosts?.length || result.data.recentTweets?.length || 0,
          postImagesCount: result.data.postImages?.length || 0,
          hasProfilePic: !!result.data.profilePicUrl,
          cached: result.cached,
        });

        const scrapedData: ScrapedProfileData = {
          platform,
          username: result.data.username,
          fullName: result.data.fullName || result.data.displayName,
          bio: result.data.bio,
          followersCount: result.data.followersCount,
          followingCount: result.data.followingCount,
          postsCount: result.data.postsCount || result.data.tweetsCount,
          recentPosts: result.data.recentPosts,
          recentTweets: result.data.recentTweets,
          profilePicUrl: result.data.profilePicUrl,
          profilePicBase64: result.data.profilePicBase64,
          isPrivate: result.data.isPrivate || result.data.isProtected,
          isVerified: result.data.isVerified,
          postImages: result.data.postImages,
        };

        if (platform === "instagram") {
          setInstagramData(scrapedData);
        } else if (platform === "twitter") {
          setTwitterData(scrapedData);
        }

        let scrapedText = "";
        if (platform === "instagram") {
          if (result.data.bio) {
            scrapedText += `📸 Instagram (@${result.data.username}):\n${result.data.bio}\n\n`;
          }

          if (result.data.recentPosts && result.data.recentPosts.length > 0) {
            scrapedText += "Recent Posts:\n";
            result.data.recentPosts.slice(0, 5).forEach((post: { caption?: string }) => {
              if (post.caption && post.caption.trim()) {
                scrapedText += `• ${post.caption.slice(0, 100)}${post.caption.length > 100 ? "..." : ""}\n`;
              }
            });
          }
        } else if (platform === "twitter") {
          if (result.data.bio) {
            scrapedText += `𝕏 Twitter (@${result.data.username}):\n${result.data.bio}\n\n`;
          }

          if (result.data.recentTweets && result.data.recentTweets.length > 0) {
            scrapedText += "Recent Tweets:\n";
            result.data.recentTweets.slice(0, 5).forEach((tweet: { text?: string }) => {
              if (tweet.text && tweet.text.trim()) {
                scrapedText += `• ${tweet.text.slice(0, 100)}${tweet.text.length > 100 ? "..." : ""}\n`;
              }
            });
          }
        }

        if (scrapedText.trim()) {
          setSocialContent((prev) => {
            const platformPrefix = platform === "instagram" ? "📸 Instagram" : "𝕏 Twitter";
            if (prev.includes(platformPrefix)) {
              const regex = platform === "instagram"
                ? /📸 Instagram[^]*?(?=(𝕏 Twitter|$))/
                : /𝕏 Twitter[^]*?$/;
              return prev.replace(regex, scrapedText).slice(0, 1000);
            } else {
              const separator = prev.trim() ? "\n\n" : "";
              return (prev + separator + scrapedText).slice(0, 1000);
            }
          });
        }
      }
    } catch (error) {
      console.error(`[Form] ❌ Error scraping ${platform}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const collectScrapedImages = (): ScrapedImageData[] => {
    const images: ScrapedImageData[] = [];

    if (instagramData) {
      if (instagramData.profilePicUrl || instagramData.profilePicBase64) {
        images.push({
          url: instagramData.profilePicUrl || "",
          base64: instagramData.profilePicBase64,
          isProfilePic: true,
          source: "instagram",
        });
      }

      if (instagramData.postImages) {
        for (const img of instagramData.postImages.slice(0, 5)) {
          if (!img.isVideo && img.url) {
            images.push({
              url: img.url,
              isProfilePic: false,
              source: "instagram",
            });
          }
        }
      }
    }

    if (twitterData) {
      if (twitterData.profilePicUrl || twitterData.profilePicBase64) {
        images.push({
          url: twitterData.profilePicUrl || "",
          base64: twitterData.profilePicBase64,
          isProfilePic: true,
          source: "twitter",
        });
      }
    }

    return images;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a name or nickname");
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarBase64: string | undefined;
      let imageUrls: string[] = [];
      let imageBase64s: string[] = [];

      if (photos.length > 0) {
        console.log(`[Form] Uploading ${photos.length} image(s)...`);
        setIsUploadingImages(true);

        try {
          const formData = new FormData();
          photos.forEach((photo) => {
            formData.append("images", photo);
          });

          const uploadResponse = await fetch("/api/upload-images", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({
              error: "Failed to upload images",
            }));
            throw new Error(errorData.error || "Image upload failed");
          }

          const uploadResult = await uploadResponse.json();

          if (uploadResult.images && uploadResult.images.length > 0) {
            avatarBase64 = uploadResult.images[0].base64;
            imageUrls = uploadResult.images.map((img: { url: string }) => img.url);
            imageBase64s = uploadResult.images
              .map((img: { base64?: string }) => img.base64)
              .filter((b: string | undefined): b is string => !!b);
          } else {
            imageUrls = uploadResult.urls || [];
            avatarBase64 = imageUrls[0];
          }

          console.log(`[Form] ✅ Images processed successfully:`, {
            count: imageUrls.length,
            hasBase64Avatar: !!avatarBase64,
          });
        } catch (uploadError) {
          console.error("[Form] ❌ Image upload error:", uploadError);
          throw new Error(
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload images. Please try again.",
          );
        } finally {
          setIsUploadingImages(false);
        }
      }

      const scrapedImages = collectScrapedImages();

      if (!avatarBase64 && scrapedImages.length > 0) {
        const profilePicImage = scrapedImages.find(img => img.isProfilePic);
        if (profilePicImage) {
          avatarBase64 = profilePicImage.base64 || profilePicImage.url;
        }
      }

      console.log(`[Form] Creating character "${name}" with vibe "${vibe}"...`, {
        hasUploadedImages: imageUrls.length > 0,
        hasScrapedImages: scrapedImages.length > 0,
        hasAvatar: !!avatarBase64,
      });

      const response = await fetch("/api/create-crush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          vibe,
          backstory: backstory.trim() || undefined,
          instagram: instagram.trim() || undefined,
          twitter: twitter.trim() || undefined,
          socialContent: socialContent.trim() || undefined,
          avatarUrl: avatarBase64,
          avatarBase64: avatarBase64,
          imageUrls: imageUrls,
          imageBase64s: imageBase64s.length > 0 ? imageBase64s : undefined,
          scrapedImages: scrapedImages.length > 0 ? scrapedImages : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to create character" }));
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await response.json();

      console.log(`[Form] ✅ Character created successfully:`, {
        characterId: result.characterId,
        sessionId: result.sessionId,
      });

      const params = new URLSearchParams({
        characterId: result.characterId,
        sessionId: result.sessionId,
        name: name.trim(),
        vibe,
      });

      router.push(`/connecting?${params.toString()}`);
    } catch (err) {
      console.error("[Form] ❌ Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create your crush. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  const totalScrapedImages =
    (instagramData?.postImages?.length || 0) +
    (twitterData?.postImages?.length || 0);

  return (
    <section
      id="build-your-crush"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="mx-auto max-w-2xl px-4">
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01] p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

          <div className="relative space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl leading-tight font-bold text-balance text-white sm:text-4xl">
                Build Your Crush in One Step
              </h2>
              <p className="text-base text-balance text-white/60 sm:text-lg">
                We&apos;ll send this to ElizaOS Cloud to create your private AI chat.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white/90"
                >
                  Their name or nickname{" "}
                  <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Luna / Ex / Gym Crush"
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden"
                  required
                />
                <p className="text-xs text-white/40">
                  Use any nickname. This stays between you and the AI.
                </p>
              </div>

              <div className="space-y-3">
                <p className="block text-sm font-medium text-white/90">
                  Vibe <span className="text-pink-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      "playful",
                      "mysterious",
                      "romantic",
                      "bold",
                      "shy",
                      "flirty",
                      "intellectual",
                      "spicy",
                    ] as Vibe[]
                  ).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVibe(v)}
                      className={`group relative rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                        vibe === v
                          ? "bg-gradient-to-b from-pink-500 to-pink-600 text-white shadow-md"
                          : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
                      }`}
                      title={vibeDescriptions[v]}
                    >
                      <span className="relative z-10">
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </span>
                      {vibe !== v && (
                        <span className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 hidden -translate-x-1/2 rounded-lg border border-white/10 bg-black/90 px-3 py-1.5 text-xs whitespace-nowrap text-white/90 backdrop-blur-sm group-hover:block">
                          {vibeDescriptions[v]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/50">
                  {vibeDescriptions[vibe]}
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      Optional: Their social media
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Add their username to auto-capture their vibe + photos
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScrapeEnabled}
                      onChange={(e) => setAutoScrapeEnabled(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500/20"
                    />
                    <span className="text-xs text-white/60">Auto-fill</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="instagram"
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Instagram className="size-4" />
                    Instagram
                    {isScrapingInstagram && (
                      <span className="text-xs text-pink-400 animate-pulse">
                        Scraping...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="username"
                    disabled={isScrapingInstagram}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="twitter"
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Twitter className="size-4" />X (Twitter)
                    {isScrapingTwitter && (
                      <span className="text-xs text-pink-400 animate-pulse">
                        Scraping...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="username"
                    disabled={isScrapingTwitter}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden disabled:opacity-50"
                  />
                </div>

                {(instagramData || twitterData) && (
                  <div className="border-t border-white/5 pt-4">
                    <ScrapedDataDisplay
                      instagramData={instagramData}
                      twitterData={twitterData}
                      onRemoveInstagram={() => {
                        setInstagramData(null);
                        setSocialContent(prev => {
                          const regex = /📸 Instagram[^]*?(?=(𝕏 Twitter|$))/;
                          return prev.replace(regex, "").trim();
                        });
                      }}
                      onRemoveTwitter={() => {
                        setTwitterData(null);
                        setSocialContent(prev => {
                          const regex = /𝕏 Twitter[^]*?$/;
                          return prev.replace(regex, "").trim();
                        });
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <label
                    htmlFor="socialContent"
                    className="block text-sm font-medium text-white/90"
                  >
                    {(instagramData || twitterData)
                      ? "Additional context (optional)"
                      : "Their vibe & personality"}
                  </label>
                  <p className="text-xs text-white/40">
                    {(instagramData || twitterData)
                      ? "Add extra details to refine their personality"
                      : autoScrapeEnabled
                        ? "Enter usernames above for auto-fill, or paste content manually"
                        : "Paste their Instagram bio, tweets, or post captions"}
                  </p>

                  <textarea
                    id="socialContent"
                    value={socialContent}
                    onChange={(e) => setSocialContent(e.target.value)}
                    placeholder={
                      (instagramData || twitterData)
                        ? "Add any extra details about their personality..."
                        : "Example: 'Living life on my own terms' or paste recent posts..."
                    }
                    rows={(instagramData || twitterData) ? 3 : 5}
                    maxLength={1000}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden resize-none"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-white/40">
                      {autoScrapeEnabled && (isScrapingInstagram || isScrapingTwitter) ? (
                        <span className="text-pink-400">Fetching profile data...</span>
                      ) : (
                        "This helps create a more authentic personality"
                      )}
                    </p>
                    <p className={`${socialContent.length > 900 ? "text-pink-400" : "text-white/40"}`}>
                      {socialContent.length}/1000
                    </p>
                  </div>
                </div>

                {autoScrapeEnabled && (
                  <div className="text-xs text-white/30 bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <p className="font-medium text-white/40 mb-1">Auto-fill Disclaimer:</p>
                    <p>
                      Profile data is scraped from publicly available pages. This feature is for personal use only.
                      By using auto-fill, you accept responsibility for respecting platform Terms of Service.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-white/90">
                  Optional: Add photos
                </p>
                <p className="text-xs text-white/40">
                  Upload 1-3 pics so she looks closer to your real crush
                  {totalScrapedImages > 0 && (
                    <span className="text-pink-400 ml-1">
                      ({totalScrapedImages} already captured from social)
                    </span>
                  )}
                </p>

                {photos.length < 3 && (
                  <label
                    htmlFor="photos"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-8 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <Upload className="mb-2 size-8 text-white/30 transition-colors group-hover:text-white/50" />
                    <p className="text-sm text-white/50">
                      Click to upload{" "}
                      {photos.length > 0
                        ? `(${3 - photos.length} more)`
                        : "photos"}
                    </p>
                    <input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}

                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo.name}-${photo.lastModified}`}
                        className="group relative size-20 overflow-hidden rounded-lg border border-white/10"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 rounded-md bg-black/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="size-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="backstory"
                  className="block text-sm font-medium text-white/90"
                >
                  Optional backstory
                </label>
                <input
                  type="text"
                  id="backstory"
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="Met in college, always joked about running away together."
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImages}
                  size="lg"
                  className="h-12 w-full bg-gradient-to-b from-pink-500 to-pink-600 text-base font-semibold shadow-lg hover:from-pink-400 hover:to-pink-500 disabled:opacity-50"
                >
                  {isUploadingImages
                    ? "Uploading images..."
                    : isSubmitting
                    ? "Creating..."
                    : "Continue to ElizaOS Cloud"}
                </Button>

                <p className="text-center text-xs text-white/40">
                  {(photos.length > 0 || totalScrapedImages > 0) && !isSubmitting && !isUploadingImages && (
                    <span className="block text-pink-400 mb-1">
                      {photos.length > 0 && `${photos.length} uploaded`}
                      {photos.length > 0 && totalScrapedImages > 0 && " + "}
                      {totalScrapedImages > 0 && `${totalScrapedImages} scraped`}
                      {" image"}
                      {(photos.length + totalScrapedImages) > 1 ? "s" : ""} ready
                    </span>
                  )}
                  Next: you&apos;ll see a quick payment screen in ElizaOS Cloud to
                  unlock this chat.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
