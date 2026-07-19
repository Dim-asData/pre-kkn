# PROJECT.md

## 1. Ringkasan Proyek

Proyek ini adalah website dokumentasi digital Kuliah Kerja Nyata (KKN) Budi Luhur University di Kecamatan Pancalang untuk tiga kelompok:

| Kelompok | Desa | Identitas warna |
|---|---|---|
| T1 | Desa Sumbakeling | Merah muda |
| T2 | Desa Silebu | Maroon |
| T3 | Desa Pancalang | Olive drab gelap |

Website berfungsi sebagai:

1. Arsip publik kegiatan KKN.
2. Media dokumentasi implementasi program CSR/TJSL.
3. Direktori promosi profil dan produk UMKM binaan.
4. Dokumentasi kegiatan, termasuk kegiatan edukasi yang menyasar sekolah.
5. Galeri seluruh foto yang digunakan pada halaman kegiatan.
6. Media publikasi hasil, bantuan, dan dampak kegiatan secara akurat.

Hanya UMKM yang diposisikan sebagai objek promosi. Sekolah dapat disebut sebagai lokasi, sasaran, mitra, atau penerima manfaat di dalam artikel kegiatan, tetapi tidak memiliki halaman overview, halaman detail, card promosi, atau ajakan promosi tersendiri.

Website dibangun dengan Astro dan menghasilkan halaman statis yang direncanakan untuk di-hosting di Cloudflare Pages. Implementasi prototipe saat ini masih menyimpan kegiatan dan artikel naratif dalam MDX. Target produksi yang sudah disepakati adalah seluruh teks dinamis—termasuk kegiatan, artikel, output, indikator, UMKM, dan produk—berasal dari Google Sheets tanpa ketergantungan operasional pada MDX. Foto mentah berasal dari Google Drive dan diproses menjadi WebP saat build. Teks kondisional antarmuka seperti **Segera hadir**, **Belum tersedia**, **Belum dinilai**, label tombol, judul section, serta aturan enable/disable tetap berada di kode.

Dokumen ini menjadi sumber konteks dan perencanaan aktif proyek. Setiap keputusan atau perubahan implementasi yang sudah disetujui harus dicatat di sini agar fase berikutnya dapat dimulai cukup dengan membaca `AGENTS.md`, `PROJECT.md`, `DESIGN-SPEC.md`, dan `README.md`. `DESIGN-SPEC.md` tetap menjadi referensi khusus arah visual dan komponen desain.

---

## 2. Sumber Perencanaan

Perencanaan proyek mengacu pada:

1. `DESIGN-SPEC.md` untuk identitas visual, layout, typography, komponen, dan responsivitas.
2. `PROPOSAL CSR KKN T1 2026.pdf` untuk program T1 di Desa Sumbakeling.
3. `Rancangan_Kegiatan_KKN_CSR_UMKM_Sekolah_T2..pdf` untuk program T2 di Desa Silebu.
4. `Rancangan_Kegiatan_KKN_CSR_T3.pdf` untuk program T3 di Desa Pancalang.

Proposal merupakan sumber data **rencana program**, bukan bukti realisasi. Data seperti tanggal pelaksanaan, nama penerima, jumlah peserta aktual, foto, dan indikator keberhasilan hanya boleh dinyatakan sebagai realisasi setelah dikonfirmasi.

### 2.1 Snapshot implementasi aktif

Pembaruan terakhir: **19 Juli 2026**.

Status fase:

| Fase | Status | Catatan |
|---|---|---|
| Fase 1 - Fondasi | Selesai | Astro 7 statis, Tailwind CSS 4 melalui Vite, design tokens, layout global, loader Sheets, validator, dan unit test tersedia; Content Collections prototipe kemudian dipensiunkan pada Fase 5A |
| Fase 2 - Halaman dan komponen | Selesai | Promosi sekolah telah dipensiunkan, URL legacy diarahkan ke kegiatan, dan galeri diturunkan dari gambar artikel kegiatan aktif |
| Fase 3 - Konten awal | Selesai | Tujuh rangkaian proposal disiapkan sebagai seed MDX untuk migrasi; seluruhnya kini berada di Sheets produksi |
| Fase 4 - Foto dan media | Selesai | Referensi Drive disinkronkan saat build, diproses dengan Sharp menjadi WebP lokal, memakai manifest, cache, fallback, dan nama berkas ber-hash |
| Fase 5A - CMS produksi tanpa MDX | Selesai | Spreadsheet produksi 10 tab, migrasi data, refactor jalur publik, penghapusan MDX, test, build, dan QA browser telah selesai |
| Fase 5B - Publish automation | Ditunda | Trigger pukul 12, pencocokan nama file Drive, Apps Script, dan Cloudflare Deploy Hook belum boleh diimplementasikan dalam task Fase 5A |
| Fase 6 - QA dan deployment | Belum dimulai | QA dasar per fase sudah dilakukan, tetapi audit final dan deployment belum dilakukan |

Fondasi yang sudah tersedia dan tidak boleh dibangun ulang:

- Output Astro statis, visual, route, dan komponen yang sudah benar.
- Schema kegiatan yang memisahkan planned dan actual.
- Types, normalizer, parser CSV, loader sepuluh tab, helper agregasi publik, dan validator relasional Sheets di `src/data/`.
- BaseLayout, Header, Footer, button, link, badge, breadcrumb, dan empty state.
- HeroSection, GroupCard, ActivityCard, UMKMCard, FilterBar, ArticleHeader, TableOfContents, InfoBox, ImageGallery, RelatedContent, PreviousNextNavigation, ProductCard, MapEmbed, WhatsAppButton, QRCodeCard, dan AidSummary.
- ProgramOutputs, BeneficiarySummary, dan SuccessIndicators.
- Menu mobile yang aksesibel dan filter ringan tanpa framework client-side.
- Tujuh kegiatan, artikel, penerima manfaat, output, indikator, dan konteks foto di spreadsheet produksi; MDX dan Content Collections sudah dihapus.

Verifikasi Fase 5A pada 19 Juli 2026:

- Spreadsheet produksi merupakan salinan native dengan ID berbeda; spreadsheet prototipe tidak diubah dan tetap menjadi arsip/fixture.
- Sepuluh tab produksi aktif: `Pengaturan`, `Kelompok`, `Kegiatan`, `Artikel_Kegiatan`, `Penerima_Manfaat`, `Output_Program`, `Indikator`, `Foto_Kegiatan`, `UMKM`, dan `Produk`.
- Tab sumber `Sekolah [LEGACY]` dan `Galeri [LEGACY]` dipertahankan dan tidak dibaca jalur publik.
- Data raw yang tervalidasi: 3 kelompok, 7 kegiatan, 7 artikel, 7 penerima manfaat, 39 output, 22 indikator, 15 foto kegiatan, 21 UMKM, dan 40 produk.
- Data publik: 7 kegiatan, 20 UMKM, dan 40 produk; satu UMKM draft/nonaktif tetap tersimpan tetapi tidak diterbitkan.
- T1 sosialisasi digital marketing tetap `ongoing`, memiliki 15 konteks foto dan 4 foto output; seluruh `actual_date`, nilai `actual`, dan `achieved` yang belum terverifikasi tetap kosong.
- Detail kegiatan merender 15 referensi foto T1. `/galeri` menghasilkan 14 item unik karena dua Drive ID memiliki hash isi WebP yang sama.
- Content Collections, MDX, `mdx_path`, remark MDX, dan dependensi MDX sudah dipensiunkan dari jalur publik.
- `npm test`: 56 test lulus pada 6 file test.
- `npm run check`: 0 error, warning, atau hint.
- `npm run build`: berhasil, termasuk sinkronisasi 15/15 foto, 7 route detail kegiatan, 20 route detail UMKM, dan 4 dokumen redirect sekolah legacy.
- QA browser pada 390px dan 1280px mencakup homepage, kegiatan dan filter, detail T1 ongoing, detail planned/empty state, UMKM, galeri, menu mobile, serta redirect sekolah. Tidak ada horizontal overflow atau error/warning console.
- Dev server dijalankan dengan `astro dev --background`, status/log diperiksa, lalu dihentikan setelah QA.

Verifikasi foto dan revisi artikel pada 19 Juli 2026:

- Pipeline foto berhasil menyinkronkan 15/15 foto T1 menjadi WebP lokal dan output build tidak memakai hotlink Google Drive.
- Artikel T1 memiliki empat output program dengan kontrol show/hide gambar.
- Ketersediaan kontrol gambar dibaca dari manifest foto hasil sinkronisasi: foto tersedia memakai ikon cek hijau dan kontrol aktif; foto belum tersedia memakai tanda seru dan kontrol nonaktif.
- `npm test`: 23 test lulus pada 5 file test.
- `npm run check`: 0 error, warning, atau hint pada diagnostic Astro.
- `npm run build`: berhasil membangun 31 halaman.

Route publik target setelah revisi struktur:

```txt
/
/kegiatan
/umkm
/galeri
/kegiatan/[kelompok]/[slug]
/umkm/[kelompok]/[slug]
```

Catatan revisi struktur:

- Route `/sekolah` dan `/sekolah/[kelompok]/[slug]`, beserta `SchoolCard`, `SchoolLayout`, dan `SchoolProfile`, telah dipensiunkan dari struktur publik.
- Redirect legacy sekolah menuju `/kegiatan` telah tersedia dan harus dipertahankan agar tautan lama tidak berakhir sebagai broken link.
- Galeri publik tidak lagi memakai direktori foto sekolah/UMKM yang terpisah; isinya diturunkan dari gambar pada artikel kegiatan aktif.

Verifikasi terakhir untuk perubahan Fase 3:

- `npm test`: 12 test lulus pada 2 file test, termasuk kontrak tujuh konten Fase 3.
- `npm run check`: 0 error, warning, atau hint pada diagnostic Astro.
- `npm run build` dengan akses Google Sheets: berhasil membangun 35 halaman, termasuk tepat 7 route detail kegiatan dan 0 route draft.
- Google Sheets publik terverifikasi memiliki tepat 3 kelompok aktif: T1 Desa Sumbakeling, T2 Desa Silebu, dan T3 Desa Pancalang; nama kelompok dummy tetap memuat `[DUMMY]`.
- QA browser pada 320, 390, 768, dan 1280px mencakup homepage, overview berfilter, detail kegiatan, dan galeri; tidak ada horizontal overflow halaman.
- Filter interaktif T3 + Edukasi menghasilkan tepat 1 artikel, yaitu `Workshop Pencegahan Cyberbullying`, dan query URL tersinkronisasi.
- Ketujuh detail kegiatan merespons 200, menampilkan badge **Rencana**, planned notice, table of contents, previous/next, related content, serta empty gallery tanpa broken link.
- Seluruh detail memiliki 0 label realisasi, seluruh indikator berstatus **Belum dinilai**, dan console browser tidak memiliki warning atau error.
- Dev server QA dijalankan dalam background, status serta log diperiksa, lalu server dihentikan.
- Warning glob loader untuk collection narasi UMKM dan sekolah yang masih kosong merupakan hasil implementasi sebelum revisi struktur. Collection sekolah tidak lagi menjadi kebutuhan target. Fallback Sheets saat jaringan sandbox/offline tidak tersedia tetap expected; build dengan akses jaringan telah berhasil memvalidasi data sebenarnya.

Verifikasi revisi struktur pada 17 Juli 2026:

