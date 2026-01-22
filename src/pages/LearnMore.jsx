import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LearnMore() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="text-3xl">🏓</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                PicklePlay
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-all"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/booking')}
                className="bg-blue-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                Book Now →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white pt-32 pb-20 mt-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About PicklePlay
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Your affordable indoor pickleball court with professional facilities. 
              Quality play shouldn't break the bank!
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-blue-900 mb-8 text-center">
              Our Story
            </h2>
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                PicklePlay was born from a simple belief: everyone should be able to enjoy pickleball 
                without worrying about expensive court fees. We wanted to create an accessible space 
                where players of all levels could come together and play.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We invested in a quality indoor court with professional lighting and all the equipment 
                you need—all while keeping our prices affordable at just ₹200 per hour.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, PicklePlay is a welcoming community where beginners learn, friends compete, 
                and everyone enjoys the game without the premium price tag.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Features */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">
            What We Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Indoor Court</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Play comfortably indoors, protected from weather. Our single court is well-maintained 
                and ready for action year-round.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Professional Lighting</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Bright, even lighting throughout the court ensures perfect visibility for every shot, 
                whether morning or evening.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🎾</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Free Equipment</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We provide quality paddles and balls at no extra cost. Feel free to bring your own 
                equipment if you prefer!
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Affordable Rates</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Just ₹200 per hour—one of the most affordable rates in the city. Quality play 
                shouldn't cost a fortune!
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Easy Online Booking</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Book your slot in seconds through our website. See real-time availability and 
                instant confirmation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Friendly Community</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Join a welcoming community of players. Whether you're a beginner or pro, 
                everyone's welcome here!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-900 mb-4 text-center">
            Simple, Affordable Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            No complicated tiers. Just one great rate for everyone.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white mb-8">
              <div className="text-center">
                <div className="text-6xl font-bold mb-3">₹200</div>
                <div className="text-2xl text-blue-100 mb-4">per hour</div>
                <div className="text-blue-200">
                  Available from 6:00 AM to 10:00 PM daily
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                What's Included in Every Booking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  Full hour of court time
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  Free paddles (or BYOP)
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  Free pickleballs
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  Professional lighting
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  Indoor climate protection
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  On-site support
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-center text-blue-900 font-semibold">
                  💡 Pro Tip: Book multiple slots for extended play sessions!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Book Section */}
      <div className="py-20 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-900 mb-4 text-center">
            How to Book
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Get on the court in just 3 simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Pick Your Time</h3>
              <p className="text-gray-600">
                Browse available slots in real-time. Choose any hour between 6 AM - 10 PM.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Choose Payment</h3>
              <p className="text-gray-600">
                Pay online instantly via UPI/Card or select pay-at-venue option.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Show Up & Play!</h3>
              <p className="text-gray-600">
                Get instant confirmation. Arrive 5 minutes early and we'll have everything ready!
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/booking')}
              className="bg-blue-900 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Book Your Court Now →
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ 1 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                What if I need to cancel my booking?
              </h3>
              <p className="text-gray-600">
                You can cancel up to 2 hours before your slot time for a full refund. 
                Cancellations within 2 hours are non-refundable.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Do you provide equipment?
              </h3>
              <p className="text-gray-600">
                Yes! We provide paddles and pickleballs at no extra charge. You're also welcome 
                to bring your own equipment if you prefer.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                How many people can play at once?
              </h3>
              <p className="text-gray-600">
                Our court accommodates singles (2 players) or doubles (4 players). 
                The rate is ₹200/hour regardless of how many people play.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Is the court suitable for beginners?
              </h3>
              <p className="text-gray-600">
                Absolutely! Our court welcomes players of all skill levels. Whether you're just 
                starting out or a seasoned pro, you'll enjoy playing here.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                What are your operating hours?
              </h3>
              <p className="text-gray-600">
                We're open daily from 6:00 AM to 10:00 PM. You can book any available slot 
                within these hours through our website.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Can I book multiple hours at once?
              </h3>
              <p className="text-gray-600">
                Yes! Simply select multiple consecutive time slots during booking. Perfect for 
                extended practice sessions or tournaments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Have Questions?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            We're here to help! Feel free to reach out.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📧</span>
              <span className="text-lg">info@pickleplay.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📞</span>
              <span className="text-lg">+91 9999 999 999</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📍</span>
              <span className="text-lg">Indoor Court, Your Location</span>
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