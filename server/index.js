const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S11LC2XItobFpH',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'sNKC9KhrOTldJwja1M4uku9k',
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
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
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'sNKC9KhrOTldJwja1M4uku9k')
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
      console.log('Invalid payment signature');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }

  } catch (error) {
    console.error(' Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/create-order`);
  console.log(`   POST http://localhost:${PORT}/api/verify-payment`);
});