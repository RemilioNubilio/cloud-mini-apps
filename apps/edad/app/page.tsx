import BuildYourDadSection from "@/components/edad/build-your-dad-section";
import EdadFooter from "@/components/edad/footer";
import EdadHero from "@/components/edad/hero";
import EdadNavbar from "@/components/edad/navbar";
import { LayoutLines } from "@/components/ui/layout-lines";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#0c0a09] text-white">
      <LayoutLines />
      <EdadNavbar />
      <EdadHero />

      {/* Character creation form section */}
      <BuildYourDadSection />

      <EdadFooter />
    </main>
  );
}

