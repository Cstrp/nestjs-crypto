import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'NestJS Crypto',
  titleTemplate: ':title - Enterprise-Grade Encryption',
  description:
    'A comprehensive crypto module for NestJS applications with bcrypt and AES encryption',
  base: '/nestjs-crypto/',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['meta', { name: 'theme-color', content: '#e0234e' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    [
      'meta',
      { name: 'og:title', content: 'NestJS Crypto | Crypto Module for NestJS' },
    ],
    ['meta', { name: 'og:site_name', content: 'NestJS Crypto' }],
    [
      'meta',
      { name: 'og:url', content: 'https://cstrp.github.io/nestjs-crypto/' },
    ],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'NestJS Crypto',

    nav: [
      { text: 'Guide', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'API Reference', link: '/api/overview', activeMatch: '/api/' },
      {
        text: 'Examples',
        link: '/examples/authentication',
        activeMatch: '/examples/',
      },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
          {
            text: '────────',
            items: [],
          },
          {
            text: 'npm Package',
            link: 'https://www.npmjs.com/package/nestjs-crypto',
          },
          {
            text: 'GitHub Repository',
            link: 'https://github.com/Cstrp/nestjs-crypto',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is NestJS Crypto?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Module Configuration', link: '/guide/configuration' },
            { text: 'Async Configuration', link: '/async-configuration' },
            { text: 'Bcrypt Service', link: '/guide/bcrypt' },
            { text: 'AES Service', link: '/guide/aes' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Security Best Practices', link: '/guide/security' },
            { text: 'Performance', link: '/guide/performance' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'BcryptService', link: '/api/bcrypt-service' },
            { text: 'AesService', link: '/api/aes-service' },
            { text: 'Utility Functions', link: '/api/utilities' },
            {
              text: 'TypeDoc API',
              link: 'https://nestjs-crypto-api.pages.dev/',
            },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'User Authentication', link: '/examples/authentication' },
            { text: 'Data Encryption', link: '/examples/data-encryption' },
            { text: 'API Key Management', link: '/examples/api-keys' },
            { text: 'File Encryption', link: '/examples/file-encryption' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Cstrp/nestjs-crypto' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/nestjs-crypto' },
      {
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>npm</title><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/></svg>',
        },
        link: 'https://www.npmjs.com/package/nestjs-crypto',
        ariaLabel: 'npm package',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © present cstrp',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/Cstrp/nestjs-crypto/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
  },
});
