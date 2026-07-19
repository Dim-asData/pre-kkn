# Jejak KKN Pancalang

Website dokumentasi digital KKN Budi Luhur University untuk kelompok T1 di Desa Sumbakeling,
T2 di Desa Silebu, dan T3 di Desa Pancalang. Perencanaan produk dan aturan keakuratan konten
berada di [`PROJECT.md`](./PROJECT.md), sedangkan arah visual berada di
[`DESIGN-SPEC.md`](./DESIGN-SPEC.md).

## Teknologi

- Astro 7 dengan output statis.
- Google Sheets sebagai CMS dan sumber seluruh teks dinamis publik.
- Google Drive sebagai sumber foto mentah yang diproses saat build.
- Tailwind CSS 4 melalui plugin Vite; design tokens dan komponen dasar berada dalam CSS proyek.
- Cloudflare Pages sebagai target hosting pada fase deployment.

## Menjalankan proyek

```sh
npm install
npm run dev
```

Perintah verifikasi:

```sh
npm run check
npm test
npm run build
```

Server development background dikelola dengan perintah berikut:

```sh
astro dev --background
astro dev status
astro dev logs
astro dev stop
```

## Environment

Salin `.env.example` menjadi `.env`, lalu isi ID spreadsheet produksi. ID tidak ditanam di source
code dan `.env.example` tetap memakai placeholder.

```env
PUBLIC_SHEET_ID=ISI_ID_SPREADSHEET
PUBLIC_SITE_NAME=Jejak KKN Pancalang
PUBLIC_SITE_TAGLINE=Cerita, karya, dan pengabdian dari tiga desa.
PUBLIC_SITE_DESCRIPTION=Dokumentasi kegiatan, promosi UMKM, dan implementasi program CSR KKN.
```

Tanpa `PUBLIC_SHEET_ID`, loader mengembalikan data kosong dan warning yang aman agar proses
pengembangan lokal tetap dapat berjalan. Gunakan opsi `required: true` pada `loadSheetsData()`
ketika koneksi Sheets wajib tersedia.

## Pipeline foto Google Drive

Simpan foto asli di Google Drive dengan izin **Viewer untuk siapa pun yang memiliki link**. Kolom
foto pada Sheets menerima `drive://FILE_ID`, file ID mentah, atau URL Google Drive lama. Pengunjung
tidak pernah memuat URL Drive tersebut secara langsung.

```sh
npm run photos:sync  # unduh, koreksi orientasi, resize ≤1600 px, lalu WebP quality 80
npm run dev          # menjalankan sinkronisasi sebelum dev server
npm run build        # menjalankan sinkronisasi sebelum build Cloudflare Pages
```

Sinkronisasi memakai loader tunggal di `src/data/sheets.ts`, lalu mengumpulkan referensi foto dari
data publik sepuluh tab produksi. Foto kegiatan berasal dari `Foto_Kegiatan`; thumbnail kelompok,
hero/QRIS UMKM, dan foto produk memakai kolom masing-masing. Pipeline menulis WebP ke
`public/_photos/`. Manifest `src/generated/photo-manifest.ts` memetakan file ID ke URL lokal. Nama
berkas menyertakan hash isi sehingga foto yang berubah mendapat URL baru dan tidak tertahan cache
Cloudflare. Folder aset dan cache (`public/_photos/`, `.cache/photos/`) tetap tidak di-commit. Bila
Sheets sedang tidak terhubung, sinkronisasi mempertahankan manifest dan cache sebelumnya. Bila foto
opsional belum tersedia, UI menampilkan placeholder atau kontrol nonaktif sampai sinkronisasi berikutnya.

## Struktur fondasi

```text
src/
├── components/          Komponen UI global dan aksesibel
├── data/                Types, normalizer, schema, loader, dan validator Sheets
├── generated/           Manifest foto lokal hasil sinkronisasi
├── layouts/             Layout dokumen HTML global
├── lib/photos/          Normalisasi referensi Drive dan fallback gambar
├── pages/               Route Astro
└── styles/              Design tokens dan style global
```

Content Collections dan MDX sudah dipensiunkan dari jalur produksi. Route statis kegiatan dan UMKM
dibentuk langsung dari data Sheets yang aktif dan terverifikasi. Sekolah tidak memiliki collection,
loader, card, atau halaman promosi publik.

## Konten rencana awal

Tujuh route kegiatan dari proposal tersedia di bawah `/kegiatan/[kelompok]/[slug]`: dua rangkaian
T1, dua rangkaian T2, dan tiga rangkaian T3. Enam kegiatan tetap berstatus `planned`; dokumentasi
T1 sosialisasi digital marketing berstatus `ongoing` tanpa mengarang tanggal, jumlah aktual, atau
capaian indikator. Placeholder dan seed prototipe yang belum diverifikasi tetap ditandai `[DUMMY]`.

## Kontrak data

- Kegiatan menyimpan rencana dan realisasi pada field berbeda.
- Kegiatan `completed` wajib memiliki `actual_date`.
- Kegiatan `planned` tidak boleh memiliki nilai aktual atau indikator yang sudah dinilai.
- UMKM hanya menjadi data publik bila `aktif` dan `verified`.
- Metadata dan narasi UMKM seluruhnya berasal dari Sheets; tidak ada `mdx_path`.
- Sekolah hanya boleh disebut sebagai lokasi, sasaran, mitra, atau penerima manfaat di artikel kegiatan.
- Loader publik membaca sepuluh tab produksi: `Pengaturan`, `Kelompok`, `Kegiatan`,
  `Artikel_Kegiatan`, `Penerima_Manfaat`, `Output_Program`, `Indikator`, `Foto_Kegiatan`, `UMKM`,
  dan `Produk`.
- Tab `Sekolah [LEGACY]` dan `Galeri [LEGACY]` dipertahankan sebagai arsip tetapi tidak dibaca jalur publik.
- `/galeri` diturunkan dan dideduplikasi dari foto yang benar-benar dirender pada kegiatan aktif;
  gambar UMKM dan produk tidak masuk galeri kegiatan.
- URL sekolah yang pernah diterbitkan diarahkan permanen ke `/kegiatan`.
- Header Sheet divalidasi secara ketat untuk mencegah perubahan schema tanpa migrasi.
- Slug dinormalisasi ke lowercase-kebab-case, tanggal ke ISO, dan WhatsApp ke format `62xxx`.
- Foreign key antar-tab, ID/slug duplikat, nomor output per kegiatan, relasi foto, maksimum satu
  hero aktif, serta aturan planned/actual divalidasi sebelum halaman dirender.
- Teks multiline Sheets dipecah menjadi paragraf teks biasa; konten tersebut tidak dirender dengan
  `set:html`.
- Pada bagian Cerita program, isi `Artikel_Kegiatan.cerita_program` sebagai prolog. Setiap foto
  `Foto_Kegiatan` dengan `peran=narrative` dan `bagian_artikel=cerita_program` dirender menurut
  `urutan`; `caption` tampil tepat di bawah gambar dan `deskripsi` minimal tiga kalimat menjadi
  paragraf setelahnya.
- `Galeri dokumentasi` di bagian bawah detail kegiatan hanya untuk foto pendukung yang belum
  digunakan di bagian artikel lain. Isi `peran=narrative`, lalu kosongkan `bagian_artikel`,
  `output_id`, dan `indikator_id`. Jika tidak ada foto seperti ini, seluruh section galeri
  dokumentasi tidak dirender.
