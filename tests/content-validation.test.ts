import { describe, expect, it } from 'vitest';
import { buildActivityDetails } from '../src/data/activities.ts';
import { createEmptySheetsData } from '../src/data/config.ts';
import { publicSheetsData, validateSheetsData } from '../src/data/validate.ts';
import type { SheetsData } from '../src/data/types.ts';
import { createProductionSheetsData, T1_ACTIVITY_ID } from './fixtures/phase5a.ts';

const invalid = (
  mutate: (data: SheetsData) => void,
  message: string | RegExp,
): void => {
  const data = createProductionSheetsData();
  mutate(data);
  expect(() => validateSheetsData(data)).toThrow(message);
};

type InvalidCase = readonly [
  label: string,
  mutate: (data: SheetsData) => void,
  message: string | RegExp,
];

const foreignKeyCases: InvalidCase[] = [
  ['Kegiatan -> Kelompok', (data) => {
    data.groups = data.groups.filter(({ id }) => id !== 't1');
  }, /kelompok yang tidak tersedia/],
  ['Artikel_Kegiatan -> Kegiatan', (data) => {
    data.activityArticles[0].activityId = 'tidak-ada';
  }, /Artikel_Kegiatan.*kegiatan_id/],
  ['Penerima_Manfaat -> Kegiatan', (data) => {
    data.beneficiaries[0].activityId = 'tidak-ada';
  }, /Penerima_Manfaat.*kegiatan_id/],
  ['Output_Program -> Kegiatan', (data) => {
    data.outputs[0].activityId = 'tidak-ada';
  }, /Output_Program.*kegiatan_id/],
  ['Indikator -> Kegiatan', (data) => {
    data.indicators[0].activityId = 'tidak-ada';
  }, /Indikator.*kegiatan_id/],
  ['Foto_Kegiatan -> Kegiatan', (data) => {
    data.activityPhotos[0].activityId = 'tidak-ada';
  }, /Foto_Kegiatan.*kegiatan_id/],
  ['Foto_Kegiatan -> Output_Program', (data) => {
    data.activityPhotos[3].outputId = 'tidak-ada';
  }, /Foto_Kegiatan.*output_id/],
  ['Foto_Kegiatan -> Indikator', (data) => {
    data.activityPhotos[12].indicatorId = 'tidak-ada';
  }, /Foto_Kegiatan.*indikator_id/],
  ['UMKM -> Kelompok', (data) => {
    const removedIds = new Set(
      data.activities.filter(({ groupId }) => groupId === 't1').map(({ id }) => id),
    );
    data.groups = data.groups.filter(({ id }) => id !== 't1');
    data.activities = data.activities.filter(({ id }) => !removedIds.has(id));
    data.activityArticles = data.activityArticles.filter(({ activityId }) => !removedIds.has(activityId));
    data.beneficiaries = data.beneficiaries.filter(({ activityId }) => !removedIds.has(activityId));
    data.outputs = data.outputs.filter(({ activityId }) => !removedIds.has(activityId));
    data.indicators = data.indicators.filter(({ activityId }) => !removedIds.has(activityId));
    data.activityPhotos = data.activityPhotos.filter(({ activityId }) => !removedIds.has(activityId));
  }, /UMKM.*kelompok yang tidak tersedia/],
  ['Produk -> UMKM', (data) => {
    data.products[0].umkmId = 'tidak-ada';
  }, /Produk.*umkm_id/],
];

const duplicateCases: InvalidCase[] = [
  ['kegiatan_id', (data) => {
    data.activities.push({ ...data.activities[0] });
  }, /kegiatan_id duplikat/],
  ['route kegiatan', (data) => {
    data.activities.push({ ...data.activities[0], id: 'kegiatan-baru' });
  }, /Route kegiatan kelompok\/slug duplikat/],
  ['penerima_id', (data) => {
    data.beneficiaries.push({ ...data.beneficiaries[0] });
  }, /penerima_id duplikat/],
  ['output_id', (data) => {
    data.outputs.push({ ...data.outputs[0] });
  }, /output_id duplikat/],
  ['indikator_id', (data) => {
    data.indicators.push({ ...data.indicators[0] });
  }, /indikator_id duplikat/],
  ['foto_id', (data) => {
    data.activityPhotos.push({ ...data.activityPhotos[0] });
  }, /foto_id duplikat/],
  ['umkm_id', (data) => {
    data.umkm.push({ ...data.umkm[0] });
  }, /umkm_id duplikat/],
  ['route UMKM', (data) => {
    data.umkm.push({ ...data.umkm[0], id: 'umkm-baru' });
  }, /Route UMKM kelompok\/slug duplikat/],
  ['produk_id', (data) => {
    data.products.push({ ...data.products[0] });
  }, /produk_id duplikat/],
];

describe('foreign key sepuluh tab', () => {
  it.each(foreignKeyCases)('menolak relasi asing rusak: %s', (_label, mutate, message) => {
    invalid(mutate, message);
  });

  it('menolak foto output atau indikator yang menunjuk entitas dari kegiatan lain', () => {
    invalid(
      (data) => {
        data.activityPhotos[3].activityId = data.activities[1].id;
      },
      /Output_Program.*harus berada pada kegiatan_id yang sama/,
    );
    invalid(
      (data) => {
        data.activityPhotos[12].activityId = data.activities[1].id;
      },
      /Indikator.*harus berada pada kegiatan_id yang sama/,
    );
  });
});

