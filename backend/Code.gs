/**
 * ProgressX — Google Sheets backend
 * ---------------------------------
 * Put this code in:
 * Google Sheet → Extensions → Apps Script
 *
 * The script expects a tab named: Workout Log
 * Columns A:H:
 * ID | Training Day | Exercise | Week | Date | Performance / Raw Entry | Status | Notes
 *
 * Deploy:
 * Deploy → New deployment → Web app
 * Execute as: Me
 * Who has access: Anyone
 *
 * Copy the generated /exec URL into ProgressX → Data → Google Sheet Sync.
 *
 * NOTE:
 * This build intentionally has no authentication layer.
 * Anyone who has the Web App URL can call it and modify the Workout Log.
 */

const PROGRESSX_SHEET_NAME = 'Workout Log';
const PROGRESSX_HEADERS = [
  'ID',
  'Training Day',
  'Exercise',
  'Week',
  'Date',
  'Performance / Raw Entry',
  'Status',
  'Notes'
];

const PROGRESSX_REMINDERS_SHEET = 'Reminders';
const PROGRESSX_REMINDER_HEADERS = [
  'ID',
  'Name',
  'Amount / Note',
  'Time',
  'Enabled',
  'Updated At'
];

const PROGRESSX_DAILY_LOG_SHEET = 'Daily Log';
const PROGRESSX_DAILY_HEADERS = [
  'Date',
  'Type',
  'ID',
  'Name',
  'Done',
  'Current',
  'Target',
  'Updated At'
];

const PROGRESSX_FOOD_PRODUCTS_SHEET = 'Food Products';
const PROGRESSX_FOOD_PRODUCT_HEADERS = [
  'ID',
  'Barcode',
  'Name',
  'Serving Qty',
  'Serving Unit',
  'Calories',
  'Protein',
  'Carbs',
  'Fat',
  'Updated At'
];

const PROGRESSX_FOOD_LOG_SHEET = 'Food Log';
const PROGRESSX_FOOD_LOG_HEADERS = [
  'ID',
  'Date',
  'Meal',
  'Product ID',
  'Product Name',
  'Amount',
  'Serving Qty',
  'Serving Unit',
  'Calories',
  'Protein',
  'Carbs',
  'Fat',
  'Created At'
];

const PROGRESSX_NUTRITION_SETTINGS_SHEET = 'Nutrition Settings';
const PROGRESSX_NUTRITION_SETTING_HEADERS = [
  'Key',
  'Value',
  'Updated At'
];


/**
 * Run this function ONCE from the Apps Script editor as the Sheet owner.
 * Google will ask for permission to access the spreadsheet and make
 * external HTTP requests (needed for Open Food Facts barcode lookup).
 */

/**
 * Run this after adding the supplied appsscript.json manifest.
 * If it finishes without an error, external API access is authorized.
 */
function testProgressXPermissions() {
  const result = {
    spreadsheet: false,
    externalRequest: false,
    httpStatus: null
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('This script must be bound to the ProgressX Google Sheet.');
  result.spreadsheet = true;

  const response = UrlFetchApp.fetch(
    'https://world.openfoodfacts.org/api/v3/product/737628064502?fields=code,product_name',
    {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'ProgressX/1.0 (personal nutrition tracker)'
      }
    }
  );

  result.externalRequest = true;
  result.httpStatus = response.getResponseCode();

  Logger.log(JSON.stringify(result));
  return result;
}

