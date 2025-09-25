import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ai: ['@google/genai']
        }
      }
    }
  },
  define: {
    // Ensure environment variables are available at build time
    'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.GEMINI_API_KEY),
    // Fix hydration issues
    'import.meta.env.SSR': false
  },
  ssr: {
    noExternal: ['@supabase/supabase-js']
  }
})
