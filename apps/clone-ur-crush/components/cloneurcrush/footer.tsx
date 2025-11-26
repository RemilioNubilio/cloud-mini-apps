import { Section } from "@/components/ui/section";

export default function CloneFooter() {
  return (
    <Section className="border-t border-white/10 bg-black/80 pt-12 pb-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-2xl font-black text-white">
              Clone<span className="text-pink-500">Ur</span>Crush
            </p>
            <p className="mt-1 text-sm font-medium tracking-wider text-white/40 uppercase">
              Just like them but better
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-white/50">
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Ethical Guidelines
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8">
          <p className="text-sm text-white/40">
            CloneUrCrush is a private beta experience. We create AI role-play
            simulations meant for personal reflection and fun. Be kind, keep it
            consensual, and delete anytime.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CloneUrCrush Labs. All rights
            reserved.
          </p>
          <p className="font-medium text-pink-400/60">
            Forbidden Fruit of AI + Romance
          </p>
        </div>
      </div>
    </Section>
  );
}
