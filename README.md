# johncwaters.com

Personal portfolio and blog, live at [www.johncwaters.com](https://www.johncwaters.com).

## Stack

- [Astro 7](https://astro.build) with `output: "server"` on the Vercel adapter; blog routes, RSS, and sitemap are prerendered
- Tailwind CSS 4 with daisyUI 5
- TypeScript

## Site map

- `/` landing page: animated wave hero, Professional Work (terminal-style cards driven by `src/data/projects.ts`), My Works (browser-window cards in `src/components/smallparts/Portfolio.astro`), About Me, contact form
- `/blog` Markdown content collection in `src/content/blog/`, schema in `src/content.config.ts`, feed at `/rss.xml`
- `/api/nodemailer` serverless contact form endpoint (nodemailer with Gmail OAuth via googleapis)

## Development

```sh
npm install
npm run dev      # local dev server
npm run check    # astro check (types + diagnostics)
npm run build    # production build
```

The contact form needs credentials: copy `.example.env` to `.env` and fill in the Gmail OAuth values.

## Easter egg

Arrive with `?ph=1` or a posthog.com referrer and a hedgehog peeks out of the hero waves.
