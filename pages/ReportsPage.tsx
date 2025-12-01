
import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionType, MonthlyBreakdown } from '../types';
import { formatRupiah } from '../utils/helpers';
import { DownloadIcon } from '../components/icons/Icons';

const ReportCard: React.FC<{label: string, value: number, variant: 'income' | 'expense' | 'balance'}> = ({label, value, variant}) => {
    const variants = {
        income: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', value: 'text-emerald-600' },
        expense: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', value: 'text-red-600' },
        balance: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', value: 'text-slate-900' },
    }
    const style = variants[variant];
    return (
        <div className={`${style.bg} border ${style.border} rounded-lg p-4`}>
            <div className={`text-sm ${style.text}`}>{label}</div>
            <div className={`text-xl font-bold ${style.value}`}>{formatRupiah(value)}</div>
        </div>
    )
}

export default function ReportsPage() {
  const { transactions, categories, settings } = useAppContext();
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
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

  const monthlyReportData = useMemo(() => {
    if (reportType !== 'monthly') return null;
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
  }, [year, month, transactions, categories, reportType]);
  
  const annualReportData = useMemo(() => {
      if (reportType !== 'annual') return null;
      
      const monthlyBreakdown: MonthlyBreakdown[] = months.map((m, i) => ({
          month: m,
          monthIndex: i,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
      }));

      const yearlyTransactions = transactions.filter(t => new Date(t.date).getFullYear() === year);

      for (const t of yearlyTransactions) {
          const tMonth = new Date(t.date).getMonth();
          if (t.type === TransactionType.Pemasukan) {
              monthlyBreakdown[tMonth].totalIncome += t.amount;
          } else {
              monthlyBreakdown[tMonth].totalExpense += t.amount;
          }
      }
      
      let totalYearlyIncome = 0;
      let totalYearlyExpense = 0;

      monthlyBreakdown.forEach(m => {
          m.balance = m.totalIncome - m.totalExpense;
          totalYearlyIncome += m.totalIncome;
          totalYearlyExpense += m.totalExpense;
      });

      return {
          monthlyBreakdown,
          totalYearlyIncome,
          totalYearlyExpense,
          yearlyBalance: totalYearlyIncome - totalYearlyExpense,
      }

  }, [year, transactions, reportType]);
  
  const handleDownloadMonthlyPdf = () => {
    if (!monthlyReportData) return;
    const doc = new jsPDF();
    let finalY = 0;

    // --- LOGO Handling ---
    let textX = 14; // Default left margin
    if (settings.logoUrl) {
        try {
            // x=14, y=10, width=24, height=24 (Square)
            doc.addImage(settings.logoUrl, 14, 10, 24, 24);
            textX = 42; // Shift text to the right if logo exists
        } catch (error) {
            console.error("Failed to add logo to PDF", error);
        }
    }

    // --- PDF Header ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.name, textX, 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Laporan Keuangan Bulan ${months[month]} ${year}`, textX, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Disusun oleh: ${settings.treasurerName}`, textX, 36);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, textX, 41);

    // --- Summary Table ---
    (doc as any).autoTable({
        startY: 50,
        head: [['Ringkasan Keuangan', 'Jumlah']],
        body: [
            ['Total Pemasukan', { content: formatRupiah(monthlyReportData.totalIncome), styles: { halign: 'right' } }],
            ['Total Pengeluaran', { content: formatRupiah(monthlyReportData.totalExpense), styles: { halign: 'right' } }],
            ['Saldo Akhir', { content: formatRupiah(monthlyReportData.balance), styles: { fontStyle: 'bold', halign: 'right' } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: '#0f766e' },
        didDrawPage: (data: any) => finalY = data.cursor.y
    });

    if (monthlyReportData.incomeBreakdown.length > 0) {
        (doc as any).autoTable({
            startY: finalY + 10, head: [['Rincian Pemasukan', 'Total']],
            body: monthlyReportData.incomeBreakdown.map(item => [item.name, { content: formatRupiah(item.total), styles: { halign: 'right' } }]),
            theme: 'striped', headStyles: { fillColor: '#10b981' }, didDrawPage: (data: any) => finalY = data.cursor.y
        });
    }

    if (monthlyReportData.expenseBreakdown.length > 0) {
         (doc as any).autoTable({
            startY: finalY + (monthlyReportData.incomeBreakdown.length > 0 ? 10 : 0),
            head: [['Rincian Pengeluaran', 'Total']],
            body: monthlyReportData.expenseBreakdown.map(item => [item.name, { content: formatRupiah(item.total), styles: { halign: 'right' } }]),
            theme: 'striped', headStyles: { fillColor: '#ef4444' }, didDrawPage: (data: any) => finalY = data.cursor.y
        });
    }
    
    if (monthlyReportData.transactions.length > 0) {
        (doc as any).autoTable({
            startY: finalY + 10,
            head: [['Tanggal', 'Keterangan', 'Kategori', 'Jumlah']],
            body: monthlyReportData.transactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return [
                    new Date(t.date).toLocaleDateString('id-ID'),
                    t.description || '-',
                    cat?.name || 'Tanpa Kategori',
                    { content: formatRupiah(t.amount), styles: { halign: 'right', textColor: t.type === 'pemasukan' ? '#059669' : '#dc2626' } }
                ];
            }),
            theme: 'grid', headStyles: { fillColor: '#475569' },
        });
    }

    doc.save(`Laporan_Bulanan_${settings.name.replace(/\s/g, '_')}_${months[month]}_${year}.pdf`);
  };
  
  const handleDownloadAnnualPdf = () => {
    if (!annualReportData) return;
    const doc = new jsPDF();

    // --- LOGO Handling ---
    let textX = 14; 
    if (settings.logoUrl) {
        try {
            doc.addImage(settings.logoUrl, 14, 10, 24, 24);
            textX = 42; 
        } catch (error) {
            console.error("Failed to add logo to PDF", error);
        }
    }
    
    // --- PDF Header ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.name, textX, 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Laporan Keuangan Tahunan ${year}`, textX, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Disusun oleh: ${settings.treasurerName}`, textX, 36);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, textX, 41);

    // --- Summary Table ---
     (doc as any).autoTable({
        startY: 50,
        head: [['Ringkasan Tahunan', 'Jumlah']],
        body: [
            ['Total Pemasukan', { content: formatRupiah(annualReportData.totalYearlyIncome), styles: { halign: 'right' } }],
            ['Total Pengeluaran', { content: formatRupiah(annualReportData.totalYearlyExpense), styles: { halign: 'right' } }],
            ['Saldo Akhir Tahun', { content: formatRupiah(annualReportData.yearlyBalance), styles: { fontStyle: 'bold', halign: 'right' } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: '#0f766e' },
    });
    
    // --- Monthly Breakdown Table ---
    (doc as any).autoTable({
        startY: (doc as any).autoTable.previous.finalY + 10,
        head: [['Bulan', 'Pemasukan', 'Pengeluaran', 'Saldo Bulan']],
        body: annualReportData.monthlyBreakdown.map(m => [
            m.month,
            { content: formatRupiah(m.totalIncome), styles: { halign: 'right' } },
            { content: formatRupiah(m.totalExpense), styles: { halign: 'right' } },
            { content: formatRupiah(m.balance), styles: { halign: 'right', fontStyle: 'bold' } }
        ]),
        theme: 'grid',
        headStyles: { fillColor: '#475569' },
    });

    doc.save(`Laporan_Tahunan_${settings.name.replace(/\s/g, '_')}_${year}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h2>
          <p className="text-slate-500">Lihat ringkasan laporan bulanan dan tahunan.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-200 p-1 rounded-lg">
            <button onClick={() => setReportType('monthly')} className={`px-3 py-1 text-sm font-medium rounded-md ${reportType === 'monthly' ? 'bg-white shadow' : 'text-slate-600'}`}>Laporan Bulanan</button>
            <button onClick={() => setReportType('annual')} className={`px-3 py-1 text-sm font-medium rounded-md ${reportType === 'annual' ? 'bg-white shadow' : 'text-slate-600'}`}>Laporan Tahunan</button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h3 className="text-lg font-bold text-primary-800">{settings.name}</h3>
                    <p className="text-sm text-slate-600">
                        {reportType === 'monthly' ? `Laporan Keuangan Bulan ${months[month]} ${year}` : `Laporan Keuangan Tahun ${year}`}
                    </p>
                    <p className="text-xs text-slate-500">Disusun oleh: {settings.treasurerName}</p>
                </div>
                <div className="flex items-center gap-2">
                    {reportType === 'monthly' && (
                        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                    )}
                    <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={reportType === 'monthly' ? handleDownloadMonthlyPdf : handleDownloadAnnualPdf} className="inline-flex items-center gap-2 justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-800">
                        <DownloadIcon/> Download PDF
                    </button>
                </div>
            </div>
        </div>

        {reportType === 'monthly' && monthlyReportData && (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ReportCard label="Total Pemasukan" value={monthlyReportData.totalIncome} variant="income" />
                <ReportCard label="Total Pengeluaran" value={monthlyReportData.totalExpense} variant="expense" />
                <ReportCard label="Saldo Akhir" value={monthlyReportData.balance} variant="balance" />
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Rincian Pemasukan</h4>
                    <div className="space-y-2">
                        {monthlyReportData.incomeBreakdown.map(item => (
                            <div key={item.name} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                                <span>{item.name}</span>
                                <span className="font-medium">{formatRupiah(item.total)}</span>
                            </div>
                        ))}
                        {monthlyReportData.incomeBreakdown.length === 0 && <p className="text-sm text-slate-500">Tidak ada pemasukan.</p>}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Rincian Pengeluaran</h4>
                    <div className="space-y-2">
                        {monthlyReportData.expenseBreakdown.map(item => (
                            <div key={item.name} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                                <span>{item.name}</span>
                                <span className="font-medium">{formatRupiah(item.total)}</span>
                            </div>
                        ))}
                        {monthlyReportData.expenseBreakdown.length === 0 && <p className="text-sm text-slate-500">Tidak ada pengeluaran.</p>}
                    </div>
                </div>
            </div>
            <div className="p-6">
                <h4 className="font-semibold mb-2 text-slate-700">Daftar Transaksi</h4>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-left"><tr><th className="p-2">Tanggal</th><th className="p-2">Keterangan</th><th className="p-2">Kategori</th><th className="p-2 text-right">Jumlah</th></tr></thead>
                        <tbody>
                            {monthlyReportData.transactions.map(t => {
                                const cat = categories.find(c => c.id === t.categoryId);
                                return (<tr key={t.id} className="border-t"><td className="p-2">{new Date(t.date).toLocaleDateString('id-ID')}</td><td className="p-2">{t.description}</td><td className="p-2">{cat?.name}</td><td className={`p-2 text-right font-medium ${t.type === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>{formatRupiah(t.amount)}</td></tr>)
                            })}
                            {monthlyReportData.transactions.length === 0 && (<tr><td colSpan={4} className="p-4 text-center text-slate-500">Tidak ada transaksi di bulan ini.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
          </>
        )}

        {reportType === 'annual' && annualReportData && (
            <>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                     <ReportCard label="Total Pemasukan Tahunan" value={annualReportData.totalYearlyIncome} variant="income" />
                     <ReportCard label="Total Pengeluaran Tahunan" value={annualReportData.totalYearlyExpense} variant="expense" />
                     <ReportCard label="Saldo Akhir Tahun" value={annualReportData.yearlyBalance} variant="balance" />
                </div>
                <div className="p-6">
                    <h4 className="font-semibold mb-4 text-slate-700">Grafik Keuangan Bulanan - {year}</h4>
                    <div className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={annualReportData.monthlyBreakdown} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{fontSize: 12}} />
                                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} tick={{fontSize: 12}} />
                                <Tooltip formatter={(value) => formatRupiah(value as number)}/>
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Bar dataKey="totalIncome" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="totalExpense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="p-6">
                    <h4 className="font-semibold mb-2 text-slate-700">Rincian Keuangan per Bulan</h4>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-left">
                                <tr>
                                    <th className="p-2">Bulan</th>
                                    <th className="p-2 text-right">Pemasukan</th>
                                    <th className="p-2 text-right">Pengeluaran</th>
                                    <th className="p-2 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {annualReportData.monthlyBreakdown.map(m => (
                                    <tr key={m.monthIndex} className="border-t">
                                        <td className="p-2 font-medium">{m.month}</td>
                                        <td className="p-2 text-right text-emerald-600">{formatRupiah(m.totalIncome)}</td>
                                        <td className="p-2 text-right text-red-600">{formatRupiah(m.totalExpense)}</td>
                                        <td className="p-2 text-right font-bold">{formatRupiah(m.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
