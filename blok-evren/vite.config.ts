import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 üretir: her şeyi tek bir index.html içine gömen taşınabilir yapı.
const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
  build: {
    outDir: single ? 'dist-single' : 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: single
      ? {}
      : {
          output: {
            // Rolldown yalnızca fonksiyon biçimini kabul ediyor.
            manualChunks(id: string) {
              if (id.includes('node_modules/three/')) return 'three'
              if (id.includes('@react-three')) return 'r3f'
              return undefined
            },
          },
        },
  },
})
