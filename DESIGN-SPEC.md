# DESIGN-SPEC — Audit UX dan Rekomendasi Redesign

## 1. Status dokumen

Dokumen ini menggantikan spesifikasi preview lama dan menjadi acuan redesign berbasis audit untuk website **Jejak KKN Pancalang**.

Status saat ini:

- audit UX dan aksesibilitas awal: selesai;
- rekomendasi struktur dan alur: disetujui;
- arah visual high-fidelity: diterapkan langsung pada project Astro;
- implementasi Astro: selesai;
- QA responsive desktop/mobile, pemeriksaan tipe, test, dan build produksi: lulus.

Redesign harus tetap mempertahankan karakter yang sudah kuat: humanis, hangat, bernuansa desa, modern, mudah dibaca, dan menjadikan foto kegiatan sebagai bukti utama.

---

## 2. Tujuan produk

Website memiliki dua fungsi utama yang harus terlihat jelas sejak layar pertama:

1. Mendokumentasikan rencana, proses, hasil, dan bukti kegiatan mahasiswa KKN.
2. Membantu warga menemukan dan menghubungi UMKM lokal yang datanya sudah aman untuk dipublikasikan.

Website bukan marketplace penuh dan bukan dashboard internal. Pengalaman yang diutamakan adalah menemukan informasi, memahami konteks, melihat bukti, lalu melakukan tindakan sederhana seperti membaca detail, membagikan kegiatan, membuka lokasi, atau menghubungi UMKM.

---

## 3. Target pengguna dan kebutuhan utama

| Pengguna | Kebutuhan utama | Tindakan yang harus mudah |
| --- | --- | --- |
| Warga desa | Mengetahui kegiatan di desanya dan manfaatnya | Pilih desa, lihat kegiatan terbaru, buka bukti, bagikan informasi |
| Calon pembeli UMKM | Menemukan produk lokal yang relevan dan dapat dipercaya | Cari produk, bandingkan informasi dasar, hubungi penjual, buka lokasi |
| Mahasiswa KKN | Mendokumentasikan program dengan struktur yang konsisten | Temukan kegiatan per kelompok, periksa status, buka detail, bagikan dokumentasi |
| Perangkat desa | Memahami cakupan, status, penerima manfaat, dan bukti program | Lihat ringkasan per desa, buka hasil program, periksa data yang sudah diverifikasi |

Prinsip penting: pengunjung umum tidak perlu memahami struktur internal T1, T2, dan T3 sebelum menemukan informasi yang mereka butuhkan. Nama desa dan jenis kebutuhan harus lebih menonjol; kode kelompok tetap dipakai sebagai metadata dan filter.

---

## 4. Ruang lingkup audit

Audit dilakukan pada build situs saat ini dengan dua ukuran layar:

- desktop: `1440 × 900`;
- mobile: `390 × 844`.

Halaman dan keadaan yang diperiksa:

1. beranda desktop;
2. susunan section beranda;
3. detail kegiatan desktop;
4. isi panjang detail kegiatan;
5. detail UMKM desktop;
6. beranda mobile;
7. menu mobile terbuka;
8. detail kegiatan mobile;
9. detail UMKM mobile;
10. daftar isi artikel pada mobile.

Bukti screenshot disimpan di [`outputs/ux-audit-2026-07-23`](outputs/ux-audit-2026-07-23/).

Audit aksesibilitas ini belum merupakan sertifikasi WCAG. Screenshot dan pemeriksaan struktur dapat menemukan risiko yang terlihat, tetapi pengujian pembaca layar, zoom 200–400%, seluruh urutan keyboard, perangkat sentuh nyata, dan kombinasi browser masih harus dilakukan saat implementasi.

---

## 5. Ringkasan hasil audit

### 5.1 Penilaian umum

Fondasi visual dan struktur semantik situs sudah baik. Identitas desa terasa hangat, judul mudah dikenali, navigasi global sederhana, dan detail kegiatan memiliki bukti yang lebih lengkap daripada situs dokumentasi KKN pada umumnya.