- `npm test`: 18 test lulus pada 3 file test, termasuk kontrak navigasi, redirect sekolah legacy, sumber galeri kegiatan, tautan artikel sumber, dan pengecualian gambar UMKM.
- `npm run check`: 0 error, warning, atau hint pada diagnostic Astro.
- `npm run build` dengan akses Google Sheets: berhasil membangun 31 halaman konten serta 4 dokumen redirect sekolah legacy; 7 detail kegiatan dan 20 detail UMKM tetap tersedia.
- Loader publik hanya membaca tab `Kelompok`, `UMKM`, dan `Produk`. Tab `Sekolah` dan `Galeri` tetap dipertahankan pada spreadsheet eksternal sebagai data legacy, tetapi tidak lagi dimuat untuk website publik.
- QA browser pada 320, 390, dan 1280px mencakup homepage, filter kegiatan edukasi, direktori UMKM, detail kegiatan edukasi, galeri, menu mobile, serta redirect sekolah overview/detail. Tidak ada horizontal overflow, broken link sekolah, atau error/warning console browser.
- Artikel T1 `sosialisasi-digital-marketing` memiliki 1 thumbnail dan 14 gambar naratif MDX dari Google Drive yang disinkronkan menjadi 15 WebP lokal. `/galeri` menurunkan seluruh 15 item tersebut dari artikel kegiatan aktif dan setiap item kembali ke artikel sumber.
- Warning glob loader untuk collection narasi UMKM yang masih kosong tetap expected. Collection sekolah sudah dihapus.

### 2.2 Keputusan konten yang sudah dikonfirmasi

1. Konten berstatus `planned` boleh ditampilkan kepada publik.
2. Konten `planned` harus selalu memiliki badge **Rencana**.
3. Bahasa konten `planned` memakai bentuk seperti “direncanakan”, “akan”, “disiapkan”, atau “ditargetkan” dan tidak boleh mengklaim realisasi.
4. Proyek saat ini merupakan prototipe/contoh sehingga data kegiatan, UMKM, produk, nama sekolah yang muncul sebagai konteks kegiatan, galeri, nama penerima, tanggal, dan gambar boleh berupa dummy.
5. Semua dummy harus mudah dikenali dengan penanda `[DUMMY]`.
6. Fakta yang bersumber dari proposal bukan dummy, tetapi tetap harus dinyatakan sebagai rencana.
7. WhatsApp, QRIS, rekening, atau informasi sensitif tetap kosong selama prototipe agar tidak mengarah ke orang atau rekening nyata.
8. Website akan diperbarui rutin pada malam hari setelah kelompok menyelesaikan program kerja dan data realisasi selesai diperiksa.
9. Bahasa publik menggunakan bahasa Indonesia yang humanis, hangat, mudah dipahami, dan tidak terasa seperti dashboard pemerintahan.
10. Nilai kuantitatif dari RAB proposal boleh dicatat sebagai `planned` bila item dan jumlahnya disebutkan jelas, tetapi tetap diperlakukan sebagai estimasi rencana, bukan bukti pembelian atau penyaluran.
11. Kisaran sasaran T1 10-15 dan 40-50 disimpan memakai batas atas pada field numerik `planned`, disertai label serta narasi yang menjelaskan bahwa angka tersebut bukan jumlah peserta aktual.
12. Bila proposal tidak memberikan jumlah penerima yang jelas, nilai `planned` penerima tetap `null` meskipun jumlah barang atau konsumsi tersedia pada RAB.
13. Placeholder gambar kegiatan wajib menampilkan penanda visual dan alt text `[DUMMY]`; fakta program dari proposal sendiri tidak diberi label dummy.
14. Peta Rencana Program tetap mengarah ke overview berfilter agar konteks kelompok dan kategori terlihat, sedangkan metadata nama desa pada peta dibaca dari Sheet `Kelompok`, bukan dari sumber metadata lokal kedua.
15. Hanya UMKM yang memiliki halaman promosi publik dan route detail tersendiri.
16. Sekolah tidak memiliki overview, route detail, card profil, CTA promosi, atau menu navigasi tersendiri.
17. Seluruh program dengan sasaran sekolah didokumentasikan sebagai artikel di `/kegiatan` dan boleh memuat nama sekolah hanya setelah terverifikasi.
18. `/galeri` menampilkan seluruh gambar yang digunakan pada halaman detail kegiatan aktif dan setiap gambar harus tertaut kembali ke artikel kegiatan sumbernya.

### 2.3 Google Sheets prototipe

Google Sheets native yang digunakan:

```txt
PUBLIC_SHEET_ID=1TZJrcIpQ2YGTSndRJv8_Onee-vkb71TrcyU3ObYj4uo
```

Aturan:

1. ID asli disimpan di `.env`.
2. `.env.example` tetap memakai placeholder dan tidak boleh diisi ID produksi/prototipe.
3. Gunakan loader yang sudah ada di `src/data/sheets.ts`; jangan membuat loader Sheets kedua.
4. Data publik hanya menggunakan baris dengan `aktif === true` dan `status_verifikasi === verified` melalui helper yang sudah tersedia.
5. Draft tidak boleh memiliki halaman publik.
6. Jika Sheets tidak dapat diakses, tampilkan empty state aman dan jangan menggagalkan build lokal tanpa alasan valid.

Isi spreadsheet saat snapshot ini dibuat:

| Sheet | Jumlah | Catatan |
|---|---:|---|
| Kelompok | 3 | T1, T2, dan T3 |
| UMKM | 21 | Termasuk satu draft |
| Produk | 40 | Relasi ke UMKM |
| Sekolah | 4 | Data legacy/internal; tidak digunakan untuk membuat halaman publik sekolah |
| Galeri | 18 | Data legacy; galeri publik target diturunkan dari gambar artikel kegiatan |

#### 2.3.1 Google Sheets produksi Fase 5A

Spreadsheet produksi dibuat sebagai salinan native dengan ID berbeda. ID produksi hanya disimpan
di `.env` lokal dan dilaporkan pada handoff Fase 5A; `.env.example` tetap berupa placeholder.
Spreadsheet prototipe di atas tidak diubah.

| Tab produksi | Jumlah data |
|---|---:|
| Pengaturan | 1 |
| Kelompok | 3 |
| Kegiatan | 7 |
| Artikel_Kegiatan | 7 |
| Penerima_Manfaat | 7 |
| Output_Program | 39 |
| Indikator | 22 |
| Foto_Kegiatan | 15 |
| UMKM | 21, termasuk satu draft/nonaktif |
| Produk | 40 |

Tab `Sekolah [LEGACY]` dan `Galeri [LEGACY]` tetap berada pada salinan sebagai arsip dan tidak
digunakan halaman publik. Spreadsheet memakai zona waktu `Asia/Jakarta`. Locale file tetap
`en_GB` karena API menolak `id_ID`; format tanggal kolom produksi ditetapkan eksplisit menjadi
`YYYY-MM-DD`, sehingga kontrak data tetap konsisten.

### 2.4 Revisi homepage yang harus dipertahankan

Hero:

1. `HeroSection.astro` tidak menggunakan card di sisi visual.
2. Bingkai organik menampilkan satu foto pada satu waktu.
3. Setiap foto tampil sekitar 3 detik lalu crossfade ke foto berikutnya.
4. Placeholder foto dari `public/` digunakan sampai dokumentasi kegiatan tersedia.
5. Daun memakai aset PNG transparan, mengambang perlahan, dan menyentuh bingkai sekitar 20%.
6. Pengukuran overlap daun terakhir sekitar 20,6-20,9% pada 320, 390, 768, dan 1280px.
7. Animasi menghormati `prefers-reduced-motion`.

Peta Rencana Program:

1. Eyebrow, judul, dan deskripsi rata tengah.
2. Program tidak memakai angka indeks karena T1, T2, dan T3 bekerja paralel.
3. Kelompok ditampilkan sejajar mulai breakpoint tablet.
4. Nama desa dapat diklik menuju `/kegiatan?kelompok=...`.
5. Setiap baris program dapat diklik menuju `/kegiatan` dengan filter kelompok dan kategori yang sesuai.
6. Link memakai focus state keyboard dan tidak boleh diarahkan ke detail yang belum tersedia agar tidak menghasilkan 404.

### 2.5 Arah produksi tanpa MDX dan scope task berikutnya

Keputusan produksi:

1. Aktivitas operasional selama KKN harus dapat dilakukan tanpa mengubah source code, MDX, atau Git.
2. Google Sheets menjadi CMS dan sumber kebenaran untuk seluruh teks dinamis.
3. Google Drive menjadi sumber kebenaran untuk seluruh foto mentah.
4. Astro tetap menjadi renderer statis. Data Sheets dan Drive dibaca saat build, divalidasi, lalu menghasilkan HTML dan WebP statis.
5. Teks kondisional UI tetap berada di kode. Sheet menyimpan nilai status dan data mentah, bukan kalimat UI seperti **Segera hadir** atau **Belum tersedia**.
6. Ketersediaan foto dan keberhasilan program merupakan dua status berbeda. Foto tersedia tidak otomatis berarti program `completed`.
7. Galeri tidak memiliki daftar publik tersendiri; galeri selalu diturunkan dari foto yang benar-benar dipakai pada kegiatan aktif.
8. Spreadsheet prototipe tidak boleh langsung diubah menjadi produksi. Buat salinan native Google Sheets baru sebagai spreadsheet produksi dan pertahankan prototipe sebagai arsip/fixture.

Tab target spreadsheet produksi:

| Tab | Tanggung jawab |
|---|---|
| `Pengaturan` | Mode produksi, `AUTO_REBUILD`, waktu/status publish terakhir; automation belum diimplementasikan pada Fase 5A |
| `Kelompok` | Metadata T1, T2, dan T3 |
| `Kegiatan` | Metadata, status, tanggal, route, kategori, lokasi, dan ringkasan kegiatan |
| `Artikel_Kegiatan` | Narasi penerima manfaat, hasil program, cerita program, dan ukuran keberhasilan |
| `Penerima_Manfaat` | Nilai planned/actual dan satuan penerima manfaat |
| `Output_Program` | Output fisik/nonfisik, planned/actual, penerima, urutan, dan status verifikasi |
| `Indikator` | Indikator keberhasilan, status capaian, dan bukti |
| `Foto_Kegiatan` | Relasi foto Drive ke hero, section artikel, output, atau indikator; bukan daftar galeri publik |
| `UMKM` | Seluruh metadata dan narasi profil UMKM tanpa `mdx_path` |
| `Produk` | Produk yang berelasi ke UMKM |

ID stabil:

- `kegiatan_id`, `output_id`, `indikator_id`, `foto_id`, `umkm_id`, dan `produk_id` tidak boleh memakai nomor baris.
- Route tetap memakai `kelompok` dan `slug`.
- Relasi child memakai ID induk, misalnya `Output_Program.kegiatan_id`.
- `nomor_output` bersifat stabil dan menjadi kunci pemetaan foto output.

Rencana format foto output untuk fase automation berikutnya:

```txt
[nomor_output]-[slug-nama-output].[ext]
01-edukasi-strategi-pemasaran-digital.jpg
02-pendampingan-katalog-digital.jpg
```

Nomor output menjadi kunci utama; bagian nama hanya validasi agar salah upload mudah ditemukan. Setiap kegiatan memiliki folder Drive tersendiri. Pencocokan otomatis berdasarkan nama file, pemantauan folder Drive, dan pemicu rebuild belum termasuk scope Fase 5A.

Todo Fase 5A:

