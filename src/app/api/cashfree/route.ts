import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, customerPhone, customerEmail, customerName } = await request.json();

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'SANDBOX'; // SANDBOX or PRODUCTION

    // Mock response if API keys are missing (Simulator mode)
    if (!appId || !secretKey) {
      return NextResponse.json({
        success: true,
        payment_session_id: 'mock_session_' + Math.random().toString(36).substring(2, 9),
        order_guid: 'order_' + Date.now(),
        message: 'Mock Mode Active (No Cashfree Credentials Found)'
      });
    }

    const host = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg/orders' : 'https://sandbox.cashfree.com/pg/orders';

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const response = await fetch(host, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: customerName || 'ClickApply User',
          customer_email: customerEmail || 'test@clickapply.ai',
          customer_phone: customerPhone || '9999999999'
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/topup?order_id={order_id}&status={order_status}`
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Order Error:', data);
      return NextResponse.json({ success: false, error: data.message || 'Payment Gateway Error' }, { status: 400 });
    }

    // Success
    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      environment: env === 'PRODUCTION' ? 'production' : 'sandbox'
    });

  } catch (error: any) {
    console.error('Cashfree API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
