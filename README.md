# Jurnal Harian PKL

Aplikasi web pencatatan jurnal harian Praktik Kerja Lapangan (PKL) berbasis **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL)**, dan autentikasi berbasis token **JWT (`jose`)** pada cookie `HttpOnly`.

## Fitur & Halaman Utama

- **Beranda (`/`)**: Titik masuk menuju halaman masuk murid PKL atau login admin.
- **Masuk Murid (`/masuk`) & Dashboard Jurnal (`/jurnal`)**: Autentikasi menggunakan kode unik siswa, melihat rekap jumlah jurnal & total jam PKL, serta memantau status persetujuan atau revisi.
- **Tulis & Ubah Jurnal (`/jurnal/baru`, `/jurnal/[id]/ubah`)**: Input kegiatan harian dengan validasi tanggal (maksimal hari ini dan paling jauh 7 hari ke belakang, 1 jurnal per hari), kegiatan (30–500 karakter), kompetensi (3–60 karakter), dan durasi (1–10 jam). Jurnal berstatus `disetujui` terkunci, sedangkan pengubahan jurnal akan mereset status kembali menjadi `diajukan`.
- **Login Admin (`/login`), Panel Pemeriksaan (`/admin`), & Kelola Siswa (`/admin/siswa`)**: Rekapitulasi per siswa, filter jurnal berdasarkan siswa atau status, persetujuan (`disetujui`) atau pemberian catatan revisi (`revisi`, minimal 5 karakter), serta tambah atau hapus data siswa.

## Menjalankan Secara Lokal

1. Pasang dependensi:
   ```bash
   npm install
   ```
