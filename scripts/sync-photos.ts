import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import {
  buildActivityDetails,
  loadSheetsData,
  publicSheetsData,
  type ActivityDetail,
  type SheetsData,
} from '../src/data/index.ts';
import { extractDriveId } from '../src/lib/photos/drive.ts';

const rootDirectory = resolve(import.meta.dirname, '..');
const outputDirectory = join(rootDirectory, 'public', '_photos');
const cacheDirectory = join(rootDirectory, '.cache', 'photos');
const cacheManifestPath = join(cacheDirectory, 'manifest.json');
const generatedManifestPath = join(rootDirectory, 'src', 'generated', 'photo-manifest.ts');
const maxWidth = 1600;
const webpQuality = 80;
const strict = process.argv.includes('--strict');

type PhotoManifest = Record<string, string>;

const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const addDriveId = (ids: Set<string>, reference: string | null | undefined): void => {
  const id = extractDriveId(reference);
  if (id) ids.add(id);
};

const collectPhotoReferences = (
  data: SheetsData,
  activities: ActivityDetail[],
): string[] => {
  const ids = new Set<string>();

  data.groups.forEach(({ thumbnail }) => addDriveId(ids, thumbnail));
  activities.forEach(({ photos }) => {
    photos.forEach(({ driveFile }) => addDriveId(ids, driveFile));
  });
  data.umkm.forEach(({ heroPhoto, qrisImage }) => {
    addDriveId(ids, heroPhoto);
    addDriveId(ids, qrisImage);
  });
  data.products.forEach(({ photo }) => addDriveId(ids, photo));

  return [...ids].sort();
};

const fetchDriveImage = async (id: string): Promise<Buffer> => {
  const endpoints = [
    `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${id}`,
  ];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(bytes, { failOn: 'error' }).metadata();
      if (!metadata.format) throw new Error('respons bukan berkas gambar');
      return bytes;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Tidak dapat mengunduh ${id}: ${String(lastError)}`);
};

const publicUrlFor = (fileName: string) => `/_photos/${fileName}`;

const readPreviousManifest = async (): Promise<PhotoManifest> => {
  if (!(await exists(cacheManifestPath))) return {};
  try {
    return JSON.parse(await readFile(cacheManifestPath, 'utf8')) as PhotoManifest;
  } catch {
    return {};
  }
};

const writeGeneratedManifest = async (manifest: PhotoManifest) => {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  const source = [
    '/** Diperbarui oleh `npm run photos:sync`; jangan mengedit manual. */',
    `export const photoManifest: Record<string, string> = ${JSON.stringify(sorted, null, 2)};`,
    '',
  ].join('\n');
  await mkdir(dirname(generatedManifestPath), { recursive: true });
  await writeFile(generatedManifestPath, source, 'utf8');
};

const removeStaleFiles = async (previous: PhotoManifest, current: PhotoManifest) => {
  const keep = new Set(Object.values(current).map((url) => join(outputDirectory, url.split('/').pop() ?? '')));
  await Promise.all(
    Object.values(previous).map(async (url) => {
      const path = join(outputDirectory, url.split('/').pop() ?? '');
      if (!keep.has(path) && path.startsWith(outputDirectory)) await rm(path, { force: true });
    }),
  );
};

const syncPhoto = async (id: string, previous: PhotoManifest): Promise<[string, string] | null> => {
  try {
    const input = await fetchDriveImage(id);
    const output = await sharp(input, { failOn: 'error' })
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: webpQuality })
      .toBuffer();
    const hash = createHash('sha256').update(output).digest('hex').slice(0, 16);
    const fileName = `${id}-${hash}.webp`;
    const outputPath = join(outputDirectory, fileName);

    if (!(await exists(outputPath))) {
      const temporaryPath = `${outputPath}.tmp`;
      await writeFile(temporaryPath, output);
      await rename(temporaryPath, outputPath);
    }

    return [id, publicUrlFor(fileName)];
  } catch (error) {
    const previousUrl = previous[id];
    const previousPath = previousUrl && join(outputDirectory, previousUrl.split('/').pop() ?? '');
    if (!strict && previousUrl && previousPath && (await exists(previousPath))) {
      console.warn(`Memakai foto cache untuk ${id}: ${String(error)}`);
      return [id, previousUrl];
    }
    console.warn(`Foto ${id} dilewati: ${String(error)}`);
    return null;
  }
};

const main = async () => {
  await Promise.all([mkdir(outputDirectory, { recursive: true }), mkdir(cacheDirectory, { recursive: true })]);
  const [loaded, previous] = await Promise.all([
    loadSheetsData({ required: strict }),
    readPreviousManifest(),
  ]);
  loaded.warnings.forEach((warning) => console.warn(warning));

  if (!loaded.connected) {
    console.warn(
      `Sinkron foto dilewati karena Google Sheets tidak terhubung; mempertahankan ${Object.keys(previous).length} aset dari manifest sebelumnya.`,
    );
    return;
  }

  const publicData = publicSheetsData(loaded.data);
  const activities = buildActivityDetails(publicData);
  const ids = collectPhotoReferences(publicData, activities);
  const results = await Promise.all(ids.map((id) => syncPhoto(id, previous)));
  const missingIds = ids.filter((_, index) => results[index] === null);
  if (strict && missingIds.length) {
    throw new Error(`Sinkron foto wajib gagal karena ${missingIds.length} aset tidak tersedia.`);
  }
  const manifest = Object.fromEntries(results.filter((result): result is [string, string] => result !== null));

  await Promise.all([
    writeFile(cacheManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
    writeGeneratedManifest(manifest),
  ]);
  await removeStaleFiles(previous, manifest);

  console.log(`Sinkron foto selesai: ${Object.keys(manifest).length}/${ids.length} aset lokal tersedia.`);
};

await main();
