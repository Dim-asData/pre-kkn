import { describe, expect, it } from 'vitest';
import { hasSyncedDrivePhoto } from '../src/lib/photos/index.ts';

const sources = import.meta.glob('../src/components/ProgramOutputs.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const layoutSources = import.meta.glob('../src/layouts/ArticleLayout.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const homepageSources = import.meta.glob('../src/pages/index.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

describe('indikator dan tombol foto output program', () => {
  const source = sources['../src/components/ProgramOutputs.astro'];
  const articleLayout = layoutSources['../src/layouts/ArticleLayout.astro'];
  const homepage = homepageSources['../src/pages/index.astro'];

  it('menghitung ketersediaan dari manifest foto, bukan status kegiatan atau angka actual', () => {
    expect(hasSyncedDrivePhoto('drive://1xyW0tC0VcZA_kO62H5UWY1olbO5zxOgC')).toBe(true);
    expect(hasSyncedDrivePhoto('drive://1Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);

    expect(source).toContain('hasSyncedDrivePhoto(item.image)');
    expect(source).not.toMatch(/hasImage\s*\?\s*['"]completed['"]/);
    expect(source).not.toMatch(/hasImage\s*&&\s*item\.actual/);
  });

  it('menampilkan cek hijau dan tombol Lihat gambar yang dapat dibuka ketika foto tersedia', () => {
    expect(source).toMatch(/\{hasImage \? ['"](?:✓|âœ“)['"] : ['"]!['"]\}/);
    expect(source).toContain("hasImage ? 'Foto dokumentasi tersedia' : 'Foto dokumentasi belum tersedia'");
    expect(source).toContain('program-outputs__value.has-image .program-outputs__status');
    expect(source).toContain('color: var(--color-success)');
    expect(source).toContain('<details class="program-outputs__image">');
    expect(source).toContain('<summary>Lihat gambar</summary>');
    expect(source).toContain('src={photoUrl(item.image)}');
  });

  it('menampilkan tanda seru dan tombol disabled ketika foto belum tersedia', () => {
    expect(source).toContain('program-outputs__image-trigger');
    expect(source).toContain('disabled');
    expect(source).toContain('Lihat gambar');
    expect(source).toContain("hasImage ? 'Foto dokumentasi tersedia' : 'Foto dokumentasi belum tersedia'");
    expect(source).toContain('color: var(--color-warning)');
  });

  it('tidak mengulang foto output sebagai galeri inline di bagian hasil program', () => {
    expect(articleLayout).toContain('<ProgramOutputs outputs={activity.outputs} />');
    expect(articleLayout).not.toContain("sectionPhotos('hasil_program')");
    expect(articleLayout).toContain('<ImageGallery images={supplementalGalleryImages} />');
  });

  it('menjaga tinggi kotak sebelah ketika salah satu gambar dibuka', () => {
    expect(source).toMatch(
      /\.program-outputs__grid\s*\{[^}]*align-items:\s*start;/s,
    );
  });

  it('tidak menampilkan bagian hasil program pada halaman beranda', () => {
    expect(homepage).not.toContain('ProgramOutputs');
    expect(homepage).not.toContain('featuredOutputs');
    expect(homepage).not.toContain('outputs-section');
    expect(homepage).not.toContain('Bentuk keluaran yang akan didokumentasikan');
  });
});
