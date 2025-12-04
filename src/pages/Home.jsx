import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    { src: "/court-1.jpg", alt: "Professional Pickleball Court" },
    { src: "/court-2.jpg", alt: "Indoor Climate Control" },
    { src: "/court-3.jpg", alt: "Tournament Ready Facility" },
    { src: "/court-4.jpg", alt: "Premium Equipment" },
  ];

  // Auto-scroll images every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">🏓</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                PicklePlay
              </span>
            </div>
            <button
              onClick={() => navigate("/booking")}
              className="bg-blue-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              Book Now →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image Carousel */}
      <div className="relative h-screen mt-16">
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/50"></div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Elevate Your
                <br />
                <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                  Pickleball Game
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Premium indoor court with real-time booking. No more calls, no
                more waiting. Book your perfect slot in seconds.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/booking")}
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  View Available Slots
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImage
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-blue-200">Happy Players</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Bookings Completed</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <div className="text-blue-200">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Why Players Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of convenience, quality, and
              professional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-900 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  🏓
                </span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                Premium Facility
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Climate-controlled indoor court with professional-grade surface
                and lighting. Perfect conditions, every single time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-900 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  ⚡
                </span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                Instant Booking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time slot availability at your fingertips. No phone calls
                needed. Book in 30 seconds, play in minutes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-900 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  💳
                </span>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                Flexible Payment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pay online via UPI for instant confirmation, or choose to pay at
                the court. Your choice, your convenience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="text-3xl">🏓</div>
              <span className="text-2xl font-bold">PicklePlay</span>
            </div>
            <div className="text-blue-300 text-center md:text-right">
              <p className="mb-1">
                © {new Date().getFullYear()} PicklePlay Court Booking
              </p>
              <p className="text-sm text-blue-400">
                Built with Love by Darren ❤️
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
