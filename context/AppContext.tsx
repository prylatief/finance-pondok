import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Category, PondokSettings, TransactionType } from '../types';
import { categoryService, transactionService, settingsService, migrationService } from '../services/supabaseService';

interface AppContextType {
  settings: PondokSettings;
  updateSettings: (newSettings: PondokSettings) => Promise<void>;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoryById: (id: string) => Category | undefined;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: PondokSettings = {
  name: 'Pondok Pesantren Al-Hidayah',
  address: 'Jl. Kebenaran No. 1, Kota Berkah',
  treasurerName: 'Ahmad Syafi\'i',
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PondokSettings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setError(null);
      
      // Try to migrate from localStorage first (one-time operation)
      const migrationResult = await migrationService.migrateFromLocalStorage();
      if (migrationResult.categoriesMigrated > 0 || migrationResult.transactionsMigrated > 0) {
        console.log('Migration completed:', migrationResult);
      }

      // Load all data from Supabase
      const [categoriesData, transactionsData, settingsData] = await Promise.all([
        categoryService.getAll(),
        transactionService.getAll(),
        settingsService.get().catch(() => defaultSettings),
      ]);

      setCategories(categoriesData);
      setTransactions(transactionsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await loadAllData();
  }, [loadAllData]);

  const updateSettings = useCallback(async (newSettings: PondokSettings) => {
    try {
      const updated = await settingsService.update(newSettings);
      setSettings(updated);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, []);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await categoryService.create(category);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (updatedCategory: Category) => {
    try {
      const result = await categoryService.update(updatedCategory);
      setCategories(prev => prev.map(cat => cat.id === result.id ? result : cat));
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const isUsed = await categoryService.isUsedInTransactions(id);
      if (isUsed) {
        alert('Kategori ini sedang digunakan dalam transaksi dan tidak bisa dihapus.');
        return false;
      }
      await categoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      return false;
    }
  }, []);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await transactionService.create(transaction);
      setTransactions(prev => 
        [newTransaction, ...prev].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
    try {
      const result = await transactionService.update(updatedTransaction);
      setTransactions(prev => 
        prev.map(t => t.id === result.id ? result : t)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  }, []);

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
    loading,
    error,
    refreshData,
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
