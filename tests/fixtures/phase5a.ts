import { REQUIRED_SHEET_HEADERS } from '../../src/data/config.ts';
import type {
  ActivityArticleData,
  ActivityData,
  ActivityPhoto,
  Beneficiary,
  GroupData,
  ProductData,
  ProgramOutput,
  RawSheetRow,
  SheetName,
  SheetsData,
  SuccessIndicator,
  UmkmData,
} from '../../src/data/types.ts';

export const ACTIVITY_ROUTES = [
  ['t1', 'sosialisasi-digital-marketing'],
  ['t1', 'edukasi-bahaya-game-online'],
  ['t2', 'pelatihan-branding-dan-pengemasan'],
  ['t2', 'pojok-bermain-edukatif'],
  ['t3', 'katalog-digital-dan-qris'],
  ['t3', 'workshop-pencegahan-cyberbullying'],
  ['t3', 'bookmark-dan-bantuan-alat-olahraga'],
] as const;

export const T1_ACTIVITY_ID = 'kegiatan-t1-sosialisasi-digital-marketing';

export const T1_PHOTO_DRIVE_IDS = [
  '1UrpAsYfu-sMmEhL2uwGfK_vzexirkXa0',
  '1V4Pcm6y9pxl7rKQjUrF-NSBd3IygFXRe',
  '1HiUilZhUc-AdKL7vLSLmqYNEPL06KN7u',
  '1xyW0tC0VcZA_kO62H5UWY1olbO5zxOgC',
  '1prBVdIKuYzysLgVyenjS1wezE6Euxpch',
  '1EaSOT7KobicRI9pNa65E_H9-BBdXRsOh',
  '1hDkIonJ5DUWiaD8pYNxM215C-Yo1bLXP',
  '1bCxg6Ql366XtEqVYMq9ovMzgB4lG600N',
  '1qkFpbTRAf52Ir1KsUHX80-DYdFYx7zeX',
  '1BD9wS00lm7SxA0xZzgD3PSFQugwbrS4X',
  '18b_BQZj3ICcCcqM6uUxUmkdA7zLuZ08g',
  '1pvi_xHu5S5dDFno89cnylVaZR9k0i6AH',
  '1x6AYDLenxxo-TFjr-hssyK0wl58tNPgP',
  '1PUy3oLGGbjcFbX-eg2T7Sbzbv-aOhfsc',
  '1oBGTbDI2S6SA1coTTzX0EBSCrxHgjhtt',
] as const;

export const T1_STORY_PHOTO_DESCRIPTIONS = [
  'Foto ini memperlihatkan pembukaan kegiatan. Tahap ini menjadi awal rangkaian program. Narasi tetap berasal dari data terverifikasi.',
  'Foto ini memperlihatkan pemaparan materi. Materi menjadi bagian dari rangkaian kegiatan. Narasi tidak menyatakan capaian peserta.',
  'Foto ini memperlihatkan sesi praktik. Praktik berada dalam urutan cerita program. Narasi tidak mengarang hasil akhir.',
  'Foto ini memperlihatkan penggunaan katalog. Katalog menjadi konteks kegiatan digital. Narasi tidak menyatakan penerapan akhir.',
  'Foto ini memperlihatkan contoh hasil pendampingan. Contoh tersebut menjadi bagian dari dokumentasi. Narasi tidak menyatakan dampak komersial.',
] as const;

const groups: GroupData[] = [
  {
    id: 't1',
    name: 'Kelompok T1',
    village: 'Desa Sumbakeling',
    programTheme: 'Pemasaran digital dan edukasi',
    shortDescription: 'Pendampingan UMKM dan edukasi penggunaan gadget sehat.',
    thumbnail: null,
    active: true,
  },
  {
    id: 't2',
    name: 'Kelompok T2',
    village: 'Desa Silebu',
    programTheme: 'Branding dan ruang belajar',
    shortDescription: 'Penguatan identitas usaha dan kegiatan belajar anak.',
    thumbnail: null,
    active: true,
  },
  {
    id: 't3',
    name: 'Kelompok T3',
    village: 'Desa Pancalang',
    programTheme: 'Digitalisasi dan program pendukung',
    shortDescription: 'Katalog digital, literasi aman, dan bantuan pendukung.',
    thumbnail: null,
    active: true,
  },
];

