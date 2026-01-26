import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Allow your Vercel frontend
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://pickle-play-eight.vercel.app',
    'http://localhost:5173', // For local development
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running',
    message: 'PicklePlay Booking API',
    timestamp: new Date().toISOString()
  });
});

// Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    console.log('📝 Creating order:', { amount, currency, receipt });

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: amount, currency, receipt' 
      });
    }

    const options = {
      amount: amount, // Amount in paise (already converted from frontend)
      currency: currency,
      receipt: receipt,
      notes: notes || {},
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Order created successfully:', order.id);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order',
    });
  }
});

// Verify Razorpay Payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log('🔍 Verifying payment:', { razorpay_order_id, razorpay_payment_id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment details',
      });
    }

    // Generate signature for verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      console.log('✅ Payment verified successfully');
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      console.log('❌ Invalid payment signature');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment',
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 API endpoints:`);
  console.log(`   POST /api/create-order`);
  console.log(`   POST /api/verify-payment`);
});