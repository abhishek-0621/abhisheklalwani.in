import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const config: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@al/ui", "@al/stray-signals"],
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async headers() {
    return [
      {
        source: "/resume.pdf",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
          // Opens in the browser's viewer; saving from there uses this name too.
          { key: "Content-Disposition", value: 'inline; filename="Abhishek_Lalwani_AI_Engineer.pdf"' },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default createMDX({
  // String form keeps the plugin serialisable for Turbopack.
  options: { remarkPlugins: [["remark-gfm"]] },
})(config);
