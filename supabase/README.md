# Supabase Database Setup

## 📋 Struktur Database

Database terdiri dari 3 tabel utama:

### 1. **categories** - Kategori Transaksi
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | TEXT | Nama kategori |
| type | TEXT | Jenis: 'pemasukan' atau 'pengeluaran' |
| created_at | TIMESTAMP | Waktu dibuat (auto) |
| updated_at | TIMESTAMP | Waktu diupdate (auto) |

### 2. **transactions** - Transaksi Keuangan
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| date | DATE | Tanggal transaksi |
| type | TEXT | Jenis: 'pemasukan' atau 'pengeluaran' |
| category_id | UUID | Foreign key ke categories.id |
| amount | NUMERIC(15,2) | Jumlah uang (max 999 triliun) |
| description | TEXT | Keterangan transaksi |
| created_at | TIMESTAMP | Waktu dibuat (auto) |
| updated_at | TIMESTAMP | Waktu diupdate (auto) |

### 3. **settings** - Konfigurasi Pondok
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | TEXT | Nama pondok |
| address | TEXT | Alamat |
| treasurer_name | TEXT | Nama bendahara |
| logo_url | TEXT | URL logo (optional) |
| created_at | TIMESTAMP | Waktu dibuat (auto) |
| updated_at | TIMESTAMP | Waktu diupdate (auto) |

**Note:** Tabel `settings` hanya boleh punya 1 baris (singleton pattern).

---

## 🚀 Cara Menjalankan Migration

### Opsi 1: Via Supabase Dashboard (RECOMMENDED)

1. **Buka Supabase Dashboard**
   - Login ke https://app.supabase.com
   - Pilih project kamu

2. **Buka SQL Editor**
   - Klik **SQL Editor** di sidebar kiri
   - Atau klik icon `</>`

3. **Copy & Run Migration**
   - Buka file `migrations/001_initial_schema.sql`
   - Copy semua isinya
   - Paste ke SQL Editor
   - Klik tombol **Run** (atau tekan Ctrl+Enter)

4. **Verify Tables Created**
   - Klik **Table Editor** di sidebar
   - Harusnya muncul 3 tabel: `categories`, `transactions`, `settings`

### Opsi 2: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link ke project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## ✅ Fitur yang Sudah Diimplementasi

### 🔐 Security
- ✅ Row Level Security (RLS) enabled di semua tabel
- ✅ Policies yang allow all operations (untuk development)
- ✅ Foreign key constraint dengan `ON DELETE RESTRICT` (prevent orphaned data)

### ⚡ Performance
- ✅ Index pada `transactions.date` (untuk sorting cepat)
- ✅ Index pada `transactions.category_id` (untuk join cepat)
- ✅ Index pada `transactions.type` (untuk filter pemasukan/pengeluaran)
- ✅ Composite index `date + type` (untuk query kompleks)

### 🛡️ Data Integrity
- ✅ CHECK constraint: type harus 'pemasukan' atau 'pengeluaran'
- ✅ CHECK constraint: amount harus > 0
- ✅ Foreign key: category_id harus exist di categories
- ✅ NOT NULL constraints di kolom wajib
- ✅ Singleton pattern untuk settings table

### 🤖 Automation
- ✅ Auto-generate UUID untuk primary keys
- ✅ Auto-set `created_at` timestamp
- ✅ Auto-update `updated_at` via trigger
- ✅ Insert default settings otomatis

### 📊 Helper Features
- ✅ View `transactions_with_categories` untuk query mudah
- ✅ Comments di semua tabel untuk dokumentasi

---

## 🧪 Testing Database

Setelah run migration, test dengan query ini di SQL Editor:

```sql
-- 1. Cek semua tabel sudah ada
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- 2. Cek default settings
SELECT * FROM settings;

-- 3. Test insert category
INSERT INTO categories (name, type)
VALUES ('Sumbangan Donatur', 'pemasukan');

-- 4. Test insert transaction
INSERT INTO transactions (date, type, category_id, amount, description)
SELECT
    CURRENT_DATE,
    'pemasukan',
    id,
    1000000,
    'Test transaksi'
FROM categories
WHERE name = 'Sumbangan Donatur'
LIMIT 1;

-- 5. Test view
SELECT * FROM transactions_with_categories;
```

---

## 📝 Next Steps

Setelah database setup:
1. ✅ Fase 1: Setup Supabase ← **DONE**
2. ✅ Fase 2: Database Schema ← **CURRENT**
3. 🔄 Fase 3: Buat Service Layer (CRUD functions)
4. 🔄 Fase 4: Update AppContext
5. 🔄 Fase 5: Migrate data dari localStorage
6. 🔄 Fase 6: Testing
7. 🔄 Fase 7: Deploy

---

## 🔧 Troubleshooting

### Error: "relation already exists"
- Tabel sudah ada, migration sudah pernah dijalankan
- Solusi: Skip atau drop table dulu (HATI-HATI!)

### Error: "permission denied"
- RLS policy belum di-setup
- Solusi: Run migration lagi, pastikan section RLS POLICIES jalan

### Error: "foreign key violation"
- Category belum ada tapi sudah insert transaction
- Solusi: Insert categories dulu sebelum transactions

---

## 📚 Resources

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/sql-editor)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
