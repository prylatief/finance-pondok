
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

// Helper functions to interact with localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
    }
};


export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PondokSettings>(() => loadFromStorage<PondokSettings>('pondokSettings', {
    name: 'Pondok Pesantren Al-Hidayah',
    address: 'Jl. Kebenaran No. 1, Kota Berkah',
    treasurerName: 'Ahmad Syafi\'i',
  }));
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = () => {
        let storedCategories = loadFromStorage<Category[]>('categories', []);
        let storedTransactions = loadFromStorage<Transaction[]>('transactions', []);

        if (storedCategories.length === 0 || storedTransactions.length === 0) {
            const initialData = generateInitialData();
            storedCategories = initialData.categories;
            storedTransactions = initialData.transactions;
            saveToStorage('categories', storedCategories);
            saveToStorage('transactions', storedTransactions);
        }

        setCategories(storedCategories);
        setTransactions(storedTransactions);
        setLoading(false);
    };
    loadInitialData();
  }, []);
  
  const updateSettings = (newSettings: PondokSettings) => {
    setSettings(newSettings);
    saveToStorage('pondokSettings', newSettings);
  };
  
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: `cat-${Date.now()}` };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveToStorage('categories', updatedCategories);
  };

  const updateCategory = (updatedCategory: Category) => {
    const updatedCategories = categories.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat));
    setCategories(updatedCategories);
    saveToStorage('categories', updatedCategories);
  };

  const deleteCategory = (id: string): boolean => {
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      alert('Kategori ini sedang digunakan dalam transaksi dan tidak bisa dihapus.');
      return false;
    }
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    saveToStorage('categories', updatedCategories);
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
    const updatedTransactions = [newTransaction, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(updatedTransactions);
    saveToStorage('transactions', updatedTransactions);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const updatedTransactions = transactions.map(trx => (trx.id === updatedTransaction.id ? updatedTransaction : trx)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(updatedTransactions);
    saveToStorage('transactions', updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(trx => trx.id !== id);
    setTransactions(updatedTransactions);
    saveToStorage('transactions', updatedTransactions);
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
