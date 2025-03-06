import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "YonoPedia - Belanja Online Mudah dan Aman",
  description: "Belanja online dengan mudah dan aman di YonoPedia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
