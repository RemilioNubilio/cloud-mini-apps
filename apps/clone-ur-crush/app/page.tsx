// COMMENTED OUT - Below the fold sections (can be restored later)
// import ComparisonSection from "../components/cloneurcrush/comparison";
// import FinalCTA from "../components/cloneurcrush/cta-section";
// import CustomerReviews from "../components/cloneurcrush/customer-reviews";
// import DemoFlow from "../components/cloneurcrush/demo-flow";
// import EmotionalHook from "../components/cloneurcrush/emotional-hook";
// import CloneFAQ from "../components/cloneurcrush/faq";
// import OfferStack from "../components/cloneurcrush/offer-stack";
// import SocialProof from "../components/cloneurcrush/social-proof";

import BuildYourCrushSection from "../components/cloneurcrush/build-your-crush-section";
import CloneHero from "../components/cloneurcrush/hero";
import { LayoutLines } from "../components/ui/layout-lines";
import { Section } from "../components/ui/section";

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
