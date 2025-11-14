import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PondokSettings, Category, TransactionType } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/icons/Icons';

const CategoryManager: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', type: TransactionType.Pemasukan });

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingCategory(null);
        setFormData({ name: '', type: TransactionType.Pemasukan });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategory({ ...editingCategory, ...formData });
        } else {
            addCategory(formData);
        }
        handleCancel();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            deleteCategory(id);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Manajemen Kategori</h3>
                {!isAdding && !editingCategory && (
                    <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-1 text-sm text-primary-700 hover:text-primary-900 font-medium">
                        <PlusIcon className="h-4 w-4"/> Tambah Baru
                    </button>
                )}
            </div>
            {(isAdding || editingCategory) && (
                <form onSubmit={handleSave} className="mb-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Nama Kategori"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="sm:col-span-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value={TransactionType.Pemasukan}>Pemasukan</option>
                            <option value={TransactionType.Pengeluaran}>Pengeluaran</option>
                        </select>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCancel} className="text-sm px-3 py-1 rounded-md border bg-white hover:bg-slate-100">Batal</button>
                        <button type="submit" className="text-sm px-3 py-1 rounded-md bg-primary-700 text-white hover:bg-primary-800">Simpan</button>
                    </div>
                </form>
            )}
            <div className="space-y-2">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between rounded-md p-3 hover:bg-slate-50">
                        <div>
                            <span className="font-medium text-slate-800">{cat.name}</span>
                            <span className={`ml-2 text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${cat.type === 'pemasukan' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{cat.type}</span>
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => handleEdit(cat)} className="text-slate-400 hover:text-primary-600"><PencilIcon /></button>
                            <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-red-600"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function SettingsPage() {
    const { settings, updateSettings } = useAppContext();
    const [formData, setFormData] = useState<PondokSettings>(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        alert('Pengaturan berhasil disimpan!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-slate-500">Kelola informasi pondok dan kategori transaksi.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Pondok</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nama Pondok</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Alamat</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nama Bendahara</label>
                                <input type="text" name="treasurerName" value={formData.treasurerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>
                            <div>
                                <button type="submit" className="w-full justify-center rounded-md border border-transparent bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-800">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <CategoryManager />
                </div>
            </div>
        </div>
    );
}