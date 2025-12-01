
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Category, PondokSettings, TransactionType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { generateInitialData } from '../services/mockDataService';

interface AppContextType {
  settings: PondokSettings;
  updateSettings: (newSettings: PondokSettings) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for Settings (Keep settings in localStorage for now to simplify, or move to DB later)
const loadSettings = (): PondokSettings => {
    try {
        const item = window.localStorage.getItem('pondokSettings');
        return item ? JSON.parse(item) : {
            name: 'Pondok Pesantren Al-Hidayah',
            address: 'Jl. Kebenaran No. 1, Kota Berkah',
            treasurerName: 'Ahmad Syafi\'i',
        };
    } catch {
        return { name: 'Pondok', address: '', treasurerName: '' };
    }
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PondokSettings>(loadSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Fetch Categories
        const { data: catData, error: catError } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        
        if (catError) throw catError;

        // 2. Fetch Transactions
        const { data: trxData, error: trxError } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (trxError) throw trxError;

        if (catData) setCategories(catData);
        if (trxData) {
            const mappedTrx = trxData.map((t: any) => ({
                id: t.id,
                date: t.date,
                type: t.type,
                categoryId: t.category_id, // Map snake_case to camelCase
                amount: t.amount,
                description: t.description,
                createdAt: t.created_at
            }));
            setTransactions(mappedTrx);
        }

    } catch (error) {
        console.error("Error fetching data from Supabase:", error);
        alert("Gagal mengambil data dari database. Pastikan tabel sudah dibuat di Supabase.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    // Check if keys are set using the helper flag
    if (!isSupabaseConfigured) {
        console.warn("Supabase keys not set. Loading mock data.");
        // Fallback to mock data if no keys
        const { categories: initialCat, transactions: initialTrx } = generateInitialData();
        setCategories(initialCat);
        setTransactions(initialTrx);
        setLoading(false);
    } else {
        fetchData();
    }
  }, []);
  
  const updateSettings = (newSettings: PondokSettings) => {
    setSettings(newSettings);
    window.localStorage.setItem('pondokSettings', JSON.stringify(newSettings));
  };
  
  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!isSupabaseConfigured) {
        // Mock implementation for demo without keys
        const newCat = { ...category, id: Math.random().toString(36).substring(7) };
        setCategories(prev => [...prev, newCat]);
        return;
    }
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        setCategories(prev => [...prev, data]);
    } catch (error) {
        console.error("Error adding category:", error);
        alert("Gagal menambah kategori.");
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    if (!isSupabaseConfigured) {
         setCategories(prev => prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)));
         return;
    }
    try {
        const { error } = await supabase
            .from('categories')
            .update({ name: updatedCategory.name, type: updatedCategory.type })
            .eq('id', updatedCategory.id);

        if (error) throw error;
        setCategories(prev => prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)));
    } catch (error) {
        console.error("Error updating category:", error);
        alert("Gagal update kategori.");
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const isUsed = transactions.some(t => t.categoryId === id);
    if (isUsed) {
      alert('Kategori ini sedang digunakan dalam transaksi dan tidak bisa dihapus.');
      return false;
    }

    if (!isSupabaseConfigured) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        return true;
    }

    try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        setCategories(prev => prev.filter(cat => cat.id !== id));
        return true;
    } catch (error) {
        console.error("Error deleting category:", error);
        alert("Gagal menghapus kategori.");
        return false;
    }
  };
  
  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!isSupabaseConfigured) {
        const newTrx: Transaction = {
            ...transaction,
            id: Math.random().toString(36).substring(7),
            createdAt: new Date().toISOString()
        };
        setTransactions(prev => [newTrx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        return;
    }

    try {
        const payload = {
            date: transaction.date,
            type: transaction.type,
            category_id: transaction.categoryId, // Map to snake_case for DB
            amount: transaction.amount,
            description: transaction.description,
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([payload])
            .select()
            .single();
        
        if (error) throw error;

        const newTrx: Transaction = {
            id: data.id,
            date: data.date,
            type: data.type,
            categoryId: data.category_id,
            amount: data.amount,
            description: data.description,
            createdAt: data.created_at
        };

        setTransactions(prev => [newTrx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Error adding transaction:", error);
        alert("Gagal menyimpan transaksi.");
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!isSupabaseConfigured) {
        setTransactions(prev => prev.map(trx => (trx.id === updatedTransaction.id ? updatedTransaction : trx)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        return;
    }
    try {
        const payload = {
            date: updatedTransaction.date,
            type: updatedTransaction.type,
            category_id: updatedTransaction.categoryId,
            amount: updatedTransaction.amount,
            description: updatedTransaction.description
        };

        const { error } = await supabase
            .from('transactions')
            .update(payload)
            .eq('id', updatedTransaction.id);

        if (error) throw error;

        setTransactions(prev => prev.map(trx => (trx.id === updatedTransaction.id ? updatedTransaction : trx)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Error updating transaction:", error);
        alert("Gagal update transaksi.");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!isSupabaseConfigured) {
        setTransactions(prev => prev.filter(trx => trx.id !== id));
        return;
    }
    try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        setTransactions(prev => prev.filter(trx => trx.id !== id));
    } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Gagal menghapus transaksi.");
    }
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
