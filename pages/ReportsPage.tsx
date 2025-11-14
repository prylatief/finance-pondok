import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { formatRupiah } from '../utils/helpers';
import { DownloadIcon } from '../components/icons/Icons';

export default function ReportsPage() {
  const { transactions, categories, settings } = useAppContext();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-11

  const years = useMemo(() => {
    const allYears = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    if (!allYears.has(new Date().getFullYear())) {
        allYears.add(new Date().getFullYear());
    }
    return Array.from(allYears).sort((a,b) => b-a);
  }, [transactions]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const reportData = useMemo(() => {
    const filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const income = filtered.filter(t => t.type === TransactionType.Pemasukan).reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === TransactionType.Pengeluaran).reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown = categories.map(cat => {
        const total = filtered.filter(t => t.categoryId === cat.id).reduce((s,t) => s + t.amount, 0);
        return { name: cat.name, type: cat.type, total };
    }).filter(c => c.total > 0);

    return {
      transactions: filtered,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      incomeBreakdown: categoryBreakdown.filter(c => c.type === TransactionType.Pemasukan),
      expenseBreakdown: categoryBreakdown.filter(c => c.type === TransactionType.Pengeluaran),
    };
  }, [year, month, transactions, categories]);
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let finalY = 0;

    // --- PDF Header ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.name, 14, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Laporan Keuangan Bulan ${months[month]} ${year}`, 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Disusun oleh: ${settings.treasurerName}`, 14, 36);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 41);

    // --- Summary Table ---
    (doc as any).autoTable({
        startY: 50,
        head: [['Ringkasan Keuangan', 'Jumlah']],
        body: [
            ['Total Pemasukan', { content: formatRupiah(reportData.totalIncome), styles: { halign: 'right' } }],
            ['Total Pengeluaran', { content: formatRupiah(reportData.totalExpense), styles: { halign: 'right' } }],
            ['Saldo Akhir', { content: formatRupiah(reportData.balance), styles: { fontStyle: 'bold', halign: 'right' } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: '#0f766e' }, // primary-700
        didDrawPage: (data: any) => finalY = data.cursor.y
    });

    // --- Breakdown Tables ---
    if (reportData.incomeBreakdown.length > 0) {
        (doc as any).autoTable({
            startY: finalY + 10,
            head: [['Rincian Pemasukan', 'Total']],
            body: reportData.incomeBreakdown.map(item => [item.name, { content: formatRupiah(item.total), styles: { halign: 'right' } }]),
            theme: 'striped',
            headStyles: { fillColor: '#10b981' }, // emerald-500
            didDrawPage: (data: any) => finalY = data.cursor.y
        });
    }

    if (reportData.expenseBreakdown.length > 0) {
         (doc as any).autoTable({
            startY: finalY + (reportData.incomeBreakdown.length > 0 ? 10 : 0),
            head: [['Rincian Pengeluaran', 'Total']],
            body: reportData.expenseBreakdown.map(item => [item.name, { content: formatRupiah(item.total), styles: { halign: 'right' } }]),
            theme: 'striped',
            headStyles: { fillColor: '#ef4444' }, // red-500
            didDrawPage: (data: any) => finalY = data.cursor.y
        });
    }
    
    // --- Transactions Table ---
    if (reportData.transactions.length > 0) {
        const transactionBody = reportData.transactions.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const amountCell = t.type === TransactionType.Pemasukan 
                ? { content: formatRupiah(t.amount), styles: { textColor: '#059669', halign: 'right' } } // emerald-600
                : { content: formatRupiah(t.amount), styles: { textColor: '#dc2626', halign: 'right' } }; // red-600
            return [
                new Date(t.date).toLocaleDateString('id-ID'),
                t.description || '-',
                cat?.name || 'Tanpa Kategori',
                amountCell
            ];
        });

        (doc as any).autoTable({
            startY: finalY + 10,
            head: [['Tanggal', 'Keterangan', 'Kategori', 'Jumlah']],
            body: transactionBody,
            theme: 'grid',
            headStyles: { fillColor: '#475569' }, // slate-600
        });
    }


    // --- Save File ---
    doc.save(`Laporan_${settings.name.replace(/\s/g, '_')}_${months[month]}_${year}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h2>
          <p className="text-slate-500">Lihat ringkasan laporan bulanan dan tahunan.</p>
        </div>
        <div className="flex items-center space-x-2">
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-primary-800">{settings.name}</h3>
                    <p className="text-sm text-slate-600">Laporan Keuangan Bulan {months[month]} {year}</p>
                    <p className="text-xs text-slate-500">Disusun oleh: {settings.treasurerName}</p>
                </div>
                <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-800">
                    <DownloadIcon/> Download PDF
                </button>
            </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="text-sm text-emerald-800">Total Pemasukan</div>
                <div className="text-xl font-bold text-emerald-600">{formatRupiah(reportData.totalIncome)}</div>
            </div>
             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-800">Total Pengeluaran</div>
                <div className="text-xl font-bold text-red-600">{formatRupiah(reportData.totalExpense)}</div>
            </div>
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-800">Saldo Akhir</div>
                <div className="text-xl font-bold text-slate-900">{formatRupiah(reportData.balance)}</div>
            </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold mb-2 text-slate-700">Rincian Pemasukan</h4>
                <div className="space-y-2">
                    {reportData.incomeBreakdown.map(item => (
                        <div key={item.name} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                            <span>{item.name}</span>
                            <span className="font-medium">{formatRupiah(item.total)}</span>
                        </div>
                    ))}
                    {reportData.incomeBreakdown.length === 0 && <p className="text-sm text-slate-500">Tidak ada pemasukan.</p>}
                </div>
            </div>
             <div>
                <h4 className="font-semibold mb-2 text-slate-700">Rincian Pengeluaran</h4>
                <div className="space-y-2">
                    {reportData.expenseBreakdown.map(item => (
                        <div key={item.name} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                            <span>{item.name}</span>
                            <span className="font-medium">{formatRupiah(item.total)}</span>
                        </div>
                    ))}
                    {reportData.expenseBreakdown.length === 0 && <p className="text-sm text-slate-500">Tidak ada pengeluaran.</p>}
                </div>
            </div>
        </div>
        
        <div className="p-6">
            <h4 className="font-semibold mb-2 text-slate-700">Daftar Transaksi</h4>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left">
                        <tr>
                            <th className="p-2">Tanggal</th>
                            <th className="p-2">Keterangan</th>
                            <th className="p-2">Kategori</th>
                            <th className="p-2 text-right">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.transactions.map(t => {
                            const cat = categories.find(c => c.id === t.categoryId);
                            return (
                                <tr key={t.id} className="border-t">
                                    <td className="p-2">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                    <td className="p-2">{t.description}</td>
                                    <td className="p-2">{cat?.name}</td>
                                    <td className={`p-2 text-right font-medium ${t.type === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>{formatRupiah(t.amount)}</td>
                                </tr>
                            )
                        })}
                         {reportData.transactions.length === 0 && (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-500">Tidak ada transaksi di bulan ini.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}