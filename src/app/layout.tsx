import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CalorieProvider } from "../context/CalorieContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "Track your calories with AI-powered food analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CalorieProvider>{children}</CalorieProvider>
      </body>
    </html>
  );
}
