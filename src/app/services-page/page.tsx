import type { Metadata } from "next";
import ServicesPage from "@/components/services/ServicesPage";

export const metadata: Metadata = {
  title: "Services | CubeIT",
  description: "CubeIT services across AI products, industry platforms, product engineering, automation, and scalable software systems.",
};

export default function Page() {
  return <ServicesPage />;
}
