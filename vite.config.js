import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '')
  
  // Get backend URL from environment or use local backend on port 8080 by default
  // Set VITE_BACKEND_URL in your .env if you need a different target
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8080'
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
                // Normalize to avoid double slashes when backendTarget ends with '/'
                const target = backendTarget.replace(/\/$/, '');
                console.log('🚀 Proxying:', req.method, req.url, '→', target + req.url);
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
