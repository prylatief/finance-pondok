import { supabase } from '../lib/supabase';
import { Category, Transaction, PondokSettings, TransactionType } from '../types';

// =====================================================
// ERROR HANDLING
// =====================================================

interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
}

const handleError = (error: any, context: string): never => {
  console.error(`[SupabaseService] ${context}:`, error);

  const errorMessage = error?.message || 'An unknown error occurred';
  const errorCode = error?.code || 'UNKNOWN';

  throw new Error(`${context}: ${errorMessage} (${errorCode})`);
};

// =====================================================
// CATEGORIES SERVICE
// =====================================================

export const categoriesService = {
  /**
   * Get all categories, optionally filtered by type
   */
  async getAll(type?: TransactionType): Promise<Category[]> {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        handleError(error, 'Failed to fetch categories');
      }

      return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type as TransactionType
      }));
    } catch (error) {
      handleError(error, 'Failed to get categories');
    }
  },

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        handleError(error, 'Failed to fetch category');
      }

      return data ? {
        id: data.id,
        name: data.name,
        type: data.type as TransactionType
      } : null;
    } catch (error) {
      handleError(error, 'Failed to get category');
    }
  },

  /**
   * Add a new category
   */
  async add(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          type: category.type
        })
        .select()
        .single();

      if (error) {
        handleError(error, 'Failed to add category');
      }

      return {
        id: data.id,
        name: data.name,
        type: data.type as TransactionType
      };
    } catch (error) {
      handleError(error, 'Failed to add category');
    }
  },

  /**
   * Update an existing category
   */
  async update(id: string, category: Partial<Omit<Category, 'id'>>): Promise<Category> {
    try {
      const updateData: any = {};
      if (category.name) updateData.name = category.name;
      if (category.type) updateData.type = category.type;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleError(error, 'Failed to update category');
      }

      return {
        id: data.id,
        name: data.name,
        type: data.type as TransactionType
      };
    } catch (error) {
      handleError(error, 'Failed to update category');
    }
  },

  /**
   * Delete a category (will fail if category is used in transactions)
   */
  async delete(id: string): Promise<void> {
    try {
      // First check if category is used in any transactions
      const { data: transactions, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (checkError) {
        handleError(checkError, 'Failed to check category usage');
      }

      if (transactions && transactions.length > 0) {
        throw new Error('Kategori ini sedang digunakan dalam transaksi dan tidak bisa dihapus.');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        handleError(error, 'Failed to delete category');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      handleError(error, 'Failed to delete category');
    }
  }
};

// =====================================================
// TRANSACTIONS SERVICE
// =====================================================

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionsService = {
  /**
   * Get all transactions with optional filters
   */
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        handleError(error, 'Failed to fetch transactions');
      }

      return (data || []).map(t => ({
        id: t.id,
        date: t.date,
        type: t.type as TransactionType,
        categoryId: t.category_id,
        amount: parseFloat(t.amount),
        description: t.description || '',
        createdAt: t.created_at
      }));
    } catch (error) {
      handleError(error, 'Failed to get transactions');
    }
  },

  /**
   * Get a single transaction by ID
   */
  async getById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        handleError(error, 'Failed to fetch transaction');
      }

      return data ? {
        id: data.id,
        date: data.date,
        type: data.type as TransactionType,
        categoryId: data.category_id,
        amount: parseFloat(data.amount),
        description: data.description || '',
        createdAt: data.created_at
      } : null;
    } catch (error) {
      handleError(error, 'Failed to get transaction');
    }
  },

  /**
   * Add a new transaction
   */
  async add(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          date: transaction.date,
          type: transaction.type,
          category_id: transaction.categoryId,
          amount: transaction.amount,
          description: transaction.description || null
        })
        .select()
        .single();

      if (error) {
        handleError(error, 'Failed to add transaction');
      }

      return {
        id: data.id,
        date: data.date,
        type: data.type as TransactionType,
        categoryId: data.category_id,
        amount: parseFloat(data.amount),
        description: data.description || '',
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'Failed to add transaction');
    }
  },

  /**
   * Update an existing transaction
   */
  async update(id: string, transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
    try {
      const updateData: any = {};
      if (transaction.date) updateData.date = transaction.date;
      if (transaction.type) updateData.type = transaction.type;
      if (transaction.categoryId) updateData.category_id = transaction.categoryId;
      if (transaction.amount !== undefined) updateData.amount = transaction.amount;
      if (transaction.description !== undefined) updateData.description = transaction.description || null;

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleError(error, 'Failed to update transaction');
      }

      return {
        id: data.id,
        date: data.date,
        type: data.type as TransactionType,
        categoryId: data.category_id,
        amount: parseFloat(data.amount),
        description: data.description || '',
        createdAt: data.created_at
      };
    } catch (error) {
      handleError(error, 'Failed to update transaction');
    }
  },

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        handleError(error, 'Failed to delete transaction');
      }
    } catch (error) {
      handleError(error, 'Failed to delete transaction');
    }
  },

  /**
   * Get transactions by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.getAll({ startDate, endDate });
  }
};

// =====================================================
// SETTINGS SERVICE
// =====================================================

export const settingsService = {
  /**
   * Get pondok settings (singleton)
   */
  async get(): Promise<PondokSettings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        handleError(error, 'Failed to fetch settings');
      }

      return {
        name: data.name,
        address: data.address || '',
        treasurerName: data.treasurer_name || '',
        logoUrl: data.logo_url || undefined
      };
    } catch (error) {
      handleError(error, 'Failed to get settings');
    }
  },

  /**
   * Update pondok settings
   */
  async update(settings: Partial<PondokSettings>): Promise<PondokSettings> {
    try {
      // First get the existing settings to get the ID
      const { data: existing, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError) {
        handleError(fetchError, 'Failed to fetch existing settings');
      }

      const updateData: any = {};
      if (settings.name !== undefined) updateData.name = settings.name;
      if (settings.address !== undefined) updateData.address = settings.address;
      if (settings.treasurerName !== undefined) updateData.treasurer_name = settings.treasurerName;
      if (settings.logoUrl !== undefined) updateData.logo_url = settings.logoUrl;

      const { data, error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        handleError(error, 'Failed to update settings');
      }

      return {
        name: data.name,
        address: data.address || '',
        treasurerName: data.treasurer_name || '',
        logoUrl: data.logo_url || undefined
      };
    } catch (error) {
      handleError(error, 'Failed to update settings');
    }
  }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });

    return !error;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

/**
 * Get database statistics
 */
export const getStats = async () => {
  try {
    const [categoriesCount, transactionsCount] = await Promise.all([
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true })
    ]);

    return {
      categoriesCount: categoriesCount.count || 0,
      transactionsCount: transactionsCount.count || 0
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return {
      categoriesCount: 0,
      transactionsCount: 0
    };
  }
};
