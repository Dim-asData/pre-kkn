import type { ContentStatus, KelompokId, ProgramCategory } from './types.ts';

export const GROUP_LABELS: Record<KelompokId, string> = {
  t1: 'T1 · Desa Sumbakeling',
  t2: 'T2 · Desa Silebu',
  t3: 'T3 · Desa Pancalang',
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draf',
  planned: 'Rencana',
  ongoing: 'Berlangsung',
  completed: 'Terlaksana',
  cancelled: 'Dibatalkan',
};

export const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  umkm: 'UMKM',
  education: 'Edukasi',
  aid_distribution: 'Penyerahan Bantuan',
  supporting: 'Program Pendukung',
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatDate = (isoDate: string | null): string | null =>
  isoDate ? dateFormatter.format(new Date(`${isoDate}T00:00:00.000Z`)) : null;
