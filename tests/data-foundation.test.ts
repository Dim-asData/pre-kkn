import { describe, expect, it, vi } from 'vitest';
import { REQUIRED_SHEET_HEADERS, SHEET_TABS } from '../src/data/config.ts';
import {
  normalizeIsoDate,
  normalizeSlug,
  normalizeWhatsapp,
  parseNullableSheetBoolean,
  parseSheetBoolean,
} from '../src/data/normalize.ts';
import {
  activityArticleSectionSchema,
  activityPhotoRoleSchema,
  contentStatusSchema,
  kelompokIdSchema,
  outputTypeSchema,
  programCategorySchema,
  verificationStatusSchema,
} from '../src/data/schemas.ts';
import { loadSheetsData, parseCsv } from '../src/data/sheets.ts';
import type { SheetName } from '../src/data/types.ts';
import { validateSheetHeaders } from '../src/data/validate.ts';
import {
  createProductionCsvBySheet,
  createProductionRawRows,
  rawRowsToCsv,
  T1_ACTIVITY_ID,
} from './fixtures/phase5a.ts';

const fetchForCsv = (csvBySheet: Record<SheetName, string>): typeof fetch =>
  vi.fn(async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const sheet = url.searchParams.get('sheet') as SheetName;
    return new Response(csvBySheet[sheet], {
      status: 200,
      headers: { 'content-type': 'text/csv' },
    });
  }) as unknown as typeof fetch;

describe('kontrak sepuluh tab produksi', () => {
  it('mewajibkan nama dan urutan header untuk seluruh tab Fase 5A', () => {
    expect(SHEET_TABS).toEqual([
      'Pengaturan',
      'Kelompok',
      'Kegiatan',
      'Artikel_Kegiatan',
      'Penerima_Manfaat',
      'Output_Program',
      'Indikator',
      'Foto_Kegiatan',
      'UMKM',
      'Produk',
    ]);

    SHEET_TABS.forEach((sheet) => {
      const headers = [...REQUIRED_SHEET_HEADERS[sheet]];
      expect(() => validateSheetHeaders(sheet, headers)).not.toThrow();
      expect(() => validateSheetHeaders(sheet, headers.slice(1))).toThrow(
        `Header Sheet ${sheet} berubah`,
      );
      expect(() => validateSheetHeaders(sheet, [...headers].reverse())).toThrow(
        `Header Sheet ${sheet} berubah`,
      );
    });
  });

  it.each([
    ['id kelompok', kelompokIdSchema, ['t1', 't2', 't3']],
    [
      'status kegiatan',
      contentStatusSchema,
      ['draft', 'planned', 'ongoing', 'completed', 'cancelled'],
    ],
    ['kategori kegiatan', programCategorySchema, ['umkm', 'education', 'aid_distribution', 'supporting']],
    ['jenis output', outputTypeSchema, ['physical', 'non_physical']],
    ['status verifikasi', verificationStatusSchema, ['draft', 'verified']],
    ['peran foto', activityPhotoRoleSchema, ['hero', 'narrative', 'output', 'evidence']],
    [
      'bagian artikel foto',
      activityArticleSectionSchema,
      ['penerima_manfaat', 'hasil_program', 'cerita_program', 'ukuran_keberhasilan'],
    ],
  ] as const)('memvalidasi enum %s secara eksplisit', (_label, schema, allowed) => {
    allowed.forEach((value) => expect(schema.safeParse(value).success).toBe(true));
    expect(schema.safeParse('nilai-di-luar-dropdown').success).toBe(false);
  });

  it('memakai boolean eksplisit, tanggal YYYY-MM-DD, slug, dan nomor WhatsApp ternormalisasi', () => {
    expect(parseSheetBoolean('TRUE')).toBe(true);
    expect(parseSheetBoolean('FALSE')).toBe(false);
    expect(parseNullableSheetBoolean('')).toBeNull();
    expect(() => parseSheetBoolean('mungkin')).toThrow('tidak valid');

    expect(normalizeIsoDate('2026-08-17')).toBe('2026-08-17');
    expect(() => normalizeIsoDate('17/08/2026')).toThrow('YYYY-MM-DD');
    expect(() => normalizeIsoDate('2026-02-30')).toThrow('bukan tanggal yang valid');
    expect(normalizeSlug('  Keripik Pisang Ñona  ')).toBe('keripik-pisang-nona');
    expect(normalizeWhatsapp('0812-3456-7890')).toBe('6281234567890');
  });
});

describe('parser dan loader Google Sheets produksi', () => {
  it('mempertahankan koma, quote, dan multiline di dalam quoted field', () => {
    const parsed = parseCsv('nama,catatan\n"Keripik, Pisang","Baris 1\nBaris ""dua"""');

    expect(parsed.headers).toEqual(['nama', 'catatan']);
    expect(parsed.rows).toEqual([
      { nama: 'Keripik, Pisang', catatan: 'Baris 1\nBaris "dua"' },
    ]);
  });

  it('memuat, menormalisasi, dan memvalidasi seluruh sepuluh tab melalui satu loader', async () => {
    const csvBySheet = createProductionCsvBySheet();
    const fetchImpl = fetchForCsv(csvBySheet);
    const result = await loadSheetsData({
      sheetId: 'sheet-produksi-fixture',
      fetchImpl,
      required: true,
    });

    expect(result.connected).toBe(true);
    expect(result.warnings).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(10);
    expect(result.data.activities).toHaveLength(7);
    expect(result.data.activityPhotos).toHaveLength(15);
    expect(result.data.activities[0].id).toBe(T1_ACTIVITY_ID);
    expect(result.data.activityArticles[0].beneficiaryNarrative).toContain('\n\n');
    expect(
      result.data.activityPhotos.find(
        ({ articleSection }) => articleSection === 'cerita_program',
      )?.description,
    ).toContain('Foto ini memperlihatkan');
    expect(result.data.outputs.every(({ actual }) => actual === null)).toBe(true);
    expect(result.data.indicators.every(({ achieved }) => achieved === null)).toBe(true);
  });

  it('menggagalkan field wajib atau enum salah setelah koneksi berhasil, bukan menyamarkannya sebagai empty state', async () => {
    const rawRows = createProductionRawRows();
    rawRows.Kegiatan[0].judul = '';
    rawRows.Kegiatan[0].status = 'sudah-jadi';
    const csvBySheet = createProductionCsvBySheet();
    csvBySheet.Kegiatan = rawRowsToCsv('Kegiatan', rawRows.Kegiatan);

    await expect(
      loadSheetsData({
        sheetId: 'sheet-schema-rusak',
        fetchImpl: fetchForCsv(csvBySheet),
      }),
    ).rejects.toThrow(/Kegiatan\.(?:status|judul)|Kegiatan\.status|Data Kegiatan/);
  });

  it('menggunakan empty state hanya ketika koneksi Sheets tidak tersedia', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;

    const result = await loadSheetsData({ sheetId: 'sheet-offline', fetchImpl });

    expect(result.connected).toBe(false);
    expect(result.data.activities).toEqual([]);
    expect(result.data.activityPhotos).toEqual([]);
    expect(result.warnings[0]).toContain('empty state aman');
  });

  it('menggagalkan koneksi Sheets ketika loader dipanggil dalam mode required', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;

    await expect(
      loadSheetsData({
        sheetId: 'sheet-offline-required',
        fetchImpl,
        required: true,
      }),
    ).rejects.toThrow('Gagal terhubung ke Sheet Pengaturan');
  });
});
