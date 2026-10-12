/* Fitur "Tambah lokasi" — dimuat SETELAH script.js, tanpa mengubahnya */
(() => {
  const bersih = s => String(s ?? "").replace(/'/g, "’").replace(/"/g, "”").replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
  const angka = s => parseInt(String(s).replace(/\D/g, ""), 10) || 0;
  const MAPS = /^https:\/\/(www\.google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|g\.page)/i;
  const GOFOOD = /^https:\/\/([\w-]+\.)?(gofood\.co\.id|gofood\.link|gojek\.com|gojek\.link|gojek\.onelink\.me)(\/|$)/i;
  const VIDEO = /^https:\/\/(www\.)?tiktok\.com\/@[\w.\-]{1,40}\/video\/\d{8,25}/i;
  const JAM = /^(24\s*jam|([01]?\d|2[0-3])[.:][0-5]\d\s*[–—-]\s*(([01]?\d|2[0-3])[.:][0-5]\d|24[.:]00))$/i;
  const FOTO = /^(images\/[\w\-./]+|https:\/\/[^\s"'<>`]+)$/;

  const bersihVideo = u => { const m = VIDEO.exec(String(u || "").trim()); return m ? m[0].replace(/^https:\/\/tiktok/i, "https://www.tiktok") : ""; };
  const parseFas = str => {
    const o = {};
    String(str || "").split(",").forEach(x => { const m = /^\s*([a-z0-9]{1,20}):([01])\s*$/.exec(x); if (m) o[m[1]] = m[2] === "1"; });
    return o;
  };

  /* ---- 1. Tampilkan lokasi yang sudah DISETUJUI ---- */
  async function muatDisetujui() {
    if (!SERVER_URL) return;
    try {
      const j = await (await fetch(SERVER_URL + "?action=approved&t=" + Date.now())).json();
      (j.data || []).forEach(p => {
        const id = "u-" + String(p.id).replace(/[^\w-]/g, "");
        const hargaMin = +p.hargaMin, hargaMax = +p.hargaMax;
        if (TEMPAT.some(t => t.id === id) || !isFinite(hargaMin) || !isFinite(hargaMax)) return;
        TEMPAT.push({
          id, gambartoko: FOTO.test(p.foto || "") ? p.foto : "images/placeholder.svg",
          nama: bersih(p.nama), kategori: bersih(p.kategori), kecamatan: bersih(p.kecamatan),
          alamat: bersih(p.alamat), jam: bersih(p.jam), hargaMin, hargaMax,
          menu: String(p.menu || "").split(",").map(bersih).filter(Boolean),
          rating: 0, jumlah: 0, maps: MAPS.test(p.maps || "") ? p.maps : "",
          gofood: GOFOOD.test(p.gofood || "") ? p.gofood : "",
          video: bersihVideo(p.video) || (typeof VIDEO_NAMA !== "undefined" && VIDEO_NAMA[bersih(p.nama).toLowerCase()]) || "",
          fasilitas: parseFas(p.fasilitas),
          jalanBagus: p.jalanBagus === "1",
          akses: p.akses === "mobil" || p.akses === "motor" ? p.akses : "",
          status: p.statusManual === "tutup" || p.statusManual === "buka" ? p.statusManual : "auto",
          tutupSampai: /^\d{4}-\d{2}-\d{2}$/.test(p.tutupSampai || "") ? p.tutupSampai : ""
        });
      });
      const sel = $("kecamatan"), nilai = sel.value;
      const kec = [...new Set(TEMPAT.map(t => t.kecamatan))].sort();
      sel.innerHTML = '<option value="">Semua kecamatan</option>' + kec.map(k => `<option>${k}</option>`).join("");
      sel.value = nilai;
      render();
    } catch (e) { console.warn("Gagal memuat lokasi tambahan", e); }
  }

  /* Tombol Google Maps pakai link dari pengaju (jika ada) */
  const asli = bukaDetail;
  bukaDetail = function (id) {
    asli(id);
    const t = TEMPAT.find(x => x.id === id), a = document.querySelector("#detail-body a.btn");
    if (t && t.maps && a) a.href = t.maps;
  };

  /* ---- 2. Formulir pengajuan ---- */
  $("t-fas").innerHTML = FASILITAS.map(f => `<div class="baris-ya" role="radiogroup" aria-label="${f.label}">
      <span>${f.label}</span>
      <label class="pilih"><input type="radio" name="fas-${f.k}" value="1"> Ya</label>
      <label class="pilih"><input type="radio" name="fas-${f.k}" value="0"> Tidak</label></div>`).join("");
  const radio = nama => { const r = form.querySelector(`input[name="${nama}"]:checked`); return r ? r.value : ""; };
  const dlg = $("tambah"), form = $("tform"), pesan = $("t-pesan");
  const kecilkan = file => new Promise((ok, gagal) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", 0.75).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); gagal(new Error("Foto tidak bisa dibaca. Coba format JPG atau PNG.")); };
    img.src = url;
  });
  $("t-foto").addEventListener("change", () => {
    const f = $("t-foto").files[0], p = $("t-prev");
    p.hidden = !f; if (f) p.src = URL.createObjectURL(f);
  });
  const tutup = () => { $("t-prev").hidden = true; dlg.close(); form.reset(); form.hidden = false; $("t-sukses").hidden = true; pesan.textContent = ""; };
  $("btn-tambah").addEventListener("click", () => dlg.showModal());
  $("tambah-close").addEventListener("click", tutup);
  $("t-selesai").addEventListener("click", tutup);
  dlg.addEventListener("click", e => { if (e.target === dlg) tutup(); });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    let wa = $("t-wa").value.replace(/\D/g, "");
    if (wa[0] === "0") wa = "62" + wa.slice(1); else if (wa[0] === "8") wa = "62" + wa;
    let maps = $("t-maps").value.trim();
    if (maps && !/^https?:/i.test(maps)) maps = "https://" + maps;
    let gofood = $("t-gofood").value.trim();
    if (gofood && !/^https?:/i.test(gofood)) gofood = "https://" + gofood;
    let video = $("t-video").value.trim();
    if (video && !/^https?:/i.test(video)) video = "https://" + video;
    const fasBelum = FASILITAS.filter(f => !radio("fas-" + f.k));
    const d = {
      action: "submit", wa, maps, gofood, video: video ? bersihVideo(video) : "",
      fasilitas: FASILITAS.map(f => f.k + ":" + radio("fas-" + f.k)).join(","),
      jalanBagus: radio("t-jalan"), akses: radio("t-akses"), website: $("t-web").value,
      nama: bersih($("t-nama").value), alamat: bersih($("t-alamat").value), jam: bersih($("t-jam").value),
      hargaMin: angka($("t-min").value), hargaMax: angka($("t-max").value), menu: bersih($("t-menu").value)
    };
    const err = !/^628\d{7,12}$/.test(d.wa) ? "Nomor WhatsApp tidak valid (contoh: 08123456789)."
      : d.nama.length < 3 ? "Nama UMKM minimal 3 huruf."
      : d.alamat.length < 5 ? "Alamat terlalu pendek."
      : !JAM.test(d.jam) ? "Format jam buka: 09.00–21.00 atau 24 jam."
      : !d.hargaMin || d.hargaMax < d.hargaMin ? "Isi kisaran harga dengan benar (harga termahal ≥ termurah)."
      : !d.menu ? "Menu andalan wajib diisi."
      : !MAPS.test(d.maps) ? "Link Google Maps tidak valid (salin dari tombol Bagikan di Google Maps)."
      : d.gofood && !GOFOOD.test(d.gofood) ? "Link Gojek/GoFood tidak valid (salin dari tombol Bagikan di aplikasi Gojek)."
      : video && !d.video ? "Link video harus link TikTok lengkap (…/@akun/video/angka). Link pendek vm.tiktok.com belum bisa."
      : fasBelum.length ? "Jawab Ya/Tidak untuk fasilitas: " + fasBelum.map(f => f.label).join(", ") + "."
      : !d.jalanBagus ? "Pilih Ya/Tidak untuk kondisi jalan menuju kedai."
      : !d.akses ? "Pilih kendaraan yang bisa masuk (mobil & motor, atau khusus motor)."
      : !$("t-foto").files[0] ? "Foto kedai wajib diisi." : "";
    if (err) { pesan.textContent = err; return; }
    if (!SERVER_URL) { pesan.textContent = "Server belum disambungkan (isi SERVER_URL di config.js)."; return; }
    const file = $("t-foto").files[0];
    if (file && file.size > 15e6) { pesan.textContent = "Ukuran foto maksimal 15 MB."; return; }
    const btn = form.querySelector("button[type=submit]"); btn.disabled = true; pesan.textContent = "Mengirim…";
    try {
      if (file) d.foto64 = await kecilkan(file);
      const j = await (await fetch(SERVER_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) })).json();
      if (!j.ok) throw new Error(j.error);
      form.hidden = true; $("t-sukses").hidden = false;
    } catch (x) { pesan.textContent = x.message || "Gagal mengirim, coba lagi."; }
    btn.disabled = false;
  });

  muatDisetujui();
})();
