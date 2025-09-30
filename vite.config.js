import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5227',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔥 Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('🚀 Proxying:', req.method, req.url, '→', proxyReq.getHeader('host') + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('✅ Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
