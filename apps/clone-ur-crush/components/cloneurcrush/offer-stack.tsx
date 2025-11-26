import { Check } from "lucide-react";

import { Section } from "@/components/ui/section";

const VALUE_LEVERS = [
  "Dream Outcome: Feel the rush of reciprocation from the person you can't stop thinking about — on demand.",
  "Time Delay: Enter their name. 60 seconds later, your clone is typing.",
  "Effort & Sacrifice: No awkward DMs, no staged run-ins. Just a short form and a tap.",
  "Likelihood of Success: Adaptive memory, mood filters, and scripts fine-tuned on 8M romance story beats.",
];

const OFFER_ITEMS = [
  {
    title: "AI Chat Twin",
    detail: "Tuned to their personality.",
    value: "$79",
  },
  {
    title: "Custom Memory Pack",
    detail: "Pre-loaded meet-cute and shared lore.",
    value: "$59",
  },
  {
    title: "Voice Notes & Heartbeat Reactions",
    detail: "Beta access before anyone else.",
    value: "$49",
  },
  {
    title: "Photo Realistic Reveal",
    detail: "Cinematic responses using your upload.",
    value: "$29",
  },
  {
    title: "Premium Unlocks",
    detail: "Mood filters, emotional sliders, secret safeword.",
    value: "$21",
  },
];

export default function OfferStack() {
  return (
    <Section id="offer" className="bg-black/20">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4">
        <div className="space-y-4 text-left">
          <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
            Hormozi Offer Stack
          </p>
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl">
            Engineered to make{" "}
            <span className="bg-pink-500 px-2 text-white">
              &ldquo;yes&rdquo;
            </span>{" "}
            the only option.
          </h2>
          <p className="max-w-2xl text-lg text-white/60">
            We pull every value lever so curiosity flips into commitment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white">
              4 Value Levers{" "}
              <span className="text-white/50">&#40;Hormozi Style&#41;</span>
            </h3>
            <ul className="space-y-4">
              {VALUE_LEVERS.map((lever) => (
                <li key={lever} className="flex gap-3 text-white/70">
                  <Check className="mt-1 size-5 shrink-0 text-pink-400" />
                  <span className="text-base leading-relaxed">{lever}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">What You Get</h3>
              <p className="text-base text-white/70">
                Total value:{" "}
                <span className="font-bold text-pink-400">$237</span>. Yours
                free today in the limited access beta.
              </p>
            </div>
            <ul className="space-y-4">
              {OFFER_ITEMS.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start justify-between gap-4 rounded-md border border-white/5 bg-white/5 p-4"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-sm text-white/60">{item.detail}</p>
                  </div>
                  <span className="shrink-0 font-bold text-pink-400">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href="#signup"
          className="text-center text-base font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Grab your beta invite →
        </a>
      </div>
    </Section>
  );
}
