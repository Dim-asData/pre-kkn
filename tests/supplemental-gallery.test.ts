import { describe, expect, it } from 'vitest';
import {
  buildActivityDetails,
  isSupplementalActivityPhoto,
} from '../src/data/index.ts';
import {
  createProductionSheetsData,
  T1_ACTIVITY_ID,
} from './fixtures/phase5a.ts';

const layoutSources = import.meta.glob('../src/layouts/ArticleLayout.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

describe('galeri dokumentasi pendukung pada detail kegiatan', () => {
  const articleLayout = layoutSources['../src/layouts/ArticleLayout.astro'];

  it('tidak mengulang foto yang sudah digunakan pada bagian artikel T1', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture kegiatan T1 tidak tersedia.');

    expect(detail.photos.filter(isSupplementalActivityPhoto)).toEqual([]);
    expect(detail.photos.filter(({ role }) => role !== 'hero')).toHaveLength(14);
  });

  it('hanya menerima foto narrative tanpa section atau relasi lain sebagai foto pendukung', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture kegiatan T1 tidak tersedia.');

    const source = detail.photos.find(({ role }) => role === 'narrative');
    if (!source) throw new Error('Fixture foto narrative T1 tidak tersedia.');

    const supplemental = {
      ...source,
      id: 'foto-t1-pendukung-01',
      articleSection: null,
      outputId: null,
      indicatorId: null,
    };

    expect(isSupplementalActivityPhoto(supplemental)).toBe(true);
    expect(isSupplementalActivityPhoto(source)).toBe(false);
    expect(
      isSupplementalActivityPhoto({ ...supplemental, role: 'output' }),
    ).toBe(false);
    expect(
      isSupplementalActivityPhoto({ ...supplemental, articleSection: 'penerima_manfaat' }),
    ).toBe(false);
  });

  it('menghilangkan seluruh section ketika tidak ada foto pendukung', () => {
    expect(articleLayout).toContain('.filter(isSupplementalActivityPhoto)');
    expect(articleLayout).toContain(
      'supplementalGalleryImages.length > 0 &&',
    );
    expect(articleLayout).toContain('<ImageGallery images={supplementalGalleryImages} />');
    expect(articleLayout).not.toContain('title="Dokumentasi foto belum tersedia"');
  });
});
