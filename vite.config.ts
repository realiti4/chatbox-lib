import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  build: {
    target: 'es2023',
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'ChatWidget',
      fileName: (format) => `chat-widget.${format}.js`
    },
    rollupOptions: {
      // external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    cssCodeSplit: false
  }
});