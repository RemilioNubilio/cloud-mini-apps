"use client";

import { ExternalLink, Image as ImageIcon, Instagram, Trash2, Twitter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface ScrapedPostImage {
  url: string;
  width?: number;
  height?: number;
  isVideo?: boolean;
}

interface ScrapedPost {
  caption: string;
  timestamp: string;
  images?: ScrapedPostImage[];
}

interface ScrapedTweet {
  text: string;
  timestamp: string;
}

export interface ScrapedProfileData {
  platform: "instagram" | "twitter";
  username: string;
  fullName?: string;
  bio: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  recentPosts?: ScrapedPost[];
  recentTweets?: ScrapedTweet[];
  profilePicUrl?: string;
  profilePicBase64?: string;
  isPrivate?: boolean;
  isVerified?: boolean;
  postImages?: ScrapedPostImage[];
}

interface ScrapedProfileCardProps {
  data: ScrapedProfileData;
  onRemove: () => void;
}

function getProxiedImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  if (url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const needsProxy = [
      "cdninstagram.com",
      "instagram.com",
      "fbcdn.net",
      "scontent",
      "twimg.com",
    ].some(domain => parsedUrl.hostname.includes(domain));

    if (needsProxy) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return url;
  } catch {
    return url;
  }
}

export function ScrapedProfileCard({ data, onRemove }: ScrapedProfileCardProps) {
  const {
    platform,
    username,
    fullName,
    bio,
    followersCount,
    recentPosts,
    recentTweets,
    profilePicUrl,
    profilePicBase64,
    isPrivate,
    isVerified,
    postImages,
  } = data;
  const posts = platform === "instagram" ? recentPosts : recentTweets;
  const PlatformIcon = platform === "instagram" ? Instagram : Twitter;
  const platformColor = platform === "instagram" ? "from-pink-500 to-purple-500" : "from-blue-400 to-blue-600";
  const platformName = platform === "instagram" ? "Instagram" : "X (Twitter)";
  const [imageError, setImageError] = useState(false);
  const [expandedImages, setExpandedImages] = useState(false);

  const profileImageSrc = profilePicBase64 || getProxiedImageUrl(profilePicUrl);

  const displayImages = postImages?.filter(img => !img.isVideo).slice(0, 6) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl hover:border-white/20"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${platformColor}`} />

      <button
        onClick={onRemove}
        className="absolute top-3 right-3 z-10 rounded-lg bg-black/60 p-2 opacity-0 transition-all hover:bg-red-500/80 group-hover:opacity-100"
        title="Remove this profile"
      >
        <Trash2 className="size-4 text-white" />
      </button>

      <div className="p-5 space-y-5">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            {!imageError && profileImageSrc ? (
              <img
                src={profileImageSrc}
                alt={username}
                className="size-16 rounded-full border-2 border-white/10 object-cover shadow-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`flex size-16 items-center justify-center rounded-full bg-gradient-to-br ${platformColor} shadow-lg`}>
                <PlatformIcon className="size-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 rounded-full bg-black p-1 border border-white/10 shadow-sm">
              <PlatformIcon className={`size-3.5 ${platform === 'instagram' ? 'text-pink-500' : 'text-blue-400'}`} />
            </div>
            {isVerified && (
              <div className="absolute -top-1 -right-1 rounded-full bg-blue-500 p-0.5 border border-white/20">
                <svg className="size-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between mb-1">
              <a
                href={`https://${platform === "instagram" ? "instagram.com" : "twitter.com"}/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-1.5 text-base font-bold text-white hover:text-pink-400 transition-colors truncate pr-8"
              >
                @{username}
                <ExternalLink className="size-3 opacity-0 group-hover/link:opacity-100 transition-opacity text-white/50" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {fullName && (
                <p className="text-xs text-white/60 truncate max-w-[120px]">{fullName}</p>
              )}
              {isPrivate && (
                <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Private
                </span>
              )}
            </div>

            {followersCount !== undefined && followersCount > 0 && (
              <div className="grid grid-cols-3 gap-2 text-xs border-t border-white/5 pt-3">
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-white text-sm truncate" title={followersCount.toLocaleString()}>
                    {followersCount.toLocaleString()}
                  </span>
                  <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">Followers</span>
                </div>

                {data.followingCount !== undefined && data.followingCount > 0 && (
                  <div className="flex flex-col overflow-hidden border-l border-white/10 pl-2">
                    <span className="font-bold text-white text-sm truncate" title={data.followingCount.toLocaleString()}>
                      {data.followingCount.toLocaleString()}
                    </span>
                    <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">Following</span>
                  </div>
                )}

                {data.postsCount !== undefined && data.postsCount > 0 && (
                  <div className="flex flex-col overflow-hidden border-l border-white/10 pl-2">
                    <span className="font-bold text-white text-sm truncate" title={data.postsCount.toLocaleString()}>
                      {data.postsCount.toLocaleString()}
                    </span>
                    <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">
                      {platform === 'instagram' ? 'Posts' : 'Tweets'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {bio && (
          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3.5 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-white/80 line-clamp-4 hover:line-clamp-none transition-all duration-300">
              {bio}
            </p>
          </div>
        )}

        {displayImages.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setExpandedImages(!expandedImages)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors"
            >
              <ImageIcon className="size-3" />
              <span>{displayImages.length} Post Images Captured</span>
              <span className="text-white/30">{expandedImages ? '▼' : '▶'}</span>
            </button>

            <AnimatePresence>
              {expandedImages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-3 gap-1.5 overflow-hidden"
                >
                  {displayImages.map((img, index) => {
                    const proxiedUrl = getProxiedImageUrl(img.url);
                    return (
                      <ProxiedImage
                        key={index}
                        src={proxiedUrl}
                        alt={`Post ${index + 1}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5"
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-white/40"></span>
                Recent {platform === "instagram" ? "Posts" : "Tweets"}
              </h4>
              <span className="text-[10px] font-medium text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{posts.length}</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {posts.slice(0, 5).map((post: ScrapedPost | ScrapedTweet, index: number) => {
                const text = platform === "instagram" ? (post as ScrapedPost).caption : (post as ScrapedTweet).text;
                if (!text || !text.trim()) return null;

                const postImgs = platform === "instagram" ? (post as ScrapedPost).images : undefined;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group/post rounded-lg border border-white/5 bg-white/[0.01] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04] hover:shadow-sm"
                  >
                    {postImgs && postImgs.length > 0 && (
                      <div className="flex gap-1 mb-2 overflow-x-auto">
                        {postImgs.slice(0, 3).map((img, imgIndex) => {
                          const proxiedUrl = getProxiedImageUrl(img.url);
                          return (
                            <div
                              key={imgIndex}
                              className="shrink-0 size-12 rounded overflow-hidden border border-white/10 bg-white/5"
                            >
                              <img
                                src={proxiedUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed text-white/70 line-clamp-2 group-hover/post:line-clamp-none transition-all">
                      {text}
                    </p>
                    {post.timestamp && (
                      <p className="mt-2 text-[10px] text-white/30 font-mono">
                        {new Date(post.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {isPrivate && (!posts || posts.length === 0) && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3.5 flex items-start gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-xs font-medium text-yellow-200/90 mb-0.5">Private Account</p>
              <p className="text-[10px] text-yellow-200/60">
                Only bio and public stats are visible. Recent posts cannot be accessed.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-medium tracking-wide text-white/20 truncate mr-2">
            SCRAPED FROM {platformName.toUpperCase()}
          </span>
          <div className={`shrink-0 rounded-full bg-gradient-to-r ${platformColor} px-2.5 py-1 text-[10px] font-bold text-white shadow-sm whitespace-nowrap`}>
            Auto-filled
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProxiedImage({ src, alt, className }: { src: string | undefined; alt: string; className: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <ImageIcon className="size-4 text-white/20" />
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}

interface ScrapedDataDisplayProps {
  instagramData: ScrapedProfileData | null;
  twitterData: ScrapedProfileData | null;
  onRemoveInstagram: () => void;
  onRemoveTwitter: () => void;
}

export function ScrapedDataDisplay({
  instagramData,
  twitterData,
  onRemoveInstagram,
  onRemoveTwitter,
}: ScrapedDataDisplayProps) {
  const hasAnyData = instagramData || twitterData;

  if (!hasAnyData) {
    return null;
  }

  const totalImages =
    (instagramData?.postImages?.length || 0) +
    (twitterData?.postImages?.length || 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Captured Vibe
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-3 sm:grid-cols-2">
          {instagramData && (
            <ScrapedProfileCard
              key="instagram"
              data={instagramData}
              onRemove={onRemoveInstagram}
            />
          )}
          {twitterData && (
            <ScrapedProfileCard
              key="twitter"
              data={twitterData}
              onRemove={onRemoveTwitter}
            />
          )}
        </div>
      </AnimatePresence>

      <p className="text-center text-xs text-white/40 italic">
        {totalImages > 0
          ? `✨ ${totalImages} images + personality data captured for AI training`
          : "✨ This data will help train your AI's personality"}
      </p>
    </div>
  );
}
