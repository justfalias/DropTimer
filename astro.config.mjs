import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid', // Hybrid mode: static pages + server endpoints
  integrations: [
    tailwind({
      // Enable Tailwind CSS
      applyBaseStyles: false, // We'll handle base styles in global.css
    }),
  ],
});

