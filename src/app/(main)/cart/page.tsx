"use client";

import { useEffect, useState } from "react";
import { Trash2, ArrowLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "@/app/contexts/CartContext";

type CartItem = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  const { updateCartCount } = useCart();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`/api/cart`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        setCartItems(data.cartItems || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Create order with cart items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price || 0,
        title: item.product?.title || "",
        image: item.product?.image || "",
      }));

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: totalPrice,
        }),
        credentials: "include",
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      await updateCartCount(); // Update cart count after clearing
      toast.success("Order placed successfully!");
      router.push("/checkout/success");
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to process checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(cartId);
      return;
    }

    setIsUpdating(cartId);
    try {
      const response = await fetch(`/api/cart/${cartId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartId, quantity: newQuantity }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      setCartItems(
        cartItems.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
      await updateCartCount(); // Update cart count after quantity change
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(null);
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      const response = await fetch(`/api/cart/${cartId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove item");
      }

      setCartItems(cartItems.filter((item) => item.id !== cartId));
      await updateCartCount(); // Update cart count after removal
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="w-3/4 px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Shopping
      </Link>

      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
        </div>
      ) : (
        <div className="w-3/4 mx-auto bg-white rounded-lg shadow">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-6 border-b border-gray-200 last:border-0"
            >
              <img
                src={item.product?.image || "https://via.placeholder.com/150"}
                alt={item.product?.title || "Product"}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1 ml-6">
                <h3 className="text-lg font-medium">
                  {item.product?.title || "Product Name"}
                </h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      disabled={isUpdating === item.id}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      disabled={isUpdating === item.id}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-lg font-bold mt-2">
                  ${(item.product?.price || 0).toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Subtotal: $
                  {((item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-600 p-2"
                aria-label="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
