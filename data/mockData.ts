// Fix: added .ts extension
import { Financials } from '../types.ts';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
const tenthDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0];
const fifteenthDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0];

export const mockData: Financials = {
    incomes: [
        { id: 'inc1', source: 'Salaire', amount: 5000, date: fifteenthDayOfMonth },
        { id: 'inc2', source: 'Freelance', amount: 750, date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0] }
    ],
    expenses: [
        { id: 'exp1', category: 'Logement', description: 'Loyer', amount: 1500, date: firstDayOfMonth },
        { id: 'exp2', category: 'Nourriture', description: 'Épicerie', amount: 450, date: tenthDayOfMonth },
        { id: 'exp3', category: 'Transport', description: 'Passe de bus', amount: 100, date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString().split('T')[0] }
    ],
    recurringExpenses: [
      { id: 'recexp1', description: 'Abonnement Netflux', amount: 15.99, category: 'Loisirs', recurrence: 'monthly', dayOfMonth: 10, startDate: '2024-01-01' }
    ],
    debts: [
        { id: 'debt1', name: 'Prêt étudiant', amount: 15000, interestRate: 3.5, dueDate: '2030-01-01' },
        { id: 'debt2', name: 'Carte de crédit', amount: 2500, interestRate: 19.9, dueDate: '2025-01-01' }
    ],
    investments: [
        { id: 'inv1', name: 'CELI - FNB indiciel', amount: 10000, country: 'Canada', sector: 'Finance', expectedReturn: 7, duration: 10, riskLevel: 'Medium' }
    ],
    settings: {
        cadToDzdRate: 100,
        goldPricePerGram: 100
    },
    zakatInfo: {
        goldInGrams: 0,
        assets: [
            { id: 'zasset1', name: 'Épargne liquide', value: 5000 }
        ],
        debts: [],
        paymentHistory: []
    }
};
