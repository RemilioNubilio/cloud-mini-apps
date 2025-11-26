import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/ui/section";

const FAQ_ITEMS = [
  {
    question: "Is this legal?",
    answer:
      "Totally above board. You're generating creative AI role-play, not impersonating for harm. Think interactive fanfiction starring you.",
  },
  {
    question: "Will they ever know?",
    answer:
      "Only if you show them. Chats are encrypted, names hashed, photos stay local. No public feed, no surprise emails.",
  },
  {
    question: "What about ethics?",
    answer:
      "We built guardrails: no malicious prompts, no NSFW exports, optional consent reminders if you decide to invite them later.",
  },
  {
    question: "Can I delete everything?",
    answer:
      "Yes. One tap nukes every memory, photo, and conversation. Your secret stays your secret.",
  },
  {
    question: "Does the clone get smarter?",
    answer:
      "Absolutely. Every reply you like upgrades the personality pack so it mirrors them more precisely each session.",
  },
];

export default function CloneFAQ() {
  return (
    <Section id="faq" className="bg-black/30">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4">
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
            Safety & Trust
          </p>
          <h2 className="text-4xl leading-tight font-black text-balance text-white sm:text-5xl">
            Questions we get{" "}
            <span className="bg-pink-500 px-2 text-white">
              (and love answering).
            </span>
          </h2>
          <p className="text-base text-white/60 sm:text-lg">
            Playful + seductive + smart. Every boundary respected, every fantasy
            curated.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className="rounded-lg border border-white/10 bg-white/5 px-6 backdrop-blur-sm"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-bold text-white hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-white/70">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <a
          href="#signup"
          className="text-center text-base font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Still curious? Dive in →
        </a>
      </div>
    </Section>
  );
}
