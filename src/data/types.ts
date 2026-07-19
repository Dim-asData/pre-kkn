export type KelompokId = 't1' | 't2' | 't3';

export type ContentStatus = 'draft' | 'planned' | 'ongoing' | 'completed' | 'cancelled';

export type ProgramCategory = 'umkm' | 'education' | 'aid_distribution' | 'supporting';

export type OutputType = 'physical' | 'non_physical';

export type VerificationStatus = 'draft' | 'verified';

export type ActivityPhotoRole = 'hero' | 'narrative' | 'output' | 'evidence';

export type ActivityArticleSection =
  | 'penerima_manfaat'
  | 'hasil_program'
  | 'cerita_program'
  | 'ukuran_keberhasilan';

export type SheetName =
  | 'Pengaturan'
  | 'Kelompok'
  | 'Kegiatan'
  | 'Artikel_Kegiatan'
  | 'Penerima_Manfaat'
  | 'Output_Program'
  | 'Indikator'
  | 'Foto_Kegiatan'
  | 'UMKM'
  | 'Produk';

export interface SiteSettings {
  productionMode: boolean;
  autoRebuild: boolean;
  lastPublishedAt: string | null;
  lastPublishStatus: string | null;
}

export interface GroupData {
  id: KelompokId;
  name: string;
  village: string;
  programTheme: string;
  shortDescription: string;
  /** Referensi mentah Drive/lokal. Resolusi URL dilakukan oleh photo pipeline/view. */
  thumbnail: string | null;
  active: boolean;
}

export interface ActivityData {
  id: string;
  groupId: KelompokId;
  slug: string;
  title: string;
  category: ProgramCategory;
  status: ContentStatus;
  csrPillars: string[];
  tags: string[];
  plannedDate: string | null;
  actualDate: string | null;
  location: string;
  shortDescription: string;
  driveFolderId: string | null;
  verificationStatus: VerificationStatus;
  active: boolean;
}

export interface ActivityArticleData {
  activityId: string;
  beneficiaryNarrative: string | null;
  programResultsNarrative: string | null;
  programStory: string | null;
  successMeasureNarrative: string | null;
}

export interface Beneficiary {
  id: string;
  activityId: string;
  label: string;
  planned: number | null;
  actual: number | null;
  unit: string;
  order: number;
}

export interface ProgramOutput {
  id: string;
  activityId: string;
  outputNumber: number;
  type: OutputType;
  name: string;
  planned: number | null;
  actual: number | null;
  unit: string;
  recipient: string | null;
  verificationStatus: VerificationStatus;
  order: number;
  /** Referensi mentah hasil join Foto_Kegiatan dengan peran output. */
  image?: string | null;
  imageAlt?: string | null;
  imageCaption?: string | null;
}

export interface SuccessIndicator {
  id: string;
  activityId: string;
  label: string;
  achieved: boolean | null;
  evidence: string | null;
  order: number;
}

export interface ActivityPhoto {
  id: string;
  activityId: string;
  outputId: string | null;
  indicatorId: string | null;
  role: ActivityPhotoRole;
  articleSection: ActivityArticleSection | null;
  /** Referensi mentah Drive/lokal. Normalizer tidak mengubahnya menjadi URL publik. */
  driveFile: string;
  alt: string;
  caption: string | null;
  /** Narasi artikel yang tampil setelah foto; berbeda dari caption singkat. */
  description: string | null;
  order: number;
  verificationStatus: VerificationStatus;
  active: boolean;
}

export interface ActivityDetail extends ActivityData {
  article: ActivityArticleData | null;
  beneficiaries: Beneficiary[];
  outputs: ProgramOutput[];
  indicators: SuccessIndicator[];
  photos: ActivityPhoto[];
  heroPhoto: ActivityPhoto | null;
}

export interface UmkmData {
  id: string;
  groupId: KelompokId;
  slug: string;
  name: string;
  owner: string | null;
  category: string;
  tagline: string | null;
  shortDescription: string;
  /** Referensi mentah Drive/lokal. */
  heroPhoto: string | null;
  whatsapp: string | null;
  address: string | null;
  mapsEmbed: string | null;
  openingHours: string | null;
  assistance: string[];
  catalogUrl: string | null;
  /** Referensi mentah Drive/lokal. */
  qrisImage: string | null;
  story: string | null;
  uniqueness: string | null;
  assistanceImpact: string | null;
  verificationStatus: VerificationStatus;
  active: boolean;
}

export interface ProductData {
  id: string;
  umkmId: string;
  name: string;
  price: string | null;
  description: string | null;
  /** Referensi mentah Drive/lokal. */
  photo: string | null;
  active: boolean;
}

export interface SheetsData {
  settings: SiteSettings | null;
  groups: GroupData[];
  activities: ActivityData[];
  activityArticles: ActivityArticleData[];
  beneficiaries: Beneficiary[];
  outputs: ProgramOutput[];
  indicators: SuccessIndicator[];
  activityPhotos: ActivityPhoto[];
  umkm: UmkmData[];
  products: ProductData[];
}

export type RawSheetRow = Record<string, string>;

export interface ParsedCsv {
  headers: string[];
  rows: RawSheetRow[];
}
