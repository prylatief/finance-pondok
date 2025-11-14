
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Category, PondokSettings, TransactionType } from '../types';
import { generateInitialData } from '../services/mockDataService';

interface AppContextType {
  settings: PondokSettings;
  updateSettings: (newSettings: PondokSettings) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => boolean;
  getCategoryById: (id: string) => Category | undefined;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PondokSettings>({
    name: 'Pondok Pesantren Al-Hidayah',
    address: 'Jl. Kebenaran No. 1, Kota Berkah',
    treasurerName: 'Ahmad Syafi\'i',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const data = generateInitialData();
      setCategories(data.categories);
      setTransactions(data.transactions);
      setLoading(false);
    };
    loadData();
  }, []);

  const updateSettings = (newSettings: PondokSettings) => setSettings(newSettings);
  
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)));
  };

  const deleteCategory = (id: string): boolean => {
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      alert('Kategori ini sedang digunakan dalam transaksi dan tidak bisa dihapus.');
      return false;
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
    return true;
  };
  
  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `trx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(trx => (trx.id === updatedTransaction.id ? updatedTransaction : trx)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(trx => trx.id !== id));
  };

  const value = {
    settings,
    updateSettings,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
