"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReceiptText, ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

function MainNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();
  const { cartCount } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check");
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
        setUser(data.decoded);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      const data = await response.json();

      toast.success("Logged out successfully");

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="bg-whtie p-4 border border-b-2 border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-green-500 text-3xl font-bold">
          YonoPedia
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/cart"
                className="flex items-center text-gray-700 hover:text-black transition-colors "
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span
                    className="
                    absolute top-2.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center
                  "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/orders"
                className="flex items-center text-gray-700 hover:text-black transition-colors relative"
              >
                <ReceiptText className="h-5 w-5 mr-1" />
                <span>Orders</span>
              </Link>
              <p className="text-gray-700">{user?.email}</p>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-green-500 hover:text-green-800 transition-colors border border-green-500 px-3 py-1 rounded-md"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div>
        <MainNav />
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex sm:flex-row justify-center items-start sm:items-center gap-4 mb-6">
            {children}
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
