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
    // Accept both VITE_API_KEY and GEMINI_API_KEY (fallback) to avoid deploy mismatches
    'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.GEMINI_API_KEY || ''),
    'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.VITE_API_KEY || ''),
    // Supabase: accept either VITE_* or plain SUPABASE_* from hosting env
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''),
    // Fix hydration issues
    'import.meta.env.SSR': false
  },
  ssr: {
    noExternal: ['@supabase/supabase-js']
  }
})