Masalah utamanya bukan kekurangan konten, melainkan **terlalu banyak jalur dan detail yang memiliki bobot visual serupa**. Beranda memprioritaskan cara tim KKN mengelompokkan program, bukan tugas utama pengunjung. Detail kegiatan kaya informasi tetapi membutuhkan ringkasan dan pengelompokan yang lebih tajam. Detail UMKM belum bekerja optimal sebagai halaman promosi karena tindakan “hubungi/pesan” tidak menjadi pusat pengalaman.

### 5.2 Kekuatan yang dipertahankan

1. Navigasi utama hanya memiliki empat label yang mudah dipahami: Beranda, Kegiatan, UMKM, dan Galeri.
2. Hero menyampaikan identitas wilayah, tujuan dokumentasi, dan nuansa humanis dengan cepat.
3. Foto asli menjadi pusat cerita, bukan dekorasi.
4. Status program dibedakan dari realisasi; ini penting untuk kepercayaan perangkat desa dan warga.
5. Detail kegiatan memakai heading, region, daftar isi, breadcrumb, dan konten terkait yang terstruktur.
6. Menu mobile memiliki label buka/tutup, `aria-expanded`, dan indikator fokus yang terlihat.
7. Skip link, urutan heading, teks alternatif gambar, dan ukuran teks body memberi fondasi aksesibilitas yang baik.

---

## 6. Temuan audit berdasarkan area evaluasi

### 6.1 Struktur navigasi

**Temuan**

- Empat menu utama sudah jelas dan tidak perlu ditambah.
- CTA global “Jelajahi kegiatan” menduplikasi menu Kegiatan. Sementara itu, jalur calon pembeli menuju UMKM tidak mendapat prioritas setara.
- Struktur T1/T2/T3 muncul sangat awal, padahal warga lebih mudah mengenali desa daripada kode kelompok.
- Detail panjang tidak menyediakan tindakan yang selalu mudah ditemukan untuk kembali, membagikan, atau berpindah ke tujuan berikutnya.

**Rekomendasi**

- Pertahankan menu utama `Beranda`, `Kegiatan`, `UMKM`, dan `Galeri`.
- Ubah CTA global menjadi `Temukan produk UMKM` agar navigasi melayani dua fungsi situs, bukan menggandakan Kegiatan.
- Gunakan nama desa sebagai label utama; T1/T2/T3 menjadi badge sekunder.
- Pada mobile, ganti breadcrumb panjang menjadi tautan `← Kembali ke Kegiatan` atau `← Kembali ke UMKM`, lalu tampilkan judul halaman tanpa separator yang terpisah.

**Alasan**

Pengguna seharusnya dapat memilih antara jalur dokumentasi dan jalur promosi UMKM sejak awal. Nama desa juga memiliki beban kognitif lebih rendah bagi warga dan perangkat desa.

### 6.2 Hierarki informasi

**Temuan**

- Hierarki hero kuat, tetapi beranda setelah hero terlalu berorientasi pada organisasi internal: ringkasan kelompok lalu peta program muncul sebelum konten terbaru dan UMKM.
- Kegiatan yang sama dapat muncul di peta program, kegiatan terbaru, kegiatan edukasi, dan galeri. Pengulangan membuat beranda sangat panjang dan mengurangi kejelasan prioritas.
- Banyak section menggunakan pola heading, card, dan CTA yang sama sehingga seluruh bagian terasa memiliki urgensi setara.
- Detail kegiatan memuat penerima manfaat, output, bantuan, cerita, dan indikator secara lengkap, tetapi tidak memberi ringkasan cepat sebelum pengunjung memasuki artikel panjang.
- Detail UMKM menempatkan informasi pendampingan KKN dan keadaan data kosong hampir setara dengan produk dan cara membeli.

**Rekomendasi**

- Setelah hero, tampilkan konten yang menjawab tugas pengunjung: kegiatan terbaru dan UMKM pilihan.
- Gabungkan ringkasan kelompok dan peta program menjadi satu `Ringkasan per desa`.
- Jadikan pendidikan sebagai filter/kategori Kegiatan, bukan section beranda tersendiri.
- Tambahkan `Ringkasan kegiatan` pada detail berisi status, desa, tanggal, penerima manfaat, dan hasil utama.
- Pada detail UMKM, urutan informasi harus menjadi produk → cara memesan → lokasi/jam → cerita usaha → pendampingan KKN.

**Alasan**

