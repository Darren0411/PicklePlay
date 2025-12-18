# 🎾 PicklePlay - Pickleball Court Booking System

A modern, responsive web application for booking pickleball courts with real-time availability, Google authentication, and email confirmations.

## ✨ Features

- 🎾 Real-time slot availability
- 🔐 Google Sign-In authentication
- 📧 Email confirmations via EmailJS
- 💳 Multiple payment options (Pay at Venue / Online)
- 📱 Fully responsive design
- 🔥 Firebase backend (Firestore + Auth)
- ⚡ Built with React + Vite

## 🚀 Tech Stack

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Firebase (Firestore, Authentication)
- **Email:** EmailJS
- **Hosting:** Vercel / Netlify (ready to deploy)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pickleplay-booking.git
   cd pickleplay-booking
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```env
   # Firebase
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # EmailJS
   VITE_EMAILJS_SERVICE_ID=service_xxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:5173
   ```

## 🔐 Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** → Google Sign-In
3. Create **Firestore Database** (test mode)
4. Add your Firebase config to `.env`

## 📧 EmailJS Setup

1. Create account at https://emailjs.com
2. Connect Gmail service
3. Create email template with variables:
   - `{{customerName}}`
   - `{{to_email}}`
   - `{{bookingId}}`
   - `{{formattedDate}}`
   - `{{slotTimes}}`
   - `{{totalPrice}}`
   - `{{paymentMethod}}`
4. Add credentials to `.env`

## 📁 Project Structure

```
Pickleball_bookings/
├── src/
│   ├── components/
│   │   ├── BookingCalendar.jsx
│   │   ├── CustomerDetailsModal.jsx
│   │   ├── PaymentModal.jsx
│   │   └── SuccessModal.jsx
│   ├── services/
│   │   └── emailService.js
│   ├── firebase.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🎯 Features Roadmap

- [x] Google Sign-In
- [x] Real-time slot booking
- [x] Email confirmations
- [x] Payment options
- [ ] Admin dashboard
- [ ] Booking history
- [ ] GitHub Actions for slot generation
- [ ] Online payment integration (Razorpay/Stripe)

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License

## 👨‍💻 Author

Darren D'Sa

## 🙏 Acknowledgments

- Firebase for backend services
- EmailJS for email delivery
- Tailwind CSS for styling