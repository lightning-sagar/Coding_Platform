import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  server:{
    port:3000,
    proxy:{
      '/api':{
        target:"https://coding-platform-backend-ol9u.onrender.com/",
        changeOrigin:true
      }
    }
  },
  plugins: [
    tailwindcss(),
  ],
})
