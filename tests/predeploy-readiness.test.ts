import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSources = import.meta.glob('../src/pages/404.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const dataSources = import.meta.glob('../src/data/sheets.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const scriptSources = import.meta.glob('../scripts/sync-photos.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const verifierSources = import.meta.glob('../scripts/verify-build.ts', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as {
  scripts: Record<string, string>;
};
const redirects = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8');
const gitignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8');
const nodeVersion = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim();

describe('kesiapan build dan hosting produksi', () => {
  it('menyediakan halaman 404 yang aman dan dapat dinavigasi', () => {
    const source = pageSources['../src/pages/404.astro'];

    expect(source).toContain('<BaseLayout');
    expect(source).toContain('noindex');
    expect(source).toContain('Halaman yang Anda cari tidak tersedia.');
    expect(source).toContain('<PrimaryButton href="/">');
    expect(source).toContain('<SecondaryButton href="/kegiatan">');
  });

  it('mengirim seluruh route sekolah legacy ke kegiatan dengan HTTP 301 di Cloudflare', () => {
    expect(redirects).toContain('/sekolah /kegiatan 301');
    expect(redirects).toContain('/sekolah/ /kegiatan 301');
    expect(redirects).toContain('/sekolah/* /kegiatan 301');
  });

  it('mewajibkan Sheets dan foto Drive pada build produksi, tetapi tidak pada development', () => {
    const sheetsSource = dataSources['../src/data/sheets.ts'];
    const syncSource = scriptSources['../scripts/sync-photos.ts'];

    expect(sheetsSource).toContain('import.meta.env?.PROD === true');
    expect(syncSource).toContain('loadSheetsData({ required: strict })');
    expect(syncSource).toContain('if (!strict && previousUrl');
    expect(packageJson.scripts['photos:sync:strict']).toContain('--strict');
    expect(packageJson.scripts.prebuild).toBe('npm run photos:sync:strict');
    expect(packageJson.scripts.postbuild).toContain('scripts/verify-build.ts');
    expect(packageJson.scripts.predev).toBe('npm run photos:sync');
  });

  it('memeriksa route wajib, tautan internal, dan manifest foto setelah build', () => {
    const source = verifierSources['../scripts/verify-build.ts'];

    expect(source).toContain('/kegiatan/t1/sosialisasi-digital-marketing');
    expect(source).toContain('/kegiatan/t3/workshop-pencegahan-cyberbullying');
    expect(source).toContain("publicFiles.has('/_redirects')");
    expect(source).toContain('photoManifest');
    expect(source).toContain('brokenLinks');
  });

  it('mengabaikan semua file environment kecuali template aman dan mematok Node build', () => {
    expect(gitignore).toContain('.env*');
    expect(gitignore).toContain('!.env.example');
    expect(nodeVersion).toBe('24.18.0');
  });
});
