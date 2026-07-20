import type { Metadata } from "next";
import "./globals.css";
import { Nunito_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/loading-screen";

/**
 * Nunito Sans — rounded, premium, variable-weight Google Font.
 * On Apple devices, `ui-rounded` / "SF Pro Rounded" is used directly via CSS;
 * Nunito Sans is the high-quality non-Apple fallback in --font-display / --font-body.
 */
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-rounded",
  display: "swap",
  // Variable font — all weights 200–900 available including intermediate values
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "CubeIT | Intelligent Software for Modern Businesses",
  description: "CubeIT builds AI products, enterprise software, intelligent automation, and scalable digital platforms for modern businesses.",
  icons: {
    icon: [
      { url: "/brand/cubeit-logo.png", type: "image/png" },
    ],
    shortcut: ["/brand/cubeit-logo.png"],
    apple: ["/brand/cubeit-logo.png"],
  },
  openGraph: {
    title: "CubeIT | Intelligent Software for Modern Businesses",
    description: "AI products, enterprise software, intelligent automation, and scalable digital platforms.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("antialiased", nunitoSans.variable)}>
      <body suppressHydrationWarning>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
