import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import {offlineCachePlugin} from "./src/build/offline-cache-plugin";

export default defineConfig({
  plugins:[react(),offlineCachePlugin()],
  optimizeDeps:{exclude:["@sqlite.org/sqlite-wasm"]},
  test:{environment:"jsdom",include:["src/**/*.test.ts","src/**/*.test.tsx"]}
});
