import fs from 'node:fs/promises';
import path from 'node:path';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = path.resolve('.');
const previewDir = path.join(outputDir, 'previews');
const outputPath = path.join(outputDir, 'Jejak-KKN-Pancalang-Dummy-Data.xlsx');

const colors = {
  dark: '#1E2A30',
  primary: '#7CB9E8',
  primarySoft: '#EAF6FD',
  border: '#DDD9CF',
  text: '#24313A',
  muted: '#66727A',
  t1: '#E89AB7',
  t2: '#7A263A',
  t3: '#556B2F',
  warning: '#FBF0DC',
};

const placeholder = (label, background = 'EAF6FD', foreground = '24313A') =>
  `https://placehold.co/1200x800/${background}/${foreground}?text=${encodeURIComponent(label)}`;

const columnName = (index) => {
  let value = index + 1;
  let name = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
};

const workbook = Workbook.create();
workbook.comments.setSelf({ displayName: 'User' });

const addDataSheet = ({
  name,
  headers,
  rows,
  widths,
  wrapColumns = [],
  freezeColumns = 1,
  bodyRowHeight = 36,
  tableName,
}) => {
  const sheet = workbook.worksheets.add(name);
  const matrix = [headers, ...rows];
  const endColumn = columnName(headers.length - 1);
  const usedRange = sheet.getRange(`A1:${endColumn}${matrix.length}`);

  usedRange.values = matrix;
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  sheet.freezePanes.freezeColumns(freezeColumns);

  const table = sheet.tables.add(`A1:${endColumn}${matrix.length}`, true, tableName);
  table.style = 'TableStyleMedium2';
  table.showBandedRows = true;
  table.showFilterButton = true;

  sheet.getRange(`A1:${endColumn}1`).format = {
    fill: colors.dark,
    font: { bold: true, color: '#FFFFFF', size: 10 },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
    wrapText: true,
    borders: { preset: 'outside', style: 'medium', color: colors.dark },
  };
  sheet.getRange(`A1:${endColumn}1`).format.rowHeight = 32;

  if (rows.length > 0) {
    sheet.getRange(`A2:${endColumn}${matrix.length}`).format = {
      font: { color: colors.text, size: 9 },
      verticalAlignment: 'top',
      borders: {
        insideHorizontal: { style: 'thin', color: colors.border },
        bottom: { style: 'thin', color: colors.border },
      },
    };
    sheet.getRange(`A2:${endColumn}${matrix.length}`).format.rowHeight = bodyRowHeight;
  }

  widths.forEach((width, index) => {
    const column = columnName(index);
    sheet.getRange(`${column}1:${column}${matrix.length}`).format.columnWidth = width;
  });

  wrapColumns.forEach((index) => {
    const column = columnName(index);
    sheet.getRange(`${column}2:${column}${matrix.length}`).format.wrapText = true;
  });

  workbook.comments.addThread(
    { cell: sheet.getRange('A1') },
    'DATA DUMMY: seluruh isi workbook ini dibuat untuk prototipe website dan harus diganti sebelum publikasi produksi.',
  );

  return sheet;
};

const groupHeaders = [
  'id_kelompok',
  'nama_kelompok',
  'desa',
  'tema_program',
  'deskripsi_singkat',
  'thumbnail',
  'aktif',
];

const groupRows = [
  [
    't1',
    'Kelompok T1 [DUMMY]',
    'Desa Sumbakeling',
    'Pemasaran digital UMKM dan penggunaan gadget sehat',
    'Program demo pendampingan UMKM keripik pisang serta edukasi gadget sehat bagi anak usia dini.',
    placeholder('T1 Sumbakeling', 'FBEAF1'),
    true,
  ],
  [
    't2',
    'Kelompok T2 [DUMMY]',
    'Desa Silebu',
    'Branding kemasan dan pojok bermain edukatif',
    'Program demo penguatan identitas produk, pengemasan, pemasaran digital, dan aktivitas bermain edukatif.',
    placeholder('T2 Silebu', 'F4E7EA'),
    true,
  ],
  [
    't3',
    'Kelompok T3 [DUMMY]',
    'Desa Pancalang',
    'Katalog digital, QRIS, dan pertemanan aman di internet',
    'Program demo katalog QR Code, transaksi digital UMKM, pencegahan cyberbullying, dan etika media sosial.',
    placeholder('T3 Pancalang', 'EDF1E5'),
    true,
  ],
];

