import type {
  ActivityArticleData,
  ActivityArticleSection,
  ActivityData,
  ActivityPhoto,
  ActivityPhotoRole,
  Beneficiary,
  ContentStatus,
  GroupData,
  KelompokId,
  OutputType,
  ProductData,
  ProgramCategory,
  ProgramOutput,
  RawSheetRow,
  SiteSettings,
  SuccessIndicator,
  UmkmData,
  VerificationStatus,
} from './types.ts';

const TRUE_VALUES = new Set(['1', 'true', 'ya', 'yes', 'y']);
const FALSE_VALUES = new Set(['0', 'false', 'tidak', 'no', 'n']);

export const normalizeOptionalString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

export const normalizeRequiredString = (value: unknown): string =>
  normalizeOptionalString(value) ?? '';

export const normalizeSlug = (value: unknown): string =>
  normalizeRequiredString(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

export const parseSheetBoolean = (value: unknown, field = 'boolean'): boolean => {
  const normalized = normalizeRequiredString(value).toLowerCase();
  if (normalized === '') return false;
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  throw new Error(`Nilai ${field} tidak valid: "${String(value)}".`);
};

export const parseNullableSheetBoolean = (
  value: unknown,
  field = 'boolean',
): boolean | null => {
  if (normalizeOptionalString(value) === null) return null;
  return parseSheetBoolean(value, field);
};

export const normalizeIsoDate = (value: unknown, field = 'tanggal'): string | null => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`${field} harus memakai format YYYY-MM-DD: "${normalized}".`);
  }

  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== normalized) {
    throw new Error(`${field} bukan tanggal yang valid: "${normalized}".`);
  }

  return normalized;
};

export const normalizePublishTimestamp = (
  value: unknown,
  field = 'waktu_publish_terakhir',
): string | null => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalizeIsoDate(normalized, field);
  }

  const isoTimestamp =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
  if (
    !isoTimestamp.test(normalized) ||
    !normalizeIsoDate(normalized.slice(0, 10), field) ||
    Number.isNaN(Date.parse(normalized))
  ) {
    throw new Error(
      `${field} harus memakai format ISO 8601 dengan zona waktu: "${normalized}".`,
    );
  }

  return normalized;
};

export const normalizeWhatsapp = (value: unknown): string | null => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return null;

  let digits = normalized.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;

  if (!/^62\d{8,13}$/.test(digits)) {
    throw new Error(`Nomor WhatsApp tidak valid: "${normalized}".`);
  }

  return digits;
};

export const parseCommaSeparated = (value: unknown): string[] => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return [];

  return [...new Set(normalized.split(',').map((item) => item.trim()).filter(Boolean))];
};

export const parseOptionalNonNegativeNumber = (
  value: unknown,
  field = 'number',
): number | null => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return null;

  if (!/^(?:\d+|\d*\.\d+)$/.test(normalized)) {
    throw new Error(`${field} harus berupa angka non-negatif: "${normalized}".`);
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} harus berupa angka non-negatif: "${normalized}".`);
  }
  return parsed;
};

export const parseRequiredInteger = (
  value: unknown,
  field = 'integer',
  options: { positive?: boolean } = {},
): number => {
  const normalized = normalizeRequiredString(value);
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${field} harus berupa integer non-negatif: "${normalized}".`);
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || (options.positive && parsed < 1)) {
    const qualifier = options.positive ? 'positif' : 'non-negatif';
    throw new Error(`${field} harus berupa integer ${qualifier}: "${normalized}".`);
  }
  return parsed;
};

export const parseEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  options: { uppercase?: boolean } = {},
): T => {
  const raw = normalizeRequiredString(value);
  const normalized = options.uppercase ? raw.toUpperCase() : raw.toLowerCase();
  const match = allowed.find((item) => {
    const candidate = options.uppercase ? item.toUpperCase() : item.toLowerCase();
    return candidate === normalized;
  });

  if (!match) {
    throw new Error(`${field} harus salah satu dari ${allowed.join(', ')}: "${raw}".`);
  }

  return match;
};

const normalizeGroupId = (value: unknown): KelompokId =>
  parseEnum(value, ['t1', 't2', 't3'] as const, 'id_kelompok');

const rowField = (row: RawSheetRow, field: string): string => row[field] ?? '';

export const normalizeSettingsRow = (row: RawSheetRow): SiteSettings => ({
  productionMode: parseSheetBoolean(
    rowField(row, 'mode_produksi'),
    'Pengaturan.mode_produksi',
  ),
  autoRebuild: parseSheetBoolean(rowField(row, 'auto_rebuild'), 'Pengaturan.auto_rebuild'),
  lastPublishedAt: normalizePublishTimestamp(
    rowField(row, 'waktu_publish_terakhir'),
    'Pengaturan.waktu_publish_terakhir',
  ),
  lastPublishStatus: normalizeOptionalString(rowField(row, 'status_publish_terakhir')),
});