const activityTitle = (slug: string): string =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const activities: ActivityData[] = ACTIVITY_ROUTES.map(([groupId, slug], index) => ({
  id: `kegiatan-${groupId}-${slug}`,
  groupId,
  slug,
  title: activityTitle(slug),
  category:
    slug.includes('branding') || slug.includes('katalog')
      ? 'umkm'
      : slug.includes('bookmark')
        ? 'aid_distribution'
        : 'education',
  status: index === 0 ? 'ongoing' : 'planned',
  csrPillars: ['Pendidikan'],
  tags: ['Program KKN', groupId.toUpperCase()],
  plannedDate: null,
  actualDate: null,
  location: groups.find(({ id }) => id === groupId)?.village ?? '',
  shortDescription: `Rencana ${activityTitle(slug).toLowerCase()}.`,
  driveFolderId: null,
  verificationStatus: 'verified',
  active: true,
}));

const articles: ActivityArticleData[] = activities.map((activity, index) => ({
  activityId: activity.id,
  beneficiaryNarrative:
    index === 0
      ? 'Pelaku UMKM menjadi sasaran kegiatan.\n\nTeks <script>alert("uji")</script> harus tetap menjadi teks biasa.'
      : 'Penerima manfaat masih berupa sasaran rencana dan belum boleh dibaca sebagai realisasi.',
  programResultsNarrative:
    index === 0 ? 'Materi dan akun usaha disiapkan sebagai output program.' : null,
  programStory: 'Kegiatan direncanakan bersama mitra setempat dan akan diverifikasi setelah berjalan.',
  successMeasureNarrative: 'Keberhasilan belum dinyatakan sampai indikator dan bukti diverifikasi.',
}));

const beneficiaries: Beneficiary[] = activities.map((activity, index) => ({
  id: `penerima-${activity.groupId}-${activity.slug}-01`,
  activityId: activity.id,
  label: 'Sasaran program',
  planned: 20 + index,
  actual: null,
  unit: 'orang',
  order: 1,
}));

const outputs: ProgramOutput[] = Array.from({ length: 4 }, (_, index) => ({
  id: `output-t1-sosialisasi-digital-marketing-${String(index + 1).padStart(2, '0')}`,
  activityId: T1_ACTIVITY_ID,
  outputNumber: index + 1,
  type: index < 2 ? 'non_physical' : 'physical',
  name: `Output kegiatan ${index + 1}`,
  planned: 1,
  actual: null,
  unit: 'paket',
  recipient: null,
  verificationStatus: 'verified',
  order: index + 1,
  image: null,
  imageAlt: null,
  imageCaption: null,
}));

const indicators: SuccessIndicator[] = Array.from({ length: 3 }, (_, index) => ({
  id: `indikator-t1-sosialisasi-digital-marketing-${String(index + 1).padStart(2, '0')}`,
  activityId: T1_ACTIVITY_ID,
  label: `Indikator program ${index + 1}`,
  achieved: null,
  evidence: null,
  order: index + 1,
}));

const photoContext = (
  index: number,
): Pick<ActivityPhoto, 'role' | 'articleSection' | 'outputId' | 'indicatorId'> => {
  if (index === 0) {
    return { role: 'hero', articleSection: null, outputId: null, indicatorId: null };
  }
  if (index <= 2) {
    return {
      role: 'narrative',
      articleSection: 'penerima_manfaat',
      outputId: null,
      indicatorId: null,
    };
  }
  if (index <= 6) {
    return {
      role: 'output',
      articleSection: 'hasil_program',
      outputId: outputs[index - 3].id,
      indicatorId: null,
    };
  }
  if (index <= 11) {
    return {
      role: 'narrative',
      articleSection: 'cerita_program',
      outputId: null,
      indicatorId: null,
    };
  }
  return {
    role: 'evidence',
    articleSection: 'ukuran_keberhasilan',
    outputId: null,
    indicatorId: indicators[index - 12].id,
  };
};

