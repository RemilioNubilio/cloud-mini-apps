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
import CloneFooter from "../components/cloneurcrush/footer";
import CloneHero from "../components/cloneurcrush/hero";
import CloneNavbar from "../components/cloneurcrush/navbar";
import { LayoutLines } from "../components/ui/layout-lines";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#050109] text-white">
      <LayoutLines />
      <CloneNavbar />
      <CloneHero />

      {/* NEW: Character creation form section */}
      <BuildYourCrushSection />

      {/* COMMENTED OUT - Below the fold sections (founder feedback: "everything below the fold should be deleted") */}
      {/* <EmotionalHook /> */}
      {/* <CustomerReviews /> */}
      {/* <DemoFlow /> */}
      {/* <SocialProof /> */}
      {/* <OfferStack /> */}
      {/* <ComparisonSection /> */}
      {/* <FinalCTA /> */}
      {/* <CloneFAQ /> */}

      <CloneFooter />
    </main>
  );
}
