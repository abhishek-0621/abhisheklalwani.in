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
  lead: "I build AI systems that turn scattered knowledge into answers people can check — and trust.",
  body: [
    "At Dassault Systèmes I started on the interface side, building web components for an enterprise engineering platform. Today I lead generative-AI work there: assistants grounded in company knowledge, agents that pause for a human before they act, and MCP integrations that let them work inside real engineering tools.",
    "I hold an M.Tech in Artificial Intelligence & Machine Learning from BITS Pilani. My thesis became GraphMind — give it documents, code, audio or a whole repository and it returns a knowledge graph you can explore, question, and hand to other agents.",
    "Away from the keyboard I read far outside my field — philosophy, psychology, the odd poem. That is where the stray signals on this site come from.",
  ],
  principles: [
    { word: "Grounded", line: "An answer should point to where it came from." },
    { word: "Accountable", line: "An agent should know when to stop and ask." },
    { word: "Measured", line: "If it hasn't been evaluated, it isn't finished." },
    { word: "Quiet", line: "The best interface is the one nobody notices." },
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
    period: "2024 — 2026",
    title: "M.Tech, Artificial Intelligence & Machine Learning",
    org: "BITS Pilani",
    kind: "education",
    points: ["Completed. Thesis: GraphMind, a knowledge-graph retrieval platform."],
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