function authorizeProgressX() {
  // Touch the bound spreadsheet so Spreadsheet permission is requested.
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open this script from the ProgressX Google Sheet.');

  // Touch an external URL so Apps Script requests script.external_request.
  const response = UrlFetchApp.fetch(
    'https://world.openfoodfacts.org/api/v3/product/737628064502?fields=code,product_name',
    {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'ProgressX/1.0 (personal nutrition tracker)'
      }
    }
  );

  Logger.log('ProgressX authorization complete. HTTP ' + response.getResponseCode());
  return 'ProgressX authorization complete';
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = p.callback || '';
  try {
    const action = String(p.action || 'ping').toLowerCase();
    let result;

    if (action === 'ping') result = ping_();
    else if (action === 'list') result = listRows_();
    else if (action === 'upsert') result = upsertRow_(p);
    else if (action === 'delete') result = deleteRow_(p);
    else if (action === 'reminders_get') result = remindersGet_(p);
    else if (action === 'reminders_save') result = remindersSave_(p);
    else if (action === 'daily_save') result = dailySave_(p);
    else if (action === 'food_products_list') result = foodProductsList_();
    else if (action === 'food_product_upsert') result = foodProductUpsert_(p);
    else if (action === 'food_product_delete') result = foodProductDelete_(p);
    else if (action === 'food_log_list') result = foodLogList_(p);
    else if (action === 'food_log_upsert') result = foodLogUpsert_(p);
    else if (action === 'food_log_delete') result = foodLogDelete_(p);
    else if (action === 'nutrition_targets_get') result = nutritionTargetsGet_();
    else if (action === 'nutrition_targets_save') result = nutritionTargetsSave_(p);
    else if (action === 'food_barcode_lookup') result = foodBarcodeLookup_(p);
    else if (action === 'food_search_online') result = foodSearchOnline_(p);
    else throw new Error('Unknown action: ' + action);

    return respond_(result, callback);
  } catch (err) {
    return respond_({ ok: false, error: String(err && err.message ? err.message : err) }, callback);
  }
}

function getWorkoutSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('This Apps Script must be bound to a Google Sheet.');

  let sh = ss.getSheetByName(PROGRESSX_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(PROGRESSX_SHEET_NAME);

  const current = sh.getRange(1, 1, 1, PROGRESSX_HEADERS.length).getDisplayValues()[0];
  const needsHeaders = PROGRESSX_HEADERS.some((h, i) => String(current[i] || '').trim() !== h);

  if (needsHeaders && sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, PROGRESSX_HEADERS.length).setValues([PROGRESSX_HEADERS]);
  } else if (needsHeaders) {
    // Keep existing data, but normalize header row only.
    sh.getRange(1, 1, 1, PROGRESSX_HEADERS.length).setValues([PROGRESSX_HEADERS]);
  }

  return sh;
}

function ping_() {
  const sh = getWorkoutSheet_();
  return {
    ok: true,
    sheet: PROGRESSX_SHEET_NAME,
    rows: Math.max(0, sh.getLastRow() - 1),
    spreadsheetId: sh.getParent().getId()
  };
}

function listRows_() {
  const sh = getWorkoutSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { ok: true, rows: [] };

  const values = sh.getRange(2, 1, lastRow - 1, PROGRESSX_HEADERS.length).getDisplayValues();
  const rows = [];

  values.forEach((r, i) => {
    if (!r.some(v => String(v).trim() !== '')) return;

    rows.push({
      id: r[0],
      day: r[1],
      exercise: r[2],
      week: r[3],
      date: r[4],
      performance: r[5],
      status: r[6],
      notes: r[7],
      sheetRow: i + 2
    });
  });

  return { ok: true, rows: rows };
}

function upsertRow_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getWorkoutSheet_();
    const id = String(p.id || '').trim();
    let rowNumber = id ? findRowById_(sh, id) : -1;
    let finalId = id;

    if (rowNumber < 0) {
      finalId = String(nextId_(sh));
      rowNumber = Math.max(2, sh.getLastRow() + 1);
    }

    const row = [[
      finalId,
      String(p.day || ''),
      String(p.exercise || ''),
      numberOrText_(p.week),
      String(p.date || ''),
      String(p.performance || ''),
      String(p.status || ''),
      String(p.notes || '')
    ]];

    sh.getRange(rowNumber, 1, 1, PROGRESSX_HEADERS.length).setValues(row);
    SpreadsheetApp.flush();

    return {
      ok: true,
      action: id && findRowById_(sh, finalId) === rowNumber ? 'updated' : 'inserted',
      id: finalId,
      sheetRow: rowNumber
    };
  } finally {
    lock.releaseLock();
  }
}

