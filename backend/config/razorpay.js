import Razorpay from 'razorpay';

// Only initialize Razorpay if credentials are provided and not in demo mode
let razorpay = null;

if (process.env.DEMO_MODE !== 'true' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.log('💰 Razorpay: Running in DEMO MODE - Payments will be simulated');
}

export default razorpay;

