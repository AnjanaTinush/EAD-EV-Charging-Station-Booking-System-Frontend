import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '')
  
  // Get backend URL from environment or use default
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:7179'
  const enableProxyLogs = env.VITE_ENABLE_PROXY_LOGS === 'true'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('🔥 Proxy error:', err.message);
            });
            
            // Only show detailed logs if enabled in .env
            if (enableProxyLogs) {
              proxy.on('proxyReq', (proxyReq, req) => {
                console.log('🚀 Proxying:', req.method, req.url, '→', backendTarget + req.url);
              });
              proxy.on('proxyRes', (proxyRes, req) => {
                console.log('✅ Response:', proxyRes.statusCode, req.url);
              });
            }
          },
        }
      }
    }
  }
})
