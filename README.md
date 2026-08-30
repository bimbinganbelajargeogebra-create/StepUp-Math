# StepUp Math (Self-Paced Math Learning Platform)

Aplikasi pembelajaran matematika mandiri 18 Level (Level 6A s.d. Level M) berbasis metode bertingkat (Small Steps) dengan Tes Diagnostik, Study Streak Tracker, Papan Coretan Virtual, KaTeX Math Formula, dan Cetak Lembar Kerja A4 PDF.

---

## 🚀 Panduan Unggah ke GitHub & Deploy ke Vercel

### Opsi 1: Export Langsung dari Menu AI Studio (Paling Mudah)
1. Buka menu **Settings / Export** di pojok kanan atas Google AI Studio Build.
2. Pilih **Export to GitHub** atau **Download ZIP**.
3. Jika memilih *Export to GitHub*, hubungkan akun GitHub Anda dan pilih repository target.
4. Buka [vercel.com](https://vercel.com), klik **Add New Project**, lalu import repository GitHub tersebut.

---

### Opsi 2: Manual via Git CLI (Terminal / Command Line)

#### 1. Inisialisasi Git & Push ke GitHub
Buka terminal di folder project komputer Anda:

```bash
# 1. Inisialisasi Git
git init

# 2. Tambahkan semua file
git add .

# 3. Buat commit pertama
git commit -m "feat: initial commit StepUp Math app"

# 4. Ganti branch ke main
git branch -M main

# 5. Hubungkan ke remote repository GitHub Anda (ganti URL dengan repo Anda)
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO.git

# 6. Push kode ke GitHub
git push -u origin main
```

---

#### 2. Deploy ke Vercel

##### Cara A: Lewat Dashboard Web Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login (bisa menggunakan akun GitHub).
2. Klik tombol **"Add New..."** > **"Project"**.
3. Pilih repository GitHub `stepup-math` yang baru saja Anda push.
4. Di bagian pengaturan proyek:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Klik **"Deploy"**. Vercel akan otomatis melakukan build dan memberikan link website aktif (misal: `https://stepup-math.vercel.app`).

##### Cara B: Menggunakan Vercel CLI
```bash
# Install Vercel CLI global jika belum ada
npm i -g vercel

# Login ke akun Vercel
vercel login

# Jalankan deploy
vercel --prod
```

---

## 🛠️ Konfigurasi Penting (Sudah Terpasang)

1. **`vercel.json`**:
   - Mendukung SPA routing (`rewrites` ke `/index.html` sehingga tidak terjadi error 404 saat navigasi).
   - Mengatur caching optimal untuk folder `/assets/`.

2. **`package.json`**:
   - `npm run build`: Menjalankan `vite build` yang menghasilkan bundle statis di folder `dist/`.
   - `npm run dev`: Menjalankan server lokal pengembangan.

---

## 💻 Menjalankan Secara Lokal di Komputer

```bash
# 1. Install dependencies
npm install

# 2. Jalankan mode pengembangan
npm run dev

# 3. Buka browser di http://localhost:3000
```
