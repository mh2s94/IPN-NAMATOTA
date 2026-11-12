# PT. Industri Perikanan Namatota — Website Intro

Animasi profil interaktif PT. Industri Perikanan Namatota (PT. IPN), Pulau Namatota, Kaimana, Papua Barat.
Responsif untuk HP, tablet dan desktop. Animasi digambar langsung di browser (canvas), jadi tetap tajam di semua layar.

## Isi folder

```
index.html                     halaman utama
assets/js/main.js              seluruh animasi + kontrol suara/putar ulang
assets/fonts/                  font (Inter Display, Poppins, DejaVu Mono) – subset ringan
assets/img/photo.webp          foto udara dermaga & pabrik
assets/img/fish.png            lapisan logo: ikan merah
assets/img/text.png            lapisan logo: teks "pt. ipn"
assets/img/waves.png           lapisan logo: ombak
assets/img/logo-pt-ipn.png     logo lengkap, background transparan
assets/img/favicon.png         ikon tab browser
assets/audio/soundtrack.mp3    musik & sound design (orisinal, bebas pakai)
video/PT_IPN_Namatota_MotionReel.mp4   video 15 detik 1080×1920 (Reels/Stories/TikTok)
video/poster.jpg               gambar pratinjau
.nojekyll                      agar GitHub Pages menyajikan file apa adanya
```

## Upload ke GitHub Pages

1. Buat repository baru di GitHub (misalnya `pt-ipn-namatota`), pilih **Public**.
2. Klik **Add file → Upload files**, lalu seret **seluruh isi** folder ini (bukan folder induknya) sehingga `index.html` berada di akar repository. Klik **Commit changes**.
3. Buka **Settings → Pages**. Pada *Build and deployment* pilih **Deploy from a branch**, branch **main**, folder **/ (root)**, lalu **Save**.
4. Tunggu 1–2 menit. Website aktif di `https://<username>.github.io/pt-ipn-namatota/`.

> Catatan: file `.nojekyll` diawali titik sehingga bisa tersembunyi di komputer Anda. Jika tidak ikut ter-upload, website tetap berjalan normal.

## Cara kerja

- Animasi mulai seketika; foto dan logo dimuat di latar belakang.
- Musik dicoba diputar otomatis. Jika browser memblokir (aturan semua browser modern: suara butuh interaksi pengunjung), muncul petunjuk *"Ketuk layar untuk menyalakan suara"* — ketukan/klik pertama **di mana saja** langsung menyalakan musik, tersinkron dengan animasi.
- Tombol speaker di pojok kanan bawah untuk bisu/nyalakan suara.
- Setelah 15 detik animasi berhenti di logo; tombol putar ulang berdenyut merah.
- Animasi berhenti sementara saat tab ditinggalkan, dan lanjut saat kembali.

## Uji di komputer sendiri

Buka terminal di folder ini lalu jalankan `python3 -m http.server 8000`, kemudian buka `http://localhost:8000`.
