import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // dev-only middleware to support friendly URLs like /sitemap -> /sitemap.xml
    {
      name: "sitemap-rewrites",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          try {
            if (req.url === "/sitemap") req.url = "/sitemap.xml";
            else if (req.url === "/robots") req.url = "/robots.txt";
            else if (req.url === "/BingSiteAuth.xml") req.url = "/BingSiteAuth.xml";
          } catch (e) {
            // ignore
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
