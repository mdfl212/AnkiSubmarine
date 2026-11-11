import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins:[react()],
  optimizeDeps:{exclude:["@sqlite.org/sqlite-wasm"]},
  test:{environment:"jsdom",include:["src/**/*.test.ts","src/**/*.test.tsx"]}
});