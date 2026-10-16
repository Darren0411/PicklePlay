import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LearnMoreHero from "@/components/learnmore/LearnMoreHero";
import OurStory from "@/components/learnmore/OurStory";
import FacilityFeatures from "@/components/learnmore/FacilityFeatures";
import PricingSection from "@/components/learnmore/PricingSection";
import HowToBook from "@/components/learnmore/HowToBook";
import FAQSection from "@/components/learnmore/FAQSection";
import ContactSection from "@/components/learnmore/ContactSection";

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <LearnMoreHero />
        <OurStory />
        <FacilityFeatures />
        <PricingSection />
        <HowToBook />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}