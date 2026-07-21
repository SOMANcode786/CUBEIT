import type { Metadata } from "next";
import CubeIQPage from "@/components/cubeiq-page";

export const metadata: Metadata = {
  title: "CubeIQ | Intelligent Digital Growth & Marketing",
  description: "CubeIQ brings your advertising, content, website and customer journey together into one system.",
};

export default function Page() {
  return <CubeIQPage />;
}
