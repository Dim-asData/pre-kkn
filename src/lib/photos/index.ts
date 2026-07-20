import { photoManifest } from '../../generated/photo-manifest.ts';
import { extractDriveId, toDriveReference } from './drive.ts';

export { extractDriveId, toDriveReference };

export const FALLBACK_PHOTO_URL = '/default.png';

/**
 * Host placeholder pada data dummy prototipe. Pengunjung tidak boleh
 * memuat layanan eksternal ini; render memakai fallback lokal.
 */
const PLACEHOLDER_HOST_PATTERN = /^https?:\/\/(?:www\.)?placehold\.co\//i;

/** Benar hanya bila referensi Drive sudah tersedia sebagai aset hasil sinkronisasi lokal. */
export const hasSyncedDrivePhoto = (reference: string | null | undefined): boolean => {
  const driveId = extractDriveId(reference?.trim());
  return Boolean(driveId && photoManifest[driveId]);
};

/**
 * Menghasilkan URL publik lokal. URL non-Drive tetap didukung untuk aset lokal
 * dan URL eksternal yang memang disengaja, kecuali placeholder dummy
 * (placehold.co) yang selalu jatuh ke fallback lokal.
 */
export const photoUrl = (
  reference: string | null | undefined,
  fallback = FALLBACK_PHOTO_URL,
): string => {
  const value = reference?.trim();
  if (!value) return fallback;

  const driveId = extractDriveId(value);
  if (driveId) return photoManifest[driveId] ?? fallback;
  if (PLACEHOLDER_HOST_PATTERN.test(value)) return fallback;
  return value;
};
