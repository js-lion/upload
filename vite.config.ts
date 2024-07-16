import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9088,
    host: "0.0.0.0"
  },
  build: {
    target: "modules",
    lib: {
      entry: "src/upload",
      name: "upload",
      formats: ["es"],
      fileName: "upload"
    },
    cssCodeSplit: true,
    sourcemap: true,
    manifest: false,
    rollupOptions: {
      external: [
        /^vue/i,
        /^uuid/i,
        /^@aws-sdk/i,
      ],
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
