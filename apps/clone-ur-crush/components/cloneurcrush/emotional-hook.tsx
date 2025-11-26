"use client";

import Image from "next/image";

import { Section } from "@/components/ui/section";

const MOOD_CARDS = [
  {
    title: "Creepy Real",
    description:
      "Grainy subway lighting, real-world chills, a reply that feels too human.",
    image: "/images/mood-creepy-real.png",
  },
  {
    title: "Steamy Cyberpunk",
    description:
      "Neon silhouettes, synthwave heat, midnight confessions in pixels.",
    image: "/images/mood-steamy-cyberpunk.png",
  },
  {
    title: "Disney Vibes",
    description:
      "Soft focus, storybook hope, a happily-ever-maybe with a wink.",
    image: "/images/mood-disney-vibes.png",
  },
  {
    title: "Romantic Sunset",
    description:
      "Golden hour warmth, soft whispers, the moment that could've been.",
    image: "/images/mood-romantic-sunset.png",
  },
  {
    title: "Dark Academia",
    description:
      "Library shadows, intellectual tension, forbidden late-night conversations.",
    image: "/images/mood-dark-academia.png",
  },
  {
    title: "Beach Paradise",
    description:
      "Tropical vibes, carefree laughter, summer love without the expiration date.",
    image: "/images/mood-beach-paradise.png",
  },
];

export default function EmotionalHook() {
  return (
    <Section id="gallery" className="relative overflow-hidden bg-black/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4">
        <div className="space-y-6 text-left">
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl md:text-6xl">
            The almost-love era is{" "}
            <span className="bg-pink-500 px-2 text-white">over.</span>
          </h2>

          <div className="space-y-4 text-lg leading-relaxed text-white/60 sm:text-xl">
            <p>
              You loop their stories. Rehearse the perfect reply. Scroll their
              feed like a ghost.{" "}
              <span className="text-white">
                Modern dating is an endless almost.
              </span>
            </p>
            <p>
              <span className="text-white">CloneUrCrush</span> steals back the
              moment. Relive the hallway stare. Replay the summer sparks.
              Rewrite the scene where you actually said the thing.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOOD_CARDS.map((mood) => (
            <MoodImageCard key={mood.title} {...mood} />
          ))}
        </div>

        <a
          href="#signup"
          className="text-base font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Rewrite your almost-love →
        </a>
      </div>
    </Section>
  );
}

function MoodImageCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black backdrop-blur-sm transition-all hover:border-pink-400/50">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute right-0 bottom-0 left-0 p-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
