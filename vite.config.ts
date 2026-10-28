import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const promallCombinedUrl = new URL(
    env.VITE_PROMALL_COMBINED_URL ||
      'https://manager.promallshop.com/proxy/combined/promallshop/'
  )

  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/vite-proxy': {
          target: promallCombinedUrl.origin,
          changeOrigin: true,
          rewrite: () => promallCombinedUrl.pathname,
        },
      },
    },
    test: {
      environment: 'jsdom',         // simulates a browser DOM
      globals: true,                // lets you use describe/it/expect without imports
      setupFiles: './src/test/setup.ts',  // runs before every test file
    },
  }
})
