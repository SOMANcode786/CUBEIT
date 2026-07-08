import type { Metadata } from "next";
import "./globals.css";
import { Geist, Syne } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "CubeIT | Intelligent Software for Modern Businesses",
  description: "CubeIT builds AI products, enterprise software, intelligent automation, and scalable digital platforms for modern businesses.",
  openGraph: {
    title: "CubeIT | Intelligent Software for Modern Businesses",
    description: "AI products, enterprise software, intelligent automation, and scalable digital platforms.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("antialiased", geist.variable, syne.variable)}>
      <body>{children}</body>
    </html>
  );
}
