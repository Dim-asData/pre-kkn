import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { photoManifest } from '../src/generated/photo-manifest.ts';

const rootDirectory = resolve(import.meta.dirname, '..');
const distDirectory = join(rootDirectory, 'dist');

const requiredRoutes = [
  '/',
  '/404.html',
  '/galeri',
  '/kegiatan',
  '/kegiatan/t1/edukasi-bahaya-game-online',
  '/kegiatan/t1/sosialisasi-digital-marketing',
  '/kegiatan/t2/pelatihan-branding-dan-pengemasan',
  '/kegiatan/t2/pojok-bermain-edukatif',
  '/kegiatan/t3/bookmark-dan-bantuan-alat-olahraga',
  '/kegiatan/t3/katalog-digital-dan-qris',
  '/kegiatan/t3/workshop-pencegahan-cyberbullying',
  '/umkm',
] as const;

const listFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return files.flat();
};

const toPublicPath = (filePath: string): string =>
  `/${relative(distDirectory, filePath).split(sep).join('/')}`;

const routeToFile = (route: string): string => {
  if (route === '/') return '/index.html';
  if (extname(route)) return route;
  return `${route.replace(/\/$/, '')}/index.html`;
};

const pageUrlFor = (htmlPath: string): string => {
  if (htmlPath === '/index.html') return '/';
  if (htmlPath.endsWith('/index.html')) return `${htmlPath.slice(0, -'index.html'.length)}`;
  return htmlPath;
};

const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  if (!(await exists(distDirectory))) {
    throw new Error('Folder dist tidak ditemukan. Jalankan Astro build sebelum verifikasi.');
  }

  const files = await listFiles(distDirectory);
  const publicFiles = new Set(files.map(toPublicPath));
  const missingRequired = requiredRoutes
    .map(routeToFile)
    .filter((filePath) => !publicFiles.has(filePath));

  if (!publicFiles.has('/_redirects')) missingRequired.push('/_redirects');
  if (missingRequired.length) {
    throw new Error(`Artefak build wajib tidak ditemukan: ${missingRequired.join(', ')}`);
  }

  const brokenLinks = new Set<string>();
  const htmlFiles = files.filter((filePath) => filePath.endsWith('.html'));
  const attributePattern = /\b(?:href|src|action)=["']([^"'<>]+)["']/g;

  await Promise.all(
    htmlFiles.map(async (htmlFile) => {
      const htmlPath = toPublicPath(htmlFile);
      const pageUrl = pageUrlFor(htmlPath);
      const html = await readFile(htmlFile, 'utf8');

      for (const match of html.matchAll(attributePattern)) {
        const value = match[1].replaceAll('&amp;', '&');
        if (
          value.startsWith('#') ||
          value.startsWith('mailto:') ||
          value.startsWith('tel:') ||
          value.startsWith('data:') ||
          value.startsWith('javascript:') ||
          value.startsWith('//')
        ) {
          continue;
        }

        const resolved = new URL(value, `https://build.local${pageUrl}`);
        if (resolved.origin !== 'https://build.local') continue;

        const target = routeToFile(decodeURI(resolved.pathname));
        if (!publicFiles.has(target)) brokenLinks.add(`${htmlPath} → ${resolved.pathname}`);
      }
    }),
  );

  Object.values(photoManifest).forEach((photoUrl) => {
    if (!publicFiles.has(photoUrl)) brokenLinks.add(`photo-manifest.ts → ${photoUrl}`);
  });

  if (brokenLinks.size) {
    throw new Error(`Tautan atau aset internal rusak:\n${[...brokenLinks].sort().join('\n')}`);
  }

  console.log(
    `Verifikasi build selesai: ${htmlFiles.length} HTML, ${requiredRoutes.length} route wajib, dan ${Object.keys(photoManifest).length} foto valid.`,
  );
};

await main();