- [x] Salin spreadsheet prototipe menjadi spreadsheet produksi dengan ID berbeda.
- [x] Tetapkan header, tipe, dropdown, field wajib, dan relasi sepuluh tab target.
- [x] Gunakan `YYYY-MM-DD`, boolean eksplisit, dropdown enum, dan ID stabil.
- [x] Pisahkan planned, actual, status kegiatan, ketersediaan foto, dan status verifikasi.
- [x] Pindahkan seluruh metadata serta artikel kegiatan dari MDX ke Sheets.
- [x] Pindahkan referensi, alt, caption, urutan, dan relasi foto kegiatan dari MDX ke `Foto_Kegiatan` tanpa membuat daftar galeri kedua.
- [x] Pindahkan narasi UMKM ke Sheet `UMKM` dan pensiunkan `mdx_path`.
- [x] Refactor loader, normalizer, types, validator, dan helper publik yang sudah ada; jangan membuat loader Sheets kedua.
- [x] Render paragraf multiline Sheet secara aman tanpa `set:html` untuk konten biasa.
- [x] Pertahankan homepage, route, komponen, filter, visual, redirect sekolah, dan empty state yang sudah benar.
- [x] Pertahankan galeri sebagai turunan foto kegiatan aktif.
- [x] Migrasikan tujuh kegiatan proposal ke Sheet produksi tanpa mengarang realisasi; enam tetap `planned` dan satu dokumentasi T1 tetap `ongoing`.
- [x] Setelah parity terverifikasi, hentikan penggunaan Content Collection/MDX untuk halaman publik.
- [x] Tambahkan test untuk schema, relasi, empty/partial/ongoing/completed state, dan ketiadaan import MDX pada jalur publik produksi.
- [x] Jalankan `npm test`, `npm run check`, `npm run build`, dan QA browser background sesuai `AGENTS.md`.
- [x] Jangan mengimplementasikan Apps Script, Deploy Hook, trigger pukul 12, atau scanner nama file Drive dalam task ini.

---

## 3. Tujuan Produk

### 3.1 Tujuan utama

1. Menyediakan dokumentasi KKN yang mudah dipahami masyarakat umum.
2. Menampilkan perbedaan program T1, T2, dan T3 secara jelas tanpa memecah identitas website.
3. Mendokumentasikan output nonfisik dan bantuan fisik program CSR.
4. Mempromosikan profil dan produk UMKM secara humanis, bukan sebagai dashboard administratif.
5. Memisahkan data rencana dan realisasi agar publikasi tetap akurat.
6. Menjadi arsip yang tetap dapat diakses setelah masa KKN berakhir.
7. Memudahkan pengelola memperbarui data tanpa membangun backend khusus.
8. Mendokumentasikan kegiatan yang menyasar sekolah tanpa mengubah sekolah menjadi objek promosi.

### 3.2 Pengguna utama

- Masyarakat Desa Sumbakeling, Silebu, dan Pancalang.
- Pelaku UMKM, peserta didik, guru, dan pihak sekolah yang terlibat sebagai penerima manfaat kegiatan.
- Mahasiswa dan dosen pembimbing KKN.
- Institusi dan mitra CSR/TJSL.
- Pengunjung umum yang ingin melihat dokumentasi program.

### 3.3 Non-goals versi awal

Versi awal tidak mencakup:

1. Login atau dashboard admin.
2. Database server seperti PostgreSQL atau MySQL.
3. Backend API khusus.
4. Upload foto melalui website.
5. Komentar pengunjung.
6. Checkout atau transaksi marketplace.
7. Analytics kompleks.
8. Multi-language.
9. CMS visual seperti WordPress atau Strapi.
10. Publikasi RAB lengkap sebagai halaman utama website.
11. Direktori, profil promosi, atau halaman detail khusus sekolah.

---

## 4. Ruang Lingkup Program Berdasarkan Proposal

### 4.1 T1 - Desa Sumbakeling

Tema utama:

```txt
Pemasaran digital UMKM
+
Peningkatan fasilitas produksi keripik pisang
+
Edukasi penggunaan gadget sehat untuk anak usia dini
+
Penguatan fasilitas edukatif dan sanitasi sekolah
```

Program UMKM:

- Sosialisasi digital marketing bagi pelaku UMKM dan remaja desa.
- Edukasi foto produk.
- Pendampingan katalog digital/website.
- Bantuan 1 mesin peniris minyak atau spinner.
- Bantuan 6 alat press kemasan atau sealer.
- Sasaran rencana sekitar 10-15 pelaku UMKM dan remaja peminat usaha.
- Komoditas yang disebut dalam proposal adalah **keripik pisang**, bukan keripik singkong.

Kegiatan dengan sasaran sekolah:

- Sasaran berupa Taman Kanak-kanak atau lembaga anak usia dini di Sumbakeling.
- Edukasi bahaya akses game online berlebihan.
- Substitusi penggunaan gadget melalui permainan edukatif.
- Bantuan alat peraga edukatif untuk sensorik dan motorik: puzzle, balok, congklak, buku cerita, dan karpet engklek.
- Bantuan dispenser non-elektrik dan penyangga galon.
- Paket perlengkapan belajar untuk sekitar 40-50 anak sesuai rencana proposal.

Program pendukung:

- Dokumentasi dan publikasi website.
- Penutupan dan penyerahan penghargaan.
- Dukungan kegiatan HUT RI dapat dicatat sebagai kegiatan tambahan jika benar-benar terlaksana.

### 4.2 T2 - Desa Silebu

Tema utama:

```txt
Branding dan pengemasan UMKM
+
Pemasaran digital
+
Pencegahan ketergantungan gadget anak usia dini
+
Pojok bermain edukatif
```

Program UMKM:

- Pelatihan strategi branding dan identitas visual.
- Pelatihan pemasaran digital dan media sosial.
- Bantuan 12 impulse sealer sesuai rencana proposal.
- Stiker label kemasan dan stiker logo.
- File desain label produk dalam format digital.
- Praktik penggunaan sealer dan pengemasan produk.
- Proposal belum menetapkan nama resmi seluruh UMKM penerima; website tidak boleh mengarang nama usaha.

Kegiatan dengan sasaran sekolah:

- Sasaran berupa Taman Kanak-kanak di Desa Silebu.
- Edukasi pencegahan ketergantungan gadget.
- Aktivitas bermain sebagai media pembelajaran dan interaksi sosial.
- Bantuan satu Paket Pojok Bermain Edukatif.
- Proposal belum menetapkan nama resmi lembaga; gunakan data resmi setelah konfirmasi.

Program pendukung:

- Dokumentasi, publikasi, dan laporan kegiatan CSR.
- Dua rangkaian pelaksanaan utama: UMKM dan sekolah.

### 4.3 T3 - Desa Pancalang

Tema utama:

```txt
Katalog digital, QR Code, dan QRIS
+
Promosi serta transaksi digital UMKM
+
Pencegahan cyberbullying dan etika media sosial
+
Bookmark edukatif dan bantuan alat olahraga
```

Program UMKM:

- Sosialisasi digitalisasi UMKM.
- Pendampingan katalog digital berbasis QR Code.
- Pendampingan pembuatan dan penggunaan QRIS.
- Promosi digital.
- Sasaran rencana sekitar 30 pelaku UMKM.
- Bantuan alat pengepres/sealer sesuai realisasi yang nantinya dikonfirmasi.
- Proposal tidak menetapkan jenis atau nama resmi seluruh usaha penerima.

Kegiatan dengan sasaran sekolah:

- Sasaran utama pada bagian tujuan dan indikator adalah peserta didik Sekolah Dasar.
- Pencegahan cyberbullying.
- Keamanan digital, jejak digital, dan etika bermedia sosial.
- Pembuatan bookmark edukatif bertema cita-cita dan pertemanan aman.
- Permainan edukatif dan kuis.
- Bantuan alat olahraga: net, raket, kok, bola, cone, dan pompa sesuai realisasi.
- Dua sesi sekolah dan satu sesi UMKM direncanakan dalam proposal.

Catatan penting:

- Tema kebun pangan, pekarangan, kerja bakti lingkungan, kerajinan anyaman, dan eksperimen sains tidak berasal dari proposal T3 dan tidak boleh menjadi konten utama kecuali ada kegiatan tambahan yang benar-benar terlaksana.

### 4.4 Ringkasan program publik

Untuk tampilan homepage, ringkasan kelompok menggunakan pesan berikut:

| Kelompok | Ringkasan publik |
|---|---|
| T1 | Pemasaran UMKM dan penggunaan gadget sehat bagi anak usia dini |
| T2 | Branding kemasan dan pojok bermain edukatif |
| T3 | Transaksi digital dan pertemanan aman di internet |

Terdapat sedikitnya tujuh rangkaian program utama dalam proposal: dua rangkaian T1, dua rangkaian T2, dan tiga rangkaian T3. Jumlah kegiatan aktual pada website harus dihitung dari data konten, bukan ditulis sebagai angka dummy.

---

## 5. Prinsip Konten dan Keakuratan Data

### 5.1 Rencana tidak sama dengan realisasi

Semua kegiatan harus memiliki status:

```ts
type ContentStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';
```

Aturan:

1. Data dari proposal dimasukkan sebagai `planned`.
2. Status hanya berubah menjadi `completed` setelah kegiatan dan dokumentasinya terverifikasi.
3. Jumlah peserta rencana dan jumlah peserta aktual disimpan pada field berbeda.
4. Jumlah bantuan rencana dan jumlah bantuan aktual disimpan pada field berbeda.
5. Tanggal rencana dan tanggal realisasi tidak boleh saling menimpa.
6. Indikator keberhasilan tidak boleh dinyatakan tercapai sebelum ada bukti realisasi.

### 5.2 Larangan data fiktif pada versi produksi

Website final tidak boleh mengarang:

- nama UMKM,
- nama pemilik,
- nama sekolah,
- alamat,
- nomor WhatsApp,
- harga produk,
- tanggal pelaksanaan,
- jumlah peserta,
- jumlah bantuan aktual,
- testimoni,
- indikator dampak.

Jika data resmi belum tersedia:

1. Jangan publikasikan halaman detail tersebut, atau
2. Tampilkan empty state yang jujur seperti `Data penerima sedang dikonfirmasi` pada mode preview saja.

### 5.3 Aturan data dummy pada prototipe

Selama proyek masih berada pada mode prototipe:

1. Data dummy boleh dipakai untuk menguji route, relasi, layout, filter, dan empty state.
2. Nama, tanggal, gambar, produk, kegiatan, UMKM, nama sekolah yang muncul dalam artikel, dan penerima dummy harus memuat penanda `[DUMMY]` pada data atau tampilan publik yang relevan.
3. Dummy tidak boleh menyerupai kontak, rekening, QRIS, atau identitas sensitif nyata.
4. WhatsApp, QRIS, dan informasi sensitif tetap kosong.
5. Data dummy tidak boleh diam-diam diubah menjadi klaim produksi.
6. Sebelum deployment final, lakukan content test untuk mengganti, menonaktifkan, atau menghapus dummy yang belum dikonfirmasi.

### 5.4 Bahasa publik

- Gunakan bahasa Indonesia yang mudah dipahami.
- Utamakan cerita manusia, proses, dan manfaat.
- Hindari gaya dashboard pemerintahan.
- Hindari klaim promosi berlebihan.
- Gunakan bahasa promosi hanya pada profil UMKM; sekolah cukup disebut secara faktual sebagai konteks kegiatan.
- Gunakan istilah CSR/TJSL secukupnya dan jelaskan melalui konteks.
- RAB dan rincian administrasi tetap menjadi bagian laporan, bukan fokus utama halaman publik.