describe('ID stabil, slug, dan nomor output', () => {
  it.each(duplicateCases)('menolak duplikasi %s', (_label, mutate, message) => {
    invalid(mutate, message);
  });

  it('mewajibkan nomor_output unik di dalam kegiatan, tetapi boleh sama pada kegiatan berbeda', () => {
    invalid(
      (data) => {
        data.outputs[1].outputNumber = data.outputs[0].outputNumber;
      },
      /nomor_output per kegiatan duplikat/,
    );

    const data = createProductionSheetsData();
    data.outputs.push({
      ...data.outputs[0],
      id: 'output-kegiatan-lain-01',
      activityId: data.activities[1].id,
    });
    expect(() => validateSheetsData(data)).not.toThrow();
  });
});

describe('planned, actual, dan state konten', () => {
  it('menerima empty dan partial state tanpa mengarang relasi', () => {
    const empty = createEmptySheetsData();
    expect(validateSheetsData(empty).data).toEqual(empty);
    expect(buildActivityDetails(empty)).toEqual([]);

    const partial = createProductionSheetsData();
    partial.activityArticles = [];
    partial.beneficiaries = [];
    partial.outputs = [];
    partial.indicators = [];
    partial.activityPhotos = [];
    const details = buildActivityDetails(validateSheetsData(partial).data);
    expect(details[0]).toMatchObject({
      article: null,
      beneficiaries: [],
      outputs: [],
      indicators: [],
      photos: [],
      heroPhoto: null,
    });
  });

  it('menolak data actual/achieved/evidence pada planned, termasuk tanggal realisasi', () => {
    const plannedId = createProductionSheetsData().activities[1].id;

    invalid(
      (data) => {
        data.activities[1].actualDate = '2026-08-17';
      },
      /planned tidak boleh memiliki data actual/,
    );
    invalid(
      (data) => {
        data.beneficiaries.find(({ activityId }) => activityId === plannedId)!.actual = 10;
      },
      /planned tidak boleh memiliki data actual/,
    );
    invalid(
      (data) => {
        data.indicators.push({
          id: 'indikator-rencana-01',
          activityId: plannedId,
          label: 'Indikator rencana',
          achieved: true,
          evidence: 'Bukti yang belum boleh ada',
          order: 1,
        });
      },
      /planned tidak boleh memiliki data actual/,
    );
  });

  it('menerima ongoing parsial dan completed terverifikasi, tetapi completed wajib bertanggal', () => {
    const ongoing = createProductionSheetsData();
    ongoing.beneficiaries[0].actual = 12;
    expect(() => validateSheetsData(ongoing)).not.toThrow();

    const completed = createProductionSheetsData();
    completed.activities[0].status = 'completed';
    completed.activities[0].actualDate = '2026-08-17';
    completed.outputs[0].actual = 1;
    completed.indicators[0].achieved = true;
    expect(() => validateSheetsData(completed)).not.toThrow();

    completed.activities[0].actualDate = null;
    expect(() => validateSheetsData(completed)).toThrow(/completed wajib memiliki tanggal_realisasi/);
  });

  it('hanya menerbitkan data aktif dan verified, tanpa menukar status bisnis', () => {
    const data = createProductionSheetsData();
    data.activities[1].verificationStatus = 'draft';
    data.activities[2].active = false;
    data.umkm[0].verificationStatus = 'draft';

    const publicData = publicSheetsData(validateSheetsData(data).data);
    expect(publicData.activities).toHaveLength(5);
    expect(publicData.activities.find(({ id }) => id === T1_ACTIVITY_ID)?.status).toBe('ongoing');
    expect(publicData.umkm).toEqual([]);
    expect(publicData.products).toEqual([]);
  });
});

describe('relasi Foto_Kegiatan', () => {
  it('mewajibkan output_id pada foto output dan maksimal satu hero aktif per kegiatan', () => {
    invalid(
      (data) => {
        data.activityPhotos[3].outputId = null;
      },
      /peran output wajib memiliki output_id/,
    );

    invalid(
      (data) => {
        data.activityPhotos[1].role = 'hero';
        data.activityPhotos[1].articleSection = null;
      },
      /lebih dari satu hero aktif/,
    );
  });

  it('menghubungkan setiap foto output ke output yang benar tanpa mengubah planned/actual', () => {
    const detail = buildActivityDetails(createProductionSheetsData()).find(
      ({ id }) => id === T1_ACTIVITY_ID,
    );
    if (!detail) throw new Error('Fixture T1 tidak ditemukan.');

    detail.outputs.forEach((output) => {
      const photo = detail.photos.find(({ outputId, role }) => role === 'output' && outputId === output.id);
      expect(photo).toBeDefined();
      expect(output.image).toBe(photo?.driveFile);
      expect(output.imageAlt).toBe(photo?.alt);
      expect(output.actual).toBeNull();
    });
  });

  it('mewajibkan deskripsi minimal tiga kalimat pada foto cerita program aktif dan verified', () => {
    invalid(
      (data) => {
        data.activityPhotos[7].description = null;
      },
      /cerita_program wajib memiliki deskripsi/,
    );

    invalid(
      (data) => {
        data.activityPhotos[7].description = 'Hanya satu kalimat.';
      },
      /deskripsi minimal 3 kalimat/,
    );
  });
});
