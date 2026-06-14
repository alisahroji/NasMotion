# 𝑵𝒂𝒔𝑴𝒐𝒕𝒊𝒐𝒏 — Bengkel Management System

> Sistem manajemen operasional bengkel motor/mobil berbasis web yang terintegrasi penuh — dari antrean masuk, proses perbaikan, sparepart, hingga invoice dan laporan keuangan.

---

## Deskripsi

NasMotion adalah platform manajemen internal bengkel yang dirancang untuk **Nasution Workshop**. Sistem ini menggantikan pencatatan manual dengan alur digital yang efisien: kasir mendaftarkan kendaraan masuk, mekanik memperbarui status perbaikan dan mencatat sparepart yang digunakan, kasir membuat invoice otomatis, dan admin memantau seluruh operasional melalui dashboard real-time.

---

## Fitur Utama

### 🔐 Autentikasi & Otorisasi
- Login dengan JWT disimpan di HttpOnly Cookie
- 3 Role berbeda: **Admin**, **Kasir**, **Mekanik**
- Role-based access control di setiap endpoint dan halaman
- Admin yang membuat akun kasir & mekanik (tidak ada registrasi publik)

### 📋 Manajemen Antrean (Live)
- Kasir mendaftarkan kendaraan masuk (cek plat nomor — baru/lama)
- Pilih jenis servis saat pendaftaran
- Status antrean: `Menunggu → Dikerjakan → Selesai`
- Auto-refresh setiap 10 detik
- Admin/Kasir bisa assign mekanik ke antrean
- Mekanik update status pengerjaan + tambah catatan

### 🔧 Detail Perbaikan (Mekanik)
- Mekanik input sparepart yang digunakan selama proses perbaikan
- Stok sparepart **berkurang otomatis** via database trigger saat sparepart diinput
- Stok **kembali otomatis** jika sparepart dihapus
- Kalkulasi total biaya real-time (servis + sparepart)

### 🧾 Invoice & Pembayaran (Kasir)
- Invoice dibuat otomatis dari data servis + sparepart yang sudah diinput mekanik
- Nomor invoice auto-generate: `INV-YYYYMMDD-XXX`
- Pilih metode pembayaran: Cash / Transfer / QRIS
- Preview invoice putih yang bisa **dicetak langsung dari browser**
- Tandai lunas dengan satu klik

### 📦 Manajemen Sparepart (Admin)
- CRUD sparepart lengkap (nama, kode, merek, satuan, harga, stok)
- Alert stok menipis ketika stok ≤ min_stok
- Update stok manual (restock)
- Filter: semua / stok menipis / nonaktif

### 🛠️ Service Catalog (Admin)
- CRUD jenis layanan servis + harga + estimasi durasi
- Aktif/nonaktifkan layanan tanpa hapus data
- Harga servis di-snapshot saat transaksi (tidak berubah walaupun harga diupdate)

### 👥 Manajemen Pengguna (Admin)
- Tambah akun kasir dan mekanik
- Edit profil + reset password
- Aktif/nonaktifkan akun (tidak bisa hapus/nonaktif diri sendiri)

### 🔍 Histori Kendaraan
- Cari riwayat servis berdasarkan plat nomor
- Lihat semua kunjungan + sparepart + biaya per kunjungan
- Total pengeluaran pelanggan ditampilkan

### 📊 Laporan & Ekspor (Admin)
- Filter laporan berdasarkan rentang tanggal
- Grafik batang pendapatan harian
- Performa mekanik: total dikerjakan, selesai, win rate, rata-rata durasi
- **Export ke PDF** dan **Export ke Excel** (.xlsx)
- Summary: total pendapatan, total servis, total sparepart, jumlah transaksi

---

## ERD (Entity Relationship Diagram)

