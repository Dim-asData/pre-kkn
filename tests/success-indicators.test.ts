import { describe, expect, it } from 'vitest';
import { buildActivityDetails } from '../src/data/index.ts';
import {
  createProductionSheetsData,
  T1_ACTIVITY_ID,
} from './fixtures/phase5a.ts';

const componentSources = import.meta.glob('../src/components/SuccessIndicators.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const layoutSources = import.meta.glob('../src/layouts/ArticleLayout.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

describe('indikator dan tombol foto bukti', () => {
  const source = componentSources['../src/components/SuccessIndicators.astro'];
  const articleLayout = layoutSources['../src/layouts/ArticleLayout.astro'];

  it('menghilangkan badge Belum dinilai tanpa menghapus tanda tanya aksesibel', () => {
    expect(source).toContain("if (value === false) return 'Belum tercapai';");
    expect(source).toContain('return null;');
    expect(source).toContain("indicator.achieved === false ? '–' : '?'");
    expect(source).toContain("{label && <span>{label}</span>}");
    expect(source).toContain("aria-label={label ? undefined : 'Belum dinilai'}");
  });

  it('memasangkan foto bukti dengan indikator_id yang benar tanpa mengubah capaian', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture kegiatan T1 tidak tersedia.');

    const indicatorPhotos = detail.photos.filter(({ role }) => role === 'evidence');
    expect(indicatorPhotos).toHaveLength(3);
    expect(indicatorPhotos.map(({ indicatorId }) => indicatorId)).toEqual(
      detail.indicators.map(({ id }) => id),
    );
    expect(detail.indicators.every(({ achieved }) => achieved === null)).toBe(true);

    expect(source).toContain('photo.indicatorId === indicator.id');
    expect(source).toContain("photo.role === 'evidence'");
    expect(source).toContain('hasSyncedDrivePhoto(photo.driveFile)');
    expect(source).not.toMatch(/hasSyncedDrivePhoto[^;]+achieved/s);
  });

  it('menampilkan show/hide Lihat gambar serta fallback disabled', () => {
    expect(source).toContain('<details class="indicators__image">');
    expect(source).toContain('<summary>Lihat gambar</summary>');
    expect(source).toContain('src={photoUrl(photo.driveFile)}');
    expect(source).toContain('indicators__image-trigger');
    expect(source).toContain('disabled');
  });

  it('tidak lagi menampilkan galeri foto indikator secara terbuka di bawah narasi', () => {
    expect(articleLayout).toContain(
      '<SuccessIndicators indicators={activity.indicators} photos={indicatorPhotos} />',
    );
    expect(articleLayout).not.toContain("sectionPhotos('ukuran_keberhasilan')");
    expect(articleLayout).toContain('<ImageGallery images={supplementalGalleryImages} />');
  });
});
