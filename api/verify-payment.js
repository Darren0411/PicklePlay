import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    // Generate signature for verification
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify signature
    if (generated_signature === razorpay_signature) {
      console.log('✅ Payment verified successfully');
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      console.log('❌ Payment verification failed');
      return res.status(400).json({
        success: false,
        error: 'Invalid signature',
      });
    }

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment',
    });
  }
}