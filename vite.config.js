import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5180,
    strictPort: true,
    allowedHosts: ["myinscribed.local", "localhost", "127.0.0.1"],
  },
})