function deleteRow_(p) {
  const id = String(p.id || '').trim();
  if (!id) throw new Error('Missing ID.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getWorkoutSheet_();
    const rowNumber = findRowById_(sh, id);
    if (rowNumber < 0) throw new Error('Workout ID not found: ' + id);

    sh.deleteRow(rowNumber);
    SpreadsheetApp.flush();

    return { ok: true, deleted: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function findRowById_(sh, id) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return -1;

  const ids = sh.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(id).trim()) return i + 2;
  }
  return -1;
}

function nextId_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 1;

  const ids = sh.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  let maxId = 0;
  ids.forEach(r => {
    const n = Number(r[0]);
    if (Number.isFinite(n)) maxId = Math.max(maxId, n);
  });
  return maxId + 1;
}

function numberOrText_(v) {
  const s = String(v == null ? '' : v).trim();
  if (s === '') return '';
  const n = Number(s);
  return Number.isFinite(n) ? n : s;
}


function getOrCreateSheetWithHeaders_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('This Apps Script must be bound to a Google Sheet.');

  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  const current = sh.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const needsHeaders = headers.some((h, i) => String(current[i] || '').trim() !== h);
  if (needsHeaders) sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  return sh;
}

function getRemindersSheet_() {
  return getOrCreateSheetWithHeaders_(PROGRESSX_REMINDERS_SHEET, PROGRESSX_REMINDER_HEADERS);
}

function getDailyLogSheet_() {
  return getOrCreateSheetWithHeaders_(PROGRESSX_DAILY_LOG_SHEET, PROGRESSX_DAILY_HEADERS);
}

function parseJsonParam_(value, fallback) {
  if (value == null || String(value).trim() === '') return fallback;
  try {
    return JSON.parse(String(value));
  } catch (e) {
    throw new Error('Invalid JSON payload.');
  }
}

function bool_(v) {
  if (v === true || v === 1) return true;
  const s = String(v == null ? '' : v).toLowerCase().trim();
  return s === 'true' || s === '1' || s === 'yes';
}

function remindersGet_(p) {
  const date = String(p.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));

  const rsh = getRemindersSheet_();
  const reminders = [];
  if (rsh.getLastRow() >= 2) {
    const values = rsh.getRange(2, 1, rsh.getLastRow() - 1, PROGRESSX_REMINDER_HEADERS.length).getDisplayValues();
    values.forEach(r => {
      if (!String(r[0] || '').trim()) return;
      reminders.push({
        id: r[0],
        name: r[1],
        amount: r[2],
        time: r[3],
        enabled: bool_(r[4])
      });
    });
  }

  const done = {};
  let water = { date: date, current: 0, target: 3 };

  const dsh = getDailyLogSheet_();
  if (dsh.getLastRow() >= 2) {
    const values = dsh.getRange(2, 1, dsh.getLastRow() - 1, PROGRESSX_DAILY_HEADERS.length).getDisplayValues();
    values.forEach(r => {
      if (String(r[0]) !== date) return;
      const type = String(r[1] || '').toLowerCase();
      if (type === 'reminder' && r[2]) {
        done[String(r[2])] = bool_(r[4]);
      } else if (type === 'water') {
        water = {
          date: date,
          current: Number(r[5]) || 0,
          target: Number(r[6]) || 3
        };
      }
    });
  }

  return {
    ok: true,
    reminders: reminders,
    done: done,
    water: water,
    date: date
  };
}

function remindersSave_(p) {
  const reminders = parseJsonParam_(p.reminders, []);
  if (!Array.isArray(reminders)) throw new Error('Reminders payload must be an array.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getRemindersSheet_();

    if (sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, PROGRESSX_REMINDER_HEADERS.length).clearContent();
    }

    if (reminders.length) {
      const now = new Date();
      const rows = reminders.map(r => [
        String(r.id || ''),
        String(r.name || ''),
        String(r.amount || ''),
        String(r.time || ''),
        !!r.enabled,
        now
      ]);
      sh.getRange(2, 1, rows.length, PROGRESSX_REMINDER_HEADERS.length).setValues(rows);
    }

    SpreadsheetApp.flush();
    return { ok: true, saved: reminders.length };
  } finally {
    lock.releaseLock();
  }
}

