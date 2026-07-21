import type { Metadata } from "next";
import CubeIQPage from "@/components/cubeiq-page";

export const metadata: Metadata = {
  title: "CubeIQ | Digital Growth System by CubeIT",
  description:
    "CubeIQ helps businesses get discovered, convert more customers and keep growing. Performance advertising, social media, SEO, creative design and intelligent automation — backed by CubeIT's technology.",
  openGraph: {
    title: "CubeIQ | Digital Growth System by CubeIT",
    description:
      "CubeIQ brings your advertising, content, website and customer journey together so more people discover your business, trust it — and become customers.",
    type: "website",
  },
};

export default function CubeIQRoute() {
  return <CubeIQPage />;
}
