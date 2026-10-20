import { defineConfig } from "astro/config";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Pages saved from claude.ai artifacts carry an inert sandbox script. Drop it from built posts.
const stripArtifactRuntime = {
  name: "strip-artifact-runtime",
  hooks: {
    "astro:build:done": ({ dir }) => {
      const postsDir = join(fileURLToPath(dir), "posts");
      if (!existsSync(postsDir)) return;
      for (const slug of readdirSync(postsDir)) {
        const file = join(postsDir, slug, "index.html");
        if (!existsSync(file)) continue;
        const html = readFileSync(file, "utf8");
        const cleaned = html.replace(/<!-- frame-runtime -->[\s\S]*?<!-- \/frame-runtime -->\n?/, "");
        if (cleaned !== html) writeFileSync(file, cleaned);
      }
    },
  },
};

// Posts are standalone files at public/posts/<slug>/index.html. Static hosts serve
// /posts/<slug>/ from that file automatically; the dev server needs this nudge.
const servePostIndex = {
  name: "serve-post-index",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const [path, query = ""] = (req.url ?? "").split("?");
      const m = path.match(/^\/posts\/([^/.]+)(\/?)$/);
      if (m && existsSync(`public/posts/${m[1]}/index.html`)) {
        if (!m[2]) {
          // Keep relative asset links (./cover.png) working, as static hosts do.
          res.writeHead(301, { Location: `/posts/${m[1]}/${query ? `?${query}` : ""}` });
          return res.end();
        }
        req.url = `/posts/${m[1]}/index.html${query ? `?${query}` : ""}`;
      }
      next();
    });
  },
};

export default defineConfig({
  // Absolute URLs in the RSS feed and canonical links are built from this.
  site: "https://blog.pranjalxm.com",
  integrations: [stripArtifactRuntime],
  vite: { plugins: [servePostIndex] },
});
