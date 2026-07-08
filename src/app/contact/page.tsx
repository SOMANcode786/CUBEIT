import type { Metadata } from "next";
import ContactQuest from "@/components/contact-quest";

export const metadata: Metadata = {
  title: "Start a Project | CubeIT",
  description: "Configure your CubeIT project mission and turn it into a clear, ready-to-send product brief.",
};

export default function ContactPage() {
  return <ContactQuest />;
}
