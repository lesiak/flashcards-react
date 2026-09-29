import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { audioCachePlugin } from './vite-plugin-audio-cache'

// https://vitejs.dev/config/
export default defineConfig({
  // audioCachePlugin serves /api/audio/* from ./audio-cache in dev; in prod an Azure Function does.
  plugins: [react(), audioCachePlugin()],
})
