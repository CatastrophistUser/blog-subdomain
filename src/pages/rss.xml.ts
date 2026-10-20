import type { APIRoute } from "astro";
import { getPosts } from "../utils/posts";
import { SITE } from "../config";

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Set `site` in astro.config.mjs; the RSS feed needs absolute URLs.");
  const posts = await getPosts();
  const home = new URL("/", site).href;
  const self = new URL("/rss.xml", site).href;

  const items = posts
    .map((p) => {
      const link = new URL(`/posts/${p.id}/`, site).href;
      return `
    <item>
      <title>${esc(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(p.data.description)}</description>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>${p.data.tags.map((t) => `
      <category>${esc(t)}</category>`).join("")}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.title)}</title>
    <link>${home}</link>
    <description>${esc(SITE.description)}</description>
    <language>${SITE.lang}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${(posts[0]?.data.pubDate ?? new Date()).toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
