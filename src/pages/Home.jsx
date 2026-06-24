import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import FeaturesSection from "@/components/home/FeaturesSection";

const images = [
  { src: "/court-1.jpg", alt: "Professional Pickleball Court" },
  { src: "/court-2.jpg", alt: "Indoor Climate Control" },
  { src: "/court-3.jpg", alt: "Tournament Ready Facility" },
  { src: "/court-4.jpg", alt: "Premium Equipment" },
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          images={images}
        />
        <StatsBar />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}