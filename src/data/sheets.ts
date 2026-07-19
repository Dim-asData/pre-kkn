import { createEmptySheetsData, googleSheetCsvUrl, SHEET_TABS } from './config.ts';
import {
  normalizeActivityArticleRow,
  normalizeActivityPhotoRow,
  normalizeActivityRow,
  normalizeBeneficiaryRow,
  normalizeGroupRow,
  normalizeProductRow,
  normalizeProgramOutputRow,
  normalizeSettingsRow,
  normalizeSuccessIndicatorRow,
  normalizeUmkmRow,
} from './normalize.ts';
import {
  rowSchemas,
  validateNormalizedRows,
  validateSettingsRows,
  validateSheetHeaders,
  validateSheetsData,
} from './validate.ts';
import type { ParsedCsv, RawSheetRow, SheetName, SheetsData } from './types.ts';

export interface LoadSheetsOptions {
  sheetId?: string;
  required?: boolean;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

export interface LoadedSheets {
  data: SheetsData;
  warnings: string[];
  connected: boolean;
}

class SheetsConnectionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SheetsConnectionError';
  }
}

let defaultLoadPromise: Promise<LoadedSheets> | null = null;

const parseCsvMatrix = (input: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field === '') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else if (character !== '\r') {
      field += character;
    }
  }

  if (quoted) throw new Error('CSV berakhir di tengah quoted field.');
  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
};

export const parseCsv = (input: string): ParsedCsv => {
  const matrix = parseCsvMatrix(input.replace(/^\uFEFF/, ''));
  if (!matrix.length) throw new Error('CSV kosong dan tidak memiliki header.');

  const headers = matrix[0].map((header) => header.trim());
  if (headers.some((header) => header === '')) throw new Error('CSV memiliki nama header kosong.');

  const rows = matrix.slice(1).map((cells, index): RawSheetRow => {
    if (cells.length !== headers.length) {
      throw new Error(
        `CSV baris ${index + 2} memiliki ${cells.length} kolom; seharusnya ${headers.length}.`,
      );
    }

    return Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex].trim()]));
  });

  return { headers, rows };
};

const fetchTabCsv = async (
  sheetId: string,
  tab: SheetName,
  fetchImpl: typeof fetch,
  signal?: AbortSignal,
): Promise<string> => {
  let response: Response;
  try {
    response = await fetchImpl(googleSheetCsvUrl(sheetId, tab), {
      headers: { accept: 'text/csv' },
      signal,
    });
  } catch (error) {
    throw new SheetsConnectionError(`Gagal terhubung ke Sheet ${tab}.`, { cause: error });
  }

  if (!response.ok) {
    throw new SheetsConnectionError(
      `Gagal membaca Sheet ${tab}: HTTP ${response.status} ${response.statusText}.`,
    );
  }

  try {
    return await response.text();
  } catch (error) {
    throw new SheetsConnectionError(`Respons Sheet ${tab} tidak dapat dibaca.`, { cause: error });
  }
};

const configuredSheetId = (explicitSheetId?: string): string | undefined => {
  const nodeSheetId =
    typeof process !== 'undefined' ? process.env?.PUBLIC_SHEET_ID?.trim() : undefined;
  const astroSheetId = import.meta.env?.PUBLIC_SHEET_ID?.trim();
  return explicitSheetId?.trim() || nodeSheetId || astroSheetId || undefined;
};

const connectionFallback = (message: string): LoadedSheets => ({
  data: createEmptySheetsData(),
  warnings: [`Google Sheets tidak dapat dibaca; data menggunakan empty state aman. ${message}`],
  connected: false,
});

