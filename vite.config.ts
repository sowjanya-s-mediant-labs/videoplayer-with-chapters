import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use relative paths in build output so dist/index.html can be opened directly.
  // For hosted deployments, this still works when served from any subpath.
  base: './',
  plugins: [react(), tailwindcss()],
})
