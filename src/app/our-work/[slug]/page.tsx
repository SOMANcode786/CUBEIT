import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkDetailPage from "@/components/works/WorkDetailPage";
import { getWorkProject, workProjects } from "@/components/works/work-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return workProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getWorkProject(slug);

  if (!project) {
    return {
      title: "Work Not Found | CubeIT",
    };
  }

  return {
    title: `${project.title} | CubeIT Our Works`,
    description: project.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const project = getWorkProject(slug);

  if (!project) notFound();

  return <WorkDetailPage project={project} />;
}
