"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Heart, MessageCircle, Zap } from "lucide-react";

/**
 * Loading fallback component for Suspense
 */
function ConnectingLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0a09] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 size-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-96 animate-pulse rounded-full bg-orange-500/10 blur-3xl delay-1000" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01] p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          <div className="flex justify-center">
            <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
              <Zap className="size-10 animate-pulse text-white" fill="white" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xl font-bold text-white">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main connecting content component that uses useSearchParams
 */
function ConnectingContent() {
  const searchParams = useSearchParams();
  const [dots, setDots] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState<number[]>([]);

  const nickname = searchParams.get("nickname") || "Kiddo";
  const vibe = searchParams.get("vibe") || "supportive";
  const characterId = searchParams.get("characterId");
  const sessionId = searchParams.get("sessionId");

  // Vibe-specific messages
  const vibeMessages: Record<
    string,
    { analyzing: string; creating: string; finalizing: string }
  > = {
    supportive: {
      analyzing: "Loading unconditional support protocols",
      creating: "Teaching him to say 'I'm proud of you'",
      finalizing: "He's practicing his encouraging words for you",
    },
    wise: {
      analyzing: "Loading decades of life wisdom",
      creating: "Teaching him your favorite philosophical topics",
      finalizing: "He's preparing thoughtful advice just for you",
    },
    funny: {
      analyzing: "Loading the ultimate dad joke database",
      creating: "Teaching him the timing of a perfect pun",
      finalizing: "He's warming up his best groan-worthy jokes",
    },
    strict: {
      analyzing: "Calibrating tough love parameters",
      creating: "Teaching him to hold you accountable",
      finalizing: "He's ready to push you to be your best",
    },
    chill: {
      analyzing: "Setting relaxation levels to maximum",
      creating: "Teaching him the art of going with the flow",
      finalizing: "He's ready to hang out and chat",
    },
    mentor: {
      analyzing: "Loading career guidance modules",
      creating: "Teaching him your industry and goals",
      finalizing: "He's preparing actionable advice for you",
    },
    storyteller: {
      analyzing: "Loading a lifetime of stories",
      creating: "Teaching him the lessons of the past",
      finalizing: "He's got a great story to share with you",
    },
    handy: {
      analyzing: "Loading practical problem-solving skills",
      creating: "Teaching him DIY tips and life hacks",
      finalizing: "He's ready to help you fix anything",
    },
  };

  const messages = vibeMessages[vibe] || vibeMessages.supportive;
  const steps = [
    { icon: Sparkles, text: messages.analyzing, color: "text-amber-400" },
    { icon: Heart, text: messages.creating, color: "text-orange-400" },
    {
      icon: MessageCircle,
      text: messages.finalizing,
      color: "text-yellow-400",
    },
  ];

  useEffect(() => {
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        return prev.length >= 3 ? "" : `${prev}.`;
      });
    }, 500);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2000);

    // Floating hearts animation
    const heartsInterval = setInterval(() => {
      setHearts((prev) => {
        const newHearts = [...prev, Date.now()];
        return newHearts.slice(-5); // Keep only last 5
      });
    }, 800);

    // Redirect to ElizaOS Cloud after animation
    let redirectTimeout: NodeJS.Timeout | null = null;

    if (characterId && sessionId) {
      redirectTimeout = setTimeout(() => {
        const elizaCloudUrl =
          process.env.NEXT_PUBLIC_ELIZA_CLOUD_URL || "http://localhost:3000";

        // Build redirect URL - theming is now dynamic based on source param
        const redirectUrl = new URL(`${elizaCloudUrl}/chat/${characterId}`);
        redirectUrl.searchParams.set("intro", "true");
        redirectUrl.searchParams.set("source", "e-dad");
        redirectUrl.searchParams.set("session", sessionId);
        redirectUrl.searchParams.set("name", nickname);
        redirectUrl.searchParams.set("vibe", vibe);

        console.log(`[Connecting] Redirecting to: ${redirectUrl.toString()}`);
        window.location.href = redirectUrl.toString();
      }, 6000); // 6 seconds for animation
    } else {
      console.warn(
        "[Connecting] Missing characterId or sessionId, redirect cancelled"
      );
    }

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stepInterval);
      clearInterval(heartsInterval);
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [characterId, sessionId, nickname, vibe]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0a09] p-4">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 size-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 size-96 animate-pulse rounded-full bg-orange-500/10 blur-3xl delay-1000" />

        {/* Floating hearts */}
        {hearts.map((id) => (
          <div
            key={id}
            className="animate-float-up absolute top-3/4 left-1/2 opacity-0"
            style={{
              animationDelay: "0s",
              left: `${45 + Math.random() * 10}%`,
            }}
          >
            <Heart className="size-6 fill-amber-500/30 text-amber-500/50" />
          </div>
        ))}
      </div>

      {/* Main content card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01] p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          {/* Subtle inner shadow */}
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

          <div className="relative space-y-8">
            {/* Animated icon */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Pulsing ring */}
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
                {/* Main icon container */}
                <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
                  <Zap
                    className="size-10 animate-pulse text-white"
                    fill="white"
                  />
                </div>
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl leading-tight font-bold text-balance text-white sm:text-3xl">
                {`Getting Dad ready${dots}`}
              </h1>
              <p className="text-base text-white/60">
                {`Your ${vibe} AI father is being created`}
              </p>
            </div>

            {/* Progress steps */}
            <div className="space-y-3">
              {steps.map((step) => {
                const stepIndex = steps.indexOf(step);
                const Icon = step.icon;
                const isActive = stepIndex <= currentStep;
                const isComplete = stepIndex < currentStep;

                return (
                  <div
                    key={step.text}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-500 ${
                      isActive
                        ? "border-white/10 bg-white/[0.02]"
                        : "border-white/5 bg-transparent opacity-40"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isComplete
                          ? "bg-amber-500/20"
                          : isActive
                            ? "bg-amber-500/10"
                            : "bg-white/5"
                      }`}
                    >
                      {isComplete ? (
                        <div className="flex size-4 items-center justify-center rounded-full bg-amber-500">
                          <svg
                            className="size-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-label="Completed"
                          >
                            <title>Completed</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <Icon
                          className={`size-4 ${isActive ? `${step.color} animate-pulse` : "text-white/30"}`}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 pt-0.5">
                      <p
                        className={`text-sm leading-relaxed transition-colors ${
                          isActive ? "text-white/90" : "text-white/40"
                        }`}
                      >
                        {step.text}
                      </p>
                    </div>

                    {/* Loading spinner for active step */}
                    {isActive && !isComplete && (
                      <div className="mt-1 size-4 shrink-0 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer text */}
            <div className="space-y-2 text-center">
              <p className="text-sm text-white/50">Almost ready to chat...</p>
              <p className="text-xs text-white/30">
                You'll be redirected to ElizaOS Cloud in a moment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animation for floating hearts */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-300px) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/**
 * Main page component with Suspense boundary
 */
export default function ConnectingPage() {
  return (
    <Suspense fallback={<ConnectingLoading />}>
      <ConnectingContent />
    </Suspense>
  );
}