const groupSheet = addDataSheet({
  name: 'Kelompok',
  headers: groupHeaders,
  rows: groupRows,
  widths: [12, 25, 22, 42, 52, 38, 10],
  wrapColumns: [3, 4, 5],
  bodyRowHeight: 38,
  tableName: 'KelompokTable',
});
groupSheet.getRange('A2:A100').dataValidation = {
  rule: { type: 'list', values: ['t1', 't2', 't3'] },
};
groupSheet.getRange('G2:G100').dataValidation = {
  rule: { type: 'list', values: ['TRUE', 'FALSE'] },
};

const umkmHeaders = [
  'id_kelompok',
  'slug',
  'nama',
  'pemilik',
  'kategori',
  'tagline',
  'deskripsi_singkat',
  'foto_hero',
  'whatsapp',
  'alamat',
  'maps_embed',
  'jam_operasional',
  'pendampingan',
  'catalog_url',
  'qris_image',
  'mdx_path',
  'status_verifikasi',
  'aktif',
];

const umkmSeed = [
  ['t1', 'keripik-pisang-mekar-sari-demo', 'Keripik Pisang Mekar Sari [DUMMY]', 'Ibu Rina [DUMMY]', 'Makanan ringan', 'Renyah dari kebun desa', 'Keripik pisang rumahan dengan beberapa pilihan rasa dan kemasan praktis.', 'foto produk, katalog digital, kemasan, sealer'],
  ['t1', 'dapur-kue-nyi-rasa-demo', 'Dapur Kue Nyi Rasa [DUMMY]', 'Ibu Lilis [DUMMY]', 'Kue kering', 'Camilan hangat untuk keluarga', 'Usaha demo kue kering rumahan yang dipasarkan melalui pesanan dan kegiatan warga.', 'foto produk, pemasaran digital, kemasan'],
  ['t1', 'kopi-pojok-sumbakeling-demo', 'Kopi Pojok Sumbakeling [DUMMY]', 'Bapak Dani [DUMMY]', 'Minuman', 'Seduhan sederhana dari desa', 'Produk demo kopi bubuk dan minuman siap seduh untuk pasar lokal.', 'foto produk, katalog digital, pemasaran digital'],
  ['t1', 'emping-melinjo-harapan-demo', 'Emping Melinjo Harapan [DUMMY]', 'Ibu Yani [DUMMY]', 'Makanan ringan', 'Gurih tipis, dibuat telaten', 'Usaha demo emping melinjo dengan produksi skala rumah tangga.', 'kemasan, sealer, pemasaran digital'],
  ['t2', 'rengginang-silebu-jaya-demo', 'Rengginang Silebu Jaya [DUMMY]', 'Ibu Enok [DUMMY]', 'Makanan ringan', 'Rengginang renyah untuk segala suasana', 'Produk demo rengginang tradisional dengan pengembangan label dan kemasan.', 'branding, label produk, kemasan, sealer'],
  ['t2', 'sambal-pawon-ambu-demo', 'Sambal Pawon Ambu [DUMMY]', 'Ibu Nani [DUMMY]', 'Bumbu', 'Pedas rumahan, rasa bersahabat', 'Sambal botolan demo yang dikembangkan melalui latihan branding dan promosi digital.', 'branding, label produk, foto produk, pemasaran digital'],
  ['t2', 'kopi-rempah-silebu-demo', 'Kopi Rempah Silebu [DUMMY]', 'Bapak Arman [DUMMY]', 'Minuman', 'Hangat kopi dan rempah pilihan', 'Minuman kopi rempah demo untuk pengujian katalog dan kartu profil UMKM.', 'branding, kemasan, foto produk'],
  ['t2', 'bolu-kukus-mekar-demo', 'Bolu Kukus Mekar [DUMMY]', 'Ibu Wati [DUMMY]', 'Kue basah', 'Lembut, warna-warni, dibuat harian', 'Usaha demo bolu kukus rumahan dengan kemasan sederhana.', 'branding, label produk, kemasan'],
  ['t3', 'madu-pancalang-lestari-demo', 'Madu Pancalang Lestari [DUMMY]', 'Bapak Asep [DUMMY]', 'Produk alami', 'Manis alami dari perbukitan', 'Produk demo madu kemasan untuk simulasi katalog digital dan QR Code.', 'katalog digital, QR Code, QRIS, promosi digital'],
  ['t3', 'opak-gurih-pancalang-demo', 'Opak Gurih Pancalang [DUMMY]', 'Ibu Tati [DUMMY]', 'Makanan ringan', 'Tipis, gurih, dan renyah', 'Produk demo opak rumahan dengan katalog digital sederhana.', 'katalog digital, QR Code, foto produk'],
  ['t3', 'kopi-bukit-cibuntu-demo', 'Kopi Bukit Cibuntu [DUMMY]', 'Bapak Rudi [DUMMY]', 'Minuman', 'Aroma bukit dalam setiap seduhan', 'Produk demo kopi bubuk untuk latihan promosi dan pembayaran digital.', 'katalog digital, QR Code, QRIS, promosi digital'],
  ['t3', 'herbal-sari-alam-demo', 'Herbal Sari Alam [DUMMY]', 'Ibu Imas [DUMMY]', 'Minuman herbal', 'Segar dari bahan pilihan', 'Minuman herbal demo dengan variasi kunyit asam dan jahe.', 'katalog digital, QR Code, promosi digital'],
  ['t3', 'sale-pisang-karya-tani-demo', 'Sale Pisang Karya Tani [DUMMY]', 'Ibu Sari [DUMMY]', 'Makanan ringan', 'Manis legit hasil kebun', 'Sale pisang demo dalam kemasan kecil dan keluarga.', 'katalog digital, QR Code, QRIS'],
  ['t3', 'kerupuk-aci-tiga-putra-demo', 'Kerupuk Aci Tiga Putra [DUMMY]', 'Bapak Dede [DUMMY]', 'Makanan ringan', 'Kriuk khas untuk teman makan', 'Kerupuk aci demo dengan beberapa pilihan ukuran.', 'katalog digital, QR Code, promosi digital'],
  ['t3', 'dodol-nyi-mas-demo', 'Dodol Nyi Mas [DUMMY]', 'Ibu Elis [DUMMY]', 'Makanan tradisional', 'Legit, lembut, dan penuh cerita', 'Produk dodol demo untuk simulasi profil UMKM dan katalog digital.', 'katalog digital, foto produk, promosi digital'],
  ['t3', 'teh-rosela-pancalang-demo', 'Teh Rosela Pancalang [DUMMY]', 'Ibu Mira [DUMMY]', 'Minuman herbal', 'Warna alami, rasa menyegarkan', 'Teh rosela demo dalam kemasan seduh.', 'katalog digital, QR Code, QRIS'],
  ['t3', 'kacang-sangrai-mekar-demo', 'Kacang Sangrai Mekar [DUMMY]', 'Bapak Ujang [DUMMY]', 'Makanan ringan', 'Disangrai perlahan untuk rasa gurih', 'Kacang sangrai demo dengan kemasan praktis.', 'katalog digital, QR Code, promosi digital'],
  ['t3', 'kue-akar-kelapa-demo', 'Kue Akar Kelapa [DUMMY]', 'Ibu Nia [DUMMY]', 'Kue kering', 'Camilan klasik yang selalu dirindukan', 'Kue tradisional demo untuk menguji direktori UMKM dalam jumlah banyak.', 'katalog digital, foto produk, promosi digital'],
  ['t3', 'susu-kedelai-sehat-demo', 'Susu Kedelai Sehat [DUMMY]', 'Ibu Dewi [DUMMY]', 'Minuman', 'Segar setiap pagi', 'Minuman kedelai demo yang diproduksi dalam jumlah terbatas setiap hari.', 'katalog digital, QR Code, QRIS'],
  ['t3', 'cemilan-pedas-baraya-demo', 'Cemilan Pedas Baraya [DUMMY]', 'Bapak Iwan [DUMMY]', 'Makanan ringan', 'Pedasnya bikin berkumpul', 'Camilan pedas demo dengan beberapa tingkat kepedasan.', 'katalog digital, QR Code, promosi digital'],
  ['t3', 'calon-umkm-pancalang-demo', 'Calon UMKM Pancalang [DUMMY]', '', 'Belum dikonfirmasi', '', 'Baris draft untuk menguji penyaringan data yang belum diverifikasi.', 'katalog digital'],
];

