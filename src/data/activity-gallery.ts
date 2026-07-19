import { photoManifest } from '../generated/photo-manifest.ts';
import { extractDriveId } from '../lib/photos/drive.ts';
import { activityRoute } from './activities.ts';
import type {
  ActivityDetail,
  ActivityPhotoRole,
  KelompokId,
  ProgramCategory,
} from './types.ts';

export interface ActivityGalleryItem {
  id: string;
  photoId: string;
  src: string;
  alt: string;
  caption: string;
  activityTitle: string;
  activityHref: string;
  groupId: KelompokId;
  category: ProgramCategory;
  tags: string[];
  date: string | null;
  source: ActivityPhotoRole;
}

interface RenderablePhoto {
  src: string;
  canonicalKey: string;
}

const contentHashFromManifestUrl = (url: string): string | null =>
  url.match(/-([a-f0-9]{16,64})\.(?:avif|jpe?g|png|webp)(?:[?#].*)?$/i)?.[1]?.toLowerCase() ??
  null;

const isRenderableNonDriveReference = (value: string): boolean => {
  if (/^https?:\/\/\S+$/i.test(value)) return true;
  if (/^(?:\/|\.{1,2}\/)\S+$/.test(value)) return true;
  return /^(?:[A-Za-z0-9._~-]+\/)*[A-Za-z0-9._~-]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i.test(
    value,
  );
};

/**
 * Referensi Drive hanya dianggap renderable bila pipeline telah menulisnya ke
 * manifest. Canonical key memakai hash isi saat tersedia sehingga dua file ID
 * Drive dengan byte gambar yang sama tidak menghasilkan item galeri ganda.
 */
export const resolveRenderableActivityPhoto = (
  reference: string | null | undefined,
): RenderablePhoto | null => {
  const value = reference?.trim();
  if (!value) return null;

  const driveId = extractDriveId(value);
  if (driveId) {
    const manifestUrl = photoManifest[driveId];
    if (!manifestUrl) return null;
    const contentHash = contentHashFromManifestUrl(manifestUrl);
    return {
      src: manifestUrl,
      canonicalKey: contentHash ? `hash:${contentHash}` : `drive:${driveId}`,
    };
  }

  if (!isRenderableNonDriveReference(value)) return null;
  return { src: value, canonicalKey: `url:${value}` };
};

export const buildActivityGallery = (
  activities: readonly ActivityDetail[],
): ActivityGalleryItem[] => {
  const seenPhotos = new Set<string>();
  const gallery: ActivityGalleryItem[] = [];

  activities
    .filter(
      ({ active, verificationStatus, status }) =>
        active &&
        verificationStatus === 'verified' &&
        status !== 'draft' &&
        status !== 'cancelled',
    )
    .forEach((activity) => {
      const href = activityRoute(activity);
      const date = activity.actualDate ?? activity.plannedDate;
      const tags = [...new Set(activity.tags.map((tag) => tag.trim()).filter(Boolean))];

      activity.photos
        .filter(({ active, verificationStatus }) => active && verificationStatus === 'verified')
        .forEach((photo) => {
          const resolved = resolveRenderableActivityPhoto(photo.driveFile);
          if (!resolved || seenPhotos.has(resolved.canonicalKey)) return;
          seenPhotos.add(resolved.canonicalKey);

          gallery.push({
            id: photo.id,
            photoId: photo.id,
            src: resolved.src,
            alt: photo.alt,
            caption: photo.caption ?? photo.alt,
            activityTitle: activity.title,
            activityHref: href,
            groupId: activity.groupId,
            category: activity.category,
            tags,
            date,
            source: photo.role,
          });
        });
    });

  return gallery;
};
