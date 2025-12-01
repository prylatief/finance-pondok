
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType, Category } from '../types';
import { formatRupiah } from '../utils/helpers';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, FilterIcon } from '../components/icons/Icons';


const TransactionForm: React.FC<{ transaction?: Transaction; onSave: (data: any) => void; onCancel: () => void; }> = ({ transaction, onSave, onCancel }) => {
  const { categories } = useAppContext();
  const [type, setType] = useState<TransactionType>(transaction?.type || TransactionType.Pemasukan);
  const [formData, setFormData] = useState({
    date: transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
    categoryId: transaction?.categoryId || '',
    amount: transaction?.amount || 0,
    description: transaction?.description || ''
  });

  const availableCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);

  useEffect(() => {
    // Reset category if type changes and current category is not valid
    if (!availableCategories.find(c => c.id === formData.categoryId)) {
      setFormData(prev => ({ ...prev, categoryId: availableCategories[0]?.id || '' }));
    }
  }, [type, availableCategories, formData.categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
        alert("Silakan pilih kategori.");
        return;
    }
    onSave({ ...formData, type });
  };

  return (
    <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">{transaction ? 'Edit' : 'Tambah'} Transaksi</h3>
            <div className="mb-4">
              <div className="flex rounded-md shadow-sm">
                <button type="button" onClick={() => setType(TransactionType.Pemasukan)} className={`w-1/2 rounded-l-md p-2 text-sm ${type === TransactionType.Pemasukan ? 'bg-primary-700 text-white' : 'bg-slate-200 text-slate-700'}`}>Pemasukan</button>
                <button type="button" onClick={() => setType(TransactionType.Pengeluaran)} className={`w-1/2 rounded-r-md p-2 text-sm ${type === TransactionType.Pengeluaran ? 'bg-primary-700 text-white' : 'bg-red-600 text-white'}`}>Pengeluaran</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Tanggal</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Kategori</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <option value="" disabled>Pilih Kategori</option>
                  {availableCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                 <label className="block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                 <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="1" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
               <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Keterangan</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" className="rounded-md border border-transparent bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-800">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TransactionsPage() {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction, getCategoryById } = useAppContext();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(location.state?.openModal || false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  const [filters, setFilters] = useState({ search: '', type: 'all', categoryId: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      // Clear state after opening
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const category = getCategoryById(t.categoryId);
      const searchMatch = filters.search === '' || 
                          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                          category?.name.toLowerCase().includes(filters.search.toLowerCase());
      const typeMatch = filters.type === 'all' || t.type === filters.type;
      const categoryMatch = filters.categoryId === 'all' || t.categoryId === filters.categoryId;
      return searchMatch && typeMatch && categoryMatch;
    });
  }, [transactions, filters, getCategoryById]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const [saving, setSaving] = useState(false);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (editingTransaction) {
        await updateTransaction({ ...editingTransaction, ...data });
      } else {
        await addTransaction(data);
      }
      setIsModalOpen(false);
      setEditingTransaction(undefined);
    } catch (err) {
      alert('Gagal menyimpan transaksi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        alert('Gagal menghapus transaksi. Silakan coba lagi.');
        console.error(err);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Transaksi</h2>
          <p className="text-slate-500">Catat, lihat, dan kelola semua transaksi keuangan.</p>
        </div>
        <button onClick={() => { setEditingTransaction(undefined); setIsModalOpen(true); }} className="inline-flex items-center gap-2 justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <PlusIcon className="h-5 w-5"/>
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {isModalOpen && <TransactionForm transaction={editingTransaction} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingTransaction(undefined); }} />}
      
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="Cari keterangan..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                <option value="all">Semua Jenis</option>
                <option value={TransactionType.Pemasukan}>Pemasukan</option>
                <option value={TransactionType.Pengeluaran}>Pengeluaran</option>
            </select>
            <select value={filters.categoryId} onChange={e => setFilters({...filters, categoryId: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                <option value="all">Semua Kategori</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600">
              <tr>
                <th className="p-3 font-medium">Tanggal</th>
                <th className="p-3 font-medium">Keterangan</th>
                <th className="p-3 font-medium hidden md:table-cell">Kategori</th>
                <th className="p-3 font-medium text-right">Jumlah</th>
                <th className="p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map(t => {
                const category = getCategoryById(t.categoryId);
                const isIncome = t.type === 'pemasukan';
                return (
                  <tr key={t.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                    <td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">{t.description}</td>
                    <td className="p-3 hidden md:table-cell">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {category?.name}
                        </span>
                    </td>
                    <td className={`p-3 text-right font-medium ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>{formatRupiah(t.amount)}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEdit(t)} className="text-slate-500 hover:text-primary-600"><PencilIcon /></button>
                        <button onClick={() => handleDelete(t.id)} className="text-slate-500 hover:text-red-600"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
           {paginatedTransactions.length === 0 && <div className="text-center p-6 text-slate-500">Tidak ada transaksi yang cocok dengan filter.</div>}
        </div>
        
        {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div><p className="text-sm text-gray-700">Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-medium">{filteredTransactions.length}</span> hasil</p></div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                                <span className="sr-only">Previous</span> &lt;
                            </button>
                            {/* In a real app, generate page numbers dynamically */}
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">{currentPage}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                                <span className="sr-only">Next</span> &gt;
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
