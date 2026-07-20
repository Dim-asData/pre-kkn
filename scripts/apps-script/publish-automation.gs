/**
 * Jejak KKN Pancalang — otomasi publish Fase 5B.
 *
 * Dipasang pada spreadsheet PRODUKSI melalui Ekstensi -> Apps Script.
 * Dua jalur publish:
 * 1. Manual: menu "KKN Web -> Rebuild sekarang" — selalu bekerja, termasuk
 *    saat AUTO_REBUILD nonaktif.
 * 2. Terjadwal: trigger harian sekitar pukul 00.00 WIB mem-publish hanya
 *    bila ada perubahan Sheets yang belum terpublikasi. Perubahan ditandai
 *    oleh trigger onChange; tidak ada publish otomatis per perubahan.
 *
 * URL Deploy Hook disimpan di Script Properties dengan key
 * CLOUDFLARE_DEPLOY_HOOK_URL — tidak pernah di sheet atau repository.
 *
 * Catatan: penulisan status oleh script ini tidak memicu trigger onChange
 * (eksekusi script tidak menjalankan trigger, sesuai batasan resmi Apps
 * Script), sehingga tidak ada risiko loop build.
 *
 * Langkah pemasangan: lihat scripts/apps-script/README.md.
 */

const CONFIG = {
  SETTINGS_SHEET: 'Pengaturan',
  HOOK_PROPERTY: 'CLOUDFLARE_DEPLOY_HOOK_URL',
  // Trigger harian berjalan pada rentang satu jam setelah jam ini
  // (0 = sekitar pukul 00.00-01.00 zona waktu manifest).
  DAILY_HOUR: 0,
  // Bila POST gagal, jalur terjadwal mencoba ulang dengan jeda ini (menit).
  RETRY_MINUTES: 15,
  MAX_AUTO_RETRIES: 2,
  TIMEZONE: 'Asia/Jakarta',
  // Asia/Jakarta (WIB) tidak memakai DST sehingga offset aman ditulis tetap.
  UTC_OFFSET: '+07:00',
};

const PROP = {
  LAST_CHANGE_AT: 'LAST_CHANGE_AT',
  LAST_PUBLISH_AT: 'LAST_PUBLISH_AT',
  LAST_PUBLISH_STATUS: 'LAST_PUBLISH_STATUS',
  RETRY_COUNT: 'RETRY_COUNT',
};

const AUTO_HANDLERS = ['onSheetChange', 'dailyPublishCheck', 'retryPublish'];

// ---------------------------------------------------------------- Menu

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('KKN Web')
    .addItem('Rebuild sekarang', 'manualRebuild')
    .addItem('Lihat status publish terakhir', 'showLastPublishStatus')
    .addSeparator()
    .addItem('Pasang ulang trigger otomatis', 'setupTriggers')
    .addToUi();
}

/**
 * Jalankan sekali dari editor Apps Script (atau lewat menu) untuk memasang
 * trigger penanda perubahan + trigger harian. Aman dijalankan berulang.
 *
 * PENTING: trigger Apps Script terikat pada akun yang memasangnya, jadi
 * fungsi ini hanya boleh dijalankan oleh akun pemilik spreadsheet.
 */
function setupTriggers() {
  if (!confirmLikelyOwner_()) return;

  AUTO_HANDLERS.forEach(deleteTriggersByHandler_);

  ScriptApp.newTrigger('onSheetChange')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onChange()
    .create();

  ScriptApp.newTrigger('dailyPublishCheck')
    .timeBased()
    .atHour(CONFIG.DAILY_HOUR)
    .everyDays(1)
    .create();

  alertIfUi_(
    'Trigger terpasang: penanda perubahan sheet dan rebuild terjadwal yang ' +
      'berjalan antara pukul ' + CONFIG.DAILY_HOUR + '.00-' +
      (CONFIG.DAILY_HOUR + 1) + '.00 ' + CONFIG.TIMEZONE +
      ' bila ada perubahan yang belum terpublikasi.',
  );
}

