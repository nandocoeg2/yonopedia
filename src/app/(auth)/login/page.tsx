"use client";

import { Info, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loginFormSchema = z.object({
      email: z.string().email("Invalid email address").min(5),
      password: z.string().min(6),
    });

    try {
      setErrors({});
      setIsSubmitting(true);
      const result = loginFormSchema.safeParse({
        email,
        password,
      });

      if (!result.success) {
        const formattedErrors = result.error.errors.reduce((acc, curr) => {
          if (curr.path) {
            acc[curr.path[0]] = curr.message;
          }
          return acc;
        }, {} as Record<string, string>);

        setErrors(formattedErrors);
        return;
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to login");
      }

      toast.success("Logged in successfully");
      router.push("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          if (curr.path) {
            acc[curr.path[0]] = curr.message;
          }
          return acc;
        }, {} as Record<string, string>);

        setErrors(errors);
      }
      if (error instanceof Error) {
        setErrors({ form: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Please sign in to your account</p>
        </div>

        <div className="my-4">
          {errors.form && (
            <div className="p-4 bg-red-100 text-red-600 rounded-lg">
              {errors.form}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 py-2 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-700 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter your email"
                required
              />
            </div>
            {errors.email && (
              <div className="mt-2 flex items-center space-x-2">
                <Info className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">{errors.email}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 py-2 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-700 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter your password"
                required
              />
            </div>
            {errors.password && (
              <div className="mt-2 flex items-center space-x-2">
                <Info className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">{errors.password}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Sign in
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
