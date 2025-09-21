import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [
        path.resolve(__dirname),           // allow project root
        path.resolve(__dirname, "client"), // allow client folder
        path.resolve(__dirname, "shared"), // allow shared folder
      ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

// Express middleware integration
function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only during dev server
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app); // Mount Express app
    },
  };
}
