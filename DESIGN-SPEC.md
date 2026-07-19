# DESIGN-SPEC.md

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan untuk membuat **preview desain statis** website dokumentasi KKN sebelum desain diterapkan ke proyek Astro utama.

Preview hanya bertujuan untuk mengevaluasi:

- arah visual,
- warna,
- tata letak,
- typography,
- bentuk komponen,
- hierarki informasi,
- responsivitas dasar.

Preview belum perlu terhubung ke Google Sheets, MDX, Google Drive, Cloudflare Pages, atau pipeline gambar.

---

## 2. Output yang Harus Dibuat

Codex cukup membuat tiga file dasar:

```txt
design-preview/
├── index.html
├── style.css
└── script.js
```

Ketentuan:

1. `index.html` berisi seluruh struktur halaman preview.
2. `style.css` berisi seluruh styling dan responsive layout.
3. `script.js` hanya dibuat jika diperlukan untuk interaksi sederhana.
4. Tidak menggunakan framework.
5. Tidak menggunakan build tool.
6. Tidak menggunakan dependency eksternal selain font dari Google Fonts jika diperlukan.
7. Preview harus dapat dibuka langsung melalui browser.

---

## 3. Scope Preview

Preview cukup mencakup satu halaman panjang yang merepresentasikan komponen utama website.

Bagian yang harus ditampilkan:

1. Header dan navigasi.
2. Hero section.
3. Ringkasan tiga kelompok KKN.
4. Section kegiatan terbaru.
5. Section UMKM binaan.
6. Sorotan kegiatan edukasi sebagai bagian dari dokumentasi kegiatan, bukan promosi sekolah.
7. Galeri foto yang bersumber dari artikel kegiatan.
8. Call to action atau informasi singkat.
9. Footer.
10. Satu contoh potongan layout artikel detail kegiatan.

Tidak perlu membuat banyak file HTML untuk setiap route. Semua contoh tampilan boleh ditempatkan dalam satu halaman agar proses evaluasi desain lebih cepat. Manusia rupanya tetap perlu melihat bentuk benda sebelum percaya bahwa benda itu akan bekerja.

### 3.1 Batasan promosi dan struktur publik

1. Hanya UMKM yang dipromosikan melalui card profil, overview, dan halaman detail tersendiri.
2. Sekolah tidak memiliki item navigasi, overview, halaman detail, card profil, CTA kunjungan, atau copy promosi.
3. Sekolah boleh muncul secara faktual sebagai lokasi, sasaran, mitra, atau penerima manfaat di card dan artikel kegiatan.
4. Struktur navigasi publik yang direpresentasikan preview adalah `Beranda`, `Kegiatan`, `UMKM`, dan `Galeri`.
5. Galeri merepresentasikan seluruh gambar yang benar-benar tampil pada artikel kegiatan dan setiap item mengarah kembali ke artikel sumber.

---

## 4. Design Direction

Arah desain utama:

```txt
Humanis
+
Bernuansa desa
+
Modern
+
Hangat
+
Mudah dibaca
```

Karakter visual yang diharapkan:

- terasa dekat dengan masyarakat,
- tidak terlalu formal,
- tidak terasa seperti dashboard pemerintahan,
- tidak terlalu ramai,
- memakai elemen visual yang lembut,
- menampilkan foto sebagai bagian utama cerita,
- tetap terlihat modern dan terstruktur.

Nuansa desa tidak boleh diterjemahkan secara berlebihan menjadi ornamen tradisional di setiap sudut. Gunakan pendekatan yang lebih halus melalui warna alami, bentuk organik, tekstur ringan, ilustrasi garis, dan komposisi foto.

---

## 5. Design Tokens

### 5.1 Warna Utama

Warna utama website adalah biru muda.

Rekomendasi awal:

```css
--color-primary: #7CB9E8;
--color-primary-dark: #4F8FBE;
--color-primary-soft: #EAF6FD;
```

Fungsi:

- tombol utama,
- link,
- highlight navigasi,
- elemen dekoratif,
- background section tertentu.

---

### 5.2 Warna Kelompok

#### T1

Karakter warna: merah muda.

```css
--color-t1: #E89AB7;
--color-t1-soft: #FBEAF1;
--color-t1-dark: #B95E80;
```

#### T2

Karakter warna: maroon.

```css
--color-t2: #7A263A;
--color-t2-soft: #F4E7EA;
--color-t2-dark: #501725;
```

#### T3

Karakter warna: olive drab gelap.

```css
--color-t3: #556B2F;
--color-t3-soft: #EDF1E5;
--color-t3-dark: #39481F;
```

Warna kelompok digunakan untuk:

- badge kelompok,
- accent card,
- label kategori,
- decorative line,
- background lembut,
- state aktif filter.

