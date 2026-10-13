import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const djangoProxy = env.VITE_PROMALL_PROXY_URL || 'http://127.0.0.1:8001/proxy'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/vite-proxy': {
          target: djangoProxy.replace(/\/proxy\/?$/, ''),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vite-proxy/, '/proxy'),
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
