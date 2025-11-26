"use client";

import { Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

import { Section } from "@/components/ui/section";

const REVIEW_VIDEOS = [
  {
    name: "Sarah, 24",
    title: "\"Changed how I think about connection\"",
    video: "/videos/video-2.mp4",
  },
  {
    name: "Marcus, 27",
    title: "\"Finally had the conversation I needed\"",
    video: "/videos/video-3.mp4",
  },
];

export default function CustomerReviews() {
  return (
    <Section className="bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4">
        <div className="space-y-4 text-left">
          <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
            Real Stories
          </p>
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl">
            See what early users are{" "}
            <span className="bg-pink-500 px-2 text-white">saying.</span>
          </h2>
          <p className="max-w-2xl text-lg text-white/60">
            Unscripted reactions from beta testers who cloned their crush.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {REVIEW_VIDEOS.map((review) => (
            <VideoReviewCard key={review.name} {...review} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function VideoReviewCard({
  name,
  title,
  video,
}: {
  name: string;
  title: string;
  video: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black backdrop-blur-sm">
      <div className="relative aspect-[9/16] overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          onClick={togglePlay}
        >
          <source src={video} type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Play button overlay (shows when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all hover:bg-black/50"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-pink-500 shadow-lg transition-transform hover:scale-110">
              <Play className="size-8 fill-white text-white" />
            </div>
          </button>
        )}

        {/* Sound toggle (top right) */}
        <button
          onClick={toggleMute}
          className="absolute right-4 top-4 rounded-full bg-black/50 p-2 backdrop-blur-sm transition-all hover:bg-black/70"
        >
          {isMuted ? (
            <VolumeX className="size-5 text-white" />
          ) : (
            <Volume2 className="size-5 text-pink-400" />
          )}
        </button>

        {/* Text overlay (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
          <p className="text-sm font-semibold text-pink-400">{name}</p>
          <p className="mt-1 text-lg font-bold text-white">{title}</p>
        </div>
      </div>
    </div>
  );
}