Warna kelompok tidak boleh mengambil alih seluruh desain halaman.

---

### 5.3 Warna Netral

Rekomendasi awal:

```css
--color-background: #FAF9F5;
--color-surface: #FFFFFF;
--color-surface-soft: #F3F0E8;
--color-text: #24313A;
--color-text-muted: #66727A;
--color-border: #DDD9CF;
--color-dark: #1E2A30;
```

Catatan:

- background utama sebaiknya tidak putih murni,
- gunakan warna krem sangat muda agar terasa lebih hangat,
- teks utama harus tetap memiliki kontras tinggi.

---

## 6. Typography

Gunakan kombinasi font yang humanis, ramah, dan mudah dibaca.

Rekomendasi awal:

```txt
Heading: Fraunces / Lora / Libre Baskerville
Body: Inter / Source Sans 3 / Nunito Sans
```

Pilihan default yang disarankan:

```txt
Heading: Lora
Body: Inter
```

Alasan:

- `Lora` memberi nuansa editorial dan humanis,
- `Inter` menjaga keterbacaan pada konten panjang dan mobile.

Skala typography awal:

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.375rem;
--font-size-2xl: 1.75rem;
--font-size-3xl: 2.25rem;
--font-size-4xl: 3rem;
```

Aturan:

1. Heading menggunakan serif.
2. Body menggunakan sans-serif.
3. Line-height body antara `1.6` sampai `1.8`.
4. Panjang teks artikel maksimal sekitar `680px–760px`.
5. Heading tidak boleh terlalu rapat.
6. Typography mobile harus tetap nyaman tanpa ukuran judul berlebihan.

---

## 7. Layout System

### 7.1 Container

```css
--container-max: 1200px;
--content-max: 760px;
```

Aturan:

- halaman utama memakai container maksimal sekitar `1200px`,
- artikel detail memakai lebar maksimal sekitar `760px`,
- section diberi ruang vertikal yang cukup,
- konten tidak boleh menempel ke sisi layar.

---

### 7.2 Spacing

Gunakan sistem spacing konsisten:

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.5rem;
--space-6: 2rem;
--space-7: 3rem;
--space-8: 4rem;
--space-9: 6rem;
```

---

### 7.3 Border Radius

Gunakan bentuk sedikit membulat untuk memberi kesan ramah.

```css
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 22px;
--radius-pill: 999px;
```

Card tidak perlu terlalu membulat seperti aplikasi anak-anak.

---

### 7.4 Shadow

Gunakan shadow tipis.

```css
--shadow-sm: 0 4px 14px rgba(30, 42, 48, 0.06);
--shadow-md: 0 10px 30px rgba(30, 42, 48, 0.10);
```

Shadow tidak boleh terlalu tebal atau gelap.

---

## 8. Responsive Breakpoints

Gunakan pendekatan mobile-first.

Rekomendasi breakpoint:

```css
@media (min-width: 640px) {}
@media (min-width: 768px) {}
@media (min-width: 1024px) {}
@media (min-width: 1280px) {}
```

Perilaku:

- mobile: satu kolom,
- tablet: dua kolom bila cukup,
- desktop: tiga kolom untuk card tertentu,
- navigasi mobile menggunakan menu sederhana,
- section hero berubah dari satu kolom menjadi dua kolom pada desktop.

---

## 9. Struktur Halaman Preview

### 9.1 Header

Isi:

- logo atau nama website,
- menu `Beranda`,
- `Kegiatan`,
- `UMKM`,
- `Galeri`,
- tombol kecil seperti `Jelajahi Kegiatan`.

Desktop:

- logo di kiri,
- menu di tengah atau kanan,
- CTA di sisi kanan.

Mobile:

- logo di kiri,
- tombol menu di kanan,
- menu dapat dibuka melalui `script.js`.

Header bersifat ringan dan tidak terlalu tinggi.

---

### 9.2 Hero Section

Struktur desktop:

```txt
Kolom kiri:
- badge kecil
- heading utama
- paragraf pendek
- tombol utama
- tombol sekunder

Kolom kanan:
- placeholder gambar besar
- kartu statistik atau badge dekoratif
```

Contoh teks boleh mengarang, misalnya:

```txt
Cerita, karya, dan pengabdian dari tiga desa.
```

Hero harus menunjukkan karakter website sejak pertama dilihat:

- hangat,
- dekat dengan masyarakat,
- berbasis dokumentasi foto,
- tidak terasa seperti portal berita formal.

Gunakan bentuk background organik atau blok warna lembut sebagai dekorasi.

---

### 9.3 Ringkasan Kelompok

Tampilkan tiga card:

- T1 — Desa Sumbakeling,
- T2 — Desa Silebu,
- T3 — Desa Pancalang.

