import react from '@vitejs/plugin-react' //mendukung pengembangan React
import { defineConfig } from 'vite' // fungsi yang digunakan untuk mendefinisikan konfigurasi vite
import tailwindcss from '@tailwindcss/vite' //plugin Vite untuk menambahkan tailwind css ke projek

// https://vite.dev/config/
export default defineConfig({ //mendefinisikan objek konfigurasi
  plugins: [ // daftar plogin yang digunakan untuk mendukung pengembangan React, dan tailwind css digunakan untuk menambahkan Tailwind CSS
    react(),
    tailwindcss(),
  ],
})
