import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { readFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { SITE_ROLE, SITE_TITLE } from "../../config";

export const prerender = true;

const cardWidth = 1200;
const cardHeight = 630;
const colors = {
  page: "#000f18",
  terminal: "#001b2b",
  chrome: "#032033",
  line: "#12455e",
  pink: "#ff5c8a",
  text: "#e6edf3",
};

export const getStaticPaths = (async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const postCards = posts.map((post) => ({
    params: { slug: post.id },
    props: { headline: post.data.title, windowPath: "~/blog", command: `cat ${post.id}.md` },
  }));
  const defaultCard = {
    params: { slug: "default" },
    props: { headline: `${SITE_TITLE}, ${SITE_ROLE}`, windowPath: "~", command: "whoami" },
  };
  return [...postCards, defaultCard];
}) satisfies GetStaticPaths;

type CardProps = { headline: string; windowPath: string; command: string };

const element = (type: string, style: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const buildCard = ({ headline, windowPath, command }: CardProps) =>
  element(
    "div",
    {
      width: cardWidth,
      height: cardHeight,
      boxSizing: "border-box",
      display: "flex",
      padding: 48,
      background: colors.page,
      color: colors.text,
      fontFamily: "CommitMono",
    },
    element(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: colors.terminal,
        border: `2px solid ${colors.line}`,
      },
      element(
        "div",
        {
          display: "flex",
          alignItems: "center",
          padding: "16px 28px",
          fontSize: 24,
          background: colors.chrome,
          borderBottom: `2px solid ${colors.line}`,
        },
        element("span", { color: colors.pink, fontWeight: 700, marginRight: 18 }, ">_"),
        element("span", { opacity: 0.6 }, `john@site: ${windowPath}`),
      ),
      element(
        "div",
        { display: "flex", flexDirection: "column", flex: 1, padding: "40px 56px 44px" },
        element(
          "div",
          { display: "flex", fontSize: 26, opacity: 0.6 },
          element("span", { color: colors.pink, marginRight: 14 }, "$"),
          command,
        ),
        element(
          "div",
          {
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontSize: headline.length > 48 ? 58 : 70,
            fontWeight: 700,
            lineHeight: 1.12,
          },
          headline,
        ),
        element(
          "div",
          { display: "flex", alignItems: "center", fontSize: 26, color: colors.pink },
          "johncwaters.com",
          element("span", { width: 15, height: 28, marginLeft: 8, background: colors.pink }, ""),
        ),
      ),
    ),
  );

export const GET: APIRoute = async ({ props }) => {
  const [regularFont, boldFont] = await Promise.all([
    readFile("src/assets/og-fonts/CommitMono-400.otf"),
    readFile("src/assets/og-fonts/CommitMono-700.otf"),
  ]);
  const svg = await satori(buildCard(props as CardProps) as Parameters<typeof satori>[0], {
    width: cardWidth,
    height: cardHeight,
    fonts: [
      { name: "CommitMono", data: regularFont, weight: 400, style: "normal" },
      { name: "CommitMono", data: boldFont, weight: 700, style: "normal" },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