const loadSheetsDataUncached = async (options: LoadSheetsOptions = {}): Promise<LoadedSheets> => {
  const sheetId = configuredSheetId(options.sheetId);
  if (!sheetId) {
    if (options.required) {
      throw new Error('PUBLIC_SHEET_ID wajib diisi untuk memuat data Google Sheets.');
    }

    return {
      data: createEmptySheetsData(),
      warnings: ['PUBLIC_SHEET_ID belum diisi; data Sheets menggunakan empty state aman.'],
      connected: false,
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let csvEntries: readonly (readonly [SheetName, string])[];
  try {
    csvEntries = await Promise.all(
      SHEET_TABS.map(
        async (tab) =>
          [tab, await fetchTabCsv(sheetId, tab, fetchImpl, options.signal)] as const,
      ),
    );
  } catch (error) {
    if (!(error instanceof SheetsConnectionError) || options.required) throw error;
    return connectionFallback(error.message);
  }

  // Mulai titik ini koneksi telah berhasil. Error CSV/header/schema/relasi
  // merupakan error konten dan selalu menggagalkan build, termasuk required=false.
  const rawSheets = Object.fromEntries(
    csvEntries.map(([tab, csv]) => {
      const parsed = parseCsv(csv);
      validateSheetHeaders(tab, parsed.headers);
      return [tab, parsed.rows] as const;
    }),
  ) as Record<SheetName, RawSheetRow[]>;

  const settings = validateSettingsRows(
    validateNormalizedRows(
      'Pengaturan',
      rawSheets.Pengaturan.map(normalizeSettingsRow),
      rowSchemas.Pengaturan,
    ),
  );
  const groups = validateNormalizedRows(
    'Kelompok',
    rawSheets.Kelompok.map(normalizeGroupRow),
    rowSchemas.Kelompok,
  );
  const activities = validateNormalizedRows(
    'Kegiatan',
    rawSheets.Kegiatan.map(normalizeActivityRow),
    rowSchemas.Kegiatan,
  );
  const activityArticles = validateNormalizedRows(
    'Artikel_Kegiatan',
    rawSheets.Artikel_Kegiatan.map(normalizeActivityArticleRow),
    rowSchemas.Artikel_Kegiatan,
  );
  const beneficiaries = validateNormalizedRows(
    'Penerima_Manfaat',
    rawSheets.Penerima_Manfaat.map(normalizeBeneficiaryRow),
    rowSchemas.Penerima_Manfaat,
  );
  const outputs = validateNormalizedRows(
    'Output_Program',
    rawSheets.Output_Program.map(normalizeProgramOutputRow),
    rowSchemas.Output_Program,
  );
  const indicators = validateNormalizedRows(
    'Indikator',
    rawSheets.Indikator.map(normalizeSuccessIndicatorRow),
    rowSchemas.Indikator,
  );
  const activityPhotos = validateNormalizedRows(
    'Foto_Kegiatan',
    rawSheets.Foto_Kegiatan.map(normalizeActivityPhotoRow),
    rowSchemas.Foto_Kegiatan,
  );
  const umkm = validateNormalizedRows(
    'UMKM',
    rawSheets.UMKM.map(normalizeUmkmRow),
    rowSchemas.UMKM,
  );
  const products = validateNormalizedRows(
    'Produk',
    rawSheets.Produk.map(normalizeProductRow),
    rowSchemas.Produk,
  );

  const validation = validateSheetsData({
    settings,
    groups,
    activities,
    activityArticles,
    beneficiaries,
    outputs,
    indicators,
    activityPhotos,
    umkm,
    products,
  });

  return { ...validation, connected: true };
};

export const loadSheetsData = async (options: LoadSheetsOptions = {}): Promise<LoadedSheets> => {
  const usesDefaultRequest =
    options.sheetId === undefined &&
    options.fetchImpl === undefined &&
    options.signal === undefined &&
    options.required !== true;

  if (!usesDefaultRequest) return loadSheetsDataUncached(options);

  defaultLoadPromise ??= loadSheetsDataUncached(options);
  return defaultLoadPromise;
};

export const resetSheetsDataCache = (): void => {
  defaultLoadPromise = null;
};
