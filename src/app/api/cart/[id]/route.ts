import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { decryptToken, getToken } from "@/app/lib/auth";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await decryptToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const cartId = context.params.id;
    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    // Delete the cart item
    await prisma.cart.delete({
      where: {
        id: cartId,
        userId: decoded.id as string,
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

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await decryptToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const cartId = context.params.id;
    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    const { quantity } = await request.json();
    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity provided" },
        { status: 400 }
      );
    }

    // Update the cart item quantity
    const updatedCart = await prisma.cart.update({
      where: {
        id: cartId,
        userId: decoded.id as string,
      },
      data: {
        quantity,
      },
    });

    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}
