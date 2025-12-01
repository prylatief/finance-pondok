
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatRupiah } from '../utils/helpers';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, ScaleIcon, PlusIcon, DownloadIcon } from '../components/icons/Icons';
import { Link } from 'react-router-dom';

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ReactNode; }> = ({ label, value, icon }) => (
  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
      {icon}
    </div>
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-800">{formatRupiah(value)}</div>
    </div>
  </div>
);

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const { getCategoryById } = useAppContext();
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === 'pemasukan';

  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="p-3">
        <div className="font-medium text-slate-800">{category?.name || 'Tanpa Kategori'}</div>
        <div className="text-xs text-slate-500">{transaction.description}</div>
      </td>
      <td className="p-3 text-sm text-slate-500 hidden sm:table-cell">{new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      <td className={`p-3 text-right font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
        {formatRupiah(transaction.amount)}
      </td>
    </tr>
  );
};

export default function DashboardPage() {
  const { transactions, loading } = useAppContext();

  const { summary, lastTransactions, chartData } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startOfMonth && tDate <= endOfMonth;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthlyTransactions
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastFive = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
        
    const dataForChart = [
        { name: 'Bulan Ini', Pemasukan: totalIncome, Pengeluaran: totalExpense }
    ];

    return {
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      lastTransactions: lastFive,
      chartData: dataForChart
    };
  }, [transactions]);

  if (loading) return <div>Memuat dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500">Ringkasan keuangan bulan berjalan.</p>
        </div>
        <div className="flex items-center gap-2">
            <Link to="/transaksi" state={{ openModal: true }} className="inline-flex items-center gap-2 justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <PlusIcon className="h-4 w-4"/>
                Input Transaksi
            </Link>
             <button onClick={() => alert("Fitur download laporan akan segera hadir!")} className="inline-flex items-center gap-2 justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-300 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <DownloadIcon className="h-4 w-4"/>
                Laporan Bulanan
            </button>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Total Pemasukan" value={summary.totalIncome} icon={<ArrowUpIcon />} />
        <SummaryCard label="Total Pengeluaran" value={summary.totalExpense} icon={<ArrowDownIcon />} />
        <SummaryCard label="Saldo Bulan Ini" value={summary.balance} icon={<ScaleIcon />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pemasukan vs Pengeluaran</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} tick={{fontSize: 12}} />
                        <Tooltip formatter={(value) => formatRupiah(value as number)}/>
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <h3 className="p-4 text-lg font-semibold text-slate-800 border-b border-slate-200">5 Transaksi Terakhir</h3>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <tbody>
                        {lastTransactions.length > 0 ? (
                            lastTransactions.map(trx => <TransactionRow key={trx.id} transaction={trx} />)
                        ) : (
                            <tr><td className="p-4 text-center text-slate-500">Belum ada transaksi.</td></tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
      </div>
    </div>
  );
}
