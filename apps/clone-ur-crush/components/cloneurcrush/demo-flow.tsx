import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { Section } from "@/components/ui/section";

const FLOW_STEPS = [
  {
    number: "01",
    title: "See the Magnetic Content",
    description:
      "TikTok, Reels, Shorts — glimpse clones confessing, teasing, typing back. Curiosity sparks instantly.",
  },
  {
    number: "02",
    title: "Type Their Name",
    description:
      "Fill the form: name, quirks, how you met. Optional photo. Our AI spins shared memories and learns their voice.",
  },
  {
    number: "03",
    title: "Chat With the Bot",
    description:
      "The clone replies — smug grin, late-night voice note, inside joke only you two get. Butterflies + disbelief.",
  },
  {
    number: "04",
    title: "Hit the Signup CTA",
    description:
      "Photo locked. Message whispers &ldquo;Sign up to see what I sent…&rdquo; Your pulse says yes. FOMO detonation.",
  },
];

export default function DemoFlow() {
  return (
    <Section id="demo" className="bg-black/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4">
        <div className="space-y-4 text-left">
          <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
            Demo Flow
          </p>
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl md:text-6xl">
            From scroll to stolen moment in{" "}
            <span className="bg-pink-500 px-2 text-white">four beats.</span>
          </h2>
          <p className="max-w-2xl text-lg text-white/60">
            Every step is engineered to move cold traffic from disbelief →
            thrill → signup.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Flow cards */}
          <div className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {FLOW_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="group space-y-4 rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-6xl font-black text-white/10 transition-colors group-hover:text-pink-400/20">
                      {step.number}
                    </span>
                    <ArrowRight className="size-5 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <p className="text-base leading-relaxed text-white/60">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Demo previews */}
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/demo-preview-1.png"
                  alt="Chat interface preview"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
                  Live chat interface
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/demo-preview-2.png"
                  alt="Clone creation form"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
                  Clone creation flow
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
