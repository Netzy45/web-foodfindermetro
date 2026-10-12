/**
 * BACKEND "TAMBAH LOKASI" — Google Apps Script (gratis)
 *
 * LANGKAH PASANG:
 * 1. Buat Google Sheet baru (kosong) → menu Extensions > Apps Script.
 * 2. Hapus isi default, tempel seluruh file ini. Ganti ADMIN_PASSWORD di bawah.
 * 3. Deploy > New deployment > jenis "Web app"
 *    - Execute as: Me   - Who has access: Anyone
 *    Izinkan akses (termasuk Google Drive untuk menyimpan foto) saat diminta, lalu salin URL yang berakhiran /exec.
 * 4. Tempel URL itu ke SERVER_URL di config.js. Selesai.
 * (Setiap kali mengubah kode ini: Deploy > Manage deployments > Edit > New version.)
 */
const ADMIN_PASSWORD = "admin";
const SHEET_NAME = "Pengajuan";
const HEADERS = ["id", "waktu", "status", "nama", "wa", "alamat", "jam", "hargaMin", "hargaMax", "menu", "maps", "kategori", "kecamatan", "foto", "gambar", "gofood", "video", "fasilitas", "jalanBagus", "akses", "statusManual", "tutupSampai"];
const LOG_SHEET = "Log";
const LOG_HEADERS = ["waktu", "hari", "tipe", "id", "menu", "cid"];
const GOFOOD = /^https:\/\/([\w-]+\.)?(gofood\.co\.id|gofood\.link|gojek\.com|gojek\.link|gojek\.onelink\.me)(\/|$)/i;
const MAPS = /^https:\/\/(www\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)/i;
const VIDEO = /^https:\/\/(www\.)?tiktok\.com\/@[\w.\-]{1,40}\/video\/\d{8,25}/i;
const JAM = /^(24\s*jam|([01]?\d|2[0-3])[.:][0-5]\d\s*[–—-]\s*(([01]?\d|2[0-3])[.:][0-5]\d|24[.:]00))$/i;
const FOTO = /^(images\/[\w\-./]+|https:\/\/[^\s"'<>`]+)$/;

function bersih_(s) {
  return String(s == null ? "" : s).replace(/'/g, "’").replace(/"/g, "”").replace(/[<>`]/g, "")
    .replace(/\s+/g, " ").replace(/^[=+\-@\s]+/, "").trim();
}
function video_(u) { const m = VIDEO.exec(String(u || "").trim()); return m ? m[0].replace(/^https:\/\/tiktok/i, "https://www.tiktok") : ""; }
/* "qris:1,halal:0" -> hanya pasangan valid (kode huruf kecil/angka, nilai 0/1) */
function fasilitas_(s) {
  const out = [];
  String(s || "").split(",").forEach(p => { const m = /^\s*([a-z0-9]{1,20}):([01])\s*$/.exec(p); if (m) out.push(m[1] + ":" + m[2]); });
  return out.slice(0, 20).join(",");
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS.length).setNumberFormat("@"); // semua teks, cegah rumus
    sh.appendRow(HEADERS); sh.setFrozenRows(1);
  }
  const head = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0]; // sheet lama: tambah kolom yang belum ada
  HEADERS.forEach((h, i) => {
    if (!head[i]) { sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat("@"); sh.getRange(1, i + 1).setValue(h); }
  });
  return sh;
}
function simpanFoto_(b64, id) {
  if (!b64) return "";
  b64 = String(b64);
  if (b64.length > 900000) throw new Error("Foto terlalu besar.");
  const bytes = Utilities.base64Decode(b64);
  if (bytes[0] !== -1 || bytes[1] !== -40) throw new Error("Format foto harus JPG."); // penanda JPEG
  const it = DriveApp.getFoldersByName("Jajan Metro Foto");
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder("Jajan Metro Foto");
  const f = folder.createFile(Utilities.newBlob(bytes, "image/jpeg", id + ".jpg"));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/thumbnail?id=" + f.getId() + "&sz=w800";
}
function baca_() {
  const v = sheet_().getDataRange().getValues(), out = [];
  for (let i = 1; i < v.length; i++) {
    const o = { _row: i + 1 };
    HEADERS.forEach((h, c) => o[h] = String(v[i][c] == null ? "" : v[i][c]));
    if (o.id) out.push(o);
  }
  return out;
}
function publik_(r) {
  return { id: r.id, nama: r.nama, alamat: r.alamat, jam: r.jam, hargaMin: +r.hargaMin, hargaMax: +r.hargaMax,
    menu: r.menu, maps: r.maps, kategori: r.kategori, kecamatan: r.kecamatan, foto: r.foto || r.gambar, gofood: r.gofood,
    video: r.video, fasilitas: r.fasilitas, jalanBagus: r.jalanBagus, akses: r.akses, statusManual: r.statusManual, tutupSampai: r.tutupSampai };
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "approved")
    return json_({ ok: true, data: baca_().filter(r => r.status === "approved").map(publik_) });
  if (e && e.parameter && e.parameter.action === "stats") return json_({ ok: true, data: stats_() });
  return json_({ ok: true, data: "Server Jajan Metro aktif." });
}

