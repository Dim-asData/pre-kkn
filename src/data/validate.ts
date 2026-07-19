import type { z } from 'astro/zod';
import { REQUIRED_SHEET_HEADERS } from './config.ts';
import {
  activityArticleDataSchema,
  activityDataSchema,
  activityPhotoSchema,
  beneficiarySchema,
  groupDataSchema,
  productDataSchema,
  programOutputSchema,
  sheetsDataSchema,
  siteSettingsSchema,
  successIndicatorSchema,
  umkmDataSchema,
} from './schemas.ts';
import type { SheetName, SheetsData, SiteSettings } from './types.ts';

export interface SheetsValidationResult {
  data: SheetsData;
  warnings: string[];
}

interface ValidationIssue {
  path: PropertyKey[];
  message: string;
}

const formatIssues = (issues: ValidationIssue[]): string =>
  issues.map((issue) => `${issue.path.join('.') || 'row'}: ${issue.message}`).join('; ');

export const validateSheetHeaders = (sheet: SheetName, headers: string[]): void => {
  const expected = REQUIRED_SHEET_HEADERS[sheet];
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  const missing = expected.filter((header) => !headers.includes(header));
  const unexpected = headers.filter((header) => !expected.includes(header));
  const orderChanged =
    missing.length === 0 &&
    unexpected.length === 0 &&
    duplicates.length === 0 &&
    (headers.length !== expected.length ||
      headers.some((header, index) => header !== expected[index]));

  const problems = [
    duplicates.length ? `duplikat: ${[...new Set(duplicates)].join(', ')}` : null,
    missing.length ? `hilang: ${missing.join(', ')}` : null,
    unexpected.length ? `tidak dikenal: ${unexpected.join(', ')}` : null,
    orderChanged ? 'urutan kolom berbeda' : null,
  ].filter(Boolean);

  if (problems.length) {
    throw new Error(`Header Sheet ${sheet} berubah (${problems.join('; ')}). Lakukan migrasi schema.`);
  }
};

export const validateNormalizedRows = <T>(
  sheet: SheetName,
  rows: unknown[],
  schema: z.ZodType<T>,
): T[] =>
  rows.map((row, index) => {
    const result = schema.safeParse(row);
    if (!result.success) {
      throw new Error(`Data ${sheet} baris ${index + 2} tidak valid: ${formatIssues(result.error.issues)}`);
    }
    return result.data;
  });

export const validateSettingsRows = (rows: SiteSettings[]): SiteSettings | null => {
  if (rows.length > 1) {
    throw new Error('Sheet Pengaturan hanya boleh memiliki satu baris data.');
  }
  return rows[0] ?? null;
};

const assertUnique = (values: string[], label: string): void => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });

  if (duplicates.size) {
    throw new Error(`${label} duplikat: ${[...duplicates].join(', ')}.`);
  }
};

const isLikelyUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const sentenceCount = (value: string): number =>
  value
    .split(/[.!?]+(?:\s+|$)/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;

const assertKnown = (
  ids: ReadonlySet<string>,
  id: string,
  source: string,
  target: string,
): void => {
  if (!ids.has(id)) {
    throw new Error(`${source} merujuk ${target} yang tidak tersedia: ${id}.`);
  }
};

export const validateSheetsData = (input: SheetsData): SheetsValidationResult => {
  const parsed = sheetsDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Data Google Sheets tidak valid: ${formatIssues(parsed.error.issues)}`);
  }

  const data = parsed.data;
  const warnings: string[] = [];

  assertUnique(data.groups.map(({ id }) => id), 'ID kelompok');
  assertUnique(data.activities.map(({ id }) => id), 'kegiatan_id');
  assertUnique(
    data.activities.map(({ groupId, slug }) => `${groupId}/${slug}`),
    'Route kegiatan kelompok/slug',
  );
  assertUnique(data.activityArticles.map(({ activityId }) => activityId), 'Artikel kegiatan');
  assertUnique(data.beneficiaries.map(({ id }) => id), 'penerima_id');
  assertUnique(data.outputs.map(({ id }) => id), 'output_id');
  assertUnique(data.indicators.map(({ id }) => id), 'indikator_id');
  assertUnique(data.activityPhotos.map(({ id }) => id), 'foto_id');
  assertUnique(data.umkm.map(({ id }) => id), 'umkm_id');
  assertUnique(
    data.umkm.map(({ groupId, slug }) => `${groupId}/${slug}`),
    'Route UMKM kelompok/slug',
  );
  assertUnique(data.products.map(({ id }) => id), 'produk_id');
  assertUnique(
    data.outputs.map(({ activityId, outputNumber }) => `${activityId}/${outputNumber}`),
    'nomor_output per kegiatan',
  );

  const groupIds = new Set(data.groups.map(({ id }) => id));
  const activityIds = new Set(data.activities.map(({ id }) => id));
  const outputIds = new Set(data.outputs.map(({ id }) => id));
  const outputById = new Map(data.outputs.map((output) => [output.id, output] as const));
  const indicatorIds = new Set(data.indicators.map(({ id }) => id));
  const indicatorById = new Map(data.indicators.map((indicator) => [indicator.id, indicator] as const));
  const umkmIds = new Set(data.umkm.map(({ id }) => id));

  data.activities.forEach((activity) => {
    assertKnown(groupIds, activity.groupId, `Kegiatan ${activity.id}`, 'kelompok');
  });
  data.activityArticles.forEach((article) => {
    assertKnown(activityIds, article.activityId, 'Artikel_Kegiatan', 'kegiatan_id');
  });
  data.beneficiaries.forEach((beneficiary) => {
    assertKnown(
      activityIds,
      beneficiary.activityId,
      `Penerima_Manfaat ${beneficiary.id}`,
      'kegiatan_id',
    );
  });
  data.outputs.forEach((output) => {
    assertKnown(activityIds, output.activityId, `Output_Program ${output.id}`, 'kegiatan_id');
  });
  data.indicators.forEach((indicator) => {
    assertKnown(activityIds, indicator.activityId, `Indikator ${indicator.id}`, 'kegiatan_id');
  });
  data.umkm.forEach((item) => {
    assertKnown(groupIds, item.groupId, `UMKM ${item.id}`, 'kelompok');
  });
  data.products.forEach((product) => {
    assertKnown(umkmIds, product.umkmId, `Produk ${product.id}`, 'umkm_id');
  });

  data.activityPhotos.forEach((photo) => {
    assertKnown(activityIds, photo.activityId, `Foto_Kegiatan ${photo.id}`, 'kegiatan_id');

    if (
      photo.role === 'narrative' &&
      photo.articleSection === 'cerita_program' &&
      photo.active &&
      photo.verificationStatus === 'verified'
    ) {
      if (!photo.description) {
        throw new Error(
          `Foto_Kegiatan ${photo.id} pada cerita_program wajib memiliki deskripsi.`,
        );
      }
      if (sentenceCount(photo.description) < 3) {
        throw new Error(
          `Foto_Kegiatan ${photo.id} pada cerita_program wajib memiliki deskripsi minimal 3 kalimat.`,
        );
      }
    }

    if (photo.role === 'output' && !photo.outputId) {
      throw new Error(`Foto_Kegiatan ${photo.id} dengan peran output wajib memiliki output_id.`);
    }

    if (photo.outputId) {
      assertKnown(outputIds, photo.outputId, `Foto_Kegiatan ${photo.id}`, 'output_id');
      const output = outputById.get(photo.outputId);
      if (output && output.activityId !== photo.activityId) {
        throw new Error(
          `Foto_Kegiatan ${photo.id} dan Output_Program ${photo.outputId} harus berada pada kegiatan_id yang sama.`,
        );
      }
    }

    if (photo.indicatorId) {
      assertKnown(indicatorIds, photo.indicatorId, `Foto_Kegiatan ${photo.id}`, 'indikator_id');
      const indicator = indicatorById.get(photo.indicatorId);
      if (indicator && indicator.activityId !== photo.activityId) {
        throw new Error(
          `Foto_Kegiatan ${photo.id} dan Indikator ${photo.indicatorId} harus berada pada kegiatan_id yang sama.`,
        );
      }
    }
  });

  const activeHeroesByActivity = new Map<string, string[]>();
  data.activityPhotos
    .filter(({ role, active }) => role === 'hero' && active)
    .forEach((photo) => {
      const ids = activeHeroesByActivity.get(photo.activityId) ?? [];
      ids.push(photo.id);
      activeHeroesByActivity.set(photo.activityId, ids);
    });
  activeHeroesByActivity.forEach((photoIds, activityId) => {
    if (photoIds.length > 1) {
      throw new Error(
        `Kegiatan ${activityId} memiliki lebih dari satu hero aktif: ${photoIds.join(', ')}.`,
      );
    }
  });

  data.activities.forEach((activity) => {
    const beneficiaries = data.beneficiaries.filter(
      ({ activityId }) => activityId === activity.id,
    );
    const outputs = data.outputs.filter(({ activityId }) => activityId === activity.id);
    const indicators = data.indicators.filter(({ activityId }) => activityId === activity.id);

    if (activity.status === 'completed' && !activity.actualDate) {
      throw new Error(
        `Kegiatan ${activity.id} berstatus completed wajib memiliki tanggal_realisasi.`,
      );
    }

    const hasActualData =
      activity.actualDate !== null ||
      beneficiaries.some(({ actual }) => actual !== null) ||
      outputs.some(({ actual }) => actual !== null) ||
      indicators.some(({ achieved, evidence }) => achieved !== null || evidence !== null);

    if (activity.status === 'planned' && hasActualData) {
      throw new Error(
        `Kegiatan ${activity.id} berstatus planned tidak boleh memiliki data actual, achieved, atau evidence realisasi.`,
      );
    }

    if (activity.active && activity.verificationStatus !== 'verified') {
      warnings.push(`${activity.id} aktif tetapi masih draft; kegiatan tidak akan dipublikasikan.`);
    }
    if (activity.active && activity.status === 'draft') {
      warnings.push(`${activity.id} berstatus draft; kegiatan tidak akan dipublikasikan.`);
    }
  });

  data.umkm.forEach((item) => {
    if (item.active && item.verificationStatus !== 'verified') {
      warnings.push(`${item.slug} aktif tetapi masih draft; UMKM tidak akan dipublikasikan.`);
    }
    if (item.mapsEmbed && !isLikelyUrl(item.mapsEmbed)) {
      warnings.push(`Map ${item.slug} tidak valid; tampilan harus memakai fallback.`);
    }
    if (item.catalogUrl && !isLikelyUrl(item.catalogUrl)) {
      warnings.push(`URL katalog ${item.slug} tidak valid; tautan tidak akan ditampilkan.`);
    }
  });

  return { data, warnings };
};

export const publicSheetsData = (data: SheetsData): SheetsData => {
  const publicGroups = data.groups.filter(({ active }) => active);
  const publicGroupIds = new Set(publicGroups.map(({ id }) => id));
  const publicActivities = data.activities.filter(
    ({ active, verificationStatus, status, groupId }) =>
      active &&
      verificationStatus === 'verified' &&
      status !== 'draft' &&
      publicGroupIds.has(groupId),
  );
  const publicActivityIds = new Set(publicActivities.map(({ id }) => id));
  const publicOutputs = data.outputs.filter(
    ({ activityId, verificationStatus }) =>
      publicActivityIds.has(activityId) && verificationStatus === 'verified',
  );
  const publicOutputIds = new Set(publicOutputs.map(({ id }) => id));
  const publicIndicators = data.indicators.filter(({ activityId }) =>
    publicActivityIds.has(activityId),
  );
  const publicIndicatorIds = new Set(publicIndicators.map(({ id }) => id));
  const publicUmkm = data.umkm.filter(
    ({ active, verificationStatus, groupId }) =>
      active && verificationStatus === 'verified' && publicGroupIds.has(groupId),
  );
  const publicUmkmIds = new Set(publicUmkm.map(({ id }) => id));

  return {
    settings: data.settings,
    groups: publicGroups,
    activities: publicActivities,
    activityArticles: data.activityArticles.filter(({ activityId }) =>
      publicActivityIds.has(activityId),
    ),
    beneficiaries: data.beneficiaries.filter(({ activityId }) =>
      publicActivityIds.has(activityId),
    ),
    outputs: publicOutputs,
    indicators: publicIndicators,
    activityPhotos: data.activityPhotos.filter(
      ({
        activityId,
        outputId,
        indicatorId,
        active,
        verificationStatus,
      }) =>
        publicActivityIds.has(activityId) &&
        active &&
        verificationStatus === 'verified' &&
        (!outputId || publicOutputIds.has(outputId)) &&
        (!indicatorId || publicIndicatorIds.has(indicatorId)),
    ),
    umkm: publicUmkm,
    products: data.products.filter(
      ({ active, umkmId }) => active && publicUmkmIds.has(umkmId),
    ),
  };
};

export const rowSchemas = {
  Pengaturan: siteSettingsSchema,
  Kelompok: groupDataSchema,
  Kegiatan: activityDataSchema,
  Artikel_Kegiatan: activityArticleDataSchema,
  Penerima_Manfaat: beneficiarySchema,
  Output_Program: programOutputSchema,
  Indikator: successIndicatorSchema,
  Foto_Kegiatan: activityPhotoSchema,
  UMKM: umkmDataSchema,
  Produk: productDataSchema,
} as const;
