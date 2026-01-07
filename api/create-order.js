import Razorpay from 'razorpay';

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
    const { amount, currency, receipt, notes } = req.body;

    // Validate required fields
    if (!amount || !currency || !receipt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order
    const options = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: receipt,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    console.log('✅ Order created:', order.id);

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
}