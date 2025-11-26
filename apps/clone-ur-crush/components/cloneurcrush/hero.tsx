"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function CloneHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleScrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("build-your-crush");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section className="relative overflow-hidden pt-20 pb-20 sm:pt-32 sm:pb-32">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 md:flex-row md:items-center md:gap-12 lg:gap-16">
        {/* Left: Content */}
        <div className="space-y-8 md:flex-1">
          <div className="space-y-6">
            <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
              Limited Beta Access
            </p>

            <h1 className="text-5xl leading-[1.05] font-black text-balance text-white sm:text-6xl lg:text-7xl">
              Stop Being Invisible.{" "}
              <span className="relative inline-block bg-pink-500 px-3 py-1 text-white shadow-lg">
                Clone Your Crush
              </span>{" "}
              & Chat Tonight.
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-white/70 sm:text-xl">
              Slip past the what-ifs. Spin up an AI mirror of{" "}
              <span className="text-white">that</span> person and feel the
              chemistry in minutes.{" "}
              <span className="text-white">Forbidden?</span> Maybe.{" "}
              <span className="text-white">Unforgettable?</span> Definitely.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg"
              onClick={handleScrollToForm}
            >
              Chat With Your Crush Now
            </Button>
            <a
              href="#demo"
              className="text-base font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              See how it works →
            </a>
          </div>
        </div>

        {/* Right: Mobile Phone Mockup Video */}
        <div className="relative w-full max-w-[220px] self-center md:max-w-[260px] md:self-start lg:max-w-[300px]">
          {/* Phone mockup container - iPhone size */}
          <div className="relative mx-auto w-[200px] overflow-hidden rounded-[24px] border-[8px] border-gray-900 bg-gray-900 shadow-2xl sm:w-[240px] sm:rounded-[28px] sm:border-[10px] lg:w-[280px] lg:rounded-[32px] lg:border-[12px]">
            <div className="relative aspect-[9/19.5]">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/video-1.mp4" type="video/mp4" />
              </video>

              {/* Sound toggle button */}
              <button
                type="button"
                onClick={toggleMute}
                className="absolute right-3 bottom-3 rounded-full bg-black/70 p-2.5 backdrop-blur-sm transition-all hover:bg-pink-500"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="size-4 text-white" />
                ) : (
                  <Volume2 className="size-4 text-white" />
                )}
              </button>

              {/* Live badge */}
              <div className="absolute top-3 left-3 rounded-full border border-pink-400/40 bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                <p className="text-[10px] font-bold tracking-wider text-pink-400 uppercase">
                  Live
                </p>
              </div>
            </div>
          </div>

          {/* Subtle glow effect behind phone */}
          <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 blur-3xl" />
        </div>
      </div>
    </Section>
  );
}
