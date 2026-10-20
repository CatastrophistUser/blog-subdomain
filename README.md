# blog-subdomain

A minimal blog built with plain [Astro](https://astro.build/) and hand-written CSS. **Every post is a standalone `index.html` page**, served exactly as written at its own URL. Astro builds everything around the posts (home page, post list, search, RSS) by reading each post's `<head>` metadata.

## Commands

| Command           | Action                                   |
| ----------------- | ---------------------------------------- |
| `npm install`     | Install dependencies                     |
| `npm run dev`     | Start the dev server at `localhost:4321` |
| `npm run build`   | Build the static site to `./dist/`       |
| `npm run preview` | Preview the production build             |

## Adding a post

1. Create a folder: `public/posts/<slug>/`. The folder name becomes the URL, `/posts/<slug>/`. Use lowercase and hyphens, and don't use a bare number like `2` (the post list's pages use those).
2. Put the page in it as `index.html`. Any HTML page works, including one saved from a claude.ai artifact.

That's it. Images, scripts and CSS for the post can sit in the same folder and be linked relatively (`<img src="./cover.png">`).

```
public/posts/my-new-post/
├── index.html
└── cover.png
```

### How the post is listed

Nothing is required in the HTML; every field falls back:

| Shown as    | Taken from                         | Fallback                           |
| ----------- | ---------------------------------- | ---------------------------------- |
| Title       | `<title>`                          | first `<h1>`, then the folder name |
| Summary     | `<meta name="description">`        | first `<p>`, trimmed to 200 chars  |
| Order       | `<meta name="date" content="YYYY-MM-DD">` (optional, never displayed) | file's last-modified time |

Optional extras:

```html
<meta name="keywords" content="sql, databases" />  <!-- searchable, RSS categories -->
<meta name="draft" content="true" />              <!-- hide from lists; the URL still works -->
```

Posts are listed newest first. Without a date meta tag the order comes from file modification times, which a fresh clone or a CI build can reset; add the date tag to a post if its position matters.

Pages saved from claude.ai artifacts include a sandbox script (`<!-- frame-runtime -->`). The build strips it from the published copy, so you don't need to remove it by hand.

### Matching the blog's look (optional)

Posts are fully standalone, so they can bring their own styling. To match the blog instead, link the shared files, as the template does:

```html
<link rel="stylesheet" href="/assets/theme.css" />  <!-- colour tokens (dark by default) -->
<link rel="stylesheet" href="/assets/post.css" />   <!-- layout and article typography -->
<script src="/assets/theme.js"></script>            <!-- applies the theme, wires [data-theme-toggle] buttons -->
```

Put the article inside `<article class="prose">` to get the blog's typography. The theme choice is shared with the main blog.

## Customising

- **Site title, description, page sizes:** `src/config.ts` (`SITE`)
- **Nav links:** `src/config.ts` (`NAV`). About points to pranjalxm.com
- **Footer links (LinkedIn, GitHub, RSS):** `src/config.ts` (`SOCIALS`)
- **Site URL:** `astro.config.mjs` (`site`, currently `https://blog.pranjalxm.com`). The RSS feed at `/rss.xml` builds its absolute links from it
- **Colours:** `public/assets/theme.css`, shared by the blog pages and the posts

## Structure

```
public/
├── posts/<slug>/index.html   Standalone posts (served as-is)
└── assets/                   theme.css, post.css, theme.js shared with posts
templates/post.html           Starter post (not published)
src/
├── content.config.ts         Loader that reads metadata from public/posts/*/index.html
├── components/               Header, Footer, Card, Datetime, Socials, Pagination
├── layouts/                  Layout (base page)
├── pages/
│   ├── index.astro           Home: recent posts
│   ├── posts/[...page].astro Paginated post list
│   ├── search.astro          Client-side search (no dependencies)
│   ├── 404.astro
│   └── rss.xml.ts            RSS feed
├── styles/global.css
└── utils/posts.ts            Sorting, date formatting
```
