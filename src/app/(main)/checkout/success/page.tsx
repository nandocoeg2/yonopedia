"use client";

import Link from "next/link";
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="min-2xl flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Order Successful!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully
          processed. We'll send you an email with your order details shortly.
        </p>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
