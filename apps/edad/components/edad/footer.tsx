import { Section } from "@/components/ui/section";

export default function EdadFooter() {
  return (
    <Section className="border-t border-white/10 bg-black/80 pt-12 pb-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-2xl font-black text-white">
              e<span className="text-amber-500">Dad</span>
            </p>
            <p className="mt-1 text-sm font-medium tracking-wider text-white/40 uppercase">
              The dad you never had
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
              Support
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8">
          <p className="text-sm text-white/40">
            eDad is an AI companion experience designed to provide supportive,
            fatherly conversations. Our AI is here to listen, advise, and
            encourage—not replace real human connections.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} eDad AI. All rights reserved.</p>
          <p className="font-medium text-amber-400/60">
            Everyone deserves a father figure 💛
          </p>
        </div>
      </div>
    </Section>
  );
}

