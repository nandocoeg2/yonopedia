import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { decryptToken, getToken } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    const token = await getToken();
  
    if (!token) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }
    const decoded = await decryptToken(token);

    const cartItems = await prisma.cart.findMany({
      where: {
        userId: decoded.id as string
      }
    });

    return NextResponse.json({ count: cartItems.length });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return NextResponse.json({ error: 'Failed to fetch cart count' }, { status: 500 });
  }
} 