const umkmRows = umkmSeed.map((item, index) => {
  const [groupId, slug, name, owner, category, tagline, description, assistance] = item;
  const groupColor = groupId === 't1' ? 'FBEAF1' : groupId === 't2' ? 'F4E7EA' : 'EDF1E5';
  const draft = slug === 'calon-umkm-pancalang-demo';
  return [
    groupId,
    slug,
    name,
    owner,
    category,
    tagline,
    description,
    placeholder(name.replace(' [DUMMY]', ''), groupColor),
    '',
    `Alamat demo ${index + 1} — ${groupId === 't1' ? 'Desa Sumbakeling' : groupId === 't2' ? 'Desa Silebu' : 'Desa Pancalang'}`,
    '',
    index % 3 === 0 ? '08.00–17.00' : index % 3 === 1 ? '07.00–16.00' : 'Berdasarkan pesanan',
    assistance,
    `https://example.com/katalog/${slug}`,
    '',
    '',
    draft ? 'draft' : 'verified',
    !draft,
  ];
});

const umkmSheet = addDataSheet({
  name: 'UMKM',
  headers: umkmHeaders,
  rows: umkmRows,
  widths: [12, 34, 34, 24, 22, 32, 52, 40, 18, 38, 28, 22, 42, 40, 28, 38, 20, 10],
  wrapColumns: [2, 5, 6, 7, 9, 12, 13, 15],
  freezeColumns: 3,
  bodyRowHeight: 48,
  tableName: 'UmkmTable',
});
umkmSheet.getRange('A2:A200').dataValidation = {
  rule: { type: 'list', values: ['t1', 't2', 't3'] },
};
umkmSheet.getRange('Q2:Q200').dataValidation = {
  rule: { type: 'list', values: ['draft', 'verified'] },
};
umkmSheet.getRange('R2:R200').dataValidation = {
  rule: { type: 'list', values: ['TRUE', 'FALSE'] },
};
umkmSheet.getRange(`Q2:Q${umkmRows.length + 1}`).conditionalFormats.add('containsText', {
  text: 'draft',
  format: { fill: colors.warning, font: { color: '#8A6327', bold: true } },
});