const activityPhotos: ActivityPhoto[] = T1_PHOTO_DRIVE_IDS.map((driveId, index) => ({
  id: `foto-t1-sosialisasi-digital-marketing-${String(index + 1).padStart(2, '0')}`,
  activityId: T1_ACTIVITY_ID,
  ...photoContext(index),
  driveFile: `drive://${driveId}`,
  alt: `Dokumentasi sosialisasi digital marketing ${index + 1}`,
  caption: `Konteks foto artikel ${index + 1}`,
  description:
    index >= 7 && index <= 11 ? T1_STORY_PHOTO_DESCRIPTIONS[index - 7] : null,
  order: index + 1,
  verificationStatus: 'verified',
  active: true,
}));

const umkm: UmkmData[] = [
  {
    id: 'umkm-t1-warung-dummy',
    groupId: 't1',
    slug: 'warung-dummy',
    name: '[DUMMY] Warung Sumbakeling',
    owner: '[DUMMY] Pemilik',
    category: 'Kuliner',
    tagline: 'Contoh profil yang belum diverifikasi lapangan',
    shortDescription: '[DUMMY] Data prototipe dipertahankan sampai verifikasi.',
    heroPhoto: 'https://placehold.co/1200x800.webp?text=UMKM',
    whatsapp: null,
    address: null,
    mapsEmbed: null,
    openingHours: null,
    assistance: ['[DUMMY] Pendampingan'],
    catalogUrl: null,
    qrisImage: null,
    story: null,
    uniqueness: null,
    assistanceImpact: null,
    verificationStatus: 'verified',
    active: true,
  },
];

const products: ProductData[] = [
  {
    id: 'produk-umkm-t1-warung-dummy-produk-dummy',
    umkmId: umkm[0].id,
    name: '[DUMMY] Produk',
    price: null,
    description: '[DUMMY] Produk prototipe.',
    photo: 'https://placehold.co/800x800.webp?text=Produk',
    active: true,
  },
];

export const createProductionSheetsData = (): SheetsData =>
  structuredClone({
    settings: {
      productionMode: true,
      autoRebuild: false,
      lastPublishedAt: null,
      lastPublishStatus: 'never',
    },
    groups,
    activities,
    activityArticles: articles,
    beneficiaries,
    outputs,
    indicators,
    activityPhotos,
    umkm,
    products,
  });

const bool = (value: boolean): string => (value ? 'TRUE' : 'FALSE');
const value = (input: string | number | boolean | null): string =>
  input === null ? '' : typeof input === 'boolean' ? bool(input) : String(input);

