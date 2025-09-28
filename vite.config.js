import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@canvasjs/react-charts", "@canvasjs/charts"], // Pre-bundle these dependencies
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/], // Ensure all CommonJS modules in node_modules are included
    },
  },
  // base: '',
});
