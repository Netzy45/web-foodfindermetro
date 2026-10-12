/* Fitur tambahan — dimuat SETELAH script.js dan tambah.js:
   halaman 2 (tren & peringkat), halaman 3 (Pilihin Aku), tombol Gojek, suka menu, tren, peringkat, Pilihin Aku */
(() => {
  const KEY_CID = "jajanmetro:cid", KEY_SUKA = "jajanmetro:suka", KEY_LIHAT = "jajanmetro:lihat";
  const baca = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const tulis = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* abaikan */ } };
  /* Sama dengan bersih_() di Code.gs, supaya nama menu cocok antara browser dan server */
  const norm = s => String(s ?? "").replace(/'/g, "’").replace(/"/g, "”").replace(/[<>`]/g, "")
    .replace(/\s+/g, " ").replace(/^[=+\-@\s]+/, "").trim();
  const fmt = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const hariIni = () => fmt(new Date());
  const hariList = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return fmt(d); });
  const tempat = id => TEMPAT.find(t => t.id === id);

  let cid = baca(KEY_CID, "");
  if (!cid) {
    cid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, "").slice(0, 24);
    tulis(KEY_CID, cid);
  }

  /* ===== LOG & STATISTIK ===== */
  let STATS = [];            // baris: [tipe, id, menu, hari, jumlah]
  let statsWaktu = 0, statsOk = false;
  /* Mengembalikan {ok, dup}; tidak pernah melempar error */
  function kirimLog(p) {
    if (!SERVER_URL) return Promise.resolve({ ok: false });
    return fetch(SERVER_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "log", cid, ...p }) })
      .then(r => r.json()).then(j => ({ ok: !!j.ok, dup: !!(j.data && j.data.dup) })).catch(() => ({ ok: false }));
  }
  async function muatStats(paksa) {
    if (!SERVER_URL || (!paksa && Date.now() - statsWaktu < 30000)) return;
    try {
      const j = await (await fetch(SERVER_URL + "?action=stats&t=" + Date.now())).json();
      STATS = (j.data && j.data.rows) || [];
      statsWaktu = Date.now(); statsOk = true;
    } catch (e) { console.warn("Gagal memuat statistik", e); }
  }
  const jumlahSuka = (id, menu) => STATS.reduce((a, [y, i, m, , n]) => a + (y === "like" && i === id && m === menu ? +n : 0), 0);
  const sudahSuka = (id, menu) => !!baca(KEY_SUKA, {})[id + "|" + menu];
  const lupaSuka = (id, menu) => { const s = baca(KEY_SUKA, {}); delete s[id + "|" + menu]; tulis(KEY_SUKA, s); };

  /* ===== DETAIL: tombol Gojek + suka menu + catat tampilan ===== */
  const asli = bukaDetail;
  bukaDetail = function (id) {
    asli(id);
    const t = tempat(id); if (!t) return;
    const body = $("detail-body");

    const maps = body.querySelector("a.btn");
    let akhir = null;
    if (maps) {
      const aksi = document.createElement("div");
      aksi.className = "aksi";
      maps.replaceWith(aksi); aksi.append(maps); akhir = aksi;
      if (t.gofood) {
        const g = document.createElement("a");
        g.className = "btn btn-gojek"; g.href = t.gofood; g.target = "_blank"; g.rel = "noopener noreferrer";
        g.textContent = "Pesan via Gojek"; g.dataset.pesan = id;
        aksi.append(g);
      } else {
        const p = document.createElement("p");
        p.className = "meta"; p.textContent = "Link Gojek belum ditambahkan pemilik.";
        aksi.after(p); akhir = p;
      }
      const vid = /\/video\/(\d{8,25})/.exec(t.video || "");
      if (vid && /^https:\/\/(www\.)?tiktok\.com\//i.test(t.video)) {
        const box = document.createElement("div");
        box.className = "video-box";
        box.innerHTML = `<button type="button" class="btn btn-video" data-video="${vid[1]}">▶ Tonton video</button>
          <a class="meta" href="${esc(t.video)}" target="_blank" rel="noopener noreferrer">Buka di TikTok ↗</a>`;
        akhir.after(box);
      }
    }

    const dt = [...body.querySelectorAll("dt")].find(d => d.textContent === "Menu andalan"), dd = dt && dt.nextElementSibling;
    if (dd) {
      dd.innerHTML = `<div class="menu-list">` + t.menu.map(m => {
        const k = norm(m), n = jumlahSuka(id, k);
        let on = sudahSuka(id, k);
        if (on && statsOk && n < 1) { lupaSuka(id, k); on = false; } // catatan lokal tanpa suara di server: buang
        return `<button type="button" class="menu-like" data-menu="${esc(m)}" aria-pressed="${on}">${esc(m)} <span class="n">👍 ${n}</span></button>`;
      }).join("") + `</div><p class="meta" id="suka-info" role="status">Ketuk 👍 pada menu yang menurutmu paling enak.</p>`;
    }

    const h = hariIni(), lama = baca(KEY_LIHAT, {}), baru = {};
    Object.keys(lama).forEach(x => { if (x.endsWith("|" + h)) baru[x] = 1; });
    if (!baru[id + "|" + h]) {
      baru[id + "|" + h] = 1; tulis(KEY_LIHAT, baru);
      STATS.push(["view", id, "", h, 1]);
      kirimLog({ tipe: "view", id });
    }
  };

  $("detail").addEventListener("click", e => {
    const b = e.target.closest(".menu-like");
    if (b) {
      const id = aktifId, k = norm(b.dataset.menu), info = $("suka-info");
      if (!id || b.dataset.proses || b.getAttribute("aria-pressed") === "true") return;
      b.dataset.proses = "1";
      kirimLog({ tipe: "like", id, menu: k }).then(r => {
        delete b.dataset.proses;
        if (!r.ok) { if (info) info.textContent = "Suara belum tersimpan. Coba lagi sebentar."; return; }
        const s = baca(KEY_SUKA, {}); s[id + "|" + k] = 1; tulis(KEY_SUKA, s);
        if (!r.dup) STATS.push(["like", id, k, hariIni(), 1]);
        b.setAttribute("aria-pressed", "true");
        b.querySelector(".n").textContent = "👍 " + Math.max(1, jumlahSuka(id, k));
        if (info) info.textContent = "Terima kasih atas suaramu!";
        renderTren();
      });
      return;
    }
    const v = e.target.closest(".btn-video");
    if (v) {
      const f = document.createElement("iframe");
      f.src = "https://www.tiktok.com/embed/v2/" + v.dataset.video;
      f.title = "Video tempat"; f.loading = "lazy"; f.allow = "fullscreen; encrypted-media"; f.setAttribute("allowfullscreen", "");
      v.replaceWith(f);
      return;
    }
    const g = e.target.closest("[data-pesan]");
    if (g) { STATS.push(["pesan", g.dataset.pesan, "", hariIni(), 1]); kirimLog({ tipe: "pesan", id: g.dataset.pesan }); renderTren(); }
  });

  /* Tutup detail = hentikan video yang sedang diputar */
  $("detail").addEventListener("close", () => $("detail-body").querySelectorAll(".video-box iframe").forEach(f => f.remove()));

  /* Kartu di halaman 2 & 3 membuka detail yang sama */
  document.addEventListener("click", e => {
    const c = e.target.closest("#p-tren .card[data-id], #p-pilih .card[data-id]");
    if (c) { bintang = 0; bukaDetail(c.dataset.id); }
  });

  /* ===== HALAMAN TREN ===== */
  const charts = {};
  const WARNA = ["#D62F1F", "#F2B705", "#2E8B6B"];

  function isiSelect(sel, items, pertama) {
    const v = sel.value;
    sel.innerHTML = `<option value="">${pertama}</option>` + items.map(x => `<option>${esc(x)}</option>`).join("");
    sel.value = items.includes(v) ? v : "";
  }
  const daftarKec = () => [...new Set(TEMPAT.map(t => t.kecamatan))].sort();

  function renderTop3() {
    const m = {};
    STATS.forEach(([y, id, menu, , n]) => { if (y === "like") m[id + "|" + menu] = (m[id + "|" + menu] || 0) + +n; });
    const top = Object.entries(m).map(([k, n]) => { const i = k.indexOf("|"); return { id: k.slice(0, i), menu: k.slice(i + 1), n }; })
      .filter(x => tempat(x.id)).sort((a, b) => b.n - a.n).slice(0, 3);
    const medali = ["🥇", "🥈", "🥉"];
    $("top3").innerHTML = top.length ? top.map((x, i) => {
      const t = tempat(x.id);
      return `<button type="button" class="card tile" data-id="${esc(x.id)}">
        <span class="medali" aria-hidden="true">${medali[i]}</span>
        <strong>${esc(x.menu)}</strong>
        <span class="meta">${esc(t.nama)} · ${esc(t.kecamatan)}</span>
        <span class="rate">👍 ${x.n} suara</span></button>`;
    }).join("") : `<p class="empty">Belum ada suara. Buka detail sebuah tempat, lalu ketuk 👍 pada menu yang enak.</p>`;
  }

  function gambarTren(canvasId, noteId, tipe, kunci, label) {
    const hari = hariList(14), tot = {}, per = {};
    STATS.forEach(([y, id, menu, h, n]) => {
      if (!tipe.includes(y) || !hari.includes(h) || !tempat(id)) return;
      const k = kunci(id, menu); n = +n;
      tot[k] = (tot[k] || 0) + n; (per[k] ||= {})[h] = (per[k][h] || 0) + n;
    });
    const top = Object.keys(tot).sort((a, b) => tot[b] - tot[a]).slice(0, 3);
    const canvas = $(canvasId), note = $(noteId), ada = top.length > 0 && !!window.Chart;
    if (charts[canvasId]) { charts[canvasId].destroy(); delete charts[canvasId]; }
    canvas.parentElement.hidden = !ada; note.hidden = ada;
    note.textContent = window.Chart ? "Belum ada data tren. Grafik terisi seiring pengunjung membuka tempat dan menyukai menu." : "Grafik gagal dimuat. Periksa koneksi internet.";
    if (!ada) return;
    const css = getComputedStyle(document.documentElement), teks = css.getPropertyValue("--muted").trim(), garis = css.getPropertyValue("--line").trim();
    charts[canvasId] = new Chart(canvas, {
      type: "line",
      data: {
        labels: hari.map(h => h.slice(8) + "/" + h.slice(5, 7)),
        datasets: top.map((k, i) => ({
          label: label(k), data: hari.map(h => (per[k] || {})[h] || 0),
          borderColor: WARNA[i], backgroundColor: WARNA[i], tension: .3, borderWidth: 2.5, pointRadius: 3
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: teks, boxWidth: 14 } } },
        scales: {
          x: { ticks: { color: teks }, grid: { color: garis } },
          y: { beginAtZero: true, ticks: { color: teks, precision: 0 }, grid: { color: garis } }
        }
      }
    });
  }

  /* Skor tertimbang (Bayesian): rating digabung jumlah ulasan */
  function renderRank() {
    const kat = $("rk-kat").value, kec = $("rk-kec").value;
    const semua = TEMPAT.map(t => ({ t, s: statistik(t) })).filter(x => x.s.jumlah > 0);
    const C = semua.reduce((a, x) => a + x.s.rating, 0) / (semua.length || 1), M = 10;
    const hasil = semua.filter(x => (!kat || x.t.kategori === kat) && (!kec || x.t.kecamatan === kec))
      .map(x => ({ ...x, skor: x.s.jumlah / (x.s.jumlah + M) * x.s.rating + M / (x.s.jumlah + M) * C }))
      .sort((a, b) => b.skor - a.skor).slice(0, 10);
    $("rank").innerHTML = hasil.length ? hasil.map((x, i) => `<li>
      <button type="button" class="card rank-item" data-id="${esc(x.t.id)}">
        <span class="no">${i + 1}</span>
        <span class="isi"><strong>${esc(x.t.nama)}</strong><small>${esc(x.t.kategori)} · ${esc(x.t.kecamatan)}</small></span>
        <span class="rate">★ ${x.s.rating.toFixed(1)} <small>(${x.s.jumlah})</small></span>
      </button></li>`).join("") : `<li class="empty">Belum ada tempat dengan ulasan di pilihan ini.</li>`;
  }
  $("rk-kat").addEventListener("change", renderRank);
  $("rk-kec").addEventListener("change", renderRank);

  function renderTren() {
    renderTop3();
    gambarTren("ch-tempat", "note-tempat", ["view", "pesan"], id => id, id => tempat(id).nama);
    gambarTren("ch-menu", "note-menu", ["like"], (id, m) => id + "|" + m, k => {
      const i = k.indexOf("|"); return k.slice(i + 1) + " (" + tempat(k.slice(0, i)).nama.replace(" (contoh)", "") + ")";
    });
  }
  function renderBawah() {
    isiSelect($("rk-kat"), KATEGORI, "Semua kategori");
    isiSelect($("rk-kec"), daftarKec(), "Semua kecamatan");
    renderRank();
    isiPilih();
  }

  /* ===== PILIHIN AKU ===== */
  function isiPilih() {
    isiSelect($("pl-kat"), KATEGORI, "Terserah");
    isiSelect($("pl-kec"), daftarKec(), "Mana saja");
  }
  $("pform").addEventListener("submit", e => {
    e.preventDefault();
    const budget = +$("pl-budget").value, kat = $("pl-kat").value, kec = $("pl-kec").value;
    const cocok = TEMPAT.filter(t => (!budget || t.hargaMin <= budget) && (!kat || t.kategori === kat) && (!kec || t.kecamatan === kec));
    /* rating + sedikit acak (variasi tiap klik), tempat yang sedang buka diprioritaskan */
    const pilih = cocok.map(t => ({ t, v: statistik(t).rating + Math.random() * 1.2 + (statusBuka(t).buka === true ? 1.5 : 0) })).sort((a, b) => b.v - a.v).slice(0, 3).map(x => x.t);
    $("pl-btn").textContent = "Pilih lagi";
    $("pl-info").textContent = pilih.length ? `${cocok.length} tempat cocok, ini ${pilih.length} pilihan untukmu.` : "";
    $("pl-hasil").innerHTML = pilih.length ? pilih.map(kartuHtml).join("") : `<p class="empty">Belum ada yang cocok. Naikkan budget atau pilih “Terserah”.</p>`;
  });

  /* Filter tambahan di hero: Buka sekarang + fasilitas */
  const fc = $("fchips");
  fc.innerHTML = [{ k: "__buka", label: "Buka sekarang" }, ...FASILITAS].map(f =>
    `<button type="button" class="fchip" data-k="${esc(f.k)}" aria-pressed="false">${esc(f.label)}</button>`).join("");
  fc.addEventListener("click", e => {
    const b = e.target.closest(".fchip"); if (!b) return;
    const on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", on);
    if (b.dataset.k === "__buka") filterExtra.buka = on;
    else if (on) filterExtra.fas.add(b.dataset.k); else filterExtra.fas.delete(b.dataset.k);
    render();
  });

  /* Setiap render() daftar (filter, ulasan baru, lokasi dari server) ikut menyegarkan halaman 2 & 3 */
  const renderAsli = render;
  render = function () { renderAsli(); renderBawah(); };
  renderBawah();
  renderTren();
  muatStats(true).then(renderTren);
})();
