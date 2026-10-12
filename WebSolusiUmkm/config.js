/* Tempel URL Web App Google Apps Script di sini (lihat langkah di server/Code.gs) */
const SERVER_URL = "https://script.google.com/macros/s/AKfycbyBMFYblXUDz9ieKv7WIKTWlETgumJZxBXgfxF6aEyI2reeWmsahbiWhfWfiQPuyZ_h/exec";
const DAFTAR_KATEGORI = ["Kuliner Legendaris", "Makanan Pedas", "Kafe Lokal", "Kaki Lima", "Oleh-oleh"]; // samakan dengan KATEGORI di script.js
const DAFTAR_KECAMATAN = ["Metro Pusat", "Metro Barat", "Metro Timur", "Metro Utara", "Metro Selatan"];

/* Fasilitas yang ditanyakan di form & tampil di detail. Tambah baris baru sesuka kamu.
   k = kode singkat (huruf kecil/angka, tanpa spasi), label = tulisan yang tampil. */
const FASILITAS = [
  { k: "qris", label: "QRIS" },
  { k: "halal", label: "Halal" },
  { k: "wifi", label: "Free WiFi" },
  { k: "kipas", label: "Kipas" },
  { k: "ac", label: "AC" },
  { k: "stopkontak", label: "Stop kontak" },
  { k: "parkir", label: "Parkir gratis" }
];

/* Video untuk tempat yang datang dari Google Sheet (tidak ada di array TEMPAT).
   Kunci = nama tempat huruf kecil. Isi dengan link TikTok lengkap (…/video/angka). */
const VIDEO_NAMA = {
  "mie ayam mbak juri": "https://www.tiktok.com/@runnalerun/video/7590739451777699090"
};
