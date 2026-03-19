// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/content'
  ],

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  content: {
    experimental: { nativeSqlite: true },
  },
  ui: {
    content: true,
    experimental: { componentDetection: true }
  },
  compatibilityDate: '2026-03-15',

  eslint: { config: { stylistic: true } },
})