Konten yang membantu pengunjung memutuskan tindakan harus muncul sebelum struktur organisasi, metodologi data, dan rincian pendukung.

### 6.3 User flow

**Temuan**

- Jalur kegiatan sudah tersedia, tetapi pengguna harus melewati banyak pilihan yang serupa.
- Jalur UMKM belum selesai ketika kontak tidak tersedia; tombol yang tampak nonaktif menjadi jalan buntu.
- Filter berbasis kelompok berguna bagi mahasiswa, tetapi warga dan pembeli juga membutuhkan filter desa dan kategori yang lebih eksplisit.
- Tidak ada tindakan berbagi yang terlihat pada awal detail kegiatan atau UMKM.

**Rekomendasi**

- Sediakan empat alur utama pada bagian 9 dokumen ini.
- Pertahankan filter kelompok, tetapi selalu pasangkan dengan nama desa.
- Jika WhatsApp belum terverifikasi, jangan tampilkan kontrol bergaya tombol. Tampilkan pesan informatif dan alternatif yang valid, misalnya `Lihat produk` atau `Buka lokasi`.
- Tambahkan `Bagikan` pada detail kegiatan dan detail UMKM menggunakan Web Share API dengan fallback salin tautan.

**Alasan**

Setiap flow harus memiliki akhir yang jelas. Kontrol nonaktif yang terlihat seperti CTA utama menimbulkan harapan yang tidak dapat dipenuhi.

### 6.4 Kejelasan CTA

**Temuan**

- `Jelajahi kegiatan` kuat secara visual, tetapi terlalu sering diulang.
- CTA hero sekunder `Kenali tiga kelompok` menjelaskan struktur tim, bukan kebutuhan utama pengguna.
- Card kegiatan dan UMKM memiliki link detail yang jelas.
- Detail kegiatan tidak memiliki CTA utama di area judul.
- Detail UMKM menampilkan `Kontak belum tersedia` di posisi CTA utama.

**Rekomendasi**

- Hero memakai dua jalur yang eksplisit:
  - utama: `Lihat kegiatan terbaru`;
  - sekunder: `Cari produk UMKM`.
- CTA global header: `Temukan produk UMKM`.
- Detail kegiatan: `Lihat dokumentasi` dan `Bagikan`.
- Detail UMKM: `Pesan via WhatsApp` hanya jika nomor terverifikasi; sekunder `Lihat lokasi` dan `Bagikan`.
- Gunakan satu CTA utama per konteks. Link lain memakai gaya sekunder atau text link.

**Alasan**

Label CTA harus menyatakan hasil setelah klik, bukan sekadar ajakan umum seperti “jelajahi”.

### 6.5 Aksesibilitas

**Kekuatan terkonfirmasi**

- Ada skip link menuju konten utama.
- Heading dan landmark tersusun secara semantik.
- Menu mobile mengumumkan keadaan buka/tutup.
- Tombol menu sekitar target sentuh minimum dan focus ring terlihat.
- Teks body pada mobile cukup besar dan memiliki jarak baris yang nyaman.

**Risiko**

- Warna biru `#4F8FBE` pada latar `#FAF9F5` memiliki rasio sekitar `3.32:1`; ini belum cukup untuk teks kecil normal yang memerlukan `4.5:1`.
- Badge T1 memakai `#B95E80` pada `#FBEAF1` dengan rasio sekitar `3.65:1`; teks kecil badge berisiko tidak memenuhi kontras minimum.
- Menu mobile terbuka tanpa backdrop yang cukup jelas; konten hero di belakang tetap bersaing secara visual.
- Perlu dipastikan menu mengunci scroll halaman, menjebak fokus secara wajar, dapat ditutup dengan `Escape`, dan mengembalikan fokus ke tombol pemicu.
- Breadcrumb mobile membungkus separator dan judul menjadi beberapa baris yang sulit dipindai.
- Label abu-abu kecil pada daftar isi dan metadata perlu diuji pada perangkat dengan kecerahan rendah.

**Rekomendasi minimum**