Masing-masing card memakai accent warna kelompok.

Isi card:

- badge kelompok,
- nama desa,
- deskripsi singkat,
- jumlah kegiatan dummy,
- link untuk melihat kelompok.

Perbedaan warna harus jelas tetapi tetap harmonis.

---

### 9.4 Kegiatan Terbaru

Tampilkan 3–6 card kegiatan.

Isi card:

- placeholder gambar,
- badge kelompok,
- tanggal,
- judul,
- deskripsi singkat,
- link baca selengkapnya.

Card harus lebih berorientasi visual dan editorial, bukan seperti card dashboard.

---

### 9.5 UMKM Binaan

Gunakan layout yang sedikit berbeda dari kegiatan agar halaman tidak monoton.

Rekomendasi:

- satu card besar unggulan,
- dua card kecil,
- informasi nama usaha,
- kategori,
- desa,
- tombol WhatsApp dummy.

Gunakan accent biru muda dan warna kelompok secukupnya.

Section ini merupakan area promosi utama website. Copy boleh menonjolkan identitas usaha, produk, keunggulan, jam operasional, lokasi, serta kontak yang terverifikasi tanpa mengubah halaman menjadi marketplace.

---

### 9.6 Sorotan Kegiatan Edukasi

Tampilkan section dengan:

- satu gambar utama dari artikel kegiatan,
- teks pengantar tentang proses atau manfaat kegiatan edukasi,
- daftar singkat kegiatan edukasi dari T1, T2, dan T3 bila tersedia,
- satu atau dua card kegiatan yang mengarah ke `/kegiatan/[kelompok]/[slug]`.

Nuansa section boleh lebih terang dan bersih.

Jangan menampilkan card profil sekolah, logo/nama sekolah sebagai materi promosi, informasi kunjungan, atau tombol menuju `/sekolah`. Nama sekolah hanya boleh menjadi metadata faktual pada kegiatan bila telah terverifikasi.

---

### 9.7 Galeri

Gunakan grid foto sederhana.

Rekomendasi:

- masonry palsu melalui variasi ukuran grid,
- placeholder abu-abu atau gambar lokal yang juga dipakai pada contoh artikel kegiatan,
- hover menampilkan caption dan judul kegiatan sumber,
- tidak perlu lightbox kompleks.

Pada mobile, gunakan dua kolom atau satu kolom tergantung ukuran layar.

Galeri tidak menampilkan koleksi foto sekolah atau produk UMKM yang berdiri sendiri. Semua item harus merepresentasikan gambar pada halaman kegiatan dan dapat diklik menuju artikel kegiatan sumber.

---

### 9.8 Informasi atau Call to Action

Buat satu section berwarna biru muda lembut.

Isi contoh:

- pesan singkat tentang dokumentasi KKN,
- tombol menuju kegiatan,
- ornamen sederhana.

CTA tidak harus menjual sesuatu. Website ini dokumentasi, bukan marketplace yang mengalami krisis identitas.

---

### 9.9 Footer

Isi:

- nama website,
- deskripsi singkat,
- link navigasi,
- informasi tiga kelompok,
- copyright dummy.

Footer menggunakan warna gelap dengan kontras yang nyaman.

Link navigasi footer mengikuti header dan tidak memuat menu `Sekolah`.

---

## 10. Preview Layout Artikel Detail

Tambahkan satu section khusus yang memperlihatkan contoh halaman artikel.

Struktur:

```txt
Breadcrumb
↓
Badge kelompok
↓
Judul artikel
↓
Metadata tanggal dan lokasi
↓
Hero image
↓
Konten artikel
↓
Heading bagian
↓
Paragraf
↓
Info box
↓
Gambar tambahan
↓
Table of contents sederhana di desktop
```

Kebutuhan:

- article body mudah dibaca,
- heading memiliki hierarki jelas,
- gambar memiliki caption,
- info box menggunakan warna lembut,
- table of contents tidak perlu sticky jika menyulitkan preview.

---

## 11. Komponen Visual Dasar

Preview harus memiliki contoh komponen berikut:

1. Primary button.
2. Secondary button.
3. Text link.
4. Badge kelompok.
5. Card kegiatan.
6. Card kelompok.
7. Card UMKM.
8. Card kegiatan edukasi.
9. Item galeri yang tertaut ke artikel sumber.
10. Info box.
11. Placeholder image.
12. Breadcrumb.
13. Table of contents.
14. Navigation mobile.
15. Footer link.
16. Empty state sederhana bila perlu.

---

## 12. Placeholder Gambar

Gambar akan disediakan kemudian.

Untuk saat ini:

