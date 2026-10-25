import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the built files work from any sub-folder,
// e.g. https://tainred.github.io/Utility-Repo/spelling-bee/
export default defineConfig({ plugins: [react()], base: './' });
