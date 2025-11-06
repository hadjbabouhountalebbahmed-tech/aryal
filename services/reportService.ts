import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// Fix: added .ts extension
import { Financials } from '../types.ts';

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA');
};

export const generatePdfReport = (financials: Financials, startDate: string, endDate: string) => {
    const doc = new jsPDF();
    let y = 15;

    // --- Filter data based on date range ---
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredIncomes = financials.incomes.filter(i => {
        const d = new Date(i.date);
        return d >= start && d <= end;
    });

    const filteredExpenses = financials.expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
    });
    
    // Investments are often not dated, so we'll list all for now
    // A better implementation would have a creation date for investments
    const filteredInvestments = financials.investments;

    // Debts can be considered new if their due date is far in the future? Or maybe add a creation date to them too.
    // For now, listing all debts.
    const filteredDebts = financials.debts;

    const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netFlow = totalIncome - totalExpenses;

    // --- Header ---
    doc.setFontSize(20);
    doc.text('Rapport Financier - Hadj Finance', 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Période du ${formatDate(startDate)} au ${formatDate(endDate)}`, 14, y);
    y += 10;

    // --- Summary Section ---
    doc.setFontSize(16);
    doc.text('Résumé Financier', 14, y);
    y += 7;
    doc.setFontSize(12);
    doc.text(`Revenus Totaux: ${formatCurrency(totalIncome)}`, 14, y);
    y += 7;
    doc.text(`Dépenses Totales: ${formatCurrency(totalExpenses)}`, 14, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Flux de Trésorerie Net:', 14, y);
    doc.setTextColor(netFlow >= 0 ? '#07aa94' : '#ef4444'); // primary-600 or red-500
    doc.text(formatCurrency(netFlow), 60, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    y += 10;
    
    const checkPageBreak = (currentY: number) => {
        if (currentY > doc.internal.pageSize.height - 20) {
            doc.addPage();
            return 15;
        }
        return currentY;
    }

    // --- Income Details ---
    if (filteredIncomes.length > 0) {
        y = checkPageBreak(y);
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Source', 'Montant']],
            body: filteredIncomes.map(i => [formatDate(i.date), i.source, formatCurrency(i.amount)]),
            theme: 'grid',
            headStyles: { fillColor: '#07aa94' },
            didDrawPage: (data) => { y = data.cursor?.y || 15; }
        });
        y = (doc as any).lastAutoTable.finalY;
    }

    // --- Expense Details ---
    if (filteredExpenses.length > 0) {
        y = checkPageBreak(y);
        autoTable(doc, {
            startY: y + 5,
            head: [['Date', 'Catégorie', 'Description', 'Montant']],
            body: filteredExpenses.map(e => [formatDate(e.date), e.category, e.description, formatCurrency(e.amount)]),
            theme: 'grid',
            headStyles: { fillColor: '#d97706' }, // secondary-600
            didDrawPage: (data) => { y = data.cursor?.y || 15; }
        });
        y = (doc as any).lastAutoTable.finalY;
    }

    // --- Investments & Debts ---
    if (filteredInvestments.length > 0) {
        y = checkPageBreak(y + 10);
        doc.setFontSize(16);
        doc.text('Liste des Investissements Actuels', 14, y);
        y += 7;
        doc.setFontSize(10);
        filteredInvestments.forEach(inv => {
            y = checkPageBreak(y);
            doc.text(`- ${inv.name}: ${formatCurrency(inv.amount)} (${inv.sector})`, 16, y);
            y += 5;
        });
        y += 5;
    }

    if (filteredDebts.length > 0) {
        y = checkPageBreak(y);
        doc.setFontSize(16);
        doc.text('Liste des Dettes Actuelles', 14, y);
        y += 7;
        doc.setFontSize(10);
        filteredDebts.forEach(debt => {
            y = checkPageBreak(y);
            doc.text(`- ${debt.name}: ${formatCurrency(debt.amount)} (Taux: ${debt.interestRate}%)`, 16, y);
            y += 5;
        });
    }
    
    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Page ${i} sur ${pageCount} | Généré le ${new Date().toLocaleDateString('fr-CA')}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // --- Save ---
    const filename = `Rapport_HadjFinance_${startDate}_au_${endDate}.pdf`;
    doc.save(filename);
};