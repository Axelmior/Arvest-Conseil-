import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Seuil relevé car xlsx, pdfjs et tesseract.js sont de la tierce partie inévitable
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Infra React — chunk commun entre toutes les routes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Recharts — chargé uniquement avec Dashboard / Analytics
          'vendor-charts': ['recharts'],
          // Icônes — arbre partagé mais volumineux, isolé pour meilleur cache
          'vendor-icons': ['lucide-react'],
          // Parseurs de documents — chargés uniquement lors d'un import
          'vendor-xlsx': ['xlsx'],
        },
      },
    },
  },
  optimizeDeps: {
    // Tesseract.js spawns Web Workers dynamically — exclude from pre-bundling
    exclude: ['tesseract.js'],
  },
});
