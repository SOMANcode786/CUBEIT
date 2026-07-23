export type GrowthLayer = {
  id: string;
  label: string;
  title: string;
  summary: string;
  services: string[];
  outcome: string;
};

export type Tool = {
  id: string;
  name: string;
  icon: string;
  role: string;
  why: string;
  accent: "blue" | "orange" | "navy";
};

export type MethodStep = {
  number: string;
  title: string;
  description: string;
};

export const growthLayers: GrowthLayer[] = [
  {
    id: "notice",
    label: "01 / Get noticed",
    title: "Create attention that belongs to your business.",
    summary:
      "We sharpen the offer, shape the message and produce creative that gives the right people a reason to stop.",
    services: ["Brand positioning", "Creative direction", "Social content", "Campaign concepts"],
    outcome: "A clearer brand people can recognize, understand and remember.",
  },
  {
    id: "demand",
    label: "02 / Generate demand",
    title: "Put that message in front of people who can become customers.",
    summary:
      "We use search, social and performance campaigns to reach people with the right intent — not just inflate activity.",
    services: ["Meta Ads", "Google Ads", "SEO", "Retargeting", "Lead generation"],
    outcome: "More qualified attention and fewer wasted impressions.",
  },
  {
    id: "convert",
    label: "03 / Turn interest into action",
    title: "Make the next step obvious, fast and convincing.",
    summary:
      "We improve landing pages, websites and offers so visitors know what to do and feel confident doing it.",
    services: ["Landing pages", "Website conversion", "E-commerce optimization", "Offer design"],
    outcome: "More enquiries, purchases and meaningful actions from existing traffic.",
  },
  {
    id: "follow-up",
    label: "04 / Stop losing leads",
    title: "Follow up while interest is still warm.",
    summary:
      "We connect forms, CRM, WhatsApp and automated reminders so good leads do not disappear between teams and tools.",
    services: ["CRM setup", "WhatsApp journeys", "Lead routing", "Email automation"],
    outcome: "Faster responses, clearer ownership and fewer missed opportunities.",
  },
  {
    id: "measure",
    label: "05 / Know what works",
    title: "See the complete journey, not a report full of vanity metrics.",
    summary:
      "We connect campaign data with customer actions so decisions are based on real business movement.",
    services: ["Tracking", "Analytics", "Reporting", "Attribution", "Experiment design"],
    outcome: "Clearer decisions about where to improve, pause or invest more.",
  },
  {
    id: "scale",
    label: "06 / Scale what performs",
    title: "Grow the system only after it proves it can work.",
    summary:
      "We improve creative, targeting, follow-up and conversion together — then increase investment with control.",
    services: ["Optimization", "Retention", "Creative testing", "AI-assisted workflows"],
    outcome: "A repeatable growth system instead of a series of disconnected campaigns.",
  },
];

export const tools: Tool[] = [
  {
    id: "meta",
    name: "Meta",
    icon: "/cubeiq-assets/meta.svg",
    role: "Demand and retargeting",
    why: "Reach new audiences, test messages quickly and bring interested visitors back before they forget.",
    accent: "blue",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "/cubeiq-assets/instagram.svg",
    role: "Attention and trust",
    why: "Turn your brand into something people recognize, follow and feel comfortable buying from.",
    accent: "orange",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "/cubeiq-assets/facebook.svg",
    role: "Audience reach",
    why: "Reach communities, local audiences and high-intent segments with focused offers and useful creative.",
    accent: "blue",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    icon: "/cubeiq-assets/google%20ads.svg",
    role: "Capture existing intent",
    why: "Meet people at the moment they are actively searching for a product, service or solution like yours.",
    accent: "orange",
  },
  {
    id: "search-console",
    name: "Search Console",
    icon: "/cubeiq-assets/googleconsole.svg",
    role: "Search visibility",
    why: "Understand how people discover you through search and where your website can earn more relevant visibility.",
    accent: "navy",
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: "/cubeiq-assets/shopify.svg",
    role: "E-commerce conversion",
    why: "Connect campaigns to a buying experience that is fast, measurable and easier to improve.",
    accent: "navy",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "/cubeiq-assets/whatsapp.svg",
    role: "Fast lead follow-up",
    why: "Respond where customers already communicate and keep enquiries moving without relying on memory.",
    accent: "blue",
  },
];

export const methodSteps: MethodStep[] = [
  {
    number: "01",
    title: "Understand",
    description: "We learn the business, offer, customer, competition, current data and existing tools.",
  },
  {
    number: "02",
    title: "Diagnose",
    description: "We locate wasted spend, weak messages, conversion leaks, tracking gaps and slow follow-up.",
  },
  {
    number: "03",
    title: "Design",
    description: "We build the strategy, creative direction, campaign plan, customer journey and measurement model.",
  },
  {
    number: "04",
    title: "Launch",
    description: "Campaigns, pages, tracking and follow-up systems go live as one connected release.",
  },
  {
    number: "05",
    title: "Learn",
    description: "Real customer behaviour replaces assumptions and gives the team a useful feedback loop.",
  },
  {
    number: "06",
    title: "Improve",
    description: "We refine the message, creative, targeting, conversion experience and lead handling together.",
  },
  {
    number: "07",
    title: "Scale",
    description: "Investment increases when the complete system is stable enough to support it.",
  },
];

export const audienceOptions = [
  {
    id: "traffic",
    label: "We get traffic, not enough enquiries",
    title: "The problem may be after the click.",
    body: "CubeIQ reviews the offer, landing experience, calls-to-action, trust signals and follow-up path before recommending more traffic.",
  },
  {
    id: "ads",
    label: "We spend on ads but cannot explain the result",
    title: "Activity needs a business-level measurement system.",
    body: "We connect campaign decisions to enquiries, purchases and lead quality so the team can see what deserves more investment.",
  },
  {
    id: "manual",
    label: "Our follow-up is manual and inconsistent",
    title: "Good leads should not depend on someone remembering.",
    body: "CubeIQ can connect forms, CRM, WhatsApp and reminders so every enquiry has a clear next action and owner.",
  },
  {
    id: "launch",
    label: "We are preparing to launch",
    title: "Build demand and infrastructure together from day one.",
    body: "CubeIQ shapes the message and acquisition plan while CubeIT can build the pages, systems and integrations that support growth.",
  },
  {
    id: "scale",
    label: "We have traction and need a repeatable system",
    title: "Scaling exposes every weak connection.",
    body: "We identify what is already working, strengthen the conversion and follow-up layers, then create a controlled testing and scaling rhythm.",
  },
];

export const diagnosticQuestions = [
  {
    id: "goal",
    title: "What are you trying to grow?",
    options: ["Qualified leads", "Online sales", "Bookings", "Brand demand"],
  },
  {
    id: "source",
    title: "Where do most opportunities come from today?",
    options: ["Paid ads", "Social media", "Search", "Referrals", "It is unclear"],
  },
  {
    id: "gap",
    title: "Where does the journey break most often?",
    options: ["Not enough attention", "Weak conversion", "Slow follow-up", "Poor measurement", "Disconnected tools"],
  },
  {
    id: "tracking",
    title: "Can you currently trace a campaign to a real customer action?",
    options: ["Yes, clearly", "Partially", "Not reliably", "We do not track it"],
  },
];
