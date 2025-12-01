
import { createClient } from '@supabase/supabase-js';

// --- PENTING: MASUKKAN KUNCI SUPABASE KAMU DI SINI ---
// Ganti string di bawah ini dengan Project URL dan Anon Key dari dashboard Supabase kamu.

const SUPABASE_URL = 'REPLACE_WITH_YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

// -----------------------------------------------------

// Helper untuk memeriksa apakah URL valid agar aplikasi tidak crash saat inisialisasi
const isUrlValid = (url: string) => {
  // Cek jika string kosong, bukan string, atau masih placeholder
  if (typeof url !== 'string' || !url.trim() || url.includes('REPLACE_WITH')) {
    return false;
  }
  try {
    // Coba parsing URL, jika gagal akan masuk catch
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Gunakan URL dummy yang valid jika user belum memasukkan URL asli
// Ini mencegah error "Failed to construct 'URL': Invalid URL" yang membuat app crash (blank screen).
// URL 'https://placeholder.supabase.co' adalah URL valid secara format, meski tidak akan connect kemana-mana.
const finalUrl = isUrlValid(SUPABASE_URL) ? SUPABASE_URL : 'https://placeholder.supabase.co';

// Pastikan key juga string tidak kosong untuk menghindari error lain
const finalKey = (SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('REPLACE_WITH')) 
  ? SUPABASE_ANON_KEY 
  : 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);

// Flag untuk memberi tahu AppContext apakah Supabase sudah siap digunakan
// Kita anggap siap HANYA jika URL valid DAN bukan placeholder
export const isSupabaseConfigured = isUrlValid(SUPABASE_URL);
