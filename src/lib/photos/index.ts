import { photoManifest } from '../../generated/photo-manifest.ts';
import { extractDriveId, toDriveReference } from './drive.ts';

export { extractDriveId, toDriveReference };

export const FALLBACK_PHOTO_URL = '/default.png';

/** Benar hanya bila referensi Drive sudah tersedia sebagai aset hasil sinkronisasi lokal. */
export const hasSyncedDrivePhoto = (reference: string | null | undefined): boolean => {
  const driveId = extractDriveId(reference?.trim());
  return Boolean(driveId && photoManifest[driveId]);
};

/**
 * Menghasilkan URL publik lokal. URL non-Drive tetap didukung untuk aset lokal
 * dan URL eksternal yang memang disengaja.
 */
export const photoUrl = (
  reference: string | null | undefined,
  fallback = FALLBACK_PHOTO_URL,
): string => {
  const value = reference?.trim();
  if (!value) return fallback;

  const driveId = extractDriveId(value);
  return driveId ? (photoManifest[driveId] ?? fallback) : value;
};
