// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      // the proper extensions will be added
      fileName: "versachain-addresses",
      name: "VersachainAddresses"
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
});
