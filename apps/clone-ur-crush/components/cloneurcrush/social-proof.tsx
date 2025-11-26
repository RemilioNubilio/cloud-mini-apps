import { Section } from "@/components/ui/section";

const TESTIMONIALS = [
  {
    quote: "Her AI clone remembered the rooftop night. I couldn't not sign up.",
    author: "Liam R.",
  },
  {
    quote: "Felt like we finally finished the conversation we never started.",
    author: "Priya M.",
  },
  {
    quote:
      "I tried Disney Vibes for my high-school sweetheart. The goodbye I never had.",
    author: "Zoe L.",
  },
];

export default function SocialProof() {
  return (
    <Section className="bg-black/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4">
        <div className="space-y-4 text-left">
          <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
            Social Proof
          </p>
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl">
            Thousands already{" "}
            <span className="bg-pink-500 px-2 text-white">
              cloned their crush.
            </span>
          </h2>
          <p className="max-w-2xl text-lg text-white/60">
            Beta users binge 23 chats per session. Screenshots leak in secret
            group chats. Everyone swears they&apos;re done — they always come
            back.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.author}
              className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="text-base leading-relaxed text-white/80">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="text-sm font-semibold text-white/50">
                — {testimonial.author}
              </p>
            </div>
          ))}
        </div>

        <a
          href="#signup"
          className="text-base font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Join the secret crush club →
        </a>
      </div>
    </Section>
  );
}
