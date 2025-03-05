"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banknote, Loader, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "@/app/contexts/CartContext";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const router = useRouter();
  const { updateCartCount } = useCart();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products?search=${searchQuery}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search: searchQuery }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setProducts(data.product);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    setIsAddingToCart(productId);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to add to cart");
      }

      await updateCartCount(); // Update cart count after adding item
      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsAddingToCart(null);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Our Products</h1>
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-3/4 mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:drop-shadow-lg transition-shadow"
          >
            <Link href={`/product/${product.id}`}>
              <Image
                src={product.image}
                alt={product.title}
                width={300}
                height={200}
                className="w-full h-48 object-contain rounded-t-lg"
              />
            </Link>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {product.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <div className="flex items-center text-gray-700">
                    <Banknote className="w-4 h-4 mr-2" />
                    <span className="text-lg font-semibold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-2">
                <Link
                  href={`/product/${product.id}`}
                  className="flex-1 bg-gray-200 text-gray-700 text-center py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={isAddingToCart === product.id}
                  className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors disabled:bg-green-300"
                >
                  {isAddingToCart === product.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <Loader className="w-4 h-4 animate-spin" />
          <p>Loading...</p>
        </div>
      )}
      {!isLoading && products.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <p className="text-center">No products found</p>
        </div>
      )}
    </div>
  );
}
