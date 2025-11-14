
export enum TransactionType {
  Pemasukan = 'pemasukan',
  Pengeluaran = 'pengeluaran',
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: TransactionType;
  categoryId: string;
  amount: number;
  description: string;
  createdAt: string; // ISO string
}

export interface PondokSettings {
  name: string;
  address: string;
  treasurerName: string;
  logoUrl?: string;
}

export interface MonthlySummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactions: Transaction[];
}

export interface MonthlyBreakdown {
  month: string;
  monthIndex: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