export const createProductionRawRows = (): Record<SheetName, RawSheetRow[]> => {
  const data = createProductionSheetsData();
  return {
    Pengaturan: data.settings
      ? [
          {
            mode_produksi: bool(data.settings.productionMode),
            auto_rebuild: bool(data.settings.autoRebuild),
            waktu_publish_terakhir: value(data.settings.lastPublishedAt),
            status_publish_terakhir: value(data.settings.lastPublishStatus),
          },
        ]
      : [],
    Kelompok: data.groups.map((group) => ({
      id_kelompok: group.id,
      nama_kelompok: group.name,
      desa: group.village,
      tema_program: group.programTheme,
      deskripsi_singkat: group.shortDescription,
      thumbnail: value(group.thumbnail),
      aktif: bool(group.active),
    })),
    Kegiatan: data.activities.map((activity) => ({
      kegiatan_id: activity.id,
      id_kelompok: activity.groupId,
      slug: activity.slug,
      judul: activity.title,
      kategori: activity.category,
      status: activity.status,
      csr_pillars: activity.csrPillars.join(', '),
      tags: activity.tags.join(', '),
      tanggal_rencana: value(activity.plannedDate),
      tanggal_realisasi: value(activity.actualDate),
      lokasi: activity.location,
      deskripsi_singkat: activity.shortDescription,
      drive_folder_id: value(activity.driveFolderId),
      status_verifikasi: activity.verificationStatus,
      aktif: bool(activity.active),
    })),
    Artikel_Kegiatan: data.activityArticles.map((article) => ({
      kegiatan_id: article.activityId,
      penerima_manfaat_narasi: value(article.beneficiaryNarrative),
      hasil_program_narasi: value(article.programResultsNarrative),
      cerita_program: value(article.programStory),
      ukuran_keberhasilan_narasi: value(article.successMeasureNarrative),
    })),
    Penerima_Manfaat: data.beneficiaries.map((beneficiary) => ({
      penerima_id: beneficiary.id,
      kegiatan_id: beneficiary.activityId,
      label: beneficiary.label,
      planned: value(beneficiary.planned),
      actual: value(beneficiary.actual),
      unit: beneficiary.unit,
      urutan: String(beneficiary.order),
    })),
    Output_Program: data.outputs.map((output) => ({
      output_id: output.id,
      kegiatan_id: output.activityId,
      nomor_output: String(output.outputNumber),
      jenis_output: output.type,
      nama_output: output.name,
      planned: value(output.planned),
      actual: value(output.actual),
      unit: output.unit,
      penerima: value(output.recipient),
      status_verifikasi: output.verificationStatus,
      urutan: String(output.order),
    })),
    Indikator: data.indicators.map((indicator) => ({
      indikator_id: indicator.id,
      kegiatan_id: indicator.activityId,
      label: indicator.label,
      achieved: value(indicator.achieved),
      evidence: value(indicator.evidence),
      urutan: String(indicator.order),
    })),
    Foto_Kegiatan: data.activityPhotos.map((photo) => ({
      foto_id: photo.id,
      kegiatan_id: photo.activityId,
      output_id: value(photo.outputId),
      indikator_id: value(photo.indicatorId),
      peran: photo.role,
      bagian_artikel: value(photo.articleSection),
      drive_file: photo.driveFile,
      alt: photo.alt,
      caption: value(photo.caption),
      deskripsi: value(photo.description),
      urutan: String(photo.order),
      status_verifikasi: photo.verificationStatus,
      aktif: bool(photo.active),
    })),
    UMKM: data.umkm.map((item) => ({
      umkm_id: item.id,
      id_kelompok: item.groupId,
      slug: item.slug,
      nama: item.name,
      pemilik: value(item.owner),
      kategori: item.category,
      tagline: value(item.tagline),
      deskripsi_singkat: item.shortDescription,
      foto_hero: value(item.heroPhoto),
      whatsapp: value(item.whatsapp),
      alamat: value(item.address),
      maps_embed: value(item.mapsEmbed),
      jam_operasional: value(item.openingHours),
      pendampingan: item.assistance.join(', '),
      catalog_url: value(item.catalogUrl),
      qris_image: value(item.qrisImage),
      cerita_usaha: value(item.story),
      keunikan: value(item.uniqueness),
      dampak_pendampingan: value(item.assistanceImpact),
      status_verifikasi: item.verificationStatus,
      aktif: bool(item.active),
    })),
    Produk: data.products.map((product) => ({
      produk_id: product.id,
      umkm_id: product.umkmId,
      nama_produk: product.name,
      harga: value(product.price),
      deskripsi: value(product.description),
      foto: value(product.photo),
      aktif: bool(product.active),
    })),
  };
};

const csvCell = (cell: string): string => `"${cell.replace(/"/g, '""')}"`;

export const rawRowsToCsv = (sheet: SheetName, rows: readonly RawSheetRow[]): string => {
  const headers = REQUIRED_SHEET_HEADERS[sheet];
  return [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? '')).join(',')),
  ].join('\n');
};

export const createProductionCsvBySheet = (): Record<SheetName, string> => {
  const rows = createProductionRawRows();
  return Object.fromEntries(
    (Object.keys(REQUIRED_SHEET_HEADERS) as SheetName[]).map((sheet) => [
      sheet,
      rawRowsToCsv(sheet, rows[sheet]),
    ]),
  ) as Record<SheetName, string>;
};
