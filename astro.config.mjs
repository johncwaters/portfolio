import { defineConfig } from 'astro/config';
import image from '@astrojs/image';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel/serverless';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: vercel(),
	integrations: [image(), sitemap(), svelte(), tailwind()],
	daisyui: {
		themes: ["wireframe"],
	},
});
