import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import {offlineCachePlugin} from "./src/build/offline-cache-plugin";
import {standaloneHtmlPlugin} from "./src/build/standalone-html-plugin";

export default defineConfig({
  base:"./",
  plugins:[react(),offlineCachePlugin(),standaloneHtmlPlugin()],
  optimizeDeps:{exclude:["@sqlite.org/sqlite-wasm"]},
  worker:{format:"iife"},
  build:{assetsInlineLimit:Infinity,cssCodeSplit:false},
  test:{environment:"jsdom",include:["src/**/*.test.ts","src/**/*.test.tsx"]}
});
