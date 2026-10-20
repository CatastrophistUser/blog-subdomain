export const SITE = {
  title: "Blogs",
  author: "Pranjal",
  description: "Writing by Pranjal on design, development and all things tech.",
  lang: "en",
  postsPerPage: 6,
  homePosts: 10,
};

export const NAV = [
  { href: "/posts/", label: "Posts" },
  { href: "https://pranjalxm.com", label: "About" },
];

export type SocialName = "github" | "linkedin" | "rss";

export const SOCIALS: { name: SocialName; href: string; title: string }[] = [
  { name: "linkedin", href: "https://www.linkedin.com/in/pranjal-m-673b64228/", title: "LinkedIn" },
  { name: "github", href: "https://github.com/CatastrophistUser", title: "GitHub" },
  { name: "rss", href: "/rss.xml", title: "RSS Feed" },
];