1. Gunakan elemen placeholder dengan rasio konsisten.
2. Gunakan background netral.
3. Tampilkan teks kecil seperti `Placeholder 16:9`.
4. Jangan mengambil gambar acak dari internet.
5. Gunakan rasio berikut:

```txt
Hero: 4:3 atau 16:10
Card kegiatan: 16:9
Card UMKM: 4:3
Galeri: variasi 1:1, 4:3, dan 3:4
Artikel: 16:9
```

---

## 13. Interaksi JavaScript

`script.js` hanya diperlukan untuk:

1. membuka dan menutup menu mobile,
2. menambahkan state aktif sederhana,
3. filter galeri dummy jika ingin ditampilkan,
4. scroll ke section tertentu,
5. toggle table of contents pada mobile.

Tidak perlu:

- fetch API,
- data dinamis,
- routing SPA,
- framework JavaScript,
- penyimpanan state kompleks,
- animasi berat.

---

## 14. Animasi

Gunakan animasi ringan:

- hover card naik sedikit,
- tombol memiliki transition,
- gambar sedikit zoom saat hover,
- section dapat memakai fade-in ringan bila sederhana.

Aturan:

```css
transition-duration: 160ms–240ms;
```

Hindari:

- parallax,
- animasi berlebihan,
- elemen bergerak terus,
- loading palsu,
- efek 3D.

---

## 15. Accessibility

Preview minimal harus mengikuti aturan berikut:

1. Semua tombol dapat difokuskan melalui keyboard.
2. Gunakan semantic HTML.
3. Kontras teks harus terbaca.
4. Ukuran area klik minimal sekitar `44px`.
5. Heading mengikuti urutan `h1`, `h2`, `h3`.
6. Placeholder gambar menggunakan elemen dengan label yang jelas.
7. Menu mobile memiliki atribut `aria-expanded`.
8. Gunakan `prefers-reduced-motion` untuk mengurangi animasi.

---

## 16. Ketentuan Implementasi CSS

Codex harus:

1. menggunakan CSS custom properties,
2. menggunakan Grid dan Flexbox,
3. menerapkan mobile-first,
4. menghindari inline style,
5. tidak memakai Bootstrap, Tailwind, atau library CSS,
6. menjaga class name tetap jelas,
7. membagi CSS berdasarkan section menggunakan komentar,
8. tidak membuat styling yang bergantung pada JavaScript.

Contoh struktur CSS:

```css
/* Reset */
/* Tokens */
/* Base */
/* Layout */
/* Header */
/* Hero */
/* Groups */
/* Activities */
/* UMKM */
/* Education Activities */
/* Gallery */
/* Article Preview */
/* Footer */
/* Utilities */
/* Responsive */
```

---

## 17. Konten Dummy

Codex bebas membuat konten dummy selama:

- memakai bahasa Indonesia,
- relevan dengan KKN,
- menyebut T1, T2, dan T3,
- menyebut Desa Sumbakeling, Silebu, dan Pancalang,
- tidak memakai lorem ipsum,
- panjang teks cukup untuk menguji layout.

---

## 18. Batasan Preview

Preview ini bukan implementasi final.

Jangan mengerjakan:

1. integrasi Astro,
2. integrasi Google Sheets,
3. MDX,
4. pipeline Sharp,
5. Google Drive,
6. Cloudflare Pages,
7. Google Apps Script,
8. routing dinamis,
9. SEO final,
10. data produksi.

---

## 19. Kriteria Evaluasi

Preview dianggap berhasil jika:

1. arah humanis dan bernuansa desa terasa jelas,
2. warna biru muda menjadi identitas utama,
3. warna T1, T2, dan T3 dapat dibedakan,
4. hierarki konten mudah dipahami,
5. tampilan tidak terlalu formal,
6. card tidak terasa seperti dashboard,
7. typography nyaman dibaca,
8. layout mobile dan desktop tetap rapi,
9. halaman artikel terlihat cocok untuk konten panjang,
10. UMKM terlihat sebagai satu-satunya entitas yang dipromosikan melalui profil tersendiri,
11. sekolah hanya tampil sebagai konteks dokumentasi kegiatan dan tidak menyerupai direktori promosi,
12. galeri terlihat sebagai agregasi gambar dari artikel kegiatan,
13. desain cukup jelas untuk diberi umpan balik sebelum dipindahkan ke Astro.

---

## 20. Instruksi Akhir untuk Codex

Buat preview statis berdasarkan dokumen ini.

Prioritas pengerjaan:

```txt
Arah visual
↓
Layout
↓
Typography
↓
Warna
↓
Komponen
↓
Responsivitas
↓
Interaksi kecil
```

Hasil akhir cukup berupa:

```txt
index.html
style.css
script.js
```

Jangan mengintegrasikan preview ke proyek Astro sebelum desain mendapatkan persetujuan.