function dailySave_(p) {
  const date = String(p.date || '').trim();
  if (!date) throw new Error('Missing daily log date.');

  const reminders = parseJsonParam_(p.reminders, []);
  const done = parseJsonParam_(p.done, {});
  const water = parseJsonParam_(p.water, { date: date, current: 0, target: 3 });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getDailyLogSheet_();

    // Remove existing rows for this date, then rewrite one clean snapshot.
    const lastRow = sh.getLastRow();
    if (lastRow >= 2) {
      const dates = sh.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      for (let i = dates.length - 1; i >= 0; i--) {
        if (String(dates[i][0]) === date) sh.deleteRow(i + 2);
      }
    }

    const now = new Date();
    const rows = [];

    (Array.isArray(reminders) ? reminders : []).forEach(r => {
      rows.push([
        date,
        'Reminder',
        String(r.id || ''),
        String(r.name || ''),
        !!done[String(r.id || '')],
        '',
        '',
        now
      ]);
    });

    rows.push([
      date,
      'Water',
      'water',
      'Water',
      '',
      Number(water.current) || 0,
      Number(water.target) || 3,
      now
    ]);

    if (rows.length) {
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, PROGRESSX_DAILY_HEADERS.length).setValues(rows);
    }

    SpreadsheetApp.flush();
    return { ok: true, date: date, rows: rows.length };
  } finally {
    lock.releaseLock();
  }
}



function getFoodProductsSheet_() {
  return getOrCreateSheetWithHeaders_(PROGRESSX_FOOD_PRODUCTS_SHEET, PROGRESSX_FOOD_PRODUCT_HEADERS);
}

function getFoodLogSheet_() {
  return getOrCreateSheetWithHeaders_(PROGRESSX_FOOD_LOG_SHEET, PROGRESSX_FOOD_LOG_HEADERS);
}

function getNutritionSettingsSheet_() {
  return getOrCreateSheetWithHeaders_(PROGRESSX_NUTRITION_SETTINGS_SHEET, PROGRESSX_NUTRITION_SETTING_HEADERS);
}

function foodProductsList_() {
  const sh = getFoodProductsSheet_();
  if (sh.getLastRow() < 2) return { ok: true, products: [] };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, PROGRESSX_FOOD_PRODUCT_HEADERS.length).getDisplayValues();
  const products = [];
  values.forEach(r => {
    if (!String(r[0] || '').trim()) return;
    products.push({
      id: r[0],
      barcode: r[1] || '',
      name: r[2],
      servingQty: Number(r[3]) || 1,
      servingUnit: r[4] || 'serving',
      calories: Number(r[5]) || 0,
      protein: Number(r[6]) || 0,
      carbs: Number(r[7]) || 0,
      fat: Number(r[8]) || 0
    });
  });
  return { ok: true, products: products };
}

function foodProductUpsert_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getFoodProductsSheet_();
    const id = String(p.id || '').trim();
    let row = id ? findRowById_(sh, id) : -1;
    let finalId = id;

    if (row < 0) {
      finalId = String(nextId_(sh));
      row = Math.max(2, sh.getLastRow() + 1);
    }

    sh.getRange(row, 1, 1, PROGRESSX_FOOD_PRODUCT_HEADERS.length).setValues([[
      finalId,
      String(p.barcode || ''),
      String(p.name || ''),
      Number(p.servingQty) || 1,
      String(p.servingUnit || 'serving'),
      Number(p.calories) || 0,
      Number(p.protein) || 0,
      Number(p.carbs) || 0,
      Number(p.fat) || 0,
      new Date()
    ]]);

    SpreadsheetApp.flush();
    return { ok: true, id: finalId };
  } finally {
    lock.releaseLock();
  }
}