const productHeaders = [
  'id_kelompok',
  'umkm_slug',
  'nama_produk',
  'harga',
  'deskripsi',
  'foto',
  'aktif',
];

const productVariants = [
  ['Kemasan Reguler', 'Rp18.000', 'Ukuran reguler untuk konsumsi pribadi.'],
  ['Kemasan Keluarga', 'Rp32.000', 'Ukuran lebih besar untuk dinikmati bersama keluarga.'],
];

const productRows = umkmRows
  .filter((row) => row[17] === true)
  .flatMap((row, umkmIndex) =>
    productVariants.map(([variant, price, description], variantIndex) => [
      row[0],
      row[1],
      `${variant} [DUMMY]`,
      umkmIndex % 5 === 0 && variantIndex === 1 ? '' : price,
      `${description} Data produk contoh untuk ${row[2]}.`,
      placeholder(`${row[2]} - ${variant}`, row[0] === 't1' ? 'FBEAF1' : row[0] === 't2' ? 'F4E7EA' : 'EDF1E5'),
      true,
    ]),
  );

const productSheet = addDataSheet({
  name: 'Produk',
  headers: productHeaders,
  rows: productRows,
  widths: [12, 34, 30, 16, 52, 42, 10],
  wrapColumns: [2, 4, 5],
  freezeColumns: 2,
  bodyRowHeight: 58,
  tableName: 'ProdukTable',
});
productSheet.getRange('A2:A300').dataValidation = {
  rule: { type: 'list', values: ['t1', 't2', 't3'] },
};
productSheet.getRange('G2:G300').dataValidation = {
  rule: { type: 'list', values: ['TRUE', 'FALSE'] },
};