---

## 6. Information Architecture dan Routing

### 6.1 Halaman overview

| Route | Fungsi |
|---|---|
| `/` | Overview seluruh kelompok dan konten terbaru |
| `/kegiatan` | Overview seluruh artikel kegiatan T1, T2, dan T3, termasuk kegiatan yang menyasar sekolah |
| `/umkm` | Overview dan direktori promosi UMKM binaan |
| `/galeri` | Seluruh gambar yang digunakan pada halaman detail kegiatan aktif |

### 6.2 Detail kegiatan

```txt
/kegiatan/[kelompok]/[slug]
```

Contoh slug yang selaras dengan proposal:

```txt
/kegiatan/t1/sosialisasi-digital-marketing
/kegiatan/t1/edukasi-bahaya-game-online
/kegiatan/t2/pelatihan-branding-dan-pengemasan
/kegiatan/t2/pojok-bermain-edukatif
/kegiatan/t3/katalog-digital-dan-qris
/kegiatan/t3/workshop-pencegahan-cyberbullying
/kegiatan/t3/bookmark-dan-bantuan-alat-olahraga
```

### 6.3 Detail UMKM

```txt
/umkm/[kelompok]/[slug]
```

Slug harus mengikuti nama usaha resmi. Sebelum nama resmi tersedia, jangan menetapkan slug permanen berdasarkan nama fiktif.

Contoh sementara untuk dokumentasi teknis saja:

```txt
/umkm/t1/keripik-pisang-[nama-resmi]
```

### 6.4 Batasan route sekolah

Website tidak memiliki route publik berikut:

```txt
/sekolah
/sekolah/[kelompok]/[slug]
```

Sekolah hanya direpresentasikan di dalam artikel `/kegiatan/[kelompok]/[slug]` sebagai lokasi, sasaran, mitra, atau penerima manfaat. Nama lembaga hanya boleh ditampilkan setelah terverifikasi dan tidak boleh disertai copy promosi, card profil, direktori, atau CTA khusus sekolah.

Route index khusus kelompok seperti `/kegiatan/t1` belum diperlukan pada MVP. Filter kelompok pada halaman overview sudah cukup.

---

## 7. Spesifikasi Halaman

### 7.1 Homepage `/`

Urutan konten:

1. Header dan navigasi utama.
2. Hero dokumentasi KKN.
3. Ringkasan T1, T2, dan T3 sesuai tema proposal.
4. Ringkasan tujuh rangkaian program utama.
5. Kegiatan terbaru atau kegiatan terdekat berdasarkan status, termasuk kegiatan edukasi dengan sasaran sekolah.
6. UMKM binaan yang dipromosikan.
7. Ringkasan output fisik dan nonfisik CSR.
8. Galeri singkat yang mengambil gambar dari artikel kegiatan.
9. Call to action menuju kegiatan.
10. Footer.

Homepage tidak perlu lagi memuat contoh artikel panjang karena halaman detail sudah tersedia.

### 7.2 Overview kegiatan `/kegiatan`

Konten:

- Judul dan pengantar.
- Jumlah kegiatan dihitung dari Content Collections.
- Filter kelompok: T1, T2, T3.
- Filter jenis program: `UMKM`, `Edukasi`, `Penyerahan Bantuan`, `Program Pendukung`.
- Filter status: `Rencana`, `Berlangsung`, `Terlaksana` bila diperlukan.
- Grid card editorial.
- Badge kelompok.
- Status kegiatan.
- Tanggal rencana atau realisasi.
- Lokasi.
- Ringkasan output.
- Pagination atau load more visual bila jumlah data banyak.

Halaman ini menjadi satu-satunya overview untuk seluruh dokumentasi program. Kegiatan UMKM, edukasi sekolah, penyerahan bantuan, dan program pendukung dibedakan melalui filter kategori, bukan melalui direktori sasaran yang terpisah.

### 7.3 Detail kegiatan `/kegiatan/[kelompok]/[slug]`

Struktur:

1. Header.
2. Breadcrumb.
3. Badge kelompok, jenis program, dan status.
4. Judul dan deskripsi.
5. Tanggal rencana/realisasi dan lokasi.
6. Hero image.
7. Ringkasan program.
8. Sasaran/penerima manfaat.
9. Output nonfisik.
10. Bantuan fisik.
11. Artikel pelaksanaan.
12. Info box.
13. Gambar di tengah artikel.
14. Indikator keberhasilan dan status capaiannya.
15. Galeri dokumentasi opsional untuk foto pendukung yang belum dirender di bagian lain.
16. Table of contents.
17. Navigasi artikel sebelumnya/berikutnya.
18. Kegiatan terkait.
19. Footer.

Untuk kegiatan yang menyasar sekolah, informasi lembaga, peserta didik, guru, materi, bantuan, respons, dan indikator dampak ditulis di halaman ini. Tidak ada tautan menuju profil sekolah terpisah.

Galeri dokumentasi pada detail kegiatan bukan pengulangan semua foto artikel. Section ini hanya
menampilkan `Foto_Kegiatan` pendukung dengan `peran=narrative` tanpa `bagian_artikel`,
`output_id`, atau `indikator_id`. Jika seluruh foto sudah digunakan sebagai hero, penerima
manfaat, output, cerita program, atau bukti indikator, section Galeri dokumentasi tidak dirender.
Aturan ini tidak mengubah `/galeri`, yang tetap menjadi agregasi foto kegiatan aktif.

Pada mobile, Table of Contents ditempatkan tepat sebelum section Penerima manfaat. Pada desktop,
Table of Contents tetap menjadi sidebar sticky di sisi artikel.

### 7.4 Overview UMKM `/umkm`

Konten:

- Pengantar program pemberdayaan ekonomi.
- Filter kelompok.
- Filter kategori usaha hanya jika datanya tersedia.
- Card UMKM dengan nama resmi, kategori, desa, dan ringkasan.
- Label bentuk pendampingan: foto produk, branding, kemasan, katalog digital, QR Code, atau QRIS.
- Empty state jika data penerima belum lengkap.

Halaman harus mendukung banyak UMKM per kelompok dan menggunakan bahasa promosi yang tetap faktual. T3 merencanakan sekitar 30 peserta UMKM sehingga desain tidak boleh mengasumsikan hanya satu UMKM untuk setiap kelompok.

### 7.5 Detail UMKM `/umkm/[kelompok]/[slug]`

Struktur:

1. Header dan breadcrumb.
2. Hero UMKM.
3. Nama resmi dan tagline.
4. Badge kelompok dan kategori.
5. Pemilik, alamat, jam operasional, dan WhatsApp jika tersedia.
6. Map atau fallback link lokasi.
7. Cerita usaha.
8. Produk unggulan.
9. Galeri produk.
10. Bentuk pendampingan KKN.
11. Bantuan fisik yang diterima bila terverifikasi.
12. Dampak pendampingan berdasarkan data realisasi.
13. QR Code katalog/QRIS khusus UMKM T3 bila tersedia.
14. UMKM terkait.
15. Footer.

Harga produk bersifat opsional. Halaman bukan marketplace dan tidak memiliki checkout.

### 7.6 Galeri `/galeri`

Sumber isi:

- Hero/thumbnail yang benar-benar tampil pada halaman detail kegiatan.
- Gambar pada `images[]` kegiatan.
- Gambar naratif yang direlasikan ke artikel kegiatan dan benar-benar dirender.
- Hanya gambar dari artikel kegiatan yang aktif dan boleh dipublikasikan.

Filter utama:

- Kelompok: T1, T2, T3.
- Jenis program: `UMKM`, `Edukasi`, `Penyerahan Bantuan`, `Program Pendukung`.
- Tag tambahan diturunkan dari metadata artikel, misalnya pendampingan, workshop, edukasi digital, penyerahan bantuan, permainan edukatif, atau QRIS/katalog digital.

Setiap foto memiliki caption atau alt text yang bermakna, badge kelompok, konteks kegiatan, dan link menuju artikel kegiatan sumber. Galeri tidak memuat foto profil/produk UMKM yang hanya tampil pada halaman `/umkm`, tidak memiliki entri sekolah mandiri, dan tidak memelihara daftar foto publik kedua yang terpisah dari konten kegiatan.

### 7.7 Perlakuan sekolah pada website

1. Sekolah boleh disebut sebagai lokasi, sasaran, mitra, atau penerima manfaat di artikel kegiatan.
2. Kegiatan edukasi dan bantuan sekolah tetap memiliki dokumentasi lengkap di `/kegiatan/[kelompok]/[slug]`.
3. Tidak ada menu `Sekolah`, overview `/sekolah`, detail sekolah, card profil sekolah, CTA kunjungan, atau copy promosi sekolah.
4. Nama, kutipan, foto anak, dan informasi lain yang sensitif tetap mengikuti verifikasi serta izin publikasi yang berlaku.

---

## 8. Arah Visual dan Design System

Gunakan `DESIGN-SPEC.md` sebagai sumber utama. Ringkasan keputusan:

```txt
Humanis
+
Bernuansa desa secara halus
+
Modern
+
Hangat
+
Editorial
+
Foto sebagai bagian utama cerita
```

### 8.1 Warna

```css
--color-primary: #7CB9E8;
--color-primary-dark: #4F8FBE;
--color-primary-soft: #EAF6FD;

--color-t1: #E89AB7;
--color-t1-soft: #FBEAF1;
--color-t1-dark: #B95E80;

--color-t2: #7A263A;
--color-t2-soft: #F4E7EA;
--color-t2-dark: #501725;

--color-t3: #556B2F;
--color-t3-soft: #EDF1E5;
--color-t3-dark: #39481F;

--color-background: #FAF9F5;
--color-surface: #FFFFFF;
--color-surface-soft: #F3F0E8;
--color-text: #24313A;
--color-text-muted: #66727A;
--color-border: #DDD9CF;
--color-dark: #1E2A30;
```

### 8.2 Typography

- Heading: Lora.
- Body: Inter.
- Lebar konten artikel: 680-760px.
- Line-height body: 1.6-1.8.

### 8.3 Prinsip komponen

- Card bersifat editorial, bukan dashboard.
- Warna kelompok dipakai sebagai aksen, bukan background penuh halaman.
- Tombol dan area klik minimal sekitar 44px.
- Animasi ringan dan menghormati `prefers-reduced-motion`.
- Hero boleh memakai gerakan floating lambat, tanpa animasi berat.
- Placeholder hanya digunakan pada tahap prototipe/preview dan harus mudah dikenali sebagai `[DUMMY]`.
- Hero homepage memakai slideshow satu foto per 3 detik dengan crossfade ringan.
- Ornamen daun hero boleh menyentuh sekitar 20% bingkai foto, konsisten pada mobile, tablet, dan desktop.
- Peta Rencana Program menampilkan kelompok secara paralel tanpa angka indeks.
- Item pada Peta Rencana Program boleh menjadi link ke overview berfilter selama detail kegiatan belum tersedia.

---

## 9. Teknologi dan Arsitektur

| Kebutuhan | Teknologi |
|---|---|
| Framework | Astro |
| Artikel detail produksi | Google Sheets, dirender oleh template Astro |
| Artikel detail prototipe | Astro Content Collections + MDX, bersifat transisi sampai Fase 5A selesai |
| Seluruh teks dinamis produksi | Google Sheets |
| Foto mentah | Google Drive |
| Image processing | Sharp saat build |
| Output gambar | WebP statis di `public/_photos/` |
| Hosting | Cloudflare Pages |
| Source control | GitHub |
| Pemicu publish data | Google Apps Script + Cloudflare Deploy Hook |

