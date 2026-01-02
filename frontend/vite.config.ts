import fs from "fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let rootDir: string | undefined
let buildOutDir: string | undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    {
      name: "remove-public-loon-rules",
      apply: "build",
      configResolved(config) {
        rootDir = config.root
        buildOutDir = config.build.outDir
      },
      closeBundle() {
        const root = rootDir ?? process.cwd()
        const outDir = buildOutDir ?? "dist"
        const target = path.resolve(root, outDir, "loon-rules.json")
        if (fs.existsSync(target)) {
          fs.rmSync(target, { force: true })
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../public",
    emptyOutDir: true,
  }
})