const schoolHeaders = [
  'id_kelompok',
  'slug',
  'nama_sekolah',
  'jenjang',
  'alamat',
  'kegiatan_utama',
  'deskripsi_singkat',
  'foto_hero',
  'maps_embed',
  'mdx_path',
  'status_verifikasi',
  'aktif',
];

const schoolRows = [
  ['t1', 'tk-pelita-sumbakeling-demo', 'TK Pelita Sumbakeling [DUMMY]', 'TK', 'Alamat demo — Desa Sumbakeling', 'Edukasi penggunaan gadget sehat dan permainan edukatif', 'Sekolah demo untuk kegiatan edukasi bahaya akses game berlebihan serta penyerahan alat permainan.', placeholder('TK Pelita Sumbakeling', 'FBEAF1'), '', '', 'verified', true],
  ['t2', 'tk-ceria-silebu-demo', 'TK Ceria Silebu [DUMMY]', 'TK', 'Alamat demo — Desa Silebu', 'Pencegahan ketergantungan gadget dan pojok bermain', 'Sekolah demo untuk aktivitas bermain, interaksi sosial, dan penyerahan Paket Pojok Bermain Edukatif.', placeholder('TK Ceria Silebu', 'F4E7EA'), '', '', 'verified', true],
  ['t3', 'sd-pancalang-cendekia-demo', 'SD Pancalang Cendekia [DUMMY]', 'SD', 'Alamat demo — Desa Pancalang', 'Pencegahan cyberbullying dan etika media sosial', 'Sekolah demo untuk kegiatan pertemanan aman di internet, bookmark edukatif, kuis, dan permainan.', placeholder('SD Pancalang Cendekia', 'EDF1E5'), '', '', 'verified', true],
  ['t3', 'sd-calon-sasaran-demo', 'SD Calon Sasaran [DUMMY]', 'SD', 'Alamat belum dikonfirmasi', 'Rencana kegiatan edukasi digital', 'Baris draft untuk menguji penyaringan sekolah yang belum terverifikasi.', placeholder('Sekolah Draft', 'F3F0E8'), '', '', 'draft', false],
];

const schoolSheet = addDataSheet({
  name: 'Sekolah',
  headers: schoolHeaders,
  rows: schoolRows,
  widths: [12, 34, 34, 13, 38, 44, 52, 40, 28, 38, 20, 10],
  wrapColumns: [2, 4, 5, 6, 7, 8, 9],
  freezeColumns: 3,
  bodyRowHeight: 50,
  tableName: 'SekolahTable',
});
schoolSheet.getRange('A2:A100').dataValidation = {
  rule: { type: 'list', values: ['t1', 't2', 't3'] },
};
schoolSheet.getRange('D2:D100').dataValidation = {
  rule: { type: 'list', values: ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'lainnya'] },
};
schoolSheet.getRange('K2:K100').dataValidation = {
  rule: { type: 'list', values: ['draft', 'verified'] },
};
schoolSheet.getRange('L2:L100').dataValidation = {
  rule: { type: 'list', values: ['TRUE', 'FALSE'] },
};
schoolSheet.getRange('K2:K5').conditionalFormats.add('containsText', {
  text: 'draft',
  format: { fill: colors.warning, font: { color: '#8A6327', bold: true } },
});

const galleryHeaders = [
  'id_foto',
  'id_kelompok',
  'kategori',
  'tag',
  'judul',
  'caption',
  'foto',
  'link_target',
  'tanggal',
  'aktif',
];

