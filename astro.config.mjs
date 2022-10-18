import { defineConfig } from 'astro/config';
import image from '@astrojs/image';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel/static';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	integrations: [image(), sitemap(), svelte(), tailwind()],
	site: 'https://johncwaters.com',
});