function foodProductDelete_(p) {
  const id = String(p.id || '').trim();
  if (!id) throw new Error('Missing product ID.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getFoodProductsSheet_();
    const row = findRowById_(sh, id);
    if (row < 0) throw new Error('Food product not found.');
    sh.deleteRow(row);
    SpreadsheetApp.flush();
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function foodLogList_(p) {
  const date = String(p.date || '').trim();
  const sh = getFoodLogSheet_();
  if (sh.getLastRow() < 2) return { ok: true, entries: [] };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, PROGRESSX_FOOD_LOG_HEADERS.length).getDisplayValues();
  const entries = [];

  values.forEach(r => {
    if (!String(r[0] || '').trim()) return;
    if (date && String(r[1]) !== date) return;

    entries.push({
      id: r[0],
      date: r[1],
      meal: r[2],
      productId: r[3],
      name: r[4],
      amount: Number(r[5]) || 0,
      servingQty: Number(r[6]) || 1,
      servingUnit: r[7] || 'serving',
      calories: Number(r[8]) || 0,
      protein: Number(r[9]) || 0,
      carbs: Number(r[10]) || 0,
      fat: Number(r[11]) || 0
    });
  });

  return { ok: true, entries: entries };
}

function foodLogUpsert_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getFoodLogSheet_();
    const id = String(p.id || '').trim();
    let row = id ? findRowById_(sh, id) : -1;
    let finalId = id;

    if (row < 0) {
      finalId = String(nextId_(sh));
      row = Math.max(2, sh.getLastRow() + 1);
    }

    sh.getRange(row, 1, 1, PROGRESSX_FOOD_LOG_HEADERS.length).setValues([[
      finalId,
      String(p.date || ''),
      String(p.meal || 'Meal'),
      String(p.productId || ''),
      String(p.name || ''),
      Number(p.amount) || 0,
      Number(p.servingQty) || 1,
      String(p.servingUnit || 'serving'),
      Number(p.calories) || 0,
      Number(p.protein) || 0,
      Number(p.carbs) || 0,
      Number(p.fat) || 0,
      new Date()
    ]]);

    SpreadsheetApp.flush();
    return { ok: true, id: finalId };
  } finally {
    lock.releaseLock();
  }
}

function foodLogDelete_(p) {
  const id = String(p.id || '').trim();
  if (!id) throw new Error('Missing food log ID.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getFoodLogSheet_();
    const row = findRowById_(sh, id);
    if (row < 0) throw new Error('Food log entry not found.');
    sh.deleteRow(row);
    SpreadsheetApp.flush();
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function nutritionTargetsGet_() {
  const defaults = { calories: 2200, protein: 180, carbs: 220, fat: 70 };
  const sh = getNutritionSettingsSheet_();
  if (sh.getLastRow() < 2) return { ok: true, targets: defaults };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, PROGRESSX_NUTRITION_SETTING_HEADERS.length).getDisplayValues();
  const targets = Object.assign({}, defaults);
  values.forEach(r => {
    const key = String(r[0] || '').trim();
    if (key && Object.prototype.hasOwnProperty.call(targets, key)) {
      targets[key] = Number(r[1]) || targets[key];
    }
  });
  return { ok: true, targets: targets };
}

function nutritionTargetsSave_(p) {
  const targets = parseJsonParam_(p.targets, {});
  const defaults = { calories: 2200, protein: 180, carbs: 220, fat: 70 };
  const finalTargets = Object.assign({}, defaults, targets || {});

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getNutritionSettingsSheet_();
    if (sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, PROGRESSX_NUTRITION_SETTING_HEADERS.length).clearContent();
    }

    const now = new Date();
    const rows = ['calories','protein','carbs','fat'].map(k => [k, Number(finalTargets[k]) || defaults[k], now]);
    sh.getRange(2, 1, rows.length, PROGRESSX_NUTRITION_SETTING_HEADERS.length).setValues(rows);
    SpreadsheetApp.flush();

    return { ok: true, targets: finalTargets };
  } finally {
    lock.releaseLock();
  }
}



