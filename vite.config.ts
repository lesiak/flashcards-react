import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

const env = loadEnv('', process.cwd(), '');
const forvoKey = env.FORVO_KEY;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/word-pronunciations': {
        target: 'https://apifree.forvo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/word-pronunciations/, `/key/${forvoKey}/format/json/action/word-pronunciations`),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('VITE_PROXY error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('VITE_PROXY Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('VITE_PROXY Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  }
})

//  target: 'https://itsthisforthat.com/',