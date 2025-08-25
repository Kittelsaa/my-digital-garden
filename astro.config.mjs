import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://kttlsaa.com',
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/draft/') && !page.includes('/private/'),
      customPages: [
        'https://kttlsaa.com/about',
        'https://kttlsaa.com/garden',
      ],
    }),
    react()
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  },

  adapter: vercel(),
  
  vite: {
    build: {
      assetsInlineLimit: 0 
    }
  }
});