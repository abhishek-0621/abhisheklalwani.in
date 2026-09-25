import signalMeta from "./signals-meta.json";

/**
 * Project registry. To add a project:
 *   1. append an entry here
 *   2. create src/content/work/<slug>.mdx for the case study
 * Cards, /work, /work/<slug>, the sitemap and OG metadata all derive from this list.
 */
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  year: string;
  role: string;
  status: "live" | "local" | "archived";
  tags: string[];
  metrics: { value: string; label: string }[];
  repo?: string;
  /** Live app — lives on its own subdomain, e.g. https://graphmind.abhisheklalwani.in */
  demo?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "graphmind",
    title: "GraphMind",
    tagline: "Turn anything into a knowledge graph you can ask questions of.",
    summary:
      "A multimodal knowledge-graph platform: documents, code, audio, video and whole repositories become queryable Neo4j graphs, with GraphRAG chat and an MCP server so other agents can use them.",
    year: "2026",
    role: "Architect & sole engineer — M.Tech project, BITS Pilani",
    status: "local",
    tags: ["GraphRAG", "Neo4j", "FastAPI", "Celery", "MCP", "Lit"],
    metrics: [
      { value: "2.4×", label: "lower token cost, graph-first mode" },
      { value: "330+", label: "commits" },
      { value: "110+", label: "tests" },
      { value: "3", label: "LLMs benchmarked on 35 questions" },
    ],
    repo: "https://github.com/graphMindv2/graphmind",
    featured: true,
  },
  {
    slug: "stray-signals",
    title: "Stray Signals",
    tagline: "An agent that crawls Substack each week and hides one great essay for every visitor.",
    summary:
      "A local-LLM agent that walks Substack's recommendation graph, judges thousands of essays on philosophy, money, science and deep space, verifies every quote word-for-word, and publishes a rotation of up to 500 that this site hands out one visitor at a time.",
    year: "2026",
    role: "Design, agent and site integration",
    status: "live",
    tags: ["Agents", "Ollama", "Structured outputs", "Crawling", "Redis", "launchd"],
    metrics: [
      { value: String(signalMeta.count), label: "essays in this week's rotation" },
      { value: String(signalMeta.publications), label: "publications represented" },
      { value: String(signalMeta.candidatesReviewed), label: "essays judged so far" },
      { value: "0", label: "repeats before the list runs out" },
    ],
    // Add `repo` once github.com/abhishek-0621/abhisheklalwani.in is public.
    featured: true,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
