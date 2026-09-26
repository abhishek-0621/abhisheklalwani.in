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
  /** selfhosted = live on this site while Abhishek's Mac is online. */
  status: "live" | "selfhosted" | "local" | "archived";
  tags: string[];
  metrics: { value: string; label: string }[];
  repo?: string;
  /** The live app, e.g. /graphmind (served from Abhishek's Mac through src/proxy.ts). */
  demo?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "graphmind",
    title: "GraphMind",
    tagline: "Turn anything into a knowledge graph you can ask questions of.",
    summary:
      "A knowledge-graph platform I built end to end: documents, code, audio, video and whole repositories become queryable graphs, with GraphRAG chat and an MCP server for other agents. In a controlled evaluation it answered more faithfully than vector RAG on every model tested — and its graph-first retrieval cut tokens by 59% without losing faithfulness.",
    year: "2026",
    role: "Architect & sole engineer — M.Tech thesis, BITS Pilani",
    status: "selfhosted",
    tags: ["GraphRAG", "Neo4j", "FastAPI", "Celery", "MCP", "Lit"],
    metrics: [
      { value: "3 / 3", label: "models where GraphRAG beat vector RAG on faithfulness and precision" },
      { value: "0.86", label: "multi-hop faithfulness, vs 0.47 for vector RAG (deepseek-r1)" },
      { value: "−59%", label: "tokens per answer with graph-first retrieval" },
      { value: "0.93", label: "faithfulness kept after the token cut (0.94 before)" },
    ],
    repo: "https://github.com/graphMindv2/graphmind",
    demo: "/graphmind",
    featured: true,
  },
  {
    slug: "stray-signals",
    title: "Stray Signals",
    tagline: "An agent that crawls Substack each week and hides one great essay for every visitor.",
    summary:
      "A local-LLM agent that walks Substack's recommendation graph, judges thousands of essays on philosophy, psychology, critical thinking, money, science and deep space, verifies every quote word-for-word, and adds every essay it accepts to a library that only grows — handed out on this site one catch at a time.",
    year: "2026",
    role: "Design, agent and site integration",
    status: "live",
    tags: ["Agents", "Ollama", "Structured outputs", "Crawling", "launchd"],
    metrics: [
      { value: String(signalMeta.count), label: "essays in the library, and growing" },
      { value: String(signalMeta.publications), label: "publications represented" },
      { value: String(signalMeta.candidatesReviewed), label: "essays judged so far" },
      { value: "0", label: "repeats per visitor until the list runs out" },
    ],
    repo: "https://github.com/abhishek-0621/abhisheklalwani.in/tree/main/agents/stray-signals",
    featured: true,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
