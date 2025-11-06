import React, { useState, useMemo } from 'react';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions, useCategories } from '../hooks/useFinancials.ts';
// Fix: added .ts extension
import { Income } from '../types.ts';
import Card from './shared/Card.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const EditIncomeModal: React.FC<{ income: Income | null, onClose: () => void }> = ({ income, onClose }) => {
    const { addIncome, updateIncome } = useFinancialsActions();
    const { getIncomeSources } = useCategories();
    const notifier = useNotifier();
    const [source, setSource] = useState(income?.source || '');
    const [amount, setAmount] = useState(income?.amount.toString() || '');
    const [date, setDate] = useState(income?.date || new Date().toISOString().split('T')[0]);

    const incomeSourcesList = getIncomeSources();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const incomeData = { source, amount: parseFloat(amount), date };
        if (income && income.id) {
            updateIncome({ ...incomeData, id: income.id });
            notifier.success(`Revenu de "${source}" mis à jour.`);
        } else {
            addIncome(incomeData);
            notifier.success(`Revenu de "${source}" ajouté.`);
        }
        onClose();
    };

    if (!income) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{income.id ? 'Modifier' : 'Ajouter'} un Revenu</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">Source</label>
                        <input 
                            type="text" 
                            value={source} 
                            onChange={e => setSource(e.target.value)} 
                            required 
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            list="income-sources-list"
                        />
                        <datalist id="income-sources-list">
                           {incomeSourcesList.map(src => <option key={src} value={src} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Montant</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
             <style>{`
                @keyframes fade-in{from{opacity:0}to{opacity:1}} .animate-fade-in{animation:fade-in .2s ease-out forwards} 
                @keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}} .animate-scale-in{animation:scale-in .2s ease-out forwards}
             `}</style>
        </div>
    );
};


const Incomes: React.FC = () => {
    const { incomes, settings } = useFinancialsState();
    const { removeIncome } = useFinancialsActions();
    const notifier = useNotifier();
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);

    const { cadToDzdRate } = settings;

    const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
    const averageIncome = useMemo(() => incomes.length > 0 ? totalIncome / incomes.length : 0, [incomes, totalIncome]);

    const handleRemove = (income: Income) => {
         if (window.confirm(`Êtes-vous sûr de vouloir supprimer le revenu de "${income.source}" ?`)) {
            removeIncome(income.id);
            notifier.info(`Revenu de "${income.source}" supprimé.`);
        }
    }
    
    const EmptyState = () => (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V3m0 8h8m-8 0l-8 8" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Aucun revenu enregistré</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Commencez par ajouter votre première source de revenu.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {editingIncome && <EditIncomeModal income={editingIncome} onClose={() => setEditingIncome(null)} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card title="Total des Revenus">
                    <p className="text-3xl font-bold text-green-500">{totalIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {(totalIncome * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </Card>
                 <Card title="Revenu Moyen par Transaction">
                    <p className="text-3xl font-bold text-primary-500">{averageIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Basé sur {incomes.length} transactions</p>
                </Card>
            </div>


            <Card title="Gestion des Revenus">
                <button 
                    onClick={() => setEditingIncome({ id: '', source: '', amount: 0, date: new Date().toISOString().split('T')[0] })} 
                    className="w-full mb-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Ajouter un nouveau revenu
                </button>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {incomes.length > 0 ? incomes.map(inc => (
                        <div key={inc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                            <div className="flex-1 mb-2 md:mb-0">
                                <p className="font-bold text-lg text-primary-800 dark:text-primary-200">{inc.source}</p>
                                <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    <span className="mr-4"><strong>Montant:</strong> {inc.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                    <span><strong>Date:</strong> {new Date(inc.date).toLocaleDateString('fr-CA')}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 self-end md:self-center">
                                <button onClick={() => setEditingIncome(inc)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Modifier">✏️</button>
                                <button onClick={() => handleRemove(inc)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Supprimer">🗑️</button>
                            </div>
                        </div>
                    )) : (
                        <EmptyState />
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Incomes;