```
users ──────────────────────────────────────────────────────────┐
│ id, name, email, password, role, is_active                    │
│                                                               │
│ role: admin | kasir | mekanik                                 │
└─────────────────────────────────┐                            │
                                  │ kasir_id                   │ mekanik_id
vehicles ──────────── queues ──────┴────────────────────────────┘
│ id                  │ id
│ plate_number        │ queue_number (auto)
│ owner_name          │ vehicle_id ──── vehicles
│ phone               │ complaint
│ vehicle_type        │ status: waiting|in_progress|done|cancelled
│ vehicle_brand       │ started_at, finished_at, notes
│ vehicle_year        │
                      │
          ┌───────────┼──────────────┐
          │           │              │
  queue_services   repair_         invoices
  │ queue_id       spareparts       │ id
  │ service_id     │ queue_id       │ invoice_number
  │ price_snapshot │ sparepart_id   │ queue_id
                   │ qty            │ total_service
service_catalog    │ price_snapshot │ total_sparepart
│ id              │               │ total_amount
│ name            spareparts       │ payment_status
│ price           │ id             │ payment_method
│ duration_est    │ name           │ paid_at
│ is_active       │ code, brand
                  │ unit, price
                  │ stock, min_stock
```

---

## Tech Stack

### Frontend
| Teknologi | Fungsi |
|---|---|
| React 18 | UI Framework |
| Vite | Build tool & dev server |
| React Router DOM v6 | Client-side routing + Outlet |
| Tailwind CSS v4 | Styling |
| Axios | HTTP client |
| Recharts | Chart & grafik |
| Sonner | Toast notifications |
| date-fns | Format tanggal |
| Lucide React | Icon set |

### Backend
| Teknologi | Fungsi |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL (Supabase) | Database relasional |
| Supabase Realtime | Real-time data sync |
| Argon2 | Hash password |
| JSON Web Token | Autentikasi |
| Cookie-parser | Manajemen cookie |
| PDFKit | Generate laporan PDF |
| ExcelJS | Generate laporan Excel |

### DevOps / Deployment
| Teknologi | Fungsi |
|---|---|
| pnpm | Package manager |
| Supabase | Database hosting + Realtime |
| Vercel *(opsional)* | Frontend deployment |

---

## Struktur Folder

```
NasMotion/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, supabase.js
│   │   ├── middlewares/     # auth.js, role.js
│   │   └── modules/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── vehicles/
│   │       ├── queues/
│   │       ├── repairs/
│   │       ├── spareparts/
│   │       ├── services/
│   │       ├── invoices/
│   │       └── reports/
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/      # AppLayout (Sidebar + Header)
    │   │   ├── shared/      # PageHeader
    │   │   └── ui/          # Spinner, EmptyState
    │   ├── contexts/        # AuthContext
    │   ├── hooks/           # useDebounce, useLocalQueue
    │   ├── pages/
    │   │   ├── auth/        # Login
    │   │   ├── admin/       # Dashboard, Spareparts, Services, Users, Reports
    │   │   ├── kasir/       # Invoice
    │   │   └── shared/      # QueueLive, RepairDetail, VehicleHistory
    │   └── utils/           # api.js (Axios instance)
    ├── .env
    └── vite.config.js
```

---

## Cara Menjalankan

### Backend
```bash
cd backend
cp .env.example .env   # isi DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET
pnpm install
pnpm dev               # berjalan di http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # isi VITE_API_URL=http://localhost:5000/api
pnpm install
pnpm dev               # berjalan di http://localhost:3000
```

### Akun Default
```
Email    : admin@nasmotion.com
Password : Admin@123
Role     : Admin
```
> ⚠️ Ganti password setelah pertama login!

---

## API Endpoints

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Auth | Data user aktif |
| GET/POST | `/api/users` | Admin | Kelola pengguna |
| GET/POST | `/api/vehicles` | Kasir/Admin | Kelola kendaraan |
| GET | `/api/vehicles/plate/:plate` | Kasir/Admin | Cari by plat |
| GET/POST | `/api/queues` | All | Antrean |
| PATCH | `/api/queues/:id/status` | Mekanik | Update status |
| PATCH | `/api/queues/:id/assign` | Admin/Kasir | Assign mekanik |
| GET/POST | `/api/repairs/:queueId` | All | Sparepart perbaikan |
| GET/POST | `/api/spareparts` | Admin | Inventori |
| GET/POST | `/api/services` | Admin | Katalog servis |
| GET/POST | `/api/invoices` | Kasir/Admin | Invoice |
| GET | `/api/reports/dashboard` | Admin | Stats dashboard |
| GET | `/api/reports/export/pdf` | Admin | Export PDF |
| GET | `/api/reports/export/excel` | Admin | Export Excel |

---

*NasMotion © 2025 — Nasution Workshop*