export const normalizeGroupRow = (row: RawSheetRow): GroupData => ({
  id: normalizeGroupId(rowField(row, 'id_kelompok')),
  name: normalizeRequiredString(rowField(row, 'nama_kelompok')),
  village: normalizeRequiredString(rowField(row, 'desa')),
  programTheme: normalizeRequiredString(rowField(row, 'tema_program')),
  shortDescription: normalizeRequiredString(rowField(row, 'deskripsi_singkat')),
  thumbnail: normalizeOptionalString(rowField(row, 'thumbnail')),
  active: parseSheetBoolean(rowField(row, 'aktif'), 'Kelompok.aktif'),
});

export const normalizeActivityRow = (row: RawSheetRow): ActivityData => ({
  id: normalizeRequiredString(rowField(row, 'kegiatan_id')),
  groupId: normalizeGroupId(rowField(row, 'id_kelompok')),
  slug: normalizeSlug(rowField(row, 'slug')),
  title: normalizeRequiredString(rowField(row, 'judul')),
  category: parseEnum(
    rowField(row, 'kategori'),
    ['umkm', 'education', 'aid_distribution', 'supporting'] as const,
    'Kegiatan.kategori',
  ) as ProgramCategory,
  status: parseEnum(
    rowField(row, 'status'),
    ['draft', 'planned', 'ongoing', 'completed', 'cancelled'] as const,
    'Kegiatan.status',
  ) as ContentStatus,
  csrPillars: parseCommaSeparated(rowField(row, 'csr_pillars')),
  tags: parseCommaSeparated(rowField(row, 'tags')),
  plannedDate: normalizeIsoDate(
    rowField(row, 'tanggal_rencana'),
    'Kegiatan.tanggal_rencana',
  ),
  actualDate: normalizeIsoDate(
    rowField(row, 'tanggal_realisasi'),
    'Kegiatan.tanggal_realisasi',
  ),
  location: normalizeRequiredString(rowField(row, 'lokasi')),
  shortDescription: normalizeRequiredString(rowField(row, 'deskripsi_singkat')),
  driveFolderId: normalizeOptionalString(rowField(row, 'drive_folder_id')),
  verificationStatus: parseEnum(
    rowField(row, 'status_verifikasi'),
    ['draft', 'verified'] as const,
    'Kegiatan.status_verifikasi',
  ) as VerificationStatus,
  active: parseSheetBoolean(rowField(row, 'aktif'), 'Kegiatan.aktif'),
});

export const normalizeActivityArticleRow = (row: RawSheetRow): ActivityArticleData => ({
  activityId: normalizeRequiredString(rowField(row, 'kegiatan_id')),
  beneficiaryNarrative: normalizeOptionalString(rowField(row, 'penerima_manfaat_narasi')),
  programResultsNarrative: normalizeOptionalString(rowField(row, 'hasil_program_narasi')),
  programStory: normalizeOptionalString(rowField(row, 'cerita_program')),
  successMeasureNarrative: normalizeOptionalString(
    rowField(row, 'ukuran_keberhasilan_narasi'),
  ),
});

export const normalizeBeneficiaryRow = (row: RawSheetRow): Beneficiary => ({
  id: normalizeRequiredString(rowField(row, 'penerima_id')),
  activityId: normalizeRequiredString(rowField(row, 'kegiatan_id')),
  label: normalizeRequiredString(rowField(row, 'label')),
  planned: parseOptionalNonNegativeNumber(
    rowField(row, 'planned'),
    'Penerima_Manfaat.planned',
  ),
  actual: parseOptionalNonNegativeNumber(
    rowField(row, 'actual'),
    'Penerima_Manfaat.actual',
  ),
  unit: normalizeRequiredString(rowField(row, 'unit')),
  order: parseRequiredInteger(rowField(row, 'urutan'), 'Penerima_Manfaat.urutan'),
});

export const normalizeProgramOutputRow = (row: RawSheetRow): ProgramOutput => ({
  id: normalizeRequiredString(rowField(row, 'output_id')),
  activityId: normalizeRequiredString(rowField(row, 'kegiatan_id')),
  outputNumber: parseRequiredInteger(
    rowField(row, 'nomor_output'),
    'Output_Program.nomor_output',
    { positive: true },
  ),
  type: parseEnum(
    rowField(row, 'jenis_output'),
    ['physical', 'non_physical'] as const,
    'Output_Program.jenis_output',
  ) as OutputType,
  name: normalizeRequiredString(rowField(row, 'nama_output')),
  planned: parseOptionalNonNegativeNumber(rowField(row, 'planned'), 'Output_Program.planned'),
  actual: parseOptionalNonNegativeNumber(rowField(row, 'actual'), 'Output_Program.actual'),
  unit: normalizeRequiredString(rowField(row, 'unit')),
  recipient: normalizeOptionalString(rowField(row, 'penerima')),
  verificationStatus: parseEnum(
    rowField(row, 'status_verifikasi'),
    ['draft', 'verified'] as const,
    'Output_Program.status_verifikasi',
  ) as VerificationStatus,
  order: parseRequiredInteger(rowField(row, 'urutan'), 'Output_Program.urutan'),
  image: null,
  imageAlt: null,
  imageCaption: null,
});