// --------------------------------------------------------- Jalur terjadwal

/**
 * Trigger onChange: hanya menandai bahwa spreadsheet berubah. Publish
 * dilakukan oleh jadwal harian atau menu manual, bukan oleh trigger ini.
 */
function onSheetChange(e) {
  PropertiesService.getScriptProperties().setProperty(
    PROP.LAST_CHANGE_AT,
    String(Date.now()),
  );
}

/** Trigger harian ~00.00 WIB: publish hanya bila ada perubahan yang belum terpublikasi. */
function dailyPublishCheck() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) {
    scheduleRetry_(5); // eksekusi lain sedang berjalan; coba lagi sebentar lagi
    return;
  }
  try {
    if (!readAutoRebuild_()) return;
    if (!hasUnpublishedChange_()) return;

    const ok = publish_('terjadwal');
    if (!ok) scheduleNextRetry_();
  } finally {
    lock.releaseLock();
  }
}

/** Trigger sekali-jalan: percobaan ulang setelah publish terjadwal gagal. */
function retryPublish() {
  deleteTriggersByHandler_('retryPublish');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) {
    scheduleRetry_(2);
    return;
  }
  try {
    const props = PropertiesService.getScriptProperties();
    if (!readAutoRebuild_() || !hasUnpublishedChange_()) {
      props.deleteProperty(PROP.RETRY_COUNT);
      return;
    }

    const ok = publish_('terjadwal-ulang');
    if (!ok) scheduleNextRetry_();
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------ Jalur manual

/** Menu KKN Web -> Rebuild sekarang. Tetap bekerja saat AUTO_REBUILD nonaktif. */
function manualRebuild() {
  const ui = SpreadsheetApp.getUi();
  const hook = PropertiesService.getScriptProperties().getProperty(CONFIG.HOOK_PROPERTY);
  if (!hook) {
    ui.alert(
      'Deploy Hook belum dikonfigurasi',
      'Isi Script Property "' + CONFIG.HOOK_PROPERTY + '" terlebih dahulu ' +
        '(Apps Script -> Project Settings -> Script properties). ' +
        'Lihat scripts/apps-script/README.md.',
      ui.ButtonSet.OK,
    );
    return;
  }

  const answer = ui.alert(
    'Rebuild sekarang?',
    'Cloudflare Pages akan membangun ulang website dari data Sheets dan ' +
      'Drive saat ini. Lanjutkan?',
    ui.ButtonSet.YES_NO,
  );
  if (answer !== ui.Button.YES) return;

  const ok = publish_('manual');
  ui.alert(
    ok
      ? 'Permintaan build terkirim. Pantau progresnya di dashboard Cloudflare Pages.'
      : 'Permintaan build GAGAL terkirim. Periksa status publish terakhir untuk detailnya.',
  );
}

/** Menu KKN Web -> Lihat status publish terakhir. */
function showLastPublishStatus() {
  const props = PropertiesService.getScriptProperties();
  const lastPublish = Number(props.getProperty(PROP.LAST_PUBLISH_AT) || 0);
  const status = props.getProperty(PROP.LAST_PUBLISH_STATUS) || 'belum pernah publish';
  const lastChange = Number(props.getProperty(PROP.LAST_CHANGE_AT) || 0);

  const lines = [
    'Status terakhir: ' + status,
    'Waktu publish terakhir: ' + (lastPublish ? toIsoWib_(new Date(lastPublish)) : '-'),
    'Perubahan sheet terakhir: ' + (lastChange ? toIsoWib_(new Date(lastChange)) : '-'),
    'AUTO_REBUILD (rebuild terjadwal): ' + (readAutoRebuild_() ? 'aktif' : 'nonaktif'),
  ];
  SpreadsheetApp.getUi().alert('Status publish', lines.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

// -------------------------------------------------------------- Inti publish

/**
 * POST ke Cloudflare Deploy Hook lalu catat waktu/status di Script Properties
 * dan tab Pengaturan. Mengembalikan true bila permintaan diterima Cloudflare.
 */
function publish_(source) {
  const props = PropertiesService.getScriptProperties();
  const hook = props.getProperty(CONFIG.HOOK_PROPERTY);
  const now = new Date();

  if (!hook) {
    const message = 'gagal (' + source + '): ' + CONFIG.HOOK_PROPERTY + ' belum diisi';
    props.setProperty(PROP.LAST_PUBLISH_STATUS, message);
    writePublishStatus_(null, message + ' ' + toIsoWib_(now));
    return false;
  }

  let ok = false;
  let detail = '';
  try {
    const response = UrlFetchApp.fetch(hook, {
      method: 'post',
      muteHttpExceptions: true,
    });
    const code = response.getResponseCode();
    ok = code >= 200 && code < 300;
    detail = 'HTTP ' + code;
  } catch (error) {
    detail = String(error && error.message ? error.message : error).slice(0, 160);
  }

  if (ok) {
    props.setProperty(PROP.LAST_PUBLISH_AT, String(now.getTime()));
    props.setProperty(PROP.LAST_PUBLISH_STATUS, 'sukses (' + source + ') ' + detail);
    props.deleteProperty(PROP.RETRY_COUNT);
    writePublishStatus_(toIsoWib_(now), 'sukses (' + source + ')');
  } else {
    props.setProperty(PROP.LAST_PUBLISH_STATUS, 'gagal (' + source + ') ' + detail);
    // waktu_publish_terakhir tidak diubah saat gagal; catat kegagalan di kolom status.
    writePublishStatus_(null, 'gagal (' + source + ') ' + detail + ' ' + toIsoWib_(now));
  }
  return ok;
}

/**
 * Tulis waktu/status publish ke baris data tab Pengaturan tanpa mengubah
 * struktur kolom atau menambah baris. Kolom dicari berdasarkan nama header
 * dan baris data dicari (bukan di-hardcode) sehingga aman terhadap validasi
 * ketat build website: header tidak tersentuh dan baris data tetap satu.
 */
function writePublishStatus_(isoTimestampOrNull, statusText) {
  const ctx = getSettingsContext_();
  if (!ctx || !ctx.dataRow) {
    Logger.log(
      'Tab Pengaturan tidak memiliki tepat satu baris data; status publish ' +
        'hanya dicatat di Script Properties.',
    );
    return;
  }

  const timeColumn = ctx.headers.indexOf('waktu_publish_terakhir');
  const statusColumn = ctx.headers.indexOf('status_publish_terakhir');
  if (timeColumn === -1 && statusColumn === -1) return;

  if (isoTimestampOrNull !== null && timeColumn !== -1) {
    const cell = ctx.sheet.getRange(ctx.dataRow, timeColumn + 1);
    // Paksa plain text agar Sheets tidak mem-parse ulang menjadi format tanggal
    // lokal — validator build mewajibkan string ISO 8601 apa adanya.
    cell.setNumberFormat('@');
    cell.setValue(isoTimestampOrNull);
  }
  if (statusColumn !== -1) {
    const cell = ctx.sheet.getRange(ctx.dataRow, statusColumn + 1);
    cell.setNumberFormat('@');
    cell.setValue(statusText);
  }
  SpreadsheetApp.flush();
}

// ------------------------------------------------------------------ Helper

/** Ada perubahan sheet yang lebih baru daripada publish terakhir? */
function hasUnpublishedChange_() {
  const props = PropertiesService.getScriptProperties();
  const lastChange = Number(props.getProperty(PROP.LAST_CHANGE_AT) || 0);
  const lastPublish = Number(props.getProperty(PROP.LAST_PUBLISH_AT) || 0);
  return lastChange > 0 && lastChange > lastPublish;
}

function scheduleNextRetry_() {
  const props = PropertiesService.getScriptProperties();
  const attempts = Number(props.getProperty(PROP.RETRY_COUNT) || 0) + 1;
  if (attempts <= CONFIG.MAX_AUTO_RETRIES) {
    props.setProperty(PROP.RETRY_COUNT, String(attempts));
    scheduleRetry_(CONFIG.RETRY_MINUTES);
  } else {
    // Menyerah; jadwal malam berikutnya menjadi jaring pengaman.
    props.deleteProperty(PROP.RETRY_COUNT);
  }
}

function scheduleRetry_(minutes) {
  deleteTriggersByHandler_('retryPublish');
  ScriptApp.newTrigger('retryPublish')
    .timeBased()
    .after(Math.max(1, minutes) * 60 * 1000)
    .create();
}

function deleteTriggersByHandler_(handlerName) {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Baca tab Pengaturan: sheet, header (row 1), dan nomor baris data.
 * dataRow bernilai null bila baris data tidak tepat satu — kondisi itu
 * sudah/akan menggagalkan build, dan script tidak boleh memperburuknya
 * dengan menulis ke baris yang salah atau menciptakan baris baru.
 */
function getSettingsContext_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SETTINGS_SHEET);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) return null;

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map(function (value) {
      return String(value).trim();
    });

  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
    .getValues();
  const dataRows = [];
  rows.forEach(function (row, index) {
    const hasContent = row.some(function (value) {
      return String(value).trim() !== '';
    });
    if (hasContent) dataRows.push(index + 2);
  });

  return {
    sheet: sheet,
    headers: headers,
    dataRow: dataRows.length === 1 ? dataRows[0] : null,
  };
}

/** Baca flag auto_rebuild dari baris data tab Pengaturan. */
function readAutoRebuild_() {
  const ctx = getSettingsContext_();
  if (!ctx || !ctx.dataRow) return false;

  const column = ctx.headers.indexOf('auto_rebuild');
  if (column === -1) return false;

  return isTruthy_(ctx.sheet.getRange(ctx.dataRow, column + 1).getValue());
}

/** Nilai truthy mengikuti TRUE_VALUES parseSheetBoolean di src/data/normalize.ts. */
function isTruthy_(value) {
  if (value === true) return true;
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized === 'true' ||
    normalized === 'ya' ||
    normalized === 'yes' ||
    normalized === 'y' ||
    normalized === '1'
  );
}

