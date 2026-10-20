import { defineCollection, z } from "astro:content";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// Each post is a standalone page at public/posts/<slug>/index.html, served as-is.
// This loader only reads its metadata to build the home page, post list, search and RSS.
const POSTS_DIR = resolve("public/posts");

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

function meta(html: string, key: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const name = tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1];
    if (name?.toLowerCase() === key) return decode(tag.match(/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i)?.slice(1).find((v) => v !== undefined) ?? "");
  }
}

const text = (fragment?: string) => (fragment ? decode(fragment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")) : "");

const truncate = (s: string, max = 200) => (s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s);

// Every field has a fallback, so a bare HTML page works as a post.
function readPost(slug: string) {
  const file = join(POSTS_DIR, slug, "index.html");
  const html = readFileSync(file, "utf8");
  const body = html.slice(html.search(/<body[\s>]/i) + 1 || 0).replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  const keywords = meta(html, "keywords");
  const date = new Date(meta(html, "date") ?? "");
  return {
    title: text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]) || text(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]) || slug,
    description: meta(html, "description") || truncate(text(body.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1])),
    // Only used for ordering and RSS; never displayed. Falls back to the file's last-modified time.
    pubDate: isNaN(date.valueOf()) ? statSync(file).mtime : date,
    tags: keywords ? keywords.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    draft: meta(html, "draft") === "true",
  };
}

const blog = defineCollection({
  loader: {
    name: "html-posts",
    load: async ({ store, parseData, logger, watcher }) => {
      const sync = async () => {
        store.clear();
        if (!existsSync(POSTS_DIR)) return;
        for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
          if (!entry.isDirectory() || !existsSync(join(POSTS_DIR, entry.name, "index.html"))) continue;
          try {
            const data = await parseData({ id: entry.name, data: readPost(entry.name) });
            store.set({ id: entry.name, data });
          } catch (err) {
            logger.error(`posts/${entry.name}/index.html: ${(err as Error).message}`);
          }
        }
      };
      await sync();

      watcher?.add(POSTS_DIR);
      const onChange = (file: string) => {
        if (resolve(file).startsWith(POSTS_DIR) && file.endsWith(".html")) sync();
      };
      watcher?.on("add", onChange).on("change", onChange).on("unlink", onChange);
    },
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