export const normalizeSuccessIndicatorRow = (row: RawSheetRow): SuccessIndicator => ({
  id: normalizeRequiredString(rowField(row, 'indikator_id')),
  activityId: normalizeRequiredString(rowField(row, 'kegiatan_id')),
  label: normalizeRequiredString(rowField(row, 'label')),
  achieved: parseNullableSheetBoolean(rowField(row, 'achieved'), 'Indikator.achieved'),
  evidence: normalizeOptionalString(rowField(row, 'evidence')),
  order: parseRequiredInteger(rowField(row, 'urutan'), 'Indikator.urutan'),
});

export const normalizeActivityPhotoRow = (row: RawSheetRow): ActivityPhoto => ({
  id: normalizeRequiredString(rowField(row, 'foto_id')),
  activityId: normalizeRequiredString(rowField(row, 'kegiatan_id')),
  outputId: normalizeOptionalString(rowField(row, 'output_id')),
  indicatorId: normalizeOptionalString(rowField(row, 'indikator_id')),
  role: parseEnum(
    rowField(row, 'peran'),
    ['hero', 'narrative', 'output', 'evidence'] as const,
    'Foto_Kegiatan.peran',
  ) as ActivityPhotoRole,
  articleSection: normalizeOptionalString(rowField(row, 'bagian_artikel'))
    ? (parseEnum(
        rowField(row, 'bagian_artikel'),
        [
          'penerima_manfaat',
          'hasil_program',
          'cerita_program',
          'ukuran_keberhasilan',
        ] as const,
        'Foto_Kegiatan.bagian_artikel',
      ) as ActivityArticleSection)
    : null,
  driveFile: normalizeRequiredString(rowField(row, 'drive_file')),
  alt: normalizeRequiredString(rowField(row, 'alt')),
  caption: normalizeOptionalString(rowField(row, 'caption')),
  description: normalizeOptionalString(rowField(row, 'deskripsi')),
  order: parseRequiredInteger(rowField(row, 'urutan'), 'Foto_Kegiatan.urutan'),
  verificationStatus: parseEnum(
    rowField(row, 'status_verifikasi'),
    ['draft', 'verified'] as const,
    'Foto_Kegiatan.status_verifikasi',
  ) as VerificationStatus,
  active: parseSheetBoolean(rowField(row, 'aktif'), 'Foto_Kegiatan.aktif'),
});

export const normalizeUmkmRow = (row: RawSheetRow): UmkmData => ({
  id: normalizeRequiredString(rowField(row, 'umkm_id')),
  groupId: normalizeGroupId(rowField(row, 'id_kelompok')),
  slug: normalizeSlug(rowField(row, 'slug')),
  name: normalizeRequiredString(rowField(row, 'nama')),
  owner: normalizeOptionalString(rowField(row, 'pemilik')),
  category: normalizeRequiredString(rowField(row, 'kategori')),
  tagline: normalizeOptionalString(rowField(row, 'tagline')),
  shortDescription: normalizeRequiredString(rowField(row, 'deskripsi_singkat')),
  heroPhoto: normalizeOptionalString(rowField(row, 'foto_hero')),
  whatsapp: normalizeWhatsapp(rowField(row, 'whatsapp')),
  address: normalizeOptionalString(rowField(row, 'alamat')),
  mapsEmbed: normalizeOptionalString(rowField(row, 'maps_embed')),
  openingHours: normalizeOptionalString(rowField(row, 'jam_operasional')),
  assistance: parseCommaSeparated(rowField(row, 'pendampingan')),
  catalogUrl: normalizeOptionalString(rowField(row, 'catalog_url')),
  qrisImage: normalizeOptionalString(rowField(row, 'qris_image')),
  story: normalizeOptionalString(rowField(row, 'cerita_usaha')),
  uniqueness: normalizeOptionalString(rowField(row, 'keunikan')),
  assistanceImpact: normalizeOptionalString(rowField(row, 'dampak_pendampingan')),
  verificationStatus: parseEnum(
    rowField(row, 'status_verifikasi'),
    ['draft', 'verified'] as const,
    'UMKM.status_verifikasi',
  ) as VerificationStatus,
  active: parseSheetBoolean(rowField(row, 'aktif'), 'UMKM.aktif'),
});

export const normalizeProductRow = (row: RawSheetRow): ProductData => ({
  id: normalizeRequiredString(rowField(row, 'produk_id')),
  umkmId: normalizeRequiredString(rowField(row, 'umkm_id')),
  name: normalizeRequiredString(rowField(row, 'nama_produk')),
  price: normalizeOptionalString(rowField(row, 'harga')),
  description: normalizeOptionalString(rowField(row, 'deskripsi')),
  photo: normalizeOptionalString(rowField(row, 'foto')),
  active: parseSheetBoolean(rowField(row, 'aktif'), 'Produk.aktif'),
});