/**
 * Trigger terikat pada akun pemasangnya dan deleteTriggersByHandler_ hanya
 * melihat trigger milik akun yang sedang berjalan. Cegah akun non-pemilik
 * memasang set trigger kedua (duplikat) bila kepemilikan dapat diperiksa.
 */
function confirmLikelyOwner_() {
  try {
    const owner = SpreadsheetApp.getActiveSpreadsheet().getOwner();
    const me = Session.getEffectiveUser().getEmail();
    if (owner && me && owner.getEmail() && owner.getEmail() !== me) {
      alertIfUi_(
        'Trigger hanya boleh dipasang oleh akun pemilik spreadsheet (' +
          owner.getEmail() + '). Pemasangan oleh akun lain membuat trigger ' +
          'ganda karena trigger Apps Script terikat per akun.',
      );
      return false;
    }
  } catch (ignored) {
    // Kepemilikan tidak dapat diperiksa (mis. shared drive); lanjutkan.
  }
  return true;
}

/** Format waktu sesuai kontrak validator build: ISO 8601 dengan offset WIB. */
function toIsoWib_(date) {
  return (
    Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss") + CONFIG.UTC_OFFSET
  );
}

function alertIfUi_(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (ignored) {
    // Dipanggil dari trigger/editor tanpa UI; cukup log.
    Logger.log(message);
  }
}