- Gunakan warna link/eyebrow kecil yang mencapai `4.5:1`.
- Gelapkan warna teks T1 atau gunakan latar yang lebih terang.
- Target sentuh minimum `44 × 44px` dengan jarak antarkontrol yang cukup.
- Pertahankan indikator fokus minimum `3:1` terhadap warna di sekelilingnya.
- Tambahkan backdrop menu, `Escape`, pengembalian fokus, dan pencegahan scroll latar.
- Uji kembali dengan keyboard penuh, pembaca layar, zoom 200–400%, dan mode `prefers-reduced-motion`.

### 6.6 Tampilan mobile

**Temuan**

- Hero mobile tersusun rapi, terbaca, dan tidak mengalami overflow horizontal.
- Dua CTA hero bertumpuk dengan baik, tetapi mendorong foto utama ke bawah fold.
- Menu mobile cukup jelas, tetapi panel dan latar memiliki kontras pemisah yang lemah.
- Judul artikel panjang masih terbaca, namun breadcrumb mengambil ruang dan menghasilkan baris separator yang canggung.
- Detail kegiatan sangat panjang; daftar isi membantu, tetapi keadaan terbuka menambah tinggi halaman sebelum konten utama.
- Detail UMKM menampilkan informasi pemilik dan jam sebelum foto produk/produk, sehingga calon pembeli belum melihat apa yang dijual pada satu layar pertama.

**Rekomendasi**

- Pada hero mobile, tampilkan satu CTA utama dan satu text link agar foto atau bukti visual muncul lebih cepat.
- Jadikan daftar isi mobile tertutup secara default, tetapi tetap menampilkan label dan jumlah bagian.
- Gunakan sticky action bar yang ringan pada detail UMKM ketika kontak terverifikasi.
- Letakkan foto produk dan CTA pesan sebelum metadata pemilik yang kurang penting bagi keputusan awal.
- Uji pada lebar `320px`, `360px`, `390px`, dan `430px`.

### 6.7 Masalah khusus beranda

1. Beranda terlalu panjang karena mengulang kegiatan dalam beberapa bentuk.
2. Konten terpenting bagi warga dan pembeli muncul terlalu jauh setelah struktur kelompok.
3. CTA global dan CTA hero terlalu fokus pada Kegiatan.
4. Ringkasan kelompok menggunakan kode internal sebagai pembeda utama.
5. Belum ada entry point cepat berdasarkan kebutuhan: kegiatan desa, produk, dan ringkasan hasil.
6. Label status dan data dummy jujur, tetapi terlalu dominan untuk pengalaman publik.

### 6.8 Masalah khusus halaman detail

**Detail kegiatan**

- Kuat dalam bukti dan transparansi.
- Judul, deskripsi, metadata, dan hero image membentuk pembukaan yang jelas.
- Informasi penting baru tersebar di beberapa section; perlu ringkasan cepat.
- Hero image besar menghasilkan jarak tempuh panjang sebelum daftar isi dan isi.
- Tidak ada CTA berbagi atau navigasi aksi di atas fold.
- Bukti, output, dan indikator dapat terasa berulang jika tidak dikelompokkan.

**Detail UMKM**

- Nama, kategori, desa, jam, produk, lokasi, dan pendampingan tersedia.
- Foto placeholder dan tombol kontak nonaktif membuat halaman terasa belum siap dipromosikan.
- Produk dan cara membeli tidak diprioritaskan.
- Narasi “data belum tersedia” muncul beberapa kali dan mendominasi halaman.
- Tautan katalog menuju URL contoh harus dianggap tidak dapat dipublikasikan.

---

## 7. Sitemap rekomendasi

```text
Beranda /
├── Kegiatan /kegiatan
│   ├── Filter: desa/kelompok
│   ├── Filter: kategori
│   ├── Filter: status
│   └── Detail kegiatan /kegiatan/[kelompok]/[slug]
├── UMKM /umkm
│   ├── Pencarian produk atau nama usaha
│   ├── Filter: kategori
│   ├── Filter: desa
│   └── Detail UMKM /umkm/[kelompok]/[slug]
├── Galeri /galeri
│   ├── Filter: desa
│   ├── Filter: kegiatan
│   └── Setiap foto kembali ke detail kegiatan sumber
└── Informasi pendukung di footer
    ├── Tentang program
    ├── Kebijakan dan status verifikasi data
    └── Kontak tim/desa jika telah disetujui untuk publik
```

Keputusan sitemap:

- Tidak menambah `Sekolah` sebagai entitas publik.
- Tidak membuat halaman detail foto terpisah.
- Tidak membuat halaman T1/T2/T3 tersendiri; filter sudah cukup.
- Informasi transparansi data ditempatkan di footer atau panel kontekstual, bukan menjadi tujuan navigasi utama.

---

## 8. User flow rekomendasi

### 8.1 Warga desa mencari kegiatan

1. Beranda.
2. Pilih desa dari `Ringkasan per desa` atau buka `Kegiatan`.
3. Lihat daftar yang sudah terfilter berdasarkan desa.
4. Buka detail kegiatan.
5. Baca ringkasan, lihat dokumentasi dan hasil.
6. Bagikan tautan atau lanjut ke kegiatan terkait.

Target: kegiatan relevan dapat ditemukan dalam maksimal dua keputusan setelah beranda.

### 8.2 Calon pembeli mencari produk UMKM

1. Beranda.
2. Klik `Cari produk UMKM`.
3. Cari nama produk/usaha atau pilih kategori dan desa.
4. Buka profil UMKM.
5. Lihat foto, harga/rentang harga, jam, dan metode pemesanan.
6. Klik `Pesan via WhatsApp` atau `Lihat lokasi`.

Target: CTA pemesanan yang valid terlihat tanpa harus membaca riwayat pendampingan.

### 8.3 Mahasiswa mencari dokumentasi kelompok

1. Buka `Kegiatan`.
2. Filter kelompok, status, atau kategori.
3. Buka detail.
4. Periksa ringkasan, output, penerima manfaat, bukti, dan indikator.
5. Bagikan tautan dokumentasi atau buka kegiatan berikutnya.

Target: status rencana, berlangsung, dan selesai tidak pernah tercampur.

### 8.4 Perangkat desa memeriksa hasil program

1. Beranda.
2. Buka `Ringkasan per desa`.
3. Lihat jumlah kegiatan, status, penerima manfaat, dan output terverifikasi.
4. Buka detail kegiatan.
5. Periksa bukti, catatan verifikasi, dan indikator.
6. Bagikan atau cetak halaman bila diperlukan.

Target: angka rencana dan angka realisasi selalu memiliki label sumber/status.

---

## 9. Susunan section setiap halaman

### 9.1 Beranda

1. **Header**
   - logo;
   - Beranda, Kegiatan, UMKM, Galeri;
   - CTA `Temukan produk UMKM`.
2. **Hero**
   - identitas wilayah;
   - satu kalimat nilai utama;
   - CTA `Lihat kegiatan terbaru`;
   - text link `Cari produk UMKM`;
   - satu foto utama nyata.
3. **Akses cepat berdasarkan desa**
   - Sumbakeling, Silebu, Pancalang;
   - jumlah kegiatan dan status singkat;
   - kode T1/T2/T3 sebagai metadata.
4. **Kegiatan terbaru**
   - maksimal tiga card;
   - status, tanggal, desa, judul, ringkasan;
   - CTA `Lihat semua kegiatan`.
5. **UMKM pilihan**
   - maksimal tiga profil dengan data terverifikasi;
   - foto produk, kategori, desa, rentang harga bila tersedia;
   - CTA `Lihat produk` atau `Hubungi usaha`.
6. **Ringkasan dampak program**
   - angka hanya dari data terverifikasi;
   - pisahkan rencana dan realisasi;
   - link menuju kegiatan sumber.
7. **Galeri terbaru**
   - empat sampai enam foto;
   - setiap foto menuju kegiatan sumber.
8. **Catatan transparansi data**
   - singkat dan tidak mengganggu alur utama.
9. **CTA akhir**
   - `Lihat semua kegiatan` atau `Temukan UMKM`.
10. **Footer**
   - navigasi;
   - tiga desa;
   - kebijakan verifikasi;
   - kontak publik bila tersedia.

Section `Peta rencana program` dan `Kegiatan edukasi` tidak berdiri sendiri di beranda. Keduanya digabung ke ringkasan desa atau menjadi filter pada Kegiatan.

### 9.2 Daftar Kegiatan

1. Header.
2. Judul dan penjelasan singkat.
3. Pencarian judul/kata kunci.
4. Filter desa/kelompok, kategori, dan status.
5. Ringkasan hasil, misalnya `7 kegiatan ditemukan`.
6. Grid/list card kegiatan.
7. Empty state dengan tombol reset filter.
8. Pagination atau `Muat lebih banyak`.
9. Footer.