Alur utama:

```txt
Google Sheets + Google Drive
                ↓
       Validasi dan normalisasi
                ↓
       Build-time photo pipeline
                ↓
             Astro build
                ↓
        Output website statis
                ↓
          Cloudflare Pages
```

Tidak ada runtime backend. Pengunjung hanya mengakses HTML, CSS, JavaScript ringan, dan gambar statis.

---

## 10. Sumber Kebenaran Data

| Jenis data | Sumber utama |
|---|---|
| Kelompok | Google Sheets |
| Kegiatan: metadata dan status | Google Sheets `Kegiatan` |
| Artikel kegiatan | Google Sheets `Artikel_Kegiatan` |
| Penerima manfaat | Google Sheets `Penerima_Manfaat` |
| Output program | Google Sheets `Output_Program` |
| Indikator | Google Sheets `Indikator` |
| Konteks dan relasi foto kegiatan | Google Sheets `Foto_Kegiatan`; file mentah tetap di Google Drive |
| UMKM: metadata dan cerita panjang | Google Sheets `UMKM` |
| Produk UMKM | Google Sheets `Produk` |
| Nama/konteks sekolah pada kegiatan | Field kegiatan/artikel di Sheets setelah verifikasi |
| Galeri | Diturunkan dari seluruh gambar pada artikel kegiatan aktif |
| Foto mentah | Google Drive |
| Proposal/rencana awal | PDF sebagai referensi, lalu dinormalisasi ke Sheets |

Aturan:

1. Field yang sama tidak dipelihara di dua sumber.
2. Seluruh teks dinamis produksi berasal dari Sheets.
3. Tidak ada metadata atau narasi produksi yang membutuhkan perubahan MDX.
4. MDX kegiatan dan UMKM pada repository adalah implementasi prototipe/transisi dan harus dipensiunkan dari jalur publik setelah parity Fase 5A terverifikasi.
5. Data proposal dimasukkan sebagai nilai rencana dan tidak menimpa nilai realisasi.
6. Sekolah tidak memiliki collection atau sheet publik tersendiri; identitas lembaga dicatat hanya bila diperlukan dalam konteks kegiatan dan telah terverifikasi.
7. Galeri tidak memiliki daftar publik kedua; seluruh item galeri harus dapat ditelusuri ke gambar pada artikel kegiatan aktif.

---

## 11. Schema Konten

### 11.1 TypeScript types

```ts
export type KelompokId = 't1' | 't2' | 't3';

export type ContentStatus =
  | 'planned'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type ProgramCategory =
  | 'umkm'
  | 'education'
  | 'aid_distribution'
  | 'supporting';

export type OutputType = 'physical' | 'non_physical';

export interface Beneficiary {
  id: string;
  activityId: string;
  label: string;
  planned: number | null;
  actual: number | null;
  unit: string;
  order: number;
}

export interface ProgramOutput {
  id: string;
  activityId: string;
  outputNumber: number;
  type: OutputType;
  name: string;
  planned: number | null;
  actual: number | null;
  unit: string;
  recipient?: string;
  verificationStatus: 'draft' | 'verified';
  order: number;
}

export interface SuccessIndicator {
  id: string;
  activityId: string;
  label: string;
  achieved: boolean | null;
  evidence?: string;
  order: number;
}
```

### 11.2 Sheet `Kelompok`

| Field | Tipe | Wajib |
|---|---|---|
| `id_kelompok` | `t1/t2/t3` | Ya |
| `nama_kelompok` | string | Ya |
| `desa` | string | Ya |
| `tema_program` | string | Ya |
| `deskripsi_singkat` | string | Ya |
| `thumbnail` | Drive URL/File ID | Tidak |
| `aktif` | boolean | Ya |

### 11.3 Kegiatan dalam MDX — legacy prototipe

Struktur berikut mendokumentasikan implementasi prototipe yang sedang berjalan. Struktur ini bukan sumber konten produksi final dan hanya boleh dipakai sebagai data migrasi serta pembanding parity selama Fase 5A.

Frontmatter minimum:

```yaml
---
title: "Sosialisasi Digital Marketing untuk UMKM"
slug: "sosialisasi-digital-marketing"
kelompok: "t1"
category: "umkm"
status: "planned"
csr_pillars:
  - "Pemberdayaan Ekonomi"
planned_date: null
actual_date: null
location: "Desa Sumbakeling"
description: "Edukasi foto produk dan pemasaran digital bagi pelaku UMKM."
thumbnail: null
beneficiaries:
  - label: "Pelaku UMKM dan remaja peminat usaha"
    planned: 15
    actual: null
    unit: "orang"
outputs:
  - type: "non_physical"
    name: "Edukasi foto produk dan katalog digital"
    planned: 1
    actual: null
    unit: "kegiatan"
  - type: "physical"
    name: "Mesin peniris minyak"
    planned: 1
    actual: null
    unit: "unit"
indicators:
  - label: "Peserta memahami dasar promosi digital"
    achieved: null
    evidence: null
images: []
active: true
---
```

Catatan:

- `planned_date` boleh kosong bila proposal belum menetapkan tanggal.
- `actual_date` hanya diisi setelah kegiatan.
- `actual` dan `achieved` tetap `null` selama kegiatan belum terverifikasi.
- `images[]` berisi referensi Drive yang diproses saat build.

### 11.4 Target schema Sheets produksi

#### Sheet `Kegiatan`

| Field | Tipe | Wajib |
|---|---|---|
| `kegiatan_id` | ID stabil | Ya |
| `id_kelompok` | `t1/t2/t3` | Ya |
| `slug` | lowercase-kebab-case | Ya |
| `judul` | string | Ya |
| `kategori` | enum kategori program | Ya |
| `status` | `draft/planned/ongoing/completed/cancelled` | Ya |
| `csr_pillars` | comma-separated string | Tidak |
| `tags` | comma-separated string | Tidak |
| `tanggal_rencana` | ISO date | Tidak |
| `tanggal_realisasi` | ISO date | Tidak |
| `lokasi` | string | Ya |
| `deskripsi_singkat` | string | Ya |
| `drive_folder_id` | Google Drive folder ID | Tidak |
| `status_verifikasi` | `draft/verified` | Ya |
| `aktif` | boolean | Ya |

#### Sheet `Artikel_Kegiatan`

| Field | Tipe | Wajib |
|---|---|---|
| `kegiatan_id` | FK ke `Kegiatan` | Ya |
| `penerima_manfaat_narasi` | multiline text | Tidak |
| `hasil_program_narasi` | multiline text | Tidak |
| `cerita_program` | multiline text | Tidak |
| `ukuran_keberhasilan_narasi` | multiline text | Tidak |

Heading dan fallback section tetap berasal dari kode. Baris kosong menghasilkan empty state yang sesuai. Paragraf multiline dirender sebagai paragraf teks aman dan tidak membutuhkan MDX atau raw HTML.

#### Sheet `Penerima_Manfaat`

| Field | Tipe | Wajib |
|---|---|---|
| `penerima_id` | ID stabil | Ya |
| `kegiatan_id` | FK ke `Kegiatan` | Ya |
| `label` | string | Ya |
| `planned` | number/null | Tidak |
| `actual` | number/null | Tidak |
| `unit` | string | Ya |
| `urutan` | integer | Ya |

#### Sheet `Output_Program`

| Field | Tipe | Wajib |
|---|---|---|
| `output_id` | ID stabil | Ya |
| `kegiatan_id` | FK ke `Kegiatan` | Ya |
| `nomor_output` | integer stabil per kegiatan | Ya |
| `jenis_output` | `physical/non_physical` | Ya |
| `nama_output` | string | Ya |
| `planned` | number/null | Tidak |
| `actual` | number/null | Tidak |
| `unit` | string | Ya |
| `penerima` | string | Tidak |
| `status_verifikasi` | `draft/verified` | Ya |
| `urutan` | integer | Ya |

#### Sheet `Indikator`

| Field | Tipe | Wajib |
|---|---|---|
| `indikator_id` | ID stabil | Ya |
| `kegiatan_id` | FK ke `Kegiatan` | Ya |
| `label` | string | Ya |
| `achieved` | boolean/null | Tidak |
| `evidence` | string | Tidak |
| `urutan` | integer | Ya |

#### Sheet `Foto_Kegiatan`

Tab ini menyimpan konteks render dan relasi foto, bukan salinan file serta bukan daftar galeri publik kedua. File mentah tetap berada di Google Drive. Pada Fase 5A, referensi yang saat ini berada di MDX dipindahkan ke tab ini. Pada Fase 5B, scanner Drive dapat mengisi atau memperbarui referensi berdasarkan folder dan pola nama yang disepakati.

| Field | Tipe | Wajib |
|---|---|---|
| `foto_id` | ID stabil | Ya |
| `kegiatan_id` | FK ke `Kegiatan` | Ya |
| `output_id` | FK ke `Output_Program` | Tidak |
| `indikator_id` | FK ke `Indikator` | Tidak |
| `peran` | `hero/narrative/output/evidence` | Ya |
| `bagian_artikel` | `penerima_manfaat/hasil_program/cerita_program/ukuran_keberhasilan` | Tidak |
| `drive_file` | Drive URL/File ID | Ya untuk referensi manual Fase 5A |
| `alt` | string bermakna | Ya |
| `caption` | string | Tidak |
| `deskripsi` | multiline text setelah foto pada alur artikel | Tidak* |
| `urutan` | integer | Ya |
| `status_verifikasi` | `draft/verified` | Ya |
| `aktif` | boolean | Ya |

Aturan relasi:

- `peran=output` wajib memiliki `output_id`.
- `peran=evidence` boleh memiliki `indikator_id`.
- `peran=narrative` boleh memiliki `bagian_artikel` agar foto muncul pada section yang tepat.
- Pada `bagian_artikel=cerita_program`, `Artikel_Kegiatan.cerita_program` menjadi prolog,
  sedangkan `Foto_Kegiatan.deskripsi` menjadi paragraf setelah foto dan caption terkait.
- `caption` tetap ringkas; `deskripsi` tidak digunakan sebagai caption galeri. Untuk foto
  `cerita_program` yang aktif dan `verified`, `deskripsi` wajib berisi minimal tiga kalimat.
- Setiap kegiatan hanya boleh memiliki satu foto `peran=hero` yang aktif.
- Hanya foto `verified` dan `aktif` dari kegiatan publik aktif yang boleh dirender atau diturunkan ke `/galeri`.
- Referensi file yang sama dideduplikasi saat membentuk galeri walaupun dipakai pada lebih dari satu konteks render.
- Ketersediaan `drive_file` atau hasil sinkronisasi tidak mengubah status kegiatan/output menjadi `completed`.

### 11.5 Sheet `UMKM`

| Field | Tipe | Wajib |
|---|---|---|
| `umkm_id` | ID stabil | Ya |
| `id_kelompok` | `t1/t2/t3` | Ya |
| `slug` | string | Ya |
| `nama` | string resmi | Ya |
| `pemilik` | string | Tidak |
| `kategori` | string | Ya |
| `tagline` | string | Tidak |
| `deskripsi_singkat` | string | Ya |
| `foto_hero` | Drive URL/File ID | Tidak |
| `whatsapp` | string | Tidak |
| `alamat` | string | Tidak |
| `maps_embed` | string | Tidak |
| `jam_operasional` | string | Tidak |
| `pendampingan` | comma-separated enum/string | Ya |
| `catalog_url` | URL | Tidak |
| `qris_image` | Drive URL/File ID | Tidak |
| `cerita_usaha` | multiline text | Tidak |
| `keunikan` | multiline text | Tidak |
| `dampak_pendampingan` | multiline text | Tidak |
| `status_verifikasi` | `draft/verified` | Ya |
| `aktif` | boolean | Ya |

