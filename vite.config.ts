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
        // Proxies /vite-proxy/* → Django backend, stripping the /vite-proxy prefix.
        // This avoids CORS entirely: the browser calls same-origin /vite-proxy/...
        // and Vite forwards the request to Django.
        '/vite-proxy': {
          target: djangoProxy.replace(/\/proxy\/?$/, ''),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vite-proxy/, '/proxy'),
        },
      },
    },
  }
})