Pada mobile, filter dibuka melalui tombol `Filter`, menampilkan jumlah filter aktif, dan dapat dibersihkan dalam satu tindakan.

### 9.3 Detail Kegiatan

1. Header.
2. Breadcrumb desktop / tautan kembali mobile.
3. Badge desa/kelompok, kategori, dan status.
4. Judul dan ringkasan satu paragraf.
5. Metadata utama: tanggal, lokasi, status verifikasi.
6. CTA `Lihat dokumentasi` dan `Bagikan`.
7. Hero image.
8. Daftar isi desktop sticky / mobile collapsed.
9. Ringkasan kegiatan:
   - penerima manfaat;
   - hasil utama;
   - bantuan fisik;
   - status indikator.
10. Cerita pelaksanaan dengan urutan kronologis.
11. Galeri bukti.
12. Output dan bantuan.
13. Indikator serta catatan verifikasi.
14. Navigasi sebelumnya/berikutnya.
15. Kegiatan terkait.
16. Footer.

### 9.4 Daftar UMKM

1. Header.
2. Hero direktori dengan CTA dan penjelasan bahwa kontak hanya ditampilkan setelah verifikasi.
3. Pencarian nama usaha atau produk.
4. Filter kategori dan desa.
5. UMKM pilihan/terverifikasi.
6. Grid seluruh hasil.
7. Empty state.
8. Catatan keamanan dan sumber data.
9. Footer.

Card minimum:

- foto produk/usaha;
- nama;
- kategori;
- desa;
- satu produk utama atau rentang harga;
- indikator `Kontak tersedia` bila benar;
- CTA `Lihat produk`.

### 9.5 Detail UMKM

1. Header.
2. Breadcrumb desktop / tautan kembali mobile.
3. Badge desa dan kategori.
4. Nama usaha, tagline, dan deskripsi singkat.
5. Foto utama/galeri produk.
6. CTA:
   - `Pesan via WhatsApp` bila nomor terverifikasi;
   - `Lihat lokasi`;
   - `Bagikan`.
7. Informasi cepat:
   - jam operasional;
   - cara pesan;
   - area layanan;
   - rentang harga.
8. Produk unggulan dengan foto dan harga.
9. Cerita usaha.
10. Lokasi/peta.
11. Bentuk pendampingan KKN.
12. Data dampak yang sudah terverifikasi.
13. UMKM terkait.
14. Footer.

Jika kontak belum tersedia, tampilkan pesan informatif biasa. Jangan gunakan tombol nonaktif sebagai CTA utama.

### 9.6 Galeri

1. Header.
2. Judul dan penjelasan bahwa foto berasal dari kegiatan.
3. Filter desa dan kegiatan.
4. Grid foto dengan caption ringkas.
5. Lightbox dengan tombol tutup, navigasi keyboard, dan caption.
6. Link `Lihat cerita kegiatan` pada setiap item.
7. Footer.

### 9.7 Halaman 404

1. Pesan sederhana.
2. CTA `Kembali ke beranda`.
3. Link `Lihat kegiatan` dan `Cari UMKM`.

---

## 10. Keputusan desain dan alasannya

| Keputusan | Alasan |
| --- | --- |
| Mempertahankan empat menu utama | Struktur saat ini sudah sederhana dan mudah dipahami |
| Mengubah CTA global menjadi UMKM | Menghilangkan duplikasi Kegiatan dan menyeimbangkan dua fungsi situs |
| Memakai desa sebagai label utama | Warga lebih mengenali desa daripada kode kelompok |
| Mengurangi pengulangan section beranda | Memperpendek halaman dan memperjelas prioritas |
| Menempatkan kegiatan terbaru sebelum peta program | Pengunjung lebih sering mencari apa yang baru/terjadi daripada struktur rencana |
| Menampilkan UMKM lebih awal | Mendukung tujuan promosi dan flow calon pembeli |
| Menambahkan ringkasan pada detail kegiatan | Membantu scanning sebelum membaca artikel panjang |
| Memindahkan pendampingan KKN ke bawah pada detail UMKM | Keputusan pembelian bergantung pada produk, harga, cara pesan, dan lokasi |
| Menghilangkan CTA nonaktif | Mencegah jalan buntu dan ekspektasi palsu |
| Menutup daftar isi mobile secara default | Mengurangi panjang awal tanpa kehilangan navigasi internal |
| Mengganti breadcrumb mobile dengan tautan kembali | Menghindari pembungkus separator dan judul yang canggung |
| Menambahkan CTA berbagi | Dokumentasi warga dan promosi UMKM membutuhkan distribusi melalui aplikasi pesan |
| Menampilkan hanya angka terverifikasi | Menjaga kepercayaan dan mencegah rencana dianggap sebagai realisasi |