function doPost(e) {
  let out;
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const req = JSON.parse(e.postData.contents);
    out = { ok: true, data: req.action === "submit" ? kirim_(req) : req.action === "log" ? log_(req) : admin_(req) };
  } catch (err) {
    out = { ok: false, error: String(err.message || err) };
  } finally { try { lock.releaseLock(); } catch (x) {} }
  return json_(out);
}

function kirim_(q) {
  if (q.website) return { id: "ok" }; // honeypot: bot dianggap sukses, tidak disimpan
  const d = {
    wa: String(q.wa || "").replace(/\D/g, ""), nama: bersih_(q.nama), alamat: bersih_(q.alamat), jam: bersih_(q.jam),
    hargaMin: parseInt(q.hargaMin, 10) || 0, hargaMax: parseInt(q.hargaMax, 10) || 0,
    menu: bersih_(q.menu).split(",").map(m => m.trim()).filter(Boolean).slice(0, 8).join(", "), maps: String(q.maps || "").trim(), gofood: String(q.gofood || "").trim(),
    video: video_(q.video), fasilitas: fasilitas_(q.fasilitas),
    jalanBagus: String(q.jalanBagus || ""), akses: String(q.akses || "")
  };
  if (!/^628\d{7,12}$/.test(d.wa)) throw new Error("Nomor WhatsApp tidak valid.");
  if (d.nama.length < 3 || d.nama.length > 60) throw new Error("Nama UMKM tidak valid.");
  if (d.alamat.length < 5 || d.alamat.length > 150) throw new Error("Alamat tidak valid.");
  if (!JAM.test(d.jam)) throw new Error("Format jam buka: 09.00–21.00 atau 24 jam.");
  if (!d.hargaMin || d.hargaMax < d.hargaMin || d.hargaMax > 10000000) throw new Error("Kisaran harga tidak valid.");
  if (!d.menu) throw new Error("Menu andalan wajib diisi.");
  if (d.maps.length > 300 || !MAPS.test(d.maps)) throw new Error("Link Google Maps tidak valid.");
  if (d.gofood && (d.gofood.length > 300 || !GOFOOD.test(d.gofood))) throw new Error("Link Gojek/GoFood tidak valid.");
  if (String(q.video || "").trim() && !d.video) throw new Error("Link video harus link TikTok lengkap.");
  if (!d.fasilitas) throw new Error("Fasilitas wajib diisi.");
  if (["0", "1"].indexOf(d.jalanBagus) < 0) throw new Error("Kondisi jalan wajib diisi.");
  if (["mobil", "motor"].indexOf(d.akses) < 0) throw new Error("Akses kendaraan wajib diisi.");
  if (!q.foto64) throw new Error("Foto kedai wajib diisi.");
  const semua = baca_();
  if (semua.some(r => r.wa === d.wa && r.nama.toLowerCase() === d.nama.toLowerCase() && r.status !== "rejected"))
    throw new Error("Pengajuan dengan nama dan nomor ini sudah ada.");
  if (semua.filter(r => r.wa === d.wa && r.status === "pending").length >= 3)
    throw new Error("Terlalu banyak pengajuan yang masih menunggu dari nomor ini.");
  const id = Utilities.getUuid().replace(/-/g, "").slice(0, 10);
  const gambar = simpanFoto_(q.foto64, id);
  sheet_().appendRow([id, new Date().toISOString(), "pending", d.nama, d.wa, d.alamat, d.jam, d.hargaMin, d.hargaMax, d.menu, d.maps, "", "", "", gambar, d.gofood, d.video, d.fasilitas, d.jalanBagus, d.akses, "", ""]);
  return { id: id };
}

