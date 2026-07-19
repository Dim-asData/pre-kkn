import { describe, expect, it } from 'vitest';
import {
  activityRoute,
  buildActivityDetails,
  resolveRenderableActivityPhoto,
  splitMultilineParagraphs,
} from '../src/data/index.ts';
import {
  ACTIVITY_ROUTES,
  createProductionSheetsData,
  T1_ACTIVITY_ID,
  T1_PHOTO_DRIVE_IDS,
  T1_STORY_PHOTO_DESCRIPTIONS,
} from './fixtures/phase5a.ts';

const publicRenderSources = import.meta.glob(
  [
    '../src/layouts/ArticleLayout.astro',
    '../src/layouts/UMKMLayout.astro',
    '../src/pages/kegiatan/**/*.astro',
  ],
  { eager: true, import: 'default', query: '?raw' },
) as Record<string, string>;

describe('migrasi tujuh kegiatan ke CMS Sheets', () => {
  it('mempertahankan tujuh route yang disetujui dengan ID stabil', () => {
    const data = createProductionSheetsData();
    const details = buildActivityDetails(data);

    expect(details).toHaveLength(7);
    expect(details.map((activity) => `${activity.groupId}/${activity.slug}`).sort()).toEqual(
      ACTIVITY_ROUTES.map(([group, slug]) => `${group}/${slug}`).sort(),
    );
    expect(details.map(activityRoute).sort()).toEqual(
      ACTIVITY_ROUTES.map(([group, slug]) => `/kegiatan/${group}/${slug}`).sort(),
    );
    expect(new Set(details.map(({ id }) => id)).size).toBe(7);
    expect(details.filter(({ groupId }) => groupId === 't1')).toHaveLength(2);
    expect(details.filter(({ groupId }) => groupId === 't2')).toHaveLength(2);
    expect(details.filter(({ groupId }) => groupId === 't3')).toHaveLength(3);
  });

  it('menjaga proposal sebagai planned tanpa menyisipkan realisasi, capaian, atau data sensitif', () => {
    const data = createProductionSheetsData();
    const plannedActivities = data.activities.filter(({ id }) => id !== T1_ACTIVITY_ID);

    expect(plannedActivities).toHaveLength(6);
    plannedActivities.forEach((activity) => {
      expect(activity.status).toBe('planned');
      expect(activity.actualDate).toBeNull();
      expect(activity.active).toBe(true);
      expect(activity.verificationStatus).toBe('verified');
    });

    expect(data.beneficiaries.every(({ actual }) => actual === null)).toBe(true);
    expect(data.outputs.every(({ actual }) => actual === null)).toBe(true);
    expect(data.indicators.every(({ achieved, evidence }) => achieved === null && evidence === null)).toBe(
      true,
    );

    const allText = JSON.stringify(data);
    expect(allText).not.toMatch(/https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i);
    expect(allText).not.toMatch(/\b08\d{8,13}\b/);
    expect(allText).not.toMatch(/\brekening\s*:/i);
  });

  it('menjaga T1 ongoing tanpa otomatis mengubah status karena foto tersedia', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture kegiatan T1 tidak tersedia.');

    expect(detail.status).toBe('ongoing');
    expect(detail.actualDate).toBeNull();
    expect(detail.outputs.every(({ actual }) => actual === null)).toBe(true);
    expect(detail.indicators.every(({ achieved }) => achieved === null)).toBe(true);
    expect(detail.outputs.every(({ image }) => image?.startsWith('drive://'))).toBe(true);
  });
});

describe('narasi dan konteks foto tanpa MDX', () => {
  it('memecah teks multiline menjadi paragraf literal yang aman', () => {
    const input = 'Paragraf pertama.\n\n<script>alert("uji")</script>\nBaris ketiga.';

    expect(splitMultilineParagraphs(input)).toEqual([
      'Paragraf pertama.',
      '<script>alert("uji")</script>',
      'Baris ketiga.',
    ]);
    expect(splitMultilineParagraphs(null)).toEqual([]);

    Object.values(publicRenderSources).forEach((source) => {
      expect(source).not.toContain('set:html');
    });
    const articleLayout = publicRenderSources['../src/layouts/ArticleLayout.astro'];
    expect(articleLayout).toContain('splitMultilineParagraphs');
    expect(articleLayout).toMatch(/\.map\(\(paragraph\) => <p>\{paragraph\}<\/p>\)/);
  });

  it('mempertahankan semua 15 konteks foto artikel T1, termasuk hero, output, naratif, dan bukti', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture kegiatan T1 tidak tersedia.');

    expect(detail.photos).toHaveLength(15);
    expect(detail.photos.map(({ driveFile }) => driveFile.replace('drive://', ''))).toEqual(
      T1_PHOTO_DRIVE_IDS,
    );
    expect(detail.heroPhoto?.role).toBe('hero');
    expect(detail.photos.filter(({ role }) => role === 'hero')).toHaveLength(1);
    expect(detail.photos.filter(({ role }) => role === 'output')).toHaveLength(4);
    expect(detail.photos.filter(({ role }) => role === 'narrative')).toHaveLength(7);
    expect(detail.photos.filter(({ role }) => role === 'evidence')).toHaveLength(3);
    expect(detail.photos.every(({ driveFile }) => resolveRenderableActivityPhoto(driveFile))).toBe(
      true,
    );

    const articleLayout = publicRenderSources['../src/layouts/ArticleLayout.astro'];
    expect(articleLayout).toContain('image={activity.heroPhoto?.driveFile ?? null}');
    expect(articleLayout).toContain("photo.role !== 'hero' && inferredSection(photo) === section");
    expect(articleLayout).toContain('.filter(isSupplementalActivityPhoto)');
    expect(articleLayout).toContain('src: photoUrl(photo.driveFile)');
  });

  it('merender cerita sebagai prolog lalu foto, caption, dan deskripsi secara berulang', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture kegiatan T1 tidak tersedia.');

    const storyPhotos = detail.photos.filter(
      ({ role, articleSection }) =>
        role === 'narrative' && articleSection === 'cerita_program',
    );
    expect(storyPhotos.map(({ order }) => order)).toEqual([8, 9, 10, 11, 12]);
    expect(storyPhotos.map(({ description }) => description)).toEqual(
      T1_STORY_PHOTO_DESCRIPTIONS,
    );

    const articleLayout = publicRenderSources['../src/layouts/ArticleLayout.astro'];
    const prologueIndex = articleLayout.indexOf('paragraphs.cerita_program.map');
    const imageIndex = articleLayout.indexOf('<ImageGallery images={[entry.image]}');
    const descriptionIndex = articleLayout.indexOf('entry.description.map');

    expect(prologueIndex).toBeGreaterThan(-1);
    expect(imageIndex).toBeGreaterThan(prologueIndex);
    expect(descriptionIndex).toBeGreaterThan(imageIndex);
    expect(articleLayout).toContain('splitMultilineParagraphs(photo.description)');
    expect(articleLayout).toContain('variant="story"');
    expect(articleLayout).not.toContain("sectionPhotos('cerita_program')");
  });

});