Hanya baris `verified` dan `aktif` yang boleh ditampilkan ke publik.

### 11.6 Sheet `Produk`

| Field | Tipe | Wajib |
|---|---|---|
| `produk_id` | ID stabil | Ya |
| `umkm_id` | FK ke `UMKM` | Ya |
| `nama_produk` | string | Ya |
| `harga` | string | Tidak |
| `deskripsi` | string | Tidak |
| `foto` | Drive URL/File ID | Tidak |
| `aktif` | boolean | Ya |

Harga tidak wajib dan tidak boleh dipalsukan untuk melengkapi layout.

### 11.7 Representasi sekolah pada konten kegiatan

Tidak ada schema `Sekolah` publik. Informasi sekolah menggunakan field kegiatan yang sudah ada:

- `lokasi` untuk lokasi pelaksanaan,
- baris `Penerima_Manfaat` untuk peserta didik, guru, atau kelompok penerima manfaat,
- `Output_Program.penerima` untuk penerima bantuan bila perlu,
- field narasi `Artikel_Kegiatan` untuk nama lembaga, materi, metode, respons, dan dampak yang telah terverifikasi.

Nama sekolah tidak menjadi slug, relasi ke route detail, atau metadata promosi. Jika nama resmi belum terverifikasi, gunakan deskripsi sasaran yang netral atau kosongkan nama lembaga.

### 11.8 Data galeri turunan

Item galeri dibentuk saat build dari referensi gambar pada kegiatan. Bentuk data hasil normalisasi minimal:

| Field | Sumber |
|---|---|
| `activity_route` | Route artikel kegiatan sumber |
| `kelompok` | Sheet `Kegiatan` |
| `category` | Sheet `Kegiatan` |
| `tag` | Tags/caption kegiatan bila tersedia |
| `title` | Judul kegiatan atau konteks `Foto_Kegiatan` |
| `caption` | `Foto_Kegiatan.caption` atau `Foto_Kegiatan.alt` |
| `photo` | `Foto_Kegiatan.drive_file` yang telah diproses pipeline lokal |
| `date` | `actual_date` atau `planned_date` kegiatan bila tersedia |

Tidak ada field `aktif` terpisah untuk galeri. Status publik item mengikuti artikel kegiatan sumber agar gambar draft, cancelled yang tidak boleh dipublikasikan, atau artikel nonaktif tidak muncul secara tidak sengaja.

---

## 12. Struktur Folder Astro

```txt
src/
├── content/
│   ├── config.ts
│   ├── kegiatan/
│   │   ├── t1/
│   │   ├── t2/
│   │   └── t3/
│   ├── umkm/
│   │   ├── t1/
│   │   ├── t2/
│   │   └── t3/
│
├── data/
│   ├── config.ts
│   ├── sheets.ts
│   ├── types.ts
│   ├── schemas.ts
│   ├── normalize.ts
│   ├── validate.ts
│   └── format.ts
│
├── lib/
│   └── photos/
│       ├── index.ts
│       └── pipeline.ts
│
├── layouts/
│   ├── BaseLayout.astro
│   ├── ArticleLayout.astro
│   └── UMKMLayout.astro
│
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── HeroSection.astro
│   ├── GroupCard.astro
│   ├── OverviewCard.astro
│   ├── ArticleHeader.astro
│   ├── Breadcrumb.astro
│   ├── TableOfContents.astro
│   ├── StatusBadge.astro
│   ├── CSRProgramSummary.astro
│   ├── ProgramOutputs.astro
│   ├── BeneficiarySummary.astro
│   ├── SuccessIndicators.astro
│   ├── ImageGallery.astro
│   ├── InfoBox.astro
│   ├── MapEmbed.astro
│   ├── WhatsAppButton.astro
│   ├── QRCodeCard.astro
│   ├── UMKMProfile.astro
│   └── ProductCard.astro
│
└── pages/
    ├── index.astro
    ├── kegiatan/
    │   ├── index.astro
    │   └── [kelompok]/[slug].astro
    ├── umkm/
    │   ├── index.astro
    │   └── [kelompok]/[slug].astro
    └── galeri/
        └── index.astro
```

---

## 13. Komponen UI Wajib

### 13.1 Global

- Header.
- Footer.
- PrimaryButton.
- SecondaryButton.
- TextLink.
- GroupBadge.
- StatusBadge.
- Breadcrumb.
- EmptyState.

### 13.2 Overview

- HeroSection.
- GroupCard.
- ActivityCard.
- UMKMCard.
- FilterBar.
- Pagination/LoadMore.

### 13.3 Detail program

- ArticleHeader.
- ArticleBody.
- TableOfContents.
- InfoBox.
- ProgramOutputs.
- BeneficiarySummary.
- SuccessIndicators.
- ImageGallery.
- RelatedContent.
- PreviousNextNavigation.

### 13.4 Detail UMKM

- UMKMProfile.
- ProductCard.
- WhatsAppButton.
- QRCodeCard.
- MapEmbed.
- AidSummary.

---

## 14. Photo Pipeline

Foto mentah berasal dari Google Drive tetapi tidak disajikan langsung ke pengunjung.

Alur:

```txt
Admin upload foto ke Google Drive
↓
Referensi `drive://FILE_ID` (atau URL/File ID yang dinormalisasi) dibaca dari Sheets atau sumber transisi MDX
↓
Build mengumpulkan semua referensi foto
↓
Download dengan concurrency terbatas
↓
Resize maksimal 1600px
↓
Convert WebP quality 80
↓
Simpan ke public/_photos/
↓
Astro menggunakan URL lokal
```

Implementasi memakai `npm run photos:sync`, yang dipanggil otomatis sebelum `dev` dan `build`.
Sinkronisasi membuat `src/generated/photo-manifest.ts` untuk memetakan ID Drive ke aset lokal
bernama hash. Dengan begitu, perubahan foto menghasilkan URL baru dan tidak memakai hotlink Drive
pada pengunjung atau output Cloudflare.

Konfigurasi:

```txt
Output: public/_photos/
Cache: .cache/photos/
Max dimension: 1600px
Format: WebP
Quality: 80
Fallback: placeholder lokal
```

Sumber foto yang harus dikumpulkan:

- `Kelompok.thumbnail`
- Hero/thumbnail kegiatan yang dipetakan dari folder Drive kegiatan
- Foto output kegiatan berdasarkan `nomor_output`
- Foto naratif kegiatan yang benar-benar dirender pada artikel
- `UMKM.foto_hero`
- `UMKM.qris_image`
- `Produk.foto`
- Foto naratif kegiatan dan UMKM yang dipetakan dari Drive

Hanya hero/thumbnail, foto output, dan foto naratif yang benar-benar dirender pada kegiatan aktif yang menjadi sumber item publik `/galeri`. Aset UMKM tetap diproses untuk halaman promosi UMKM, tetapi tidak otomatis masuk ke galeri dokumentasi kegiatan. Pada target produksi, metadata konteks gambar berasal dari relasi Sheet dan manifest Drive, bukan daftar galeri manual atau body MDX.

Pure render utility tidak boleh mengimpor `fs` atau `sharp`. Logic download dan optimasi hanya berada di pipeline build-time.

`public/_photos/` dan `.cache/photos/` tidak di-commit ke Git. `src/generated/photo-manifest.ts`
merupakan keluaran kecil yang dilacak agar render dan test memiliki fallback deterministik sebelum
sinkronisasi pertama.

---

## 15. Environment Variables

```env
PUBLIC_SHEET_ID=ISI_ID_SPREADSHEET
PUBLIC_SITE_NAME=Jejak KKN Pancalang
PUBLIC_SITE_TAGLINE=Cerita, karya, dan pengabdian dari tiga desa.
PUBLIC_SITE_DESCRIPTION=Dokumentasi kegiatan dan promosi UMKM dalam implementasi program CSR KKN.
```

Nilai aktif prototipe untuk `.env` lokal:

```env
PUBLIC_SHEET_ID=1TZJrcIpQ2YGTSndRJv8_Onee-vkb71TrcyU3ObYj4uo
```

Jangan mengganti placeholder `PUBLIC_SHEET_ID` pada `.env.example` dengan ID tersebut.

Cloudflare Pages wajib memiliki:

```txt
PUBLIC_SHEET_ID
```

Deploy Hook tidak disimpan di repository atau spreadsheet. URL tersebut disimpan melalui Apps Script Properties dengan key:

```txt
CLOUDFLARE_DEPLOY_HOOK_URL
```

---

## 16. Workflow Pengelolaan Konten

### 16.1 Sebelum kegiatan

1. Proposal dinormalisasi menjadi baris Google Sheets berstatus `planned`.
2. Nama penerima yang belum resmi tetap kosong/draft.
3. Tanggal dan jumlah realisasi tetap `null`.
4. Halaman rencana boleh dipublikasikan.
5. Halaman rencana selalu memakai badge **Rencana** dan bahasa yang tidak mengklaim pelaksanaan.

### 16.2 Setelah kegiatan

1. Admin mengumpulkan data realisasi dan foto.
2. Admin memperbarui tanggal aktual, jumlah peserta, jumlah bantuan, indikator, artikel, UMKM, produk, dan status melalui Google Sheets.
3. Bukti foto kegiatan, profil UMKM, dan produk diunggah ke folder Google Drive yang ditentukan.
4. Konten diperiksa sebelum `status` menjadi `completed`.
5. Website dibangun ulang.

Pembaruan operasional dilakukan rutin pada malam hari setelah kelompok menyelesaikan program kerja. Data aktual hanya dimasukkan setelah kelompok menyerahkan informasi dan bukti yang dapat diperiksa.

### 16.3 Peran admin/DPL

- Mengelola seluruh teks dinamis dan metadata terstruktur di Sheets.
- Memastikan nama penerima dan data operasional benar.
- Mengunggah foto Drive dan memberikan akses viewer.
- Mengonfirmasi data realisasi.
- Menjalankan menu publish manual bila diperlukan.

### 16.4 Peran developer

- Menjaga schema dan validasi.
- Menjaga renderer teks multiline Sheets dan empty state kondisional.
- Menjaga photo pipeline.
- Memastikan route tidak berubah tanpa migrasi.
- Menjalankan QA dan deployment.

---

## 17. Otomatisasi Publish

Bagian ini adalah target Fase 5B dan belum boleh diimplementasikan pada task migrasi CMS Fase 5A.

Jalur kode:

```txt
Push GitHub
↓
Cloudflare Pages build
↓
Deploy
```

Jalur perubahan data:

```txt
Admin mengubah Google Sheets
↓
Apps Script menandai perubahan
↓
Debounce/cooldown 1-5 menit
↓
POST Cloudflare Deploy Hook
↓
Cloudflare menjalankan build
```

Apps Script menyediakan:

- trigger waktu harian sekitar pukul 12.00 zona `Asia/Jakarta`,
- pembacaan flag `Pengaturan.AUTO_REBUILD` agar trigger otomatis dapat dinonaktifkan tanpa menghapus trigger,
- cooldown agar build tidak terpanggil berulang,
- menu `KKN Web -> Rebuild sekarang` yang tetap berfungsi ketika `AUTO_REBUILD` nonaktif,
- pencatatan waktu dan status publish terakhir,
- penyimpanan Deploy Hook di Script Properties.

Automation Drive pada Fase 5B akan memeriksa perubahan folder dan pola nama file secara berkala, lalu memicu build hanya bila manifest konten berubah. Format foto output menggunakan `[nomor_output]-[slug-nama-output].[ext]`. Apps Script time-driven tidak dianggap jaminan eksekusi tepat pada detik 12.00; kebutuhan presisi tinggi harus memakai scheduler Cloudflare pada fase terpisah.

---

## 18. Validasi Wajib

Build gagal jika:

1. `id_kelompok` bukan `t1`, `t2`, atau `t3`.
2. Slug kosong atau duplikat dalam kelompok dan jenis konten yang sama.
3. Header atau nilai Sheet kegiatan/artikel tidak valid.
4. `status` tidak termasuk enum yang diizinkan.
5. `actual` terisi tetapi status masih `planned` tanpa alasan yang valid.
6. Status `completed` tetapi `actual_date` kosong.
7. UMKM aktif tidak memiliki nama resmi.
8. Child row mengarah ke `kegiatan_id`, `umkm_id`, atau ID induk yang tidak ada.
9. ID stabil atau kombinasi kelompok/slug duplikat.
10. Schema atau header Google Sheets berubah tanpa migrasi.
11. Item galeri tidak memiliki artikel kegiatan sumber yang aktif.
12. Navigasi atau konten publik masih menautkan route `/sekolah` setelah revisi struktur diterapkan.
13. `Foto_Kegiatan` memiliki foreign key yang tidak valid, peran tanpa relasi wajib, atau lebih dari satu hero aktif pada kegiatan yang sama.

Build tidak gagal, tetapi menghasilkan warning/fallback jika:

- foto gagal diunduh,
- maps tidak valid,
- WhatsApp kosong,
- harga produk kosong,
- field opsional kosong,
- indikator keberhasilan belum dinilai pada kegiatan yang belum selesai.

Normalisasi:

- WhatsApp menjadi format `62xxx`.
- Slug memakai lowercase-kebab-case.
- Tanggal memakai ISO `YYYY-MM-DD`.
- String kosong menjadi `null` pada field opsional.
- `aktif` kosong tidak otomatis dianggap publik; gunakan default aman `false` untuk data baru.
- Teks multiline Sheet dipecah menjadi paragraf aman; raw HTML tidak dirender secara default.

---

## 19. Accessibility, Responsive, dan Performance

### Accessibility

- Semantic HTML.
- Urutan heading benar.
- Semua gambar memiliki alt text kontekstual.
- Semua tombol dapat digunakan dengan keyboard.
- Menu mobile memiliki `aria-expanded` dan `aria-controls`.
- Kontras minimum mengikuti WCAG AA.
- Focus state terlihat.
- Animasi menghormati `prefers-reduced-motion`.

### Responsive

- Mobile-first.
- Card satu kolom pada mobile.
- Hero satu kolom pada mobile.
- Table of contents collapsible pada mobile.
- Sidebar berpindah ke atas atau menjadi collapsible.
- Tidak ada horizontal overflow pada 320px.

### Performance

- Static generation.
- Gambar WebP responsif.
- Lazy loading untuk gambar non-hero.
- Width dan height gambar selalu ditentukan.
- JavaScript hanya untuk menu, filter, table of contents, dan interaksi ringan.
- Tidak menggunakan framework client-side untuk fitur yang dapat diselesaikan dengan HTML/CSS.

---

## 20. Tahapan Implementasi

### Fase 1 - Fondasi — selesai

1. Inisialisasi Astro 7 dengan output statis.
2. Design tokens dan layout global.
3. Header, footer, button, badge, typography, serta menu mobile aksesibel.
4. Content Collections modern dan schema planned versus actual.
5. Loader, normalizer, helper publik, dan validator Sheets.
6. Unit test fondasi data.

### Fase 2 - Halaman dan komponen — selesai

Target akhir fase setelah revisi:

1. Homepage sebagai overview seluruh bagian website.
2. Overview kegiatan, UMKM, dan galeri.
3. Detail kegiatan.
4. Detail UMKM.
5. ProgramOutputs, BeneficiarySummary, dan SuccessIndicators.
6. Filter tanpa framework berat, empty state aman, dan QA responsif dasar.
7. Revisi homepage pada Bagian 2.4.
8. Hapus menu, overview, route detail, layout, dan card profil sekolah.
9. Arahkan tautan legacy sekolah ke `/kegiatan` bila route tersebut pernah dipublikasikan.
10. Bangun `/galeri` dari seluruh gambar artikel kegiatan aktif dan tautkan setiap item ke artikel sumber.

Implementasi awal sebelumnya mencakup overview dan detail sekolah. Bagian legacy tersebut sudah dipensiunkan; butir 8-10 telah diterapkan dan diverifikasi pada 17 Juli 2026.

### Fase 3 - Konten awal — selesai

1. Masukkan tujuh rangkaian program proposal sebagai MDX `planned` dan `active`.
2. Gunakan slug berikut:

   ```txt
   /kegiatan/t1/sosialisasi-digital-marketing
   /kegiatan/t1/edukasi-bahaya-game-online
   /kegiatan/t2/pelatihan-branding-dan-pengemasan
   /kegiatan/t2/pojok-bermain-edukatif
   /kegiatan/t3/katalog-digital-dan-qris
   /kegiatan/t3/workshop-pencegahan-cyberbullying
   /kegiatan/t3/bookmark-dan-bantuan-alat-olahraga
   ```

3. Gunakan proposal sebagai sumber rencana dan jangan mengarang realisasi.
4. `actual_date`, seluruh nilai `actual`, `indicators[].achieved`, dan evidence realisasi tetap `null`/kosong.
5. `planned_date` tetap `null` bila proposal tidak memberikan tanggal pasti.
6. `images` tetap kosong sampai dokumentasi kegiatan tersedia.
7. Nilai planned hanya boleh dimasukkan jika jelas disebutkan dalam proposal.
8. Semua halaman menampilkan badge **Rencana** dan memakai tense rencana.
9. Verifikasi tiga data kelompok dari Sheets; jangan membuat sumber metadata kelompok kedua.
10. Nama resmi UMKM yang belum tersedia tidak boleh dikarang. Nama sekolah hanya boleh dicantumkan sebagai konteks artikel kegiatan setelah terverifikasi; data dummy prototipe yang masih dipakai tetap memakai `[DUMMY]`.
11. Audit placeholder/dummy serta pastikan WhatsApp, QRIS, rekening, dan informasi sensitif kosong.
12. Pastikan overview, filter, homepage, tujuh route detail, related content, serta previous/next navigation bekerja tanpa broken link.
13. Jangan mengerjakan photo pipeline Fase 4, publish automation Fase 5, atau deployment dalam Fase 3.

Verifikasi wajib Fase 3:

1. Jalankan `npm test`, `npm run check`, dan `npm run build`.
2. Gunakan dev server background sesuai `AGENTS.md`; periksa status dan log, lalu hentikan server yang dibuat untuk QA.
3. QA browser pada 320, 390, 768, dan 1280px.
4. Uji homepage, filter kegiatan, tujuh detail kegiatan, previous/next, related content, empty gallery, console browser, dan horizontal overflow.
5. Pastikan build menghasilkan tujuh route detail kegiatan tanpa route draft.
6. Pastikan tidak ada data actual atau indikator tercapai pada konten `planned`.
7. Warning data kosong atau fallback jaringan yang memang expected boleh dilaporkan; seluruh error harus diperbaiki.

Hasil implementasi Fase 3:

1. Ketujuh route yang ditetapkan tersedia sebagai MDX `planned` dan `active`.
2. Proposal T1, T2, dan T3 diperiksa melalui ekstraksi teks dan render visual halaman sumber sebelum konten dinormalisasi.
3. Semua `planned_date`, `actual_date`, nilai `actual`, `indicators[].achieved`, evidence, thumbnail, dan `images` yang belum terverifikasi tetap `null` atau kosong sesuai schema.
4. Quantitas rencana hanya diambil dari sasaran, keluaran, dan RAB yang tertulis jelas pada proposal; nama penerima tidak dibuat.
5. Placeholder kegiatan sekarang menampilkan `[DUMMY] Placeholder gambar` pada card dan `[DUMMY] Placeholder gambar rencana` pada header detail.
6. Homepage menghitung 2 kegiatan T1, 2 kegiatan T2, dan 3 kegiatan T3 dari Content Collections, sedangkan nama desa pada Peta Rencana Program berasal dari Sheet `Kelompok`.
7. `tests/phase3-content.test.ts` menjaga jumlah/slug konten, status planned, ketiadaan data actual, bahasa rencana, ketiadaan kontak sensitif, dan label placeholder dummy.
8. Seluruh verifikasi wajib pada daftar di atas telah dijalankan dan lulus; warning expected dicatat pada snapshot implementasi aktif.

### Fase 4 - Foto dan media — selesai

1. Pure photo utility.
2. Build-time download dan Sharp pipeline.
3. Cache dan fallback.
4. Derivasi galeri dari seluruh gambar artikel kegiatan aktif.
5. Uji kesetaraan antara gambar yang tampil di detail kegiatan dan item yang tampil di `/galeri`.

Pipeline aktif menyinkronkan referensi Drive, mengoreksi orientasi, membatasi lebar 1600px, mengubah ke WebP quality 80, dan memakai nama berkas ber-hash serta manifest lokal. Foto yang tidak tersedia menghasilkan fallback aman.

### Fase 5A - CMS produksi tanpa MDX — selesai

1. Buat salinan native spreadsheet produksi tanpa mengubah spreadsheet prototipe.
2. Implementasikan tab dan relasi pada Bagian 2.5 serta 11.4.
3. Migrasikan tujuh kegiatan proposal, relasi media kegiatan yang sudah ada, dan data UMKM/produk prototipe sebagai seed produksi.
4. Refactor jalur publik agar seluruh teks dinamis berasal dari Sheets.
5. Pertahankan teks kondisional di kode.
6. Pensiunkan import, collection, type, validator, test, dan `mdx_path` yang hanya dibutuhkan MDX publik setelah parity terverifikasi.
7. Jangan mengerjakan trigger atau scanner Drive otomatis.

Hasil implementasi Fase 5A:

1. Spreadsheet prototipe disalin menjadi spreadsheet produksi native dengan ID baru; sumber tetap utuh sebagai arsip/fixture.
2. Sepuluh tab target memiliki header ketat, validation rule, dropdown enum, boolean eksplisit, format tanggal, field wajib, dan relasi berbasis ID stabil.
3. Tujuh kegiatan beserta artikel, penerima manfaat, 39 output, 22 indikator, dan 15 konteks foto dimigrasikan ke Sheets.
4. Dua puluh satu seed UMKM dan 40 produk dimigrasikan menggunakan `umkm_id`/`produk_id`; satu UMKM draft tetap tidak dipublikasikan.
5. Loader tunggal `src/data/sheets.ts` memuat sepuluh tab. Schema/header/FK invalid menggagalkan validasi, sedangkan kegagalan koneksi opsional memakai empty state aman.
6. Halaman publik dan pipeline foto tidak lagi membaca Content Collections, MDX, `mdx_path`, atau daftar foto dari sumber kedua.
7. Foto T1 tetap diproses ke 15 WebP lokal. Galeri menampilkan 14 gambar unik setelah deduplikasi hash dan tidak memuat gambar UMKM.
8. Suite Fase 5A memiliki 56 test dan seluruh `npm test`, `npm run check`, `npm run build`, serta QA browser lulus.
9. Apps Script, Deploy Hook, trigger waktu, scanner folder Drive, pencocokan nama file, dan deployment tetap ditunda ke fase berikutnya.

### Fase 5B - Publish automation — ditunda

1. Apps Script.
2. Flag `AUTO_REBUILD`.
3. Trigger harian sekitar pukul 12.00 WIB.
4. Cloudflare Deploy Hook.
5. Cooldown, deteksi perubahan, manual rebuild, dan log status.
6. Scanner folder Drive serta validasi format nama file.

### Fase 6 - QA dan deployment — belum dimulai

1. Schema validation.
2. Broken-link test.
3. Visual QA desktop/mobile.
4. Accessibility audit.
5. Performance audit.
6. Cloudflare deployment.

---

## 21. Strategi Pengujian

### Unit test

- `extractDriveId()`.
- `photoKey()`.
- `photoUrl()`.
- normalisasi WhatsApp.
- normalisasi slug.
- parsing boolean dan tanggal Sheets.
- validasi planned versus actual.

### Integration test

- Sheets loader dengan fixture.
- agregasi relasional antar-tab Sheets.
- route generation dari data kegiatan yang aktif.
- pengumpulan semua referensi foto.
- derivasi item galeri dari gambar artikel kegiatan aktif.
- fallback foto dan map.

### Content test

- tidak ada nama fiktif pada konten publik,
- status dan tense sesuai,
- seluruh data `completed` memiliki bukti realisasi,
- seluruh link terkait mengarah ke konten yang aktif,
- tidak ada menu, card, CTA, atau link publik menuju `/sekolah`,
- seluruh item `/galeri` berasal dari dan tertaut ke artikel kegiatan aktif,
- seluruh teks dinamis publik berasal dari Sheets dan tidak membutuhkan MDX,
- seluruh child row memiliki ID induk yang valid,
- nomor output unik dalam satu kegiatan dan konsisten dengan referensi fotonya,
- foto kegiatan memiliki konteks render, relasi, alt, dan artikel sumber yang valid tanpa daftar galeri manual,
- tema T1/T2/T3 sesuai proposal.

### Visual test

- homepage,
- tiga overview: kegiatan, UMKM, dan galeri,
- dua jenis detail: kegiatan dan UMKM,
- mobile 320/390px,
- tablet 768px,
- desktop 1200/1440px,
- menu mobile,
- filter,
- table of contents,
- empty state.

---

## 22. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Proposal berbeda dengan realisasi | Pisahkan planned dan actual serta gunakan status |
| Nama penerima belum resmi | Pada prototipe gunakan `[DUMMY]`; pada produksi jangan membuat halaman publik sebelum data resmi verified |
| Foto Drive tidak public | Warning dan fallback placeholder |
| Drive throttling | Cache dan batasi concurrency |
| Header Sheets berubah | Validasi schema dan gagalkan build |
| Relasi antar-tab Sheets rusak | Gunakan ID stabil, validasi foreign key, dan gagalkan build dengan pesan baris yang spesifik |
| Slug berubah setelah publikasi | Gunakan redirect dan jangan mengubah tanpa migrasi |
| Nama foto output tidak sesuai nomor/nama program | Validasi pola nama dan tampilkan warning; jangan menganggap program selesai hanya karena foto ditemukan |
| Banyak UMKM T3 | Pagination/filter dan card yang efisien |
| Route/promosi sekolah legacy tetap terlihat | Hapus menu, card, layout, dan route sekolah; tambahkan redirect ke `/kegiatan` bila diperlukan |
| Galeri berbeda dengan gambar artikel kegiatan | Turunkan galeri dari sumber gambar kegiatan yang sama dan uji kesetaraannya |
| Data dummy ikut terbawa ke produksi | Content test dan `status_verifikasi` |
| Build terlalu sering | Debounce Apps Script dan publish manual |
| Website terasa seperti laporan formal | Pertahankan visual editorial dan ringkas data administratif |

---

## 23. Keputusan Final

| Keputusan | Status |
|---|---|
| Framework Astro | Final |
| Hosting Cloudflare Pages | Final |
| Overview dan detail bersifat static-generated | Final |
| Seluruh teks dinamis produksi bersumber dari Google Sheets | Final |
| MDX hanya data prototipe/transisi dan dipensiunkan dari jalur publik setelah parity terverifikasi | Final |
| Teks kondisional antarmuka dan aturan empty/disabled/success tetap berada di kode | Final |
| Ketersediaan foto adalah bukti media, bukan penentu tunggal status keberhasilan program | Final |
| Hanya UMKM yang dipromosikan melalui overview dan detail tersendiri | Final |
| Sekolah hanya menjadi konteks/sasaran pada artikel kegiatan | Final |
| Tidak ada route, card, atau CTA promosi sekolah | Final |
| Galeri diturunkan dari seluruh gambar artikel kegiatan aktif | Final |
| Foto mentah dari Google Drive | Final |
| Foto dioptimasi saat build ke WebP | Final |
| Output foto di `public/_photos/` | Final |
| Route detail kegiatan dan UMKM memakai kelompok dan slug | Final |
| Planned dan actual dipisahkan | Final |
| Konten `planned` boleh tampil publik dengan badge Rencana | Final |
| Konten `planned` wajib memakai bahasa rencana, bukan klaim realisasi | Final |
| Nama penerima harus terverifikasi | Final |
| Dummy diperbolehkan selama prototipe dan wajib ditandai `[DUMMY]` | Final |
| WhatsApp, QRIS, rekening, dan informasi sensitif kosong selama prototipe | Final |
| Banyak UMKM per kelompok harus didukung | Final |
| Output fisik/nonfisik ditampilkan pada detail kegiatan | Final |
| RAB lengkap bukan fokus halaman publik | Final |
| Publish Sheets melalui Apps Script dan Deploy Hook | Final |
| Deploy Hook disimpan di Script Properties | Final |
| Trigger harian, pemantauan Drive, dan pencocokan nama foto dikerjakan terpisah pada Fase 5B | Final |
| Desain mengikuti `DESIGN-SPEC.md` | Final |

---

## 24. Keputusan yang Masih Terbuka

1. Nama resmi seluruh UMKM penerima T1, T2, dan T3.
2. Nama resmi sekolah sasaran hanya jika akan disebut di dalam artikel kegiatan; konfirmasi ini tidak digunakan untuk membuat halaman promosi sekolah.
3. Tanggal pelaksanaan aktual.
4. Jumlah peserta dan bantuan aktual.
5. Apakah ringkasan anggaran CSR perlu ditampilkan pada halaman khusus laporan.
6. Kebijakan QRIS untuk versi produksi; selama prototipe field dan gambar QRIS tetap kosong.
7. Apakah pencarian konten diperlukan setelah jumlah data bertambah.

Keputusan tersebut tidak menghambat migrasi schema dan data prototipe pada Fase 5A, tetapi wajib diselesaikan sebelum data terkait dinyatakan sebagai konten produksi terverifikasi.

---

## 25. Definition of Done

Proyek dianggap selesai jika:

1. Homepage serta overview kegiatan, UMKM, dan galeri dapat diakses.
2. Detail kegiatan dan detail UMKM dapat dirender.
3. Konten T1, T2, dan T3 selaras dengan proposal dan realisasi terverifikasi.
4. Tidak ada nama, tanggal, jumlah, harga, alamat, atau testimoni fiktif pada produksi.
5. Seluruh dummy prototipe mudah dikenali dengan `[DUMMY]` dan tidak ikut produksi tanpa audit.
6. Konten `planned` selalu memiliki badge Rencana dan tidak memakai bahasa realisasi.
7. Status planned/ongoing/completed berfungsi konsisten.
8. Output fisik dan nonfisik dapat ditampilkan.
9. Data planned dan actual tidak tertukar.
10. Seluruh tab Google Sheets produksi berhasil dibaca, divalidasi, dan direlasikan dengan ID stabil.
11. Halaman publik produksi tidak lagi bergantung pada Content Collections, MDX, atau `mdx_path`.
12. Foto Drive berhasil diproses ke WebP lokal.
13. Fallback gambar bekerja.
14. Filter kelompok dan kategori bekerja.
15. Tidak ada menu, card, CTA, overview, atau detail promosi sekolah.
16. Kegiatan dengan sasaran sekolah tetap terdokumentasi lengkap sebagai artikel kegiatan.
17. `/galeri` memuat seluruh gambar pada artikel kegiatan aktif dan setiap item tertaut ke artikel sumber.
18. Website nyaman pada mobile, tablet, dan desktop.
19. Tidak ada broken link atau horizontal overflow.
20. Accessibility minimum terpenuhi.
21. Cloudflare Pages build berhasil.
22. Perubahan Sheets dapat memicu deploy melalui Apps Script.
23. Menu publish manual berfungsi.
24. Dokumentasi workflow cukup jelas untuk admin dan developer berikutnya.
25. Admin dapat memperbarui konten rutin melalui Google Sheets dan Google Drive tanpa mengubah source code.

---

## 26. Checklist Status Proyek

```txt
[x] Buat proyek Astro
[x] Sediakan PROJECT.md dan DESIGN-SPEC.md
[x] Implementasikan design tokens
[x] Buat schema Content Collections
[x] Buat schema Sheets dan validator
[x] Buat implementasi awal homepage serta halaman overview
[x] Buat implementasi awal tiga jenis route/layout detail
[x] Buat komponen output CSR
[x] Hubungkan Google Sheets melalui loader dan helper publik
[x] Jalankan QA responsif dasar dan aksesibilitas komponen
[x] Masukkan tujuh program proposal sebagai planned
[x] Hapus menu, overview, detail, layout, dan card promosi sekolah
[x] Tambahkan redirect route sekolah legacy ke /kegiatan bila diperlukan
[x] Pastikan kegiatan dengan sasaran sekolah hanya tampil sebagai artikel /kegiatan
[x] Ubah /galeri agar diturunkan dari seluruh gambar artikel kegiatan aktif
[x] Implementasikan photo pipeline
[ ] Konfirmasi nama resmi UMKM; konfirmasi nama sekolah hanya bila disebut dalam artikel kegiatan
[x] Buat salinan native Google Sheet khusus produksi dengan ID berbeda dari spreadsheet prototipe
[x] Terapkan schema tab produksi dan relasi berbasis ID stabil
[x] Migrasikan seluruh teks dinamis kegiatan, artikel, output, indikator, UMKM, dan produk ke Sheets
[x] Migrasikan konteks dan relasi foto kegiatan yang sudah ada ke Foto_Kegiatan tanpa membuat daftar galeri kedua
[x] Pensiunkan Content Collections/MDX dan mdx_path dari jalur publik setelah parity terverifikasi
[x] Verifikasi empty, partial, ongoing, dan completed state dari fixture Sheets
[ ] Siapkan Apps Script dan Deploy Hook
[ ] Jalankan QA final, broken-link test, audit aksesibilitas, dan audit performa
[ ] Deploy ke Cloudflare Pages
```

Dokumen ini harus diperbarui jika ada perubahan arsitektur, sumber data, ruang lingkup program, keputusan konten, atau revisi UI/UX yang sudah disetujui. Setelah Fase 5A selesai, perubahan realisasi kegiatan sehari-hari cukup diperbarui melalui Google Sheets dan Google Drive, kecuali perubahan tersebut juga mengubah aturan atau workflow proyek.
