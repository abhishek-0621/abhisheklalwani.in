const email = "abhisheklalwani2009@gmail.com";
const whatsappNumber = "917020688599"; // country code + number, no "+" (wa.me format)
const mailSubject = "Hello from abhisheklalwani.in";
const whatsappText = "Hi Abhishek, I came across your portfolio at abhisheklalwani.in and would like to connect.";

export const site = {
  name: "Abhishek Lalwani",
  url: "https://abhisheklalwani.in",
  role: "AI Engineer",
  location: "Pune, India",
  email,
  description:
    "AI engineer building knowledge-graph retrieval, agentic workflows and production LLM systems. Senior Software Engineer at Dassault Systèmes.",
  links: {
    github: "https://github.com/abhishek-0621",
    linkedin: "https://www.linkedin.com/in/abhishek-lalwani/",
    whatsapp: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`,
    /** Desktop: Gmail web compose. Touch devices: mailto, which opens the Gmail / Mail app. */
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(mailSubject)}`,
    mailto: `mailto:${email}?subject=${encodeURIComponent(mailSubject)}`,
    resume: "/resume.pdf",
  },
} as const;

export const about = {
  lead: "I turn scattered knowledge into systems you can ask questions of — and trust the answers you get back.",
  body: [
    "For four years at Dassault Systèmes I have worked on both halves of that problem. First the interface: fast, well-tested web components for an enterprise platform used by more than 2,000 people. Now the intelligence: LLM assistants, tool-calling agents that pause for a human before they act, and MCP integrations that let those agents work inside real engineering software.",
    "Outside work I am finishing an M.Tech in AI & ML at BITS Pilani, where I built GraphMind — hand it documents, code, audio or an entire repository and it gives back a knowledge graph you can explore, query, and pass to other agents. The parts I enjoy most are the unglamorous ones: evaluation, latency, and being able to explain why a model said what it said.",
  ],
  stats: [
    { value: "4+", label: "Years shipping production software" },
    { value: "60%", label: "Faster document retrieval from a production RAG pipeline" },
    { value: "1,000+", label: "Users on LLM chatbot workflows" },
    { value: "2.4×", label: "Lower token cost with graph-first retrieval" },
  ],
  stack: [
    "LangGraph", "MCP", "RAG", "Knowledge Graphs", "Neo4j", "FAISS", "FastAPI",
    "Celery", "Redis", "Ollama", "PyTorch", "TypeScript", "Lit", "Redux",
  ],
} as const;

export type ExperienceNode = {
  period: string;
  title: string;
  org: string;
  kind: "role" | "education";
  points: string[];
};

export const experience: ExperienceNode[] = [
  {
    period: "Apr 2025 — Now",
    title: "AI/ML Engineer — Generative AI & Agentic Systems",
    org: "Dassault Systèmes",
    kind: "role",
    points: [
      "Designing enterprise retrieval with FAISS, embeddings and semantic search.",
      "Running GPT-4, Llama and Mistral assistants through LangChain workflows.",
      "Orchestrating tool-calling sequences with human-in-the-loop checkpoints.",
      "Automating end-user query flows, saving 5–10 hours a week per team.",
    ],
  },
  {
    period: "Jul 2022 — Mar 2025",
    title: "Senior Software Engineer — Web Components & Platform",
    org: "Dassault Systèmes",
    kind: "role",
    points: [
      "Built high-performance web components with Lit, Polymer and TypeScript.",
      "Moved legacy architecture to Redux + TypeScript; customer adoption grew 2–3×.",
      "Profiled rendering pipelines and cut load time by 50–75%.",
      "Supported a platform serving 300+ customers and 2,000+ users.",
    ],
  },
  {
    period: "2024 — Sep 2026",
    title: "M.Tech, Artificial Intelligence & Machine Learning",
    org: "BITS Pilani",
    kind: "education",
    points: ["Thesis project: GraphMind, a knowledge-graph retrieval platform."],
  },
  {
    period: "2022",
    title: "B.Tech, Information Technology",
    org: "Savitribai Phule Pune University",
    kind: "education",
    points: ["Final-year research on NGO revenue forecasting, published in IJCA."],
  },
];

export const awards = [
  { year: "H1 2026", name: "Applause Award", note: "Performance Study Migration & MCP Tools" },
  { year: "2024", name: "Applause Annual Award", note: "Inclusive Simulation Process Automation" },
  { year: "H2 2023", name: "Genius Award", note: "Individual excellence" },
  { year: "2020", name: "Smart India Hackathon", note: "Finalist — AI career recommender" },
] as const;
