# MoneyJournal - Dokumentasi Implementasi

Dokumen ini menjelaskan langkah-langkah teknis dan alur implementasi aplikasi web "MoneyJournal". Meskipun di-blueprint sebagai aplikasi mobile (Flutter/React Native), implementasi ini akan menggunakan **React (Vite)** bergaya *Mobile First* sebagai aplikasi web yang responsif dan sangat ringan.

## 1. Persiapan Proyek (Setup)
Proyek diinisialisasi menggunakan Vite dengan React.
- **Perintah**: `npm create vite@latest . -- --template react`
- **Tujuan**: Membangun fondasi frontend yang cepat.
- **Gaya (Styling)**: CSS Murni (Vanilla CSS) untuk kontrol penuh atas desain, memastikan antarmuka minimalis, ringan, dan tidak berlebihan.

## 2. Struktur Direktori
Struktur standar untuk memisahkan komponen, halaman, dan state:
```text
src/
├── assets/          # Ikon dan gambar
├── components/      # Komponen UI (Button, Card, Modal, dll)
├── pages/           # Halaman Utama (Dashboard, Settings)
├── hooks/           # Custom hooks (state management transaksi)
├── styles/          # File CSS global dan utilitas
├── App.jsx          # Komponen root aplikasi
└── main.jsx         # Entry point aplikasi
```

## 3. Implementasi MVP (Fase 1)

### A. Komponen UI Inti
1. **Layout Wrapper (Mobile View)**: Membuat container tengah yang meniru dimensi layar *smartphone* jika dibuka di desktop, namun *full-screen* jika dibuka di perangkat mobile.
2. **Dashboard**: Menampilkan `Total Balance Card`, kotak ringkasan *Income* & *Expense*, serta daftar `Recent Activities`.
3. **Bottom Navigation**: Menampung navigasi utama dan *Floating Action Button (FAB)* untuk tombol `Quick-Add (+)`.

### B. Alur Pencatatan (Quick-Add)
1. **Bottom Sheet Modal**: Muncul secara instan dari bawah ketika FAB ditekan.
2. **Keypad Numerik Kustom (Opsional/Bawaan)**: Input nominal secara cepat.
3. **Pemilihan Kategori Cepat**: Menampilkan ikon kategori dengan gaya *pills/bubble* langsung di bawah angka.
4. **Simpan Otomatis**: Menyimpan transaksi ke *local state* dan memperbarui dashboard secara *real-time*.

### C. State Management
Sementara sebelum diintegrasikan dengan database backend (Supabase), aplikasi akan menggunakan `React Context` dipadukan dengan `localStorage` agar data tetap tersimpan saat *browser* ditutup.
Struktur State:
- `balance`: Saldo berjalan.
- `transactions`: Array objek riwayat transaksi.
- `categories`: Array objek kategori pengeluaran dan pemasukan.

## 4. Desain & Estetika (UI/UX)
- **Warna Latar**: `#F8F9FA` (Abu-abu sangat terang).
- **Elemen Card**: Background `#FFFFFF` dengan bayangan *soft* (`box-shadow: 0 4px 12px rgba(0,0,0,0.05)`).
- **Tipografi**: Menggunakan font modern tanpa kait (sans-serif) dari Google Fonts seperti `Inter` atau `Plus Jakarta Sans`.
- **Transisi**: Animasi geser (*slide-up*) untuk memunculkan Modal Quick-Add agar terasa dinamis.

## 5. Rencana Backend (Lanjutan)
Integrasi masa depan akan memindahkan penyimpanan `localStorage` ke Supabase.
- Tabel akan dibuat mengikuti skema di blueprint (`users`, `wallets`, `categories`, `transactions`).
- Login akan difasilitasi dengan `Supabase Auth`.

## 6. Git & Version Control
Semua perubahan pengembangan akan dilakukan *commit* bertahap dan diunggah ke repositori GitHub untuk memastikan manajemen versi yang baik.
