import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection({ currentImage, setCurrentImage, images }) {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen">
      {/* Image Carousel */}
      <div className="absolute inset-0 overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/70" />
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-md border border-white/20 bg-white/10 mb-6">
              <span className="text-white/90 text-sm font-medium tracking-tight">
                Premium Indoor Pickleball Court
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-5 leading-tight">
              Elevate Your
              <br />
              Pickleball Game
            </h1>
            <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-xl">
              Real-time court booking. No phone calls, no waiting.
              Reserve your slot in seconds.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/booking")}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white text-foreground font-medium text-sm hover:bg-white/90 transition-colors"
              >
                View Available Slots
              </button>
              <button
                onClick={() => navigate("/learn-more")}
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-1 rounded-sm transition-all duration-300 ${
              index === currentImage
                ? "w-8 bg-white"
                : "w-3 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}