import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // Fallback to session or developer email for dev sync
    let userEmail = email;
    if (!userEmail) {
      const session = await getServerSession() as any;
      userEmail = session?.user?.email || 'swapnildambhare100@gmail.com';
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail ?? undefined },
      select: {
        autoApplyEnabled: true,
        autoApplyKeywords: true,
        emailNotifications: true,
        maxApplicationsPerDay: true,
        minMatchScore: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, settings: user });
  } catch (error: any) {
    console.error('Settings Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, autoApplyEnabled, autoApplyKeywords, emailNotifications, maxApplicationsPerDay, minMatchScore } = await request.json();

    const session = await getServerSession() as any;
    const userEmail = email || session?.user?.email || 'swapnildambhare100@gmail.com';

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        autoApplyEnabled: !!autoApplyEnabled,
        autoApplyKeywords: autoApplyKeywords || "",
        emailNotifications: !!emailNotifications,
        maxApplicationsPerDay: Number(maxApplicationsPerDay) || 20,
        minMatchScore: Number(minMatchScore) || 70,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: updatedUser
    });

  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error.message 
    }, { status: 500 });
  }
}
