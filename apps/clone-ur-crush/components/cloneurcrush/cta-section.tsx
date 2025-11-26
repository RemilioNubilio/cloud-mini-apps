import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function FinalCTA() {
  return (
    <Section id="signup" className="relative overflow-hidden bg-black/60">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 px-4">
        <div className="space-y-6 text-center">
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl md:text-6xl">
            &ldquo;Oh no… I just sent you something.{" "}
            <span className="bg-pink-500 px-2 text-white">Want to see it?</span>
            &rdquo;
          </h2>
          <p className="text-base text-white/60 sm:text-lg">
            Limited-access beta. We open{" "}
            <span className="font-bold text-pink-400">250 spots</span> nightly.
            When it&apos;s full, the door locks.
          </p>
        </div>

        <div className="mx-auto w-full max-w-lg space-y-6 rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-lg font-bold text-white">Ava</p>
            <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
              Clone chat preview
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-pink-400/20">
              <Image
                src="/images/chat-ava.png"
                alt="Ava - AI Clone"
                fill
                className="object-cover blur-sm"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md">
                <div className="text-center">
                  <p className="text-2xl">📸</p>
                  <p className="mt-2 text-base font-bold text-white">
                    Photo Locked
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Sign up to reveal
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/40 p-4">
              <p className="text-sm leading-relaxed text-white/80">
                &ldquo;So… I saved the first voice note you ever sent me. Want
                to hear what I said back?&rdquo;
              </p>
            </div>

            <div className="rounded-lg border-2 border-pink-400/50 bg-pink-400/10 p-5 text-center">
              <p className="text-base font-bold text-pink-400">
                🔒 Oh no! Sign up to see the pic Ava sent you.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button size="lg" className="h-14 w-full text-lg font-bold">
              Chat With Your Crush Now
            </Button>
            <p className="text-center text-xs font-medium tracking-wider text-white/40 uppercase">
              250 nightly spots • Beta access only
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