const gallerySeed = [
  ['t1-001', 't1', 'kegiatan', 'workshop, pemasaran digital', 'Latihan foto produk T1 [DUMMY]', 'Peserta mencoba menyusun komposisi foto produk menggunakan pencahayaan sederhana.', '/kegiatan/t1/sosialisasi-digital-marketing', '2026-08-04'],
  ['t1-002', 't1', 'kegiatan', 'penyerahan bantuan, sealer', 'Simulasi penggunaan sealer T1 [DUMMY]', 'Pendampingan penggunaan alat press kemasan pada sesi UMKM.', '/kegiatan/t1/sosialisasi-digital-marketing', '2026-08-04'],
  ['t1-003', 't1', 'umkm', 'dokumentasi produk, keripik pisang', 'Produk keripik pisang T1 [DUMMY]', 'Contoh foto produk setelah sesi pendampingan visual.', '/umkm/t1/keripik-pisang-mekar-sari-demo', '2026-08-05'],
  ['t1-004', 't1', 'umkm', 'kemasan, katalog digital', 'Kemasan UMKM T1 [DUMMY]', 'Contoh penataan kemasan untuk katalog digital.', '/umkm/t1/dapur-kue-nyi-rasa-demo', '2026-08-05'],
  ['t1-005', 't1', 'sekolah', 'edukasi digital, permainan edukatif', 'Permainan edukatif T1 [DUMMY]', 'Anak-anak mengikuti aktivitas permainan tanpa gadget.', '/kegiatan/t1/edukasi-bahaya-game-online', '2026-08-07'],
  ['t1-006', 't1', 'sekolah', 'penyerahan bantuan, alat peraga', 'Penyerahan alat edukatif T1 [DUMMY]', 'Dokumentasi demo penyerahan puzzle, buku cerita, dan alat permainan.', '/sekolah/t1/tk-pelita-sumbakeling-demo', '2026-08-07'],
  ['t2-001', 't2', 'kegiatan', 'workshop, branding', 'Workshop branding T2 [DUMMY]', 'Peserta menyusun unsur nama, warna, dan pesan merek.', '/kegiatan/t2/pelatihan-branding-dan-pengemasan', '2026-08-06'],
  ['t2-002', 't2', 'kegiatan', 'kemasan, sealer', 'Praktik pengemasan T2 [DUMMY]', 'Simulasi pengemasan produk menggunakan impulse sealer.', '/kegiatan/t2/pelatihan-branding-dan-pengemasan', '2026-08-06'],
  ['t2-003', 't2', 'umkm', 'label produk, dokumentasi produk', 'Label produk T2 [DUMMY]', 'Contoh penerapan label baru pada produk makanan ringan.', '/umkm/t2/rengginang-silebu-jaya-demo', '2026-08-08'],
  ['t2-004', 't2', 'umkm', 'foto produk, promosi digital', 'Foto produk sambal T2 [DUMMY]', 'Foto katalog demo untuk kebutuhan media sosial.', '/umkm/t2/sambal-pawon-ambu-demo', '2026-08-08'],
  ['t2-005', 't2', 'sekolah', 'permainan edukatif, interaksi sosial', 'Aktivitas pojok bermain T2 [DUMMY]', 'Anak-anak mencoba permainan yang mendorong interaksi dan kerja sama.', '/kegiatan/t2/pojok-bermain-edukatif', '2026-08-10'],
  ['t2-006', 't2', 'sekolah', 'penyerahan bantuan, pojok bermain', 'Pojok bermain edukatif T2 [DUMMY]', 'Dokumentasi demo penataan Paket Pojok Bermain Edukatif.', '/sekolah/t2/tk-ceria-silebu-demo', '2026-08-10'],
  ['t3-001', 't3', 'kegiatan', 'QRIS, katalog digital', 'Pendampingan QRIS T3 [DUMMY]', 'Simulasi pengenalan transaksi digital dan penggunaan QRIS.', '/kegiatan/t3/katalog-digital-dan-qris', '2026-08-09'],
  ['t3-002', 't3', 'kegiatan', 'QR Code, promosi digital', 'Pembuatan katalog QR T3 [DUMMY]', 'Peserta mencoba membuka katalog produk melalui QR Code.', '/kegiatan/t3/katalog-digital-dan-qris', '2026-08-09'],
  ['t3-003', 't3', 'umkm', 'dokumentasi produk, QRIS', 'Produk madu T3 [DUMMY]', 'Contoh foto produk untuk katalog digital UMKM.', '/umkm/t3/madu-pancalang-lestari-demo', '2026-08-11'],
  ['t3-004', 't3', 'umkm', 'katalog digital, QR Code', 'Katalog produk opak T3 [DUMMY]', 'Contoh tampilan produk opak yang ditautkan dari QR Code.', '/umkm/t3/opak-gurih-pancalang-demo', '2026-08-11'],
  ['t3-005', 't3', 'sekolah', 'cyberbullying, edukasi digital', 'Workshop pertemanan aman T3 [DUMMY]', 'Siswa berdiskusi mengenai jejak digital dan etika berkomunikasi.', '/kegiatan/t3/workshop-pencegahan-cyberbullying', '2026-08-12'],
  ['t3-006', 't3', 'sekolah', 'bookmark edukatif, alat olahraga', 'Bookmark edukatif T3 [DUMMY]', 'Contoh aktivitas membuat bookmark bertema cita-cita dan pertemanan aman.', '/kegiatan/t3/bookmark-dan-bantuan-alat-olahraga', '2026-08-12'],
];

