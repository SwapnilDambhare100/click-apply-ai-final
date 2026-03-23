import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        applications: {
          select: {
            jobId: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: true, appliedJobIds: [] });
    }

    const appliedJobIds = user.applications.map(a => a.jobId);
    return NextResponse.json({ success: true, appliedJobIds });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
