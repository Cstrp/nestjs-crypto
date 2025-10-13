import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'NestJS Crypto',
  description: 'NestJS Crypto documentation',
  srcDir: './docs',
  outDir: './dist',
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'API (typedoc)', link: 'https://nestjs-crypto-api.pages.dev/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/' },
          { text: 'Getting updates', link: '/getting-updates' },
          { text: 'Async configuration', link: '/async-configuration' },
        ],
      },
      {
        text: 'Extras',
        items: [],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cstrp/nestjs-crypto' },
    ],
  },
});
