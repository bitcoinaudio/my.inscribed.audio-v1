import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
  //   https: {
  //     key: fs.readFileSync('key.pem'),
  //     cert: fs.readFileSync('cert.pem'),
  // },
    host: true,
    port: 3333,
    proxy: {
      '/bores-api': {
        target: 'https://royalty.bitcoinaudio.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/bores-api/, ''),
      },
    },
  },
  plugins: [react()],
})