import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // Since we don't have real keys, we mock the order creation if keys are not present
    if (!process.env.RAZORPAY_KEY_ID) {
      return NextResponse.json({
        success: true,
        order: {
          id: 'order_mock_' + Math.random().toString(36).substr(2, 9),
          amount: amount * 100, // Amount in paise
          currency: 'INR'
        }
      });
    }

    const dummyRazorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET || '',
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_74394",
    };
    
    const order = await dummyRazorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
