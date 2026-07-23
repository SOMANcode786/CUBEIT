import type { Metadata } from "next";
import WorksPage from "@/components/works/WorksPage";

export const metadata: Metadata = {
  title: "Our Works | CubeIT",
  description: "Explore CubeIT product concepts and client deliveries in an interactive WebGL portfolio gallery.",
};

export default function Page() {
  return <WorksPage />;
}
