# Otomasi Publish (Fase 5B) — Google Apps Script

Kode pada folder ini menghubungkan spreadsheet produksi ke Cloudflare Pages
sesuai PROJECT.md Bagian 17 (revisi 19 Juli 2026: tanpa publish otomatis per
perubahan):

- Ada dua jalur publish: **manual** lewat menu **KKN Web → Rebuild sekarang**
  (selalu bekerja, termasuk saat `auto_rebuild` FALSE) dan **terjadwal** lewat
  trigger harian sekitar pukul 00.00 WIB.
- Perubahan Sheets hanya *ditandai* oleh trigger `onChange` — tidak memicu
  build. Rebuild terjadwal tengah malam mem-publish hanya bila ada perubahan
  yang belum terpublikasi, sehingga tidak ada build sia-sia pada hari tanpa
  edit.
- Jalur terjadwal dikendalikan kolom `auto_rebuild` pada tab `Pengaturan`
  (TRUE = aktif) — bisa dimatikan tanpa menghapus trigger.
- Waktu dan status publish terakhir dicatat ke kolom `waktu_publish_terakhir`
  dan `status_publish_terakhir` tab `Pengaturan` (format ISO 8601 `+07:00`,
  ditulis sebagai teks supaya lolos validator build).
- URL Deploy Hook disimpan di **Script Properties** dengan key
  `CLOUDFLARE_DEPLOY_HOOK_URL` — tidak pernah di sheet atau repository.

## Pembagian tugas

| Bagian | Siapa | Status |
|---|---|---|
| Kode script, manifest, panduan | Developer (repo ini) | Selesai — file di folder ini |
| Membuat Deploy Hook di Cloudflare | Admin (butuh akun Cloudflare) | Belum |
| Memasang script di spreadsheet + otorisasi + trigger | Admin (butuh akun Google pemilik spreadsheet) | Belum |

## Prasyarat

Proyek Cloudflare Pages harus **sudah ada** (deploy pertama dari GitHub sudah
berjalan). Deploy Hook baru bisa dibuat setelah proyeknya ada, jadi lakukan
pemasangan ini **setelah** deploy pertama Fase 6.

## Langkah pemasangan (dilakukan admin)

1. **Buat Deploy Hook di Cloudflare**
   Dashboard Cloudflare → Workers & Pages → proyek website → *Settings* →
   *Builds & deployments* → *Deploy hooks* → *Add deploy hook*.
   Nama bebas (misal `sheets-publish`), branch `main`. Salin URL-nya
   (`https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...`).
   Jangan tempel URL ini di sheet, dokumen, atau chat publik — siapa pun yang
   memegangnya bisa memicu build.

2. **Pasang script di spreadsheet produksi**
   Buka spreadsheet produksi → menu *Ekstensi* → *Apps Script*.
   - Ganti seluruh isi `Code.gs` dengan isi
     [`publish-automation.gs`](./publish-automation.gs).
   - *Project Settings* (ikon gerigi) → centang *Show "appsscript.json"
     manifest file* → kembali ke editor → ganti isi `appsscript.json` dengan
     file [`appsscript.json`](./appsscript.json) di folder ini
     (penting: `timeZone` `Asia/Jakarta` menentukan jam trigger harian).
   - Simpan (Ctrl+S).

3. **Isi Script Property**
   *Project Settings* → *Script properties* → *Add script property*:
   - Property: `CLOUDFLARE_DEPLOY_HOOK_URL`
   - Value: URL Deploy Hook dari langkah 1.

4. **Pasang trigger dan otorisasi**
   **Gunakan akun pemilik spreadsheet** — trigger Apps Script terikat per
   akun; pemasangan oleh akun lain menghasilkan trigger ganda (script juga
   menolaknya bila kepemilikan terdeteksi). Di editor Apps Script pilih
   fungsi `setupTriggers` → *Run*. Saat diminta, berikan izin (akan muncul
   peringatan "unverified app" karena script pribadi: *Advanced* →
   *Go to ... (unsafe)* → *Allow*). Izin yang diminta hanya: spreadsheet ini,
   menu/dialog di spreadsheet ini, permintaan HTTP keluar, dan pengelolaan
   trigger. Alternatif setelah reload spreadsheet: menu **KKN Web → Pasang
   ulang trigger otomatis**.

5. **Aktifkan jadwal malam**
   Tab `Pengaturan` → set `auto_rebuild` = `TRUE`.

6. **Uji**
   - Jalur manual: menu **KKN Web → Rebuild sekarang** → konfirmasi → cek
     dashboard Cloudflare Pages: harus muncul deployment baru; kolom
     `waktu_publish_terakhir`/`status_publish_terakhir` terisi.
   - Jalur terjadwal: edit satu sel data, lalu cek keesokan paginya bahwa ada
     deployment sekitar pukul 00.00–01.00 WIB. Untuk menguji tanpa menunggu
     tengah malam, jalankan fungsi `dailyPublishCheck` langsung dari editor
     Apps Script.

## Catatan perilaku

- Trigger harian Apps Script tidak presisi ke menit — berjalan dalam rentang
  sekitar pukul 00.00–01.00 WIB (sudah dicatat di PROJECT.md §17).
- Rebuild terjadwal dilewati bila tidak ada perubahan sejak publish terakhir,
  atau bila `auto_rebuild` FALSE. Rebuild manual tidak pernah dilewati.
- Penulisan status oleh script ke tab `Pengaturan` tidak memicu trigger
  `onChange` (eksekusi script tidak menjalankan trigger — batasan resmi Apps
  Script), sehingga tidak ada risiko loop build.
- Status hanya ditulis bila tab `Pengaturan` memiliki tepat satu baris data;
  kolom dicari berdasarkan nama header, jadi script tidak pernah menambah
  baris/kolom yang bisa menggagalkan validator build.
- `waktu_publish_terakhir` hanya diperbarui saat Deploy Hook menerima
  permintaan (HTTP 2xx). Kegagalan dicatat di `status_publish_terakhir`, dan
  jalur terjadwal mencoba ulang maksimal 2 kali dengan jeda 15 menit sebelum
  menyerah ke jadwal malam berikutnya.
- Scanner folder Drive dan pencocokan nama file foto (bagian lain Fase 5B)
  **belum** termasuk script ini.
- Mengubah jam jadwal atau perilaku retry: edit konstanta `CONFIG` di bagian
  atas script (`DAILY_HOUR` = jam mulai jendela rebuild), simpan, lalu
  jalankan ulang `setupTriggers`.
