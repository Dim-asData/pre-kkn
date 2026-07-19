// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/sekolah': '/kegiatan',
    '/sekolah/t1/tk-pelita-sumbakeling-demo': '/kegiatan',
    '/sekolah/t2/tk-ceria-silebu-demo': '/kegiatan',
    '/sekolah/t3/sd-pancalang-cendekia-demo': '/kegiatan',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
