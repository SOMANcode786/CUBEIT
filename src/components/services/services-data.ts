export type CubeITService = {
  slug: string;
  title: string;
  shortTitle: string;
  label: string;
  index: string;
  summary: string;
  thesis: string;
  outcome: string;
  images: string[];
  tags: string[];
  capabilities: string[];
  technologies: string[];
  proof: string;
  pose: [number, number, number];
  accent: "blue" | "navy" | "orange";
};

export const cubeitServices: CubeITService[] = [
  {
    slug: "ai-products",
    title: "AI Products",
    shortTitle: "AI",
    label: "AI systems",
    index: "01",
    summary: "Document intelligence, AI agents, predictive analytics, copilots, and automation designed around measurable business work.",
    thesis: "We turn intelligent models into usable products with permissions, context, review paths and business-grade interfaces.",
    outcome: "Teams get faster answers, cleaner operations and AI workflows that stay connected to how work is actually done.",
    images: ["/services/photos/ai-code.png", "/services/photos/ai-team.png", "/services/photos/ai-data.png"],
    tags: ["Agents", "Document AI", "Analytics"],
    capabilities: ["AI agents", "Document intelligence", "Predictive analytics", "Workflow copilots", "Knowledge search"],
    technologies: ["Python", "Next.js", "PostgreSQL", "FastAPI", "Docker"],
    proof: "Useful AI is not a feature pasted on top. It needs product design, secure data flow and operational guardrails.",
    pose: [-0.16, 0.74, 0.02],
    accent: "blue",
  },
  {
    slug: "industry-solutions",
    title: "Industry Solutions",
    shortTitle: "Industry",
    label: "Business platforms",
    index: "02",
    summary: "Secure platforms for legal, healthcare, retail, education, construction, logistics, finance, and growing operations.",
    thesis: "We model the domain first, then build the software around the people, records, approvals and decisions that move the business.",
    outcome: "Complex work becomes easier to see, control and improve without forcing teams into disconnected tools.",
    images: ["/services/photos/industry-clinic.png", "/services/photos/industry-construction.png", "/services/photos/industry-logistics.png"],
    tags: ["Healthcare", "Construction", "Logistics"],
    capabilities: ["Operational platforms", "Role-based portals", "Dashboards", "Secure records", "Industry workflows"],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Cloudflare"],
    proof: "The strongest systems are shaped around the industry they serve, not a generic template.",
    pose: [0.2, 1.58, -0.1],
    accent: "navy",
  },
  {
    slug: "innovative-tools",
    title: "Innovative Tools",
    shortTitle: "Tools",
    label: "Product engineering",
    index: "03",
    summary: "Modern SaaS products, internal dashboards, creator tools, workflow systems, and digital platforms built to scale.",
    thesis: "We design and engineer tools that are fast to use, simple to understand and strong enough to become a long-term product foundation.",
    outcome: "Your team gets software that can launch, learn and keep evolving as the business grows.",
    images: ["/services/photos/tools-design.png", "/services/photos/tools-workflow.png", "/services/photos/tools-software.png"],
    tags: ["SaaS", "Workflows", "Product UX"],
    capabilities: ["SaaS products", "Internal tools", "Workflow systems", "Customer portals", "Product interfaces"],
    technologies: ["Next.js", "React", "Node.js", "Prisma", "Vercel"],
    proof: "Good tools remove friction quietly. They make the right action feel obvious and the system easier to trust.",
    pose: [0.42, 2.34, -0.18],
    accent: "orange",
  },
];

export const servicePrinciples = [
  {
    label: "Model the work",
    title: "We understand the operation before designing the interface.",
    copy: "Every platform starts with the real people, records, decisions and constraints inside the business.",
  },
  {
    label: "Engineer the system",
    title: "Design, code, AI and automation move together.",
    copy: "CubeIT treats the product as one connected system instead of a stack of separate deliverables.",
  },
  {
    label: "Prepare for scale",
    title: "The first version should not block the second.",
    copy: "Architecture, data and workflows are shaped so the product can keep improving after launch.",
  },
];

export const deliveryMatrix = [
  {
    heading: "Discovery",
    items: ["Workflow mapping", "Technical scope", "Role and permission planning", "Risk clarity"],
  },
  {
    heading: "Product",
    items: ["UX systems", "Interface design", "Prototype flows", "Content structure"],
  },
  {
    heading: "Engineering",
    items: ["Full-stack build", "AI and automation", "Integrations", "Data architecture"],
  },
  {
    heading: "Launch",
    items: ["Deployment", "Quality review", "Performance pass", "Handover support"],
  },
];