function foodBarcodeLookup_(p) {
  const barcode = String(p.barcode || '').replace(/\D/g, '').trim();
  if (!barcode) throw new Error('Missing barcode.');

  const fields = [
    'code',
    'product_name',
    'product_name_en',
    'brands',
    'quantity',
    'serving_size',
    'serving_quantity',
    'nutrition_data_per',
    'nutriments',
    'image_front_url'
  ].join(',');

  const url = 'https://world.openfoodfacts.org/api/v3/product/' +
    encodeURIComponent(barcode) +
    '?fields=' + encodeURIComponent(fields);

  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    followRedirects: true,
    headers: {
      'User-Agent': 'ProgressX/1.0 (personal nutrition tracker)'
    }
  });

  const status = response.getResponseCode();
  if (status === 404) {
    return { ok: true, found: false, barcode: barcode };
  }
  if (status < 200 || status >= 300) {
    throw new Error('Open Food Facts returned HTTP ' + status);
  }

  const payload = JSON.parse(response.getContentText() || '{}');
  const product = payload.product || {};

  if (!product || Object.keys(product).length === 0) {
    return { ok: true, found: false, barcode: barcode };
  }

  const n = product.nutriments || {};

  const num = function(v) {
    const x = Number(v);
    return isFinite(x) ? x : null;
  };

  // Prefer values per 100 g / 100 ml so ProgressX can scale any amount reliably.
  let calories = num(n['energy-kcal_100g']);
  if (calories == null) {
    const kj = num(n['energy-kj_100g']);
    if (kj != null) calories = kj / 4.184;
  }

  const protein = num(n['proteins_100g']);
  const carbs = num(n['carbohydrates_100g']);
  const fat = num(n['fat_100g']);

  const name =
    String(product.product_name || product.product_name_en || '').trim() ||
    (String(product.brands || '').trim() ? String(product.brands).trim() : 'Scanned product');

  return {
    ok: true,
    found: true,
    barcode: barcode,
    product: {
      barcode: barcode,
      name: name,
      brand: String(product.brands || ''),
      servingQty: 100,
      servingUnit: 'g',
      calories: calories == null ? 0 : calories,
      protein: protein == null ? 0 : protein,
      carbs: carbs == null ? 0 : carbs,
      fat: fat == null ? 0 : fat,
      originalServing: String(product.serving_size || ''),
      quantity: String(product.quantity || ''),
      image: String(product.image_front_url || '')
    }
  };
}



function foodSearchOnline_(p) {
  const q = String(p.q || '').trim();
  if (q.length < 2) throw new Error('Enter at least 2 characters.');

  const url =
    'https://world.openfoodfacts.org/cgi/search.pl?' +
    'search_terms=' + encodeURIComponent(q) +
    '&search_simple=1&action=process&json=1&page_size=15' +
    '&fields=' + encodeURIComponent(
      'code,product_name,product_name_en,brands,serving_size,quantity,nutriments,image_front_small_url,image_front_url'
    );

  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    followRedirects: true,
    headers: {
      'User-Agent': 'ProgressX/1.0 (personal nutrition tracker)'
    }
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error('Open Food Facts search returned HTTP ' + status);
  }

  const payload = JSON.parse(response.getContentText() || '{}');
  const raw = Array.isArray(payload.products) ? payload.products : [];
  const results = [];

  raw.forEach(product => {
    const n = product.nutriments || {};
    const num = function(v) {
      const x = Number(v);
      return isFinite(x) ? x : null;
    };

    let calories = num(n['energy-kcal_100g']);
    if (calories == null) {
      const kj = num(n['energy-kj_100g']);
      if (kj != null) calories = kj / 4.184;
    }

    const protein = num(n['proteins_100g']);
    const carbs = num(n['carbohydrates_100g']);
    const fat = num(n['fat_100g']);

    if (calories == null && protein == null && carbs == null && fat == null) return;

    const name = String(product.product_name || product.product_name_en || '').trim();
    if (!name) return;

    results.push({
      barcode: String(product.code || ''),
      name: name,
      brand: String(product.brands || ''),
      servingQty: 100,
      servingUnit: 'g',
      calories: calories == null ? 0 : calories,
      protein: protein == null ? 0 : protein,
      carbs: carbs == null ? 0 : carbs,
      fat: fat == null ? 0 : fat,
      originalServing: String(product.serving_size || ''),
      quantity: String(product.quantity || ''),
      image: String(product.image_front_small_url || product.image_front_url || '')
    });
  });

  return { ok: true, query: q, count: results.length, products: results };
}


function respond_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    // JSONP allows a standalone local HTML file to communicate with Apps Script
    // without browser CORS problems.
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
