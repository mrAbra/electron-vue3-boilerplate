import path from "path";
import vuePlugin from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

/**
 * https://vitejs.dev/config
 */
export default defineConfig({
  root: path.join(__dirname),
  publicDir: "public",
  server: {
    port: 8080,
  },
  open: false,
  base: "/",
  build: {
    // outDir 的位置与 src/tsconfig.json 中的 outDir 息息相关
    outDir: path.join(__dirname, "../../build/renderer"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.join(__dirname),
      "@lib": path.join(__dirname, "../lib"),
      "@file-download": path.join(__dirname, "../lib/file-download"),
      "@utils": path.join(__dirname, "../lib/utils"),
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node']
  },
  plugins: [
    vuePlugin(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
  ],
});
