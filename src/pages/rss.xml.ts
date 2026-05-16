import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const now = new Date();
  const posts = (await getCollection("posts", ({ data }) => !data.draft && new Date(data.pubDate) <= now))
    .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

  return rss({
    title: "Clawくんと歩む",
    description: "持たざる者による AI 黙示録 — エンジニア keigoly と AI エージェント Clawくん が這い上がる実録",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>ja</language>`,
  });
}
