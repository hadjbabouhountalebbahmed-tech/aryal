import { Financials } from '../types.ts';

export const mockData: Financials = {
    incomes: [
        { id: 'inc1', source: 'Salaire', amount: 4500, date: '2024-07-01' },
        { id: 'inc2', source: 'Consulting', amount: 750, date: '2024-07-15' },
    ],
    expenses: [
        { id: 'exp1', description: 'Loyer', category: 'Logement', amount: 1600, date: '2024-07-01' },
        { id: 'exp2', description: 'Épicerie', category: 'Alimentation', amount: 450, date: '2024-07-05' },
        { id: 'exp3', description: 'Internet & Mobile', category: 'Factures & Services', amount: 120, date: '2024-07-10' },
        { id: 'exp4', description: 'Passe Transport', category: 'Transport', amount: 85, date: '2024-07-02', sourceRecurringId: 'rec1' },
    ],
    recurringExpenses: [
        { id: 'rec1', description: 'Transport Mensuel', amount: 85, category: 'Transport', recurrence: 'monthly', dayOfMonth: 2, startDate: '2024-01-01', lastProcessedDate: '2024-07-02' }
    ],
    debts: [
        { id: 'debt1', name: 'Prêt étudiant', amount: 12000, interestRate: 2.5, dueDate: '2028-09-01' },
        { id: 'debt2', name: 'Marge de crédit', amount: 3500, interestRate: 7.2, dueDate: '2025-01-01' },
    ],
    investments: [
        { id: 'inv1', name: 'Immobilier Locatif (Alger)', amount: 75000, country: 'Algeria', sector: 'Immobilier', expectedReturn: 8, duration: 10, riskLevel: 'Medium' },
        { id: 'inv2', name: 'Fonds indiciel Sharia-compliant', amount: 15000, country: 'Canada', sector: 'Finance Islamique (Sukuk)', expectedReturn: 6, duration: 5, riskLevel: 'Low' },
    ],
    loansAndBorrows: [
        { id: 'lb1', type: 'loan', personName: 'Frère Ahmed', amount: 1000, description: 'Avance pour projet', date: '2024-05-10', dueDate: '2024-12-31'},
        { id: 'lb2', type: 'borrow', personName: 'Père', amount: 2000, description: 'Aide pour mise de fonds', date: '2023-01-15'},
    ],
    goals: [
        { id: 'goal1', name: 'Fonds d\'urgence', targetAmount: 10000, currentAmount: 6500, targetDate: '2025-12-31' },
        { id: 'goal2', name: 'Hadj', targetAmount: 15000, currentAmount: 2500, targetDate: '2028-01-01' },
    ],
    zakatInfo: {
        goldInGrams: 50,
        assets: [
            { id: 'za1', name: 'Épargne liquide', value: 8000 }
        ],
        debts: [
            { id: 'zd1', name: 'Dette à court terme', amount: 1500 }
        ],
        paymentHistory: []
    },
    settings: {
        cadToDzdRate: 100,
        goldPricePerGram: 95,
    },
};