import BuildYourDadSection from "@/components/edad/build-your-dad-section";
import EdadFooter from "@/components/edad/footer";
import EdadHero from "@/components/edad/hero";
import { LayoutLines } from "@/components/ui/layout-lines";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#0c0a09] text-white">
      <LayoutLines />
      <EdadHero />

      {/* Character creation form section */}
      <BuildYourDadSection />

      <EdadFooter />
    </main>
  );
}

