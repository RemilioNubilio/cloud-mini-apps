"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function EdadHero() {
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
    const el = document.getElementById("build-your-dad");
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
              The Father Figure You Deserve
            </p>

            <h1 className="text-5xl leading-[1.05] font-black text-balance text-white sm:text-6xl lg:text-7xl">
              Finally Get{" "}
              <span className="relative inline-block bg-amber-500 px-3 py-1 text-white shadow-lg">
                The Dad
              </span>{" "}
              You Never Had.
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-pretty text-white/70 sm:text-xl">
              Get the advice, the{" "}
              <span className="text-white">dad jokes</span>, and the
              unconditional support you always deserved.{" "}
              <span className="text-white">No judgment.</span> Just a father
              figure who's{" "}
              <span className="text-white">always there for you.</span>
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-lg"
              onClick={handleScrollToForm}
            >
              Meet Your AI Dad Now
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
              {/* Placeholder for demo - shows a warm dad-themed gradient */}
              <div className="h-full w-full bg-gradient-to-br from-amber-900/80 via-stone-800 to-amber-950 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="text-6xl mb-4">👨‍👧‍👦</p>
                  <p className="text-white/80 text-sm font-medium">
                    Your AI Dad
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Always here for you
                  </p>
                </div>
              </div>

              {/* Sound toggle button - hidden when no video */}
              {videoRef.current && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute right-3 bottom-3 rounded-full bg-black/70 p-2.5 backdrop-blur-sm transition-all hover:bg-amber-500"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? (
                    <VolumeX className="size-4 text-white" />
                  ) : (
                    <Volume2 className="size-4 text-white" />
                  )}
                </button>
              )}

              {/* Live badge */}
              <div className="absolute top-3 left-3 rounded-full border border-amber-400/40 bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                <p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                  Ready
                </p>
              </div>
            </div>
          </div>

          {/* Subtle glow effect behind phone */}
          <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 blur-3xl" />
        </div>
      </div>
    </Section>
  );
}

