import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'NestJS Telegraf',
  description: 'NestJS Crypto documentation',
  srcDir: './docs',
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
          { text: 'Telegraf methods', link: '/telegraf-methods' },
          { text: 'Async configuration', link: '/async-configuration' },
        ],
      },
      {
        text: 'Extras',
        items: [],
      },
      {
        text: 'Migrating',
        items: [{ text: 'From v1 to v2', link: '/migrating/from-v1-to-v2' }],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/0x467/nestjs-crypto' },
    ],
  },
});
