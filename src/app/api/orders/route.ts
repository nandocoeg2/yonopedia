import { NextResponse } from "next/server";
import { decryptToken, getToken } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

type DecodedToken = {
  id: string;
  email: string;
};

export async function GET(request: Request) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await decryptToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await decryptToken(token) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { items, totalAmount } = await request.json();

    // Start a transaction to ensure all operations succeed or fail together
    const order = await prisma.$transaction(async (tx) => {
      // Check if all products have sufficient quantity
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient quantity for product ${product.title}`);
        }
      }

      // Update product quantities
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: decoded.id,
          totalAmount,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              title: item.title,
              image: item.image,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear the user's cart
      await tx.cart.deleteMany({
        where: {
          userId: decoded.id,
        },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
