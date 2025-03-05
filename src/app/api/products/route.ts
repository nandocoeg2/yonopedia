import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({});

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "An error occurred fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { search } = await request.json();
  const product = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } }
      ]
    }
  });

  return NextResponse.json({ product });
}