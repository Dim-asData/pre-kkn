const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{20,}$/;

/** Mengambil ID berkas dari referensi `drive://`, URL Drive, atau ID mentah. */
export const extractDriveId = (reference: string | null | undefined): string | null => {
  const value = reference?.trim();
  if (!value) return null;

  if (value.startsWith('drive://')) {
    const id = value.slice('drive://'.length).split(/[/?#]/, 1)[0];
    return DRIVE_ID_PATTERN.test(id) ? id : null;
  }

  if (DRIVE_ID_PATTERN.test(value)) return value;

  try {
    const url = new URL(value);
    const queryId = url.searchParams.get('id');
    if (queryId && DRIVE_ID_PATTERN.test(queryId)) return queryId;

    const pathId = url.pathname.match(/\/(?:file\/)?d\/([A-Za-z0-9_-]{20,})/)?.[1];
    return pathId && DRIVE_ID_PATTERN.test(pathId) ? pathId : null;
  } catch {
    return null;
  }
};

/** Menormalkan URL Drive lama agar referensi konten tidak mengunci endpoint hotlink. */
export const toDriveReference = (reference: string): string => {
  const id = extractDriveId(reference);
  return id ? `drive://${id}` : reference;
};
