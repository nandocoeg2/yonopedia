import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getToken, verifyToken } from "@/app/lib/auth";

// Define types based on Prisma schema
type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
};

type Cart = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
};

type CartWithProduct = Cart & {
  product: Product;
};

export async function GET(request: Request) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const cartItems = (await prisma.cart.findMany({
      where: {
        userId: payload.id as string,
      },
      include: {
        product: true,
      },
    })) as CartWithProduct[];

    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
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

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if the product is already in the cart
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: payload.id as string,
        productId: productId,
      },
    });

    if (existingCartItem) {
      // If product already exists in cart, increment quantity
      const updatedCartItem = await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: (existingCartItem.quantity || 0) + 1,
        },
      });
      return NextResponse.json(updatedCartItem);
    }

    // Create new cart item
    const newCartItem = await prisma.cart.create({
      data: {
        userId: payload.id as string,
        productId,
        quantity: 1,
      },
    });

    return NextResponse.json(newCartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { pathname } = new URL(request.url);
    const cartId = pathname.split("/").pop();

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cartItem || cartItem.userId !== payload.id) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    await prisma.cart.delete({
      where: {
        id: cartId,
      },
    });

    return NextResponse.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    );
  }
}
