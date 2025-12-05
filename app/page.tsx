import BuildYourCrushSection from "../components/build-your-crush-section";
import CloneHero from "../components/hero";
import { LayoutLines } from "../components/layout-lines";
import { Section } from "../components/section";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#050109] text-white">
      <LayoutLines />
      
      {/* Combined Hero + Build Section */}
      <Section 
        id="build-your-crush"
        className="relative overflow-hidden pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28 xl:pt-32 xl:pb-32"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:gap-12 md:gap-14 lg:flex-row lg:items-start lg:gap-8 xl:gap-12 2xl:gap-16">
          {/* Left: Hero Content */}
          <CloneHero />

          {/* Right: Build Your Crush Form */}
          <BuildYourCrushSection />
        </div>
      </Section>
    </main>
  );
}
