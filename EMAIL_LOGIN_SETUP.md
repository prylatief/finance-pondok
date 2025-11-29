# Setup Email Login - Finance Pondok

## Persiapan

Aplikasi Finance Pondok sekarang menggunakan **Supabase Auth** untuk login dengan email. Ikuti langkah-langkah berikut untuk setup:

## 1. Setup Environment Variables

Pastikan file `.env.local` sudah ada dengan konfigurasi Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Anda bisa mendapatkan credentials ini dari [Supabase Dashboard](https://app.supabase.com) → Project → Settings → API

## 2. Jalankan Migrasi Database

Aplikasi memiliki 2 file migrasi di folder `supabase/migrations/`:

### Migration 1: Initial Schema
```bash
# File: 001_initial_schema.sql
# Membuat tabel: categories, transactions, settings
```

### Migration 2: Enable Authentication RLS
```bash
# File: 002_enable_auth_rls.sql
# Mengaktifkan Row Level Security untuk authenticated users
```

### Cara Menjalankan Migrasi:

**Opsi 1: Menggunakan Supabase CLI**
```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

**Opsi 2: Manual via Supabase Dashboard**
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Copy-paste isi file `001_initial_schema.sql` dan jalankan
5. Copy-paste isi file `002_enable_auth_rls.sql` dan jalankan

## 3. Buat User di Supabase

Untuk login, Anda perlu membuat user terlebih dahulu:

### Opsi 1: Via Supabase Dashboard
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **Authentication** → **Users**
4. Klik **Add User**
5. Masukkan email dan password
6. Klik **Create User**

### Opsi 2: Via API (untuk testing)
```javascript
// Anda bisa menggunakan signup endpoint
import { supabase } from './lib/supabase';

const { data, error } = await supabase.auth.signUp({
  email: 'bendahara@pondok.com',
  password: 'password123',
});
```

### Opsi 3: Tambahkan Fitur Register (opsional)
Anda bisa membuat halaman register sendiri yang memanggil fungsi `signUpWithEmail` dari `services/authService.ts`

## 4. Testing

Setelah setup selesai:

1. Jalankan aplikasi:
```bash
npm run dev
```

2. Buka browser di `http://localhost:5173/login`

3. Login dengan email dan password yang sudah dibuat di Supabase

4. Jika berhasil, Anda akan diarahkan ke `/dashboard`

## Fitur yang Sudah Diimplementasikan

### 1. Authentication Service (`services/authService.ts`)
- ✅ `signInWithEmail()` - Login dengan email/password
- ✅ `signUpWithEmail()` - Register user baru
- ✅ `signOut()` - Logout
- ✅ `getCurrentSession()` - Get session saat ini
- ✅ `getCurrentUser()` - Get user saat ini
- ✅ `resetPassword()` - Reset password
- ✅ `updatePassword()` - Update password

### 2. Auth Context (`context/AuthContext.tsx`)
- ✅ Manage authentication state
- ✅ Auto-refresh token
- ✅ Persist session
- ✅ Listen to auth state changes

### 3. Login Page (`pages/LoginPage.tsx`)
- ✅ Form login dengan email dan password
- ✅ Loading state saat proses login
- ✅ Error handling dengan pesan dalam Bahasa Indonesia
- ✅ Disabled state untuk form saat loading

### 4. Protected Routes (`App.tsx`)
- ✅ Route protection dengan AuthProvider
- ✅ Redirect ke login jika belum login
- ✅ Redirect ke dashboard jika sudah login
- ✅ Loading spinner saat check auth state

### 5. Row Level Security (RLS)
- ✅ Hanya authenticated users yang bisa akses data
- ✅ RLS policies untuk categories, transactions, settings

## Troubleshooting

### Error: "Missing Supabase credentials"
- Pastikan file `.env.local` ada dan berisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
- Restart dev server setelah membuat `.env.local`

### Error: "Invalid login credentials"
- Pastikan email dan password yang dimasukkan benar
- Cek di Supabase Dashboard → Authentication → Users apakah user sudah dibuat
- Pastikan user sudah confirmed (email verified)

### Error: "Row Level Security"
- Pastikan migration `002_enable_auth_rls.sql` sudah dijalankan
- Cek RLS policies di Supabase Dashboard → Database → Policies

### User tidak bisa akses data setelah login
- Pastikan RLS policies sudah diterapkan dengan benar
- Cek console browser untuk error messages
- Pastikan session token valid di Supabase

## Pengembangan Selanjutnya

Beberapa fitur yang bisa ditambahkan:

1. **Halaman Register** - Form untuk user baru mendaftar
2. **Forgot Password** - Fitur reset password via email
3. **Email Verification** - Konfirmasi email setelah register
4. **User Profile** - Halaman untuk update profile user
5. **Role-based Access** - Akses berbeda berdasarkan role (admin, bendahara, dll)
6. **Multi-tenancy** - Satu user bisa akses beberapa pondok

## Kontak

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.