const galleryRows = gallerySeed.map(([id, groupId, category, tags, title, caption, target, date]) => [
  id,
  groupId,
  category,
  tags,
  title,
  caption,
  placeholder(title.replace(' [DUMMY]', ''), groupId === 't1' ? 'FBEAF1' : groupId === 't2' ? 'F4E7EA' : 'EDF1E5'),
  target,
  new Date(`${date}T00:00:00.000Z`),
  true,
]);

const gallerySheet = addDataSheet({
  name: 'Galeri',
  headers: galleryHeaders,
  rows: galleryRows,
  widths: [15, 12, 16, 36, 38, 52, 42, 48, 16, 10],
  wrapColumns: [3, 4, 5, 6, 7],
  freezeColumns: 3,
  bodyRowHeight: 50,
  tableName: 'GaleriTable',
});
gallerySheet.getRange('B2:B200').dataValidation = {
  rule: { type: 'list', values: ['t1', 't2', 't3'] },
};
gallerySheet.getRange('C2:C200').dataValidation = {
  rule: { type: 'list', values: ['kegiatan', 'umkm', 'sekolah'] },
};
gallerySheet.getRange('J2:J200').dataValidation = {
  rule: { type: 'list', values: ['TRUE', 'FALSE'] },
};
gallerySheet.getRange(`I2:I${galleryRows.length + 1}`).format.numberFormat = 'yyyy-mm-dd';

await fs.mkdir(previewDir, { recursive: true });

const previews = [
  ['Kelompok', 'A1:G4'],
  ['UMKM', 'A1:R9'],
  ['Produk', 'A1:G13'],
  ['Sekolah', 'A1:L5'],
  ['Galeri', 'A1:J13'],
];

for (const [sheetName, range] of previews) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: 'png' });
  await fs.writeFile(
    path.join(previewDir, `${sheetName.toLowerCase()}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const groupInspect = await workbook.inspect({
  kind: 'table',
  range: 'Kelompok!A1:G4',
  include: 'values,formulas',
  tableMaxRows: 6,
  tableMaxCols: 8,
});
console.log(groupInspect.ndjson);

const relationInspect = await workbook.inspect({
  kind: 'table',
  range: 'Produk!A1:G7',
  include: 'values,formulas',
  tableMaxRows: 8,
  tableMaxCols: 8,
});
console.log(relationInspect.ndjson);

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 300 },
  summary: 'final formula error scan',
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, counts: {
  kelompok: groupRows.length,
  umkm: umkmRows.length,
  produk: productRows.length,
  sekolah: schoolRows.length,
  galeri: galleryRows.length,
} }));
