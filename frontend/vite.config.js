import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: '0.0.0.0', // Or host: true
    port: 5173, // or whatever port you're using
    proxy: {
      '/api': {
        target: 'http://localhost:5177',
        // Optional: rewrite path if needed
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
