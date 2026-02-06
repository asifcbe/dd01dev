import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://engineers-twice-bull-mario.trycloudflare.com/invoice-generator/api',
        changeOrigin: true,
        secure: false, // use this if the target uses self-signed SSL cert
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})