---

## 11. Prioritas perbaikan

### P0 — harus diselesaikan sebelum visual final

1. Tetapkan hierarki CTA: Kegiatan dan UMKM mendapat jalur yang jelas.
2. Pangkas dan urutkan ulang section beranda.
3. Prioritaskan produk, kontak, dan lokasi pada detail UMKM.
4. Definisikan state ketika WhatsApp, harga, foto, atau lokasi belum terverifikasi.
5. Perbaiki warna teks biru kecil dan badge T1 agar memenuhi kontras minimum.
6. Perbaiki breadcrumb mobile.
7. Tetapkan perilaku menu mobile: backdrop, scroll lock, `Escape`, focus trap, dan return focus.
8. Pastikan URL contoh dan data `[DUMMY]` tidak masuk versi publik.

### P1 — dampak tinggi setelah struktur disetujui

1. Tambahkan pencarian dan filter desa/kategori/status.
2. Tambahkan ringkasan cepat pada detail kegiatan.
3. Tambahkan CTA berbagi.
4. Jadikan daftar isi mobile collapsed secara default.
5. Gabungkan output, bantuan, bukti, dan indikator agar tidak terasa berulang.
6. Tambahkan indikator data terverifikasi yang konsisten.
7. Uji keyboard, screen reader, zoom, dan target sentuh.

### P2 — penyempurnaan

1. Sticky action bar ringan pada detail UMKM mobile.
2. Empty state dan reset filter yang lebih membantu.
3. Penyesuaian caption galeri dan related content.
4. Pengukuran analitik untuk CTA Kegiatan, UMKM, WhatsApp, lokasi, dan berbagi.
5. Optimasi panjang copy dan metadata card berdasarkan data produksi.

---

## 12. Kriteria penerimaan redesign

Redesign dianggap siap masuk tahap visual apabila:

1. Setiap target pengguna memiliki flow yang berakhir pada tindakan jelas.
2. Dua fungsi situs—dokumentasi kegiatan dan promosi UMKM—terlihat pada layar pertama.
3. Tidak ada kegiatan yang diulang dalam lebih dari dua section beranda.
4. Nama desa lebih menonjol daripada kode kelompok.
5. Detail kegiatan memiliki ringkasan sebelum isi panjang.
6. Detail UMKM menampilkan produk dan CTA valid sebelum pendampingan KKN.
7. Tidak ada tombol utama nonaktif tanpa alternatif.
8. Kontras teks normal minimal `4.5:1`; teks besar dan komponen UI minimal `3:1`.
9. Semua kontrol dapat digunakan dengan keyboard dan memiliki focus state.
10. Mobile tidak mengalami overflow pada lebar `320px`.
11. Target sentuh minimal `44 × 44px`.
12. Menu mobile mengelola fokus, backdrop, dan scroll latar dengan benar.
13. Rencana, berlangsung, selesai, dan terverifikasi memiliki arti serta tampilan yang konsisten.
14. Data dummy, URL contoh, dan kontak yang belum aman tidak muncul pada versi publik.

---

## 13. Batasan tahap berikutnya

Tahap setelah dokumen ini disetujui adalah membuat wireframe rendah fidelitas untuk:

1. beranda desktop dan mobile;
2. daftar Kegiatan;
3. detail Kegiatan;
4. daftar UMKM;
5. detail UMKM.

Wireframe harus menguji urutan, panjang halaman, posisi CTA, filter, serta state data kosong. Warna final, tipografi final, ilustrasi, animasi, dan polish visual belum perlu diputuskan pada tahap tersebut.
