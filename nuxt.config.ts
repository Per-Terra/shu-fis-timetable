import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon'],
  srcDir: 'src/',
  typescript: {
    typeCheck: true
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
})
