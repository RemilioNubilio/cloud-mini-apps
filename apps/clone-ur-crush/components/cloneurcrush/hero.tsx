"use client";

import Image from "next/image";

export default function CloneHero() {
  return (
    <div className="flex w-full flex-col items-start gap-8 lg:w-auto lg:flex-1 lg:justify-center lg:sticky lg:top-24">
      {/* Heading */}
      <div className="space-y-4 lg:space-y-6 xl:space-y-8">
        <h1 className="text-4xl leading-[1.1] font-black text-balance text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
          <span className="relative inline-block bg-pink-500 px-3 py-1 text-white shadow-lg sm:px-4 sm:py-1.5">
            Clone Your Crush
          </span>{" "}
          & Chat Right Away.
        </h1>
      </div>

      {/* Hero Image */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:rounded-3xl lg:max-w-lg xl:max-w-xl">
        <Image
          src="/images/hero.jpg"
          alt="Clone Your Crush"
          width={800}
          height={600}
          className="h-auto w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
