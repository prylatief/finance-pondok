
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { PondokSettings, Category, TransactionType } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/icons/Icons';
import { Logo } from '../components/Logo';

const CategoryManager: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', type: TransactionType.Pemasukan });

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type });
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingCategory(null);
        setFormData({ name: '', type: TransactionType.Pemasukan });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            await updateCategory({ ...editingCategory, ...formData });
        } else {
            await addCategory(formData);
        }
        handleCancel();
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Yakin ingin menghapus kategori ini?')) {
            await deleteCategory(id);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Manajemen Kategori</h3>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 text-sm text-primary-700 font-medium hover:text-primary-800">
                        <PlusIcon className="h-4 w-4"/> Tambah Kategori
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSave} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-medium mb-3 text-slate-700">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <input 
                                type="text" 
                                placeholder="Nama Kategori" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <select 
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value={TransactionType.Pemasukan}>Pemasukan</option>
                                <option value={TransactionType.Pengeluaran}>Pengeluaran</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                             <button type="submit" className="px-4 py-2 bg-primary-700 text-white rounded-md text-sm font-medium hover:bg-primary-800">Simpan</button>
                             <button type="button" onClick={handleCancel} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50">Batal</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left">
                        <tr>
                            <th className="p-3">Nama Kategori</th>
                            <th className="p-3">Jenis</th>
                            <th className="p-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="p-3">{cat.name}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.type === TransactionType.Pemasukan ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {cat.type === TransactionType.Pemasukan ? 'Pemasukan' : 'Pengeluaran'}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(cat)} className="text-slate-400 hover:text-primary-600"><PencilIcon/></button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-red-600"><TrashIcon/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const GeneralSettings: React.FC = () => {
    const { settings, updateSettings } = useAppContext();
    const [formData, setFormData] = useState<PondokSettings>(settings);
    const [previewLogo, setPreviewLogo] = useState<string | undefined>(settings.logoUrl);

    useEffect(() => {
        setFormData(settings);
        setPreviewLogo(settings.logoUrl);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewLogo(result);
                setFormData(prev => ({ ...prev, logoUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setPreviewLogo(undefined);
        setFormData(prev => ({ ...prev, logoUrl: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        alert('Pengaturan berhasil disimpan!');
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Identitas Pondok</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Logo Pondok</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 w-full flex flex-col items-center justify-center bg-slate-50 min-h-[160px]">
                            {previewLogo ? (
                                <div className="relative group">
                                    <img src={previewLogo} alt="Logo Preview" className="h-32 w-32 object-contain mb-2" />
                                    <button 
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Hapus Logo"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Logo className="h-16 w-16 mx-auto text-slate-300 mb-2" showText={false} />
                                    <span className="text-xs text-slate-400">Belum ada logo custom</span>
                                </div>
                            )}
                        </div>
                         <div className="mt-2 w-full">
                            <label className="block w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 text-center">
                                <span>Upload Logo Baru</span>
                                <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <p className="text-xs text-slate-500 mt-1 text-center">Format: PNG, JPG, GIF (Max 2MB)</p>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nama Pondok</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nama Bendahara</label>
                            <input type="text" name="treasurerName" value={formData.treasurerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-primary-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>
                <p className="text-slate-500">Kelola identitas pondok dan kategori keuangan.</p>
            </div>
            
            <GeneralSettings />
            <CategoryManager />
        </div>
    );
}
