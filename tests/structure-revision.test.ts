import { describe, expect, it } from 'vitest';
import astroConfig from '../astro.config.mjs';
import { buildActivityDetails } from '../src/data/activities.ts';
import { buildActivityGallery } from '../src/data/activity-gallery.ts';
import { createProductionSheetsData } from './fixtures/phase5a.ts';

const publicSources = import.meta.glob(
  [
    '../src/pages/**/*.astro',
    '../src/layouts/**/*.astro',
    '../src/components/**/*.astro',
    '../src/data/**/*.{ts,js}',
    '../scripts/sync-photos.ts',
    '../astro.config.mjs',
    '../package.json',
  ],
  { eager: true, import: 'default', query: '?raw' },
) as Record<string, string>;

const navigationSources = import.meta.glob(
  [
    '../src/components/Header.astro',
    '../src/components/Footer.astro',
    '../src/components/GroupCard.astro',
    '../src/pages/index.astro',
  ],
  { eager: true, import: 'default', query: '?raw' },
) as Record<string, string>;

const schoolRouteSources = import.meta.glob('../src/pages/sekolah/**/*.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const legacyContentSources = import.meta.glob('../src/content/**/*.mdx', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const contentConfigSources = import.meta.glob('../src/content.config.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
});

describe('jalur publik produksi tanpa MDX dan Content Collections', () => {
  it('tidak memiliki file MDX, schema collection, getCollection, atau integrasi MDX pada jalur publik', () => {
    expect(Object.keys(legacyContentSources)).toHaveLength(0);
    expect(Object.keys(contentConfigSources)).toHaveLength(0);

    Object.entries(publicSources).forEach(([path, source]) => {
      expect(source, path).not.toMatch(/getCollection\s*\(/);
      expect(source, path).not.toMatch(/from\s+['"]astro:content['"]/);
      expect(source, path).not.toMatch(/\.mdx\b/i);
      expect(source, path).not.toContain('@astrojs/mdx');
      expect(source, path).not.toContain('remarkLocalPhotos');
      expect(source, path).not.toContain('mdx_path');
    });
  });

  it('memakai loader Sheets tunggal untuk homepage, kegiatan, detail, UMKM, dan galeri', () => {
    const expectedPages = [
      '../src/pages/index.astro',
      '../src/pages/kegiatan/index.astro',
      '../src/pages/kegiatan/[kelompok]/[slug].astro',
      '../src/pages/umkm/index.astro',
      '../src/pages/umkm/[kelompok]/[slug].astro',
      '../src/pages/galeri/index.astro',
    ];

    expectedPages.forEach((path) => {
      expect(publicSources[path], path).toContain('loadSheetsData');
    });
    expect(Object.keys(publicSources).filter((path) => path.endsWith('/sheets.ts'))).toEqual([
      '../src/data/sheets.ts',
    ]);
  });
});

describe('pensiun struktur publik sekolah', () => {
  it('menghapus Sekolah dari navigasi desktop, mobile, footer, dan card homepage', () => {
    Object.values(navigationSources).forEach((source) => {
      expect(source).not.toMatch(/href=["'{`]\/sekolah/);
      expect(source).not.toContain('SchoolCard');
      expect(source).not.toContain('SchoolLayout');
    });

    expect(navigationSources['../src/components/Header.astro']).not.toContain("label: 'Sekolah'");
    expect(navigationSources['../src/components/Footer.astro']).not.toContain("label: 'Sekolah'");
  });

  it('mempertahankan redirect legacy sekolah menuju kegiatan tanpa route sekolah baru', () => {
    expect(Object.keys(schoolRouteSources)).toHaveLength(0);
    expect(astroConfig.redirects).toMatchObject({
      '/sekolah': '/kegiatan',
      '/sekolah/t1/tk-pelita-sumbakeling-demo': '/kegiatan',
      '/sekolah/t2/tk-ceria-silebu-demo': '/kegiatan',
      '/sekolah/t3/sd-pancalang-cendekia-demo': '/kegiatan',
    });
  });
});

describe('galeri turunan Foto_Kegiatan yang benar-benar dapat dirender', () => {
  it('menautkan setiap item ke kegiatan aktif dan verified, serta mendeduplikasi byte gambar sama', () => {
    const data = createProductionSheetsData();
    const gallery = buildActivityGallery(buildActivityDetails(data));

    expect(data.activityPhotos).toHaveLength(15);
    expect(gallery).toHaveLength(14);
    expect(new Set(gallery.map(({ src }) => src)).size).toBe(14);
    gallery.forEach((item) => {
      expect(item.activityHref).toBe('/kegiatan/t1/sosialisasi-digital-marketing');
      expect(item.groupId).toBe('t1');
      expect(item.activityTitle).toBeTruthy();
      expect(item.src).toMatch(/^\/_photos\/.+\.webp$/);
    });
  });

  it('mengabaikan kegiatan nonaktif/draft serta gambar profil dan produk UMKM', () => {
    const data = createProductionSheetsData();
    data.activities.push({
      ...data.activities[0],
      id: 'kegiatan-t1-tidak-publik',
      slug: 'tidak-publik',
      status: 'draft',
    });
    data.activityPhotos.push({
      ...data.activityPhotos[0],
      id: 'foto-tidak-publik',
      activityId: 'kegiatan-t1-tidak-publik',
      driveFile: '/kegiatan/tidak-publik.webp',
    });

    const gallery = buildActivityGallery(buildActivityDetails(data));
    const sources = gallery.map(({ src }) => src);
    expect(sources).not.toContain('/kegiatan/tidak-publik.webp');
    expect(sources).not.toContain(data.umkm[0].heroPhoto);
    expect(sources).not.toContain(data.products[0].photo);

    const galleryPage = publicSources['../src/pages/galeri/index.astro'];
    expect(galleryPage).toContain('buildActivityGallery(activities)');
    expect(galleryPage).not.toMatch(/data\.(?:umkm|products)/);
  });
});
