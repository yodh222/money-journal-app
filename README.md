# MoneyJournal

MoneyJournal adalah aplikasi pencatatan keuangan cerdas yang didesain untuk memangkas kerumitan. Dengan pendekatan minimalis, Anda dapat mencatat pemasukan dan pengeluaran dalam waktu kurang dari 5 detik namun tetap mendapatkan laporan dan visualisasi yang mendetail.

## 🚀 Fitur Utama

### Fase 1: MVP (Minimum Viable Product)
- **Quick-Add Button**: Pencatatan instan dengan tombol "+" di navigasi bawah.
- **Multi-Wallet/Account**: Manajemen saldo untuk Uang Tunai, Rekening Bank, dan E-Wallet secara terpisah.
- **Flexible Categorization**: Kustomisasi kategori pengeluaran dan pemasukan sesuai kebutuhan.
- **Real-time Dashboard**: Pantau Saldo Total, Pemasukan, dan Pengeluaran bulanan secara langsung.

### Fase 2: Analisis & Kontrol (Mendatang)
- **Dynamic Pie Chart**: Visualisasi aliran uang interaktif.
- **Smart Budgeting Bars**: Pemantauan sisa anggaran dengan indikator warna (Hijau, Kuning, Merah).
- **Daily Journal Notes**: Tambahkan catatan personal pada setiap transaksi.

### Fase 3: Otomatisasi & Sistem Cerdas (Mendatang)
- **Recurring Transactions**: Jadwalkan transaksi rutin (sewa, tagihan bulanan).
- **AI Smart-Text Input**: Ekstraksi nominal dan kategori dari satu kalimat teks bebas.
- **Data Export**: Unduh riwayat jurnal ke format `.xlsx` atau `.csv`.

## 💻 Tech Stack

Proyek ini dibangun sebagai **Web Application** modern bergaya mobile (PWA), dengan rekomendasi stack sebagai berikut:
- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (Mobile-first design)
- **State Management**: React Context API atau Zustand
- **Backend/Database**: Supabase (PostgreSQL) - *Bisa diintegrasikan lebih lanjut*

## 🎨 Desain & UI
- **Tema Utama**: Clean, Minimalis, dengan banyak White Space.
- **Warna Dasar**: Putih (#FFFFFF) & Abu-abu Terang (#F8F9FA).
- **Warna Teks**: Hitam Arang (#1A1A1A).
- **Aksen Transaksi**: Hijau (#2ECC71) untuk Pemasukan, Merah (#E74C3C) untuk Pengeluaran.
- **Aksen Tombol**: Biru Royal (#3498DB) / Ungu Indigo (#6C5CE7).

## 🚀 Cara Menjalankan Proyek

1. **Clone repository ini**
   ```bash
   git clone <repo-url>
   ```
2. **Masuk ke direktori proyek**
   ```bash
   cd moneyjournal
   ```
3. **Install dependensi**
   ```bash
   npm install
   ```
4. **Jalankan server pengembangan**
   ```bash
   npm run dev
   ```

## 🗄️ Skema Database

- **users**: Data pengguna.
- **wallets**: Dompet/rekening (Tunai, Bank, dll).
- **categories**: Kategori pemasukan/pengeluaran (Makanan, Gaji, dll).
- **transactions**: Inti catatan jurnal relasional antara dompet dan kategori.

---
*Dibuat untuk mencatat keuangan tanpa ribet.*
