"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Package,
  Award,
  Clock,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useCart } from "@/app/contexts/CartContext";

type Product = {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  quantity: number;
};

export default function ProductPage() {
  const { product: productId } = useParams();
  const [product, setProduct] = useState<Product>();
  const [isLoading, setIsLoading] = useState(false);
  const { updateCartCount } = useCart();
  const router = useRouter();

  const addToCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
      toast.success("Product added to cart!");
      await updateCartCount();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/product?id=${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="flex items-center text-gray-600 hover:text-gray-900 hover:font-medium mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/2">
            <img
              src={product?.image || "https://via.placeholder.com/500"}
              alt={product?.title || "Product Image"}
              className="h-full w-full object-cover md:h-[500px]"
            />
          </div>

          <div className="p-8 md:w-1/2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product?.title || "Product Title"}
                </h1>
              </div>
              <div className="flex items-center text-gray-700">
                <Banknote className="h-6 w-6 mr-1 text-gray-400" />
                <span className="text-2xl font-bold text-green-600">
                  ${product?.price}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-600">
                  {product?.description || "No description available."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                  <span className="text-sm text-gray-600">
                    Stock {product?.quantity || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                  <span className="text-sm text-gray-600">
                    Certified Product
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                  <span className="text-sm text-gray-600">Fast Delivery</span>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  className="flex-1 flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300"
                  onClick={addToCart}
                  disabled={isLoading}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isLoading ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
