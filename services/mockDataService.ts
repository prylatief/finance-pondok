
import { Category, Transaction, TransactionType } from '../types';

// This function simulates a call to Gemini to get initial data.
// In a real application, this would be an API call.
export const generateInitialData = () => {
  const categories: Category[] = [
    { id: 'cat-1', name: 'Sumbangan Donatur', type: TransactionType.Pemasukan },
    { id: 'cat-2', name: 'SPP Santri', type: TransactionType.Pemasukan },
    { id: 'cat-3', name: 'Infaq Kotak Amal', type: TransactionType.Pemasukan },
    { id: 'cat-4', name: 'Biaya Listrik & Air', type: TransactionType.Pengeluaran },
    { id: 'cat-5', name: 'Belanja Dapur', type: TransactionType.Pengeluaran },
    { id: 'cat-6', name: 'Gaji Ustadz', type: TransactionType.Pengeluaran },
    { id: 'cat-7', name: 'Perawatan Gedung', type: TransactionType.Pengeluaran },
    { id: 'cat-8', name: 'Kegiatan Santri', type: TransactionType.Pengeluaran },
  ];

  const transactions: Transaction[] = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth + 5; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (daysInMonth - i) - 5);
    const dateStr = date.toISOString();

    if (i % 3 === 0) {
      transactions.push({
        id: `trx-spp-${i}`,
        date: dateStr,
        type: TransactionType.Pemasukan,
        categoryId: 'cat-2',
        amount: 2500000 + Math.floor(Math.random() * 500000),
        description: `Pembayaran SPP termin ${i / 3}`,
        createdAt: dateStr
      });
    }

    if (i % 7 === 0) {
      transactions.push({
        id: `trx-donatur-${i}`,
        date: dateStr,
        type: TransactionType.Pemasukan,
        categoryId: 'cat-1',
        amount: 1000000 + Math.floor(Math.random() * 1000000),
        description: `Sumbangan dari Hamba Allah`,
        createdAt: dateStr
      });
    }

    if (i % 2 === 0) {
      transactions.push({
        id: `trx-dapur-${i}`,
        date: dateStr,
        type: TransactionType.Pengeluaran,
        categoryId: 'cat-5',
        amount: 350000 + Math.floor(Math.random() * 150000),
        description: `Belanja kebutuhan dapur harian`,
        createdAt: dateStr
      });
    }
    
    if (i === 1) {
       transactions.push({
        id: `trx-gaji-1`,
        date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
        type: TransactionType.Pengeluaran,
        categoryId: 'cat-6',
        amount: 7500000,
        description: `Gaji Ustadz & Ustadzah bulan ini`,
        createdAt: dateStr
      });
    }

     if (i === 5) {
       transactions.push({
        id: `trx-listrik-1`,
        date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(),
        type: TransactionType.Pengeluaran,
        categoryId: 'cat-4',
        amount: 1200000,
        description: `Bayar tagihan listrik & air`,
        createdAt: dateStr
      });
    }
  }

  return {
    categories,
    transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
};
