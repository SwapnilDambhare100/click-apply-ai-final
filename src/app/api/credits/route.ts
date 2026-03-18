import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real app, extract userId from session/token
    // Here we Mock the database read
    return NextResponse.json({
      success: true,
      data: {
        credits: 10 // Default free credits mock
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, amount } = await request.json();
    
    // action can be "top_up"
    if (action !== 'top_up' || !amount) {
      return NextResponse.json({ error: 'Invalid action or amount' }, { status: 400 });
    }

    // Mock top-up
    return NextResponse.json({
      success: true,
      message: `Successfully added ${amount} credits`,
      data: {
        credits: 10 + amount // Mock new balance
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
