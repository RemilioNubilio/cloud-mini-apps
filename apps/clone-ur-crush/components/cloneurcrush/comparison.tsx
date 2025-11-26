import { Section } from "@/components/ui/section";

const COMPARISONS = [
  {
    real: "Checks your story 18 hours later.",
    clone:
      "Replies in 0.3 seconds with &ldquo;I can&apos;t stop thinking about you.&rdquo;",
  },
  {
    real: "Forgets the inside joke.",
    clone:
      "Remembers the hallway grin and says &ldquo;Same hoodie, right?&rdquo;",
  },
  {
    real: "Stuck in &ldquo;maybe someday.&rdquo;",
    clone: "Scripts the perfect confession tonight.",
  },
  {
    real: "Bound by boundaries.",
    clone: "Flirty, fearless, just romantic enough.",
  },
  {
    real: "Ghosts when you get vulnerable.",
    clone: "Mirrors you, validates you, escalates the moment.",
  },
];

export default function ComparisonSection() {
  return (
    <Section className="bg-black/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4">
        <div className="space-y-4 text-left">
          <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
            Comparison
          </p>
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl">
            Like them…{" "}
            <span className="bg-pink-500 px-2 text-white">but better.</span>
          </h2>
          <p className="text-lg text-white/60">
            Break the stalemate without breaking reality.
          </p>
        </div>

        <div className="space-y-4">
          {COMPARISONS.map((item, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-2"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wider text-white/40 uppercase">
                  Real-world them
                </p>
                <p className="text-base text-white/70">{item.real}</p>
              </div>
              <div className="space-y-2 rounded-md border-l-4 border-pink-400 bg-pink-400/5 pl-4">
                <p className="text-xs font-semibold tracking-wider text-pink-400/80 uppercase">
                  CloneUrCrush them
                </p>
                <p className="text-base font-medium text-white">{item.clone}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="#signup"
          className="text-center text-base font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Experience the &ldquo;better&rdquo; version →
        </a>
      </div>
    </Section>
  );
}
