import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  server:{
    port:3000,
    proxy:{
      '/api':{
        target:"http://localhost:5000/",
        changeOrigin:true
      }
    }
  },
  plugins: [
    tailwindcss(),
  ],
})