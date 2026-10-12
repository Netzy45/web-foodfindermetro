/* ===== DATA CONTOH (ganti dengan tempat sebenarnya) ===== */
const KATEGORI = ["Kuliner Legendaris", "Makanan Pedas", "Kafe Lokal", "Kaki Lima", "Oleh-oleh"];

/* Kolom opsional tiap tempat: video (link TikTok lengkap), fasilitas, jalanBagus, akses ("mobil" / "motor"),
   status ("auto" = ikut jam buka, "tutup" = tutup sementara, "buka" = paksa buka) + tutupSampai ("2026-10-20"). */
const TEMPAT = [
  { id: "t1", gambartoko: "images/baksoPakDarmo.jpg", nama: "Bakso Pak Darmo", kategori: "Kuliner Legendaris", kecamatan: "Metro Pusat",
    alamat: "Jl. Sudirman No. 12, Metro Pusat", jam: "09.00–21.00", hargaMin: 12000, hargaMax: 25000,
    menu: ["Bakso urat", "Bakso tahu", "Es jeruk"], rating: 4.6, jumlah: 18, gofood: "https://gofood.co.id/",
    fasilitas: { qris: true, halal: true, wifi: true, kipas: true, ac: false, stopkontak: true, parkir: true },
    jalanBagus: true, akses: "mobil", status: "auto", tutupSampai: "", video: "" },
  { id: "t2", gambartoko: "images/imas.png", nama: "Seblak Teh Imas", kategori: "Makanan Pedas", kecamatan: "Metro Barat",
    alamat: "Jl. Imam Bonjol, Metro Barat", jam: "14.00–22.00", hargaMin: 10000, hargaMax: 20000,
    menu: ["Seblak ceker", "Seblak seafood", "Cuanki"], rating: 4.4, jumlah: 31, gofood: "https://gofood.co.id/",
    fasilitas: { qris: true, halal: true, wifi: false, kipas: true, ac: false, stopkontak: false, parkir: true },
    jalanBagus: false, akses: "motor", status: "auto", tutupSampai: "", video: "" },
  { id: "t3", gambartoko: "images/kopiSudutTaman.jpg", nama: "Kopi Sudut Taman", kategori: "Kafe Lokal", kecamatan: "Metro Timur",
    alamat: "Jl. Ki Hajar Dewantara, Metro Timur", jam: "08.00–23.00", hargaMin: 15000, hargaMax: 35000,
    menu: ["Kopi susu gula aren", "Kopi Lampung V60", "Roti bakar"], rating: 4.7, jumlah: 42, gofood: "https://gofood.co.id/",
    fasilitas: { qris: true, halal: true, wifi: true, kipas: true, ac: true, stopkontak: true, parkir: true },
    jalanBagus: true, akses: "mobil", status: "auto", tutupSampai: "", video: "" },
  { id: "t4", gambartoko: "images/nasiUduk1.png", nama: "Nasi Uduk Bu Sari", kategori: "Kaki Lima", kecamatan: "Metro Utara",
    alamat: "Depan pasar, Metro Utara", jam: "05.30–10.00", hargaMin: 8000, hargaMax: 15000,
    menu: ["Nasi uduk telur", "Bakwan", "Teh manis"], rating: 4.3, jumlah: 12, gofood: "https://gofood.co.id/",
    fasilitas: { qris: false, halal: true, wifi: false, kipas: false, ac: false, stopkontak: false, parkir: false },
    jalanBagus: false, akses: "motor", status: "auto", tutupSampai: "", video: "" },
  { id: "t5", gambartoko: "images/keripikPisang.jpg", nama: "Keripik Pisang Mak Yah", kategori: "Oleh-oleh", kecamatan: "Metro Selatan",
    alamat: "Jl. Pattimura, Metro Selatan", jam: "08.00–17.00", hargaMin: 15000, hargaMax: 60000,
    menu: ["Keripik pisang coklat", "Keripik pisang asin", "Kopi bubuk"], rating: 4.8, jumlah: 25, gofood: "https://gofood.co.id/",
    fasilitas: { qris: true, halal: true, wifi: false, kipas: true, ac: false, stopkontak: true, parkir: true },
    jalanBagus: true, akses: "mobil", status: "auto", tutupSampai: "", video: "" },
  { id: "t6", gambartoko: "images/ayamGeprek.png", nama: "Mie Ayam Geprek Joss", kategori: "Makanan Pedas", kecamatan: "Metro Pusat",
    alamat: "Jl. Hasanudin, Metro Pusat", jam: "10.00–21.00", hargaMin: 13000, hargaMax: 22000,
    menu: ["Ayam geprek level 1–5", "Mie ayam pedas"], rating: 4.2, jumlah: 20, gofood: "https://gofood.co.id/",
    fasilitas: { qris: true, halal: true, wifi: true, kipas: true, ac: true, stopkontak: true, parkir: false },
    jalanBagus: true, akses: "mobil", status: "auto", tutupSampai: "", video: "" },
  { id: "t7", gambartoko: "images/sotoBetawi.jpg", nama: "Soto Betawi Haji Ujang", kategori: "Kuliner Legendaris", kecamatan: "Metro Barat",
    alamat: "Jl. Veteran, Metro Barat", jam: "07.00–15.00", hargaMin: 18000, hargaMax: 30000,
    menu: ["Soto daging", "Soto babat", "Emping"], rating: 4.5, jumlah: 16, gofood: "https://gofood.co.id/",
    fasilitas: { qris: false, halal: true, wifi: false, kipas: true, ac: false, stopkontak: false, parkir: true },
    jalanBagus: true, akses: "mobil", status: "auto", tutupSampai: "", video: "" },
  { id: "t8", gambartoko: "images/esKelapa.png", nama: "Es Kelapa Muda Bang Ron", kategori: "Kaki Lima", kecamatan: "Metro Timur",
    alamat: "Pinggir lapangan, Metro Timur", jam: "10.00–18.00", hargaMin: 7000, hargaMax: 12000,
    menu: ["Es kelapa muda", "Es cincau"], rating: 4.1, jumlah: 9, gofood: "https://gofood.co.id/",
    fasilitas: { qris: false, halal: true, wifi: false, kipas: false, ac: false, stopkontak: false, parkir: true },
    jalanBagus: false, akses: "motor", status: "auto", tutupSampai: "", video: "" }
];

/* ===== STATE & UTIL ===== */
const $ = id => document.getElementById(id);
const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KEY = "jajanmetro:ulasan";
let kategoriAktif = "";
let aktifId = null;
const filterExtra = { buka: false, fas: new Set() }; // diatur dari fitur.js

/* ===== BUKA / TUTUP (zona WIB) ===== */
function waktuWIB() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { tgl: `${p.year}-${p.month}-${p.day}`, menit: (+p.hour % 24) * 60 + (+p.minute) };
}
/* buka: true/false, atau null kalau jam tidak bisa dibaca. manual: true bila diatur admin. */
function statusBuka(t) {
  const { tgl, menit } = waktuWIB();
  const aktif = !t.tutupSampai || tgl <= t.tutupSampai;
  if (t.status === "tutup" && aktif) return { buka: false, manual: true };
  if (t.status === "buka" && aktif) return { buka: true, manual: true };
  const j = String(t.jam || "").toLowerCase();
  if (/24\s*jam/.test(j)) return { buka: true };
  const m = j.match(/(\d{1,2})[.:](\d{2})\s*[–—-]\s*(\d{1,2})[.:](\d{2})/);
  if (!m) return { buka: null };
  const a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4];
  return { buka: a === b ? true : a < b ? menit >= a && menit < b : menit >= a || menit < b };
}
function lencanaBuka(t) {
  const s = statusBuka(t);
  if (s.buka === null) return "";
  return `<span class="closeTag ${s.buka ? "buka" : "tutup"}">${s.buka ? "Buka" : s.manual ? "Tutup sementara" : "Tutup"}</span>`;
}
/* 🛣️ jalan bagus (hanya muncul bila bagus) + 🚗 mobil bisa / 🏍️ khusus motor */
function aksesHtml(t) {
  const a = [];
  if (t.jalanBagus) a.push(`<span role="img" title="Jalan menuju kedai mayoritas bagus" aria-label="Jalan menuju kedai mayoritas bagus">🛣️</span>`);
  if (t.akses === "mobil") a.push(`<span role="img" title="Mobil bisa masuk" aria-label="Mobil bisa masuk">🚗</span>`);
  else if (t.akses === "motor") a.push(`<span role="img" title="Khusus motor" aria-label="Khusus motor">🏍️</span>`);
  return a.length ? `<span class="akses">${a.join("")}</span>` : "";
}
function barisTag(t) {
  return `<div class="wrapClose"><span class="tag">${esc(t.kategori)}</span>${lencanaBuka(t)}${aksesHtml(t)}</div>`;
}
/* Lencana fasilitas; yang belum pernah diisi tidak ditampilkan */
function fasilitasHtml(t) {
  if (typeof FASILITAS === "undefined") return "";
  const f0 = t.fasilitas || {};
  const l = FASILITAS.filter(f => f0[f.k] === true || f0[f.k] === false || f0[f.k] === 1 || f0[f.k] === 0).map(f => {
    const ya = !!f0[f.k];
    return `<li class="fas ${ya ? "ya" : "tidak"}" title="${esc(f.label)} ${ya ? "tersedia" : "tidak tersedia"}">${esc(f.label)} <span aria-hidden="true">${ya ? "✓" : "✕"}</span><span class="sr">${ya ? "tersedia" : "tidak tersedia"}</span></li>`;
  });
  return l.length ? `<ul class="fas-list">${l.join("")}</ul>` : `<p class="meta">Info fasilitas belum diisi.</p>`;
}
function kartuHtml(t) {
  const s = statistik(t);
  return `<button class="card" data-id="${esc(t.id)}">
      <img src="${esc(t.gambartoko)}" alt="">
      ${barisTag(t)}
      <div class="top"><h2>${esc(t.nama)}</h2><span class="rate">★ ${s.rating.toFixed(1)} <small>(${s.jumlah})</small></span></div>
      <p class="meta">${esc(t.kecamatan)} · ${rupiah(t.hargaMin)}–${rupiah(t.hargaMax)}</p>
      <p class="meta">Andalan: ${t.menu.slice(0, 2).map(esc).join(", ")}</p>
    </button>`;
}

function muatUlasan() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function simpanUlasan(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch { return false; }
}

/* Rating gabungan: rating kurasi (dihitung sebagai `jumlah` suara) + ulasan pengguna */
function statistik(t) {
  const u = muatUlasan()[t.id] || [];
  const total = t.jumlah + u.length;
  const sum = t.rating * t.jumlah + u.reduce((a, r) => a + r.bintang, 0);
  return { rating: total ? sum / total : 0, jumlah: total, ulasan: u };
}

/* ===== FILTER & DAFTAR ===== */
function isiFilter() {
  const kec = [...new Set(TEMPAT.map(t => t.kecamatan))].sort();
  $("kecamatan").insertAdjacentHTML("beforeend", kec.map(k => `<option>${k}</option>`).join(""));
  $("chips").innerHTML = ["Semua", ...KATEGORI].map((k, i) =>
    `<button type="button" class="chip" data-k="${i ? k : ""}" aria-pressed="${i === 0}">${k}</button>`).join("");
}

function render() {
  const q = $("q").value.trim().toLowerCase();
  const kec = $("kecamatan").value;
  let hasil = TEMPAT.filter(t =>
    (!kategoriAktif || t.kategori === kategoriAktif) &&
    (!kec || t.kecamatan === kec) &&
    (!q || (t.nama + " " + t.menu.join(" ") + " " + t.alamat).toLowerCase().includes(q)) &&
    (!filterExtra.buka || statusBuka(t).buka === true) &&
    [...filterExtra.fas].every(k => t.fasilitas && t.fasilitas[k] === true));

  const urut = $("sort").value;
  hasil.sort((a, b) =>
    urut === "murah" ? a.hargaMin - b.hargaMin :
    urut === "nama" ? a.nama.localeCompare(b.nama) :
    statistik(b).rating - statistik(a).rating);

  $("count").textContent = `${hasil.length} tempat ditemukan`;
  $("grid").innerHTML = hasil.length ? hasil.map(kartuHtml).join("") : `<p class="empty">Belum ada yang cocok. Coba kata kunci lain atau pilih “Semua” kategori.</p>`;
}


