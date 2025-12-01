import { supabase } from '../lib/supabase';
import { Category, Transaction, PondokSettings, TransactionType } from '../types';

// =====================================================
// CATEGORIES SERVICE
// =====================================================

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type as TransactionType,
    }));
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: category.name, type: category.type })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      type: data.type as TransactionType,
    };
  },

  async update(category: Category): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ name: category.name, type: category.type })
      .eq('id', category.id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      type: data.type as TransactionType,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async isUsedInTransactions(id: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);
    
    if (error) throw error;
    return (count || 0) > 0;
  }
};

// =====================================================
// TRANSACTIONS SERVICE
// =====================================================

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(t => ({
      id: t.id,
      date: t.date,
      type: t.type as TransactionType,
      categoryId: t.category_id,
      amount: Number(t.amount),
      description: t.description || '',
      createdAt: t.created_at,
    }));
  },

  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        date: transaction.date.split('T')[0],
        type: transaction.type,
        category_id: transaction.categoryId,
        amount: transaction.amount,
        description: transaction.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      categoryId: data.category_id,
      amount: Number(data.amount),
      description: data.description || '',
      createdAt: data.created_at,
    };
  },

  async update(transaction: Transaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        date: transaction.date.split('T')[0],
        type: transaction.type,
        category_id: transaction.categoryId,
        amount: transaction.amount,
        description: transaction.description,
      })
      .eq('id', transaction.id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      date: data.date,
      type: data.type as TransactionType,
      categoryId: data.category_id,
      amount: Number(data.amount),
      description: data.description || '',
      createdAt: data.created_at,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// SETTINGS SERVICE
// =====================================================

export const settingsService = {
  async get(): Promise<PondokSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) throw error;
    return {
      name: data.name,
      address: data.address || '',
      treasurerName: data.treasurer_name || '',
      logoUrl: data.logo_url || undefined,
    };
  },

  async update(settings: PondokSettings): Promise<PondokSettings> {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    const settingsData = {
      name: settings.name,
      address: settings.address,
      treasurer_name: settings.treasurerName,
      logo_url: settings.logoUrl || null,
    };

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update(settingsData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert(settingsData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return {
      name: result.name,
      address: result.address || '',
      treasurerName: result.treasurer_name || '',
      logoUrl: result.logo_url || undefined,
    };
  }
};

// =====================================================
// DATA MIGRATION SERVICE
// =====================================================

export const migrationService = {
  async migrateFromLocalStorage(): Promise<{
    categoriesMigrated: number;
    transactionsMigrated: number;
    settingsMigrated: boolean;
  }> {
    let categoriesMigrated = 0;
    let transactionsMigrated = 0;
    let settingsMigrated = false;

    try {
      // Check if we should migrate
      const { count: existingCategories } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
      
      if (existingCategories && existingCategories > 0) {
        console.log('Data already exists in Supabase, skipping migration');
        return { categoriesMigrated: 0, transactionsMigrated: 0, settingsMigrated: false };
      }

      // Migrate categories
      const localCategories = localStorage.getItem('categories');
      if (localCategories) {
        const categories = JSON.parse(localCategories) as Category[];
        const categoryIdMap = new Map<string, string>();
        
        for (const cat of categories) {
          const { data, error } = await supabase
            .from('categories')
            .insert({ name: cat.name, type: cat.type })
            .select()
            .single();
          
          if (!error && data) {
            categoryIdMap.set(cat.id, data.id);
            categoriesMigrated++;
          }
        }

        // Migrate transactions with new category IDs
        const localTransactions = localStorage.getItem('transactions');
        if (localTransactions) {
          const transactions = JSON.parse(localTransactions) as Transaction[];
          
          for (const t of transactions) {
            const newCategoryId = categoryIdMap.get(t.categoryId);
            if (newCategoryId) {
              const { error } = await supabase
                .from('transactions')
                .insert({
                  date: t.date.split('T')[0],
                  type: t.type,
                  category_id: newCategoryId,
                  amount: t.amount,
                  description: t.description,
                });
              
              if (!error) {
                transactionsMigrated++;
              }
            }
          }
        }
      }

      // Migrate settings
      const localSettings = localStorage.getItem('pondokSettings');
      if (localSettings) {
        const settings = JSON.parse(localSettings) as PondokSettings;
        await settingsService.update(settings);
        settingsMigrated = true;
      }

      // Clear localStorage after successful migration
      if (categoriesMigrated > 0 || settingsMigrated) {
        localStorage.removeItem('categories');
        localStorage.removeItem('transactions');
        localStorage.removeItem('pondokSettings');
        console.log('Migration complete, localStorage cleared');
      }

    } catch (error) {
      console.error('Migration error:', error);
    }

    return { categoriesMigrated, transactionsMigrated, settingsMigrated };
  }
};