function admin_(q) {
  if (ADMIN_PASSWORD === "admin") throw new Error("Ganti ADMIN_PASSWORD di Code.gs dulu.");
  if (String(q.password || "") !== ADMIN_PASSWORD) { Utilities.sleep(1000); throw new Error("Password salah."); }
  if (q.action === "admin_list") return baca_().map(r => { delete r._row; return r; });
  const r = baca_().filter(x => x.id === q.id)[0];
  if (!r) throw new Error("Data tidak ditemukan.");
  const sh = sheet_();
  if (q.action === "admin_delete") {
    const m = /id=([\w-]+)/.exec(r.gambar || "");
    if (m) { try { DriveApp.getFileById(m[1]).setTrashed(true); } catch (x) {} }
    sh.deleteRow(r._row); return true;
  }
  if (q.action === "admin_update") {
    const status = ["pending", "approved", "rejected"].indexOf(q.status) >= 0 ? q.status : r.status;
    const kategori = bersih_(q.kategori), kecamatan = bersih_(q.kecamatan), foto = String(q.foto || "").trim();
    if (status === "approved" && (!kategori || !kecamatan)) throw new Error("Kategori dan kecamatan wajib diisi.");
    if (foto && !FOTO.test(foto)) throw new Error("Format foto tidak valid (pakai images/nama.jpg atau link https).");
    sh.getRange(r._row, 3).setValue(status);
    const video = String(q.video || "").trim() ? video_(q.video) : "";
    if (String(q.video || "").trim() && !video) throw new Error("Link video harus link TikTok lengkap.");
    const jalan = String(q.jalanBagus || ""), akses = String(q.akses || ""), buka = String(q.buka || ""), sampai = String(q.tutupSampai || "");
    if (["", "0", "1"].indexOf(jalan) < 0 || ["", "mobil", "motor"].indexOf(akses) < 0 || ["", "tutup", "buka"].indexOf(buka) < 0) throw new Error("Pilihan tidak valid.");
    if (sampai && !/^\d{4}-\d{2}-\d{2}$/.test(sampai)) throw new Error("Tanggal tutup sampai tidak valid.");
    sh.getRange(r._row, 12, 1, 3).setValues([[kategori, kecamatan, foto]]);
    const gofood = String(q.gofood || "").trim();
    if (gofood && (gofood.length > 300 || !GOFOOD.test(gofood))) throw new Error("Link Gojek/GoFood tidak valid.");
    sh.getRange(r._row, 16, 1, 7).setValues([[gofood, video, fasilitas_(q.fasilitas), jalan, akses, buka, sampai]]);
    return true;
  }
  throw new Error("Aksi tidak dikenal.");
}

/* ===== TREN: catat aktivitas (view / like / pesan) & rekap 30 hari ===== */
function logSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(LOG_SHEET);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET);
    sh.getRange(1, 1, sh.getMaxRows(), LOG_HEADERS.length).setNumberFormat("@");
    sh.appendRow(LOG_HEADERS); sh.setFrozenRows(1);
  }
  return sh;
}
function hari_(d) { return Utilities.formatDate(d, "Asia/Jakarta", "yyyy-MM-dd"); }

function log_(q) {
  const tipe = String(q.tipe || ""), id = String(q.id || ""), cid = String(q.cid || "");
  if (["view", "like", "pesan"].indexOf(tipe) < 0) throw new Error("Tipe tidak valid.");
  if (!/^[\w-]{1,20}$/.test(id)) throw new Error("ID tidak valid.");
  if (!/^[\w-]{6,40}$/.test(cid)) throw new Error("ID perangkat tidak valid.");
  const menu = tipe === "like" ? bersih_(q.menu).slice(0, 60) : "";
  if (tipe === "like" && !menu) throw new Error("Menu wajib diisi.");
  const sh = logSheet_();
  if (tipe === "like") { // satu suara per perangkat per menu
    const v = sh.getDataRange().getValues();
    for (let i = 1; i < v.length; i++) if (v[i][2] === "like" && v[i][3] === id && v[i][4] === menu && v[i][5] === cid) return { dup: true };
  }
  const now = new Date();
  sh.appendRow([now.toISOString(), hari_(now), tipe, id, menu, cid]);
  CacheService.getScriptCache().remove("stats");
  return true;
}

function stats_() {
  const cache = CacheService.getScriptCache(), c = cache.get("stats");
  if (c) return JSON.parse(c);
  const v = logSheet_().getDataRange().getValues(), batas = hari_(new Date(Date.now() - 30 * 864e5)), agg = {};
  for (let i = 1; i < v.length; i++) {
    const hari = v[i][1] instanceof Date ? hari_(v[i][1]) : String(v[i][1]);
    if (v[i][2] !== "like" && hari < batas) continue; // suara 👍 dihitung seumur hidup
    const k = [v[i][2], v[i][3], v[i][4], hari].join("\t");
    agg[k] = (agg[k] || 0) + 1;
  }
  const out = { rows: Object.keys(agg).map(k => { const r = k.split("\t"); r.push(agg[k]); return r; }) };
  cache.put("stats", JSON.stringify(out), 60);
  return out;
}
