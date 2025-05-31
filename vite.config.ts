import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use root path for Netlify deployment, GitHub Pages path for GitHub deployment
  base: (process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production') ? '/' : (mode === 'production' ? '/camu-course-compass-planner/' : '/'),
  define: {
    // Make NETLIFY environment variable available to the client
    'import.meta.env.VITE_NETLIFY': JSON.stringify(process.env.NETLIFY || false),
  },
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
}));