/* ===== DETAIL & ULASAN ===== */
function bukaDetail(id) {
  const t = TEMPAT.find(x => x.id === id);
  if (!t) return;
  aktifId = id;
  const s = statistik(t);
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(t.nama.replace(" (contoh)", "") + " " + t.alamat);

  $("detail-body").innerHTML = `
    ${barisTag(t)}
    <h2 id="d-nama">${esc(t.nama)}</h2>
    <p class="rate">★ ${s.rating.toFixed(1)} <small>dari ${s.jumlah} penilaian</small></p>
    ${fasilitasHtml(t)}
    ${t.akses || t.jalanBagus ? `<p class="meta akses-teks">${t.jalanBagus ? "🛣️ Jalan menuju kedai bagus" : ""}${t.jalanBagus && t.akses ? " · " : ""}${t.akses === "mobil" ? "🚗 Mobil bisa masuk" : t.akses === "motor" ? "🏍️ Khusus motor" : ""}</p>` : ""}
    <dl>
      <dt>Alamat</dt><dd>${esc(t.alamat)}</dd>
      <dt>Jam buka</dt><dd>${t.jam}</dd>
      <dt>Kisaran harga</dt><dd>${rupiah(t.hargaMin)} – ${rupiah(t.hargaMax)}</dd>
      <dt>Menu andalan</dt><dd>${t.menu.map(esc).join(", ")}</dd>
    </dl>
    <a class="btn" href="${maps}" target="_blank" rel="noopener">Buka di Google Maps</a>

    <h3>Tulis ulasan</h3>
    <form id="rform">
      <div class="stars" id="stars" role="radiogroup" aria-label="Beri bintang">
        ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star" data-n="${n}" role="radio" aria-checked="false" aria-label="${n} bintang">★</button>`).join("")}
      </div>
      <input id="r-nama" maxlength="30" placeholder="Nama (boleh kosong)">
      <textarea id="r-teks" rows="3" maxlength="300" placeholder="Apa yang enak? Apa yang perlu dicoba?"></textarea>
      <p class="meta" id="r-pesan" role="status"></p>
      <button class="btn" type="submit">Kirim ulasan</button>
    </form>

    <h3>Ulasan pengunjung (${s.ulasan.length})</h3>
    ${s.ulasan.length ? s.ulasan.slice().reverse().map(r => `
      <div class="review"><p><strong>${esc(r.nama || "Anonim")}</strong> · <span class="rate">${"★".repeat(r.bintang)}</span></p>
      <p>${esc(r.teks || "")}</p></div>`).join("") : `<p class="meta">Belum ada ulasan. Jadilah yang pertama.</p>`}`;

  $("detail").showModal();
}

let bintang = 0;
function setBintang(n) {
  bintang = n;
  document.querySelectorAll(".star").forEach(b => {
    const on = +b.dataset.n <= n;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", +b.dataset.n === n);
  });
}

function kirimUlasan(e) {
  e.preventDefault();
  const pesan = $("r-pesan");
  if (!bintang) { pesan.textContent = "Pilih jumlah bintang dulu."; return; }
  const data = muatUlasan();
  (data[aktifId] ||= []).push({
    bintang, nama: $("r-nama").value.trim(), teks: $("r-teks").value.trim(), waktu: Date.now()
  });
  if (!simpanUlasan(data)) { pesan.textContent = "Ulasan tidak bisa disimpan di browser ini."; return; }
  bintang = 0;
  bukaDetail(aktifId);
  render();
}

/* ===== EVENT ===== */
$("chips").addEventListener("click", e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  kategoriAktif = b.dataset.k;
  document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === b));
  render();
});
$("filters").addEventListener("input", render);
$("filters").addEventListener("submit", e => e.preventDefault());
$("grid").addEventListener("click", e => {
  const c = e.target.closest(".card");
  if (c) { bintang = 0; bukaDetail(c.dataset.id); }
});
$("detail").addEventListener("click", e => {
  if (e.target === $("detail") || e.target.id === "close") $("detail").close();
  const st = e.target.closest(".star");
  if (st) setBintang(+st.dataset.n);
});
$("detail").addEventListener("submit", kirimUlasan);

isiFilter();
render();
