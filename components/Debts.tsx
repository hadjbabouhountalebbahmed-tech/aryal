import React, { useState, useMemo } from 'react';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions } from '../hooks/useFinancials.ts';
// Fix: added .ts extension
import { Debt } from '../types.ts';
import Card from './shared/Card.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const EditDebtModal: React.FC<{ debt: Debt | null, onClose: () => void }> = ({ debt, onClose }) => {
    const { addDebt, updateDebt } = useFinancialsActions();
    const notifier = useNotifier();
    const [name, setName] = useState(debt?.name || '');
    const [amount, setAmount] = useState(debt?.amount.toString() || '');
    const [interestRate, setInterestRate] = useState(debt?.interestRate.toString() || '');
    const [dueDate, setDueDate] = useState(debt?.dueDate || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const debtData = { 
            name, 
            amount: parseFloat(amount), 
            interestRate: parseFloat(interestRate),
            dueDate 
        };
        if (debt && debt.id) {
            updateDebt({ ...debtData, id: debt.id });
            notifier.success(`Dette "${name}" mise à jour.`);
        } else {
            addDebt(debtData);
            notifier.success(`Dette "${name}" ajoutée.`);
        }
        onClose();
    };

    if (!debt) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{debt.id ? 'Modifier' : 'Ajouter'} une Dette</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nom de la dette</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Montant total (CAD)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Taux d'intérêt (%)</label>
                        <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date d'échéance</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
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

const Debts: React.FC = () => {
    const { debts, settings } = useFinancialsState();
    const { removeDebt } = useFinancialsActions();
    const notifier = useNotifier();
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    const { cadToDzdRate } = settings;

    const totalDebt = useMemo(() => debts.reduce((sum, item) => sum + item.amount, 0), [debts]);
    const averageInterestRate = useMemo(() => {
        if (debts.length === 0) return 0;
        const totalWeightedInterest = debts.reduce((sum, item) => sum + (item.amount * item.interestRate), 0);
        const totalAmount = debts.reduce((sum, item) => sum + item.amount, 0);
        if (totalAmount === 0) return 0;
        return totalWeightedInterest / totalAmount;
    }, [debts]);

    const handleRemove = (debt: Debt) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la dette "${debt.name}" ?`)) {
            removeDebt(debt.id);
            notifier.info(`Dette "${debt.name}" supprimée.`);
        }
    };
    
    const EmptyState = () => (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Aucune dette enregistrée</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Commencez par ajouter votre première dette pour suivre vos remboursements.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {editingDebt && <EditDebtModal debt={editingDebt} onClose={() => setEditingDebt(null)} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card title="Total des Dettes">
                    <p className="text-3xl font-bold text-red-500">{totalDebt.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {(totalDebt * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </Card>
                 <Card title="Taux d'intérêt moyen pondéré">
                    <p className="text-3xl font-bold text-secondary-500">{averageInterestRate.toFixed(2)}%</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pondéré par le montant de la dette</p>
                </Card>
            </div>


            <Card title="Gestion des Dettes">
                <button 
                    onClick={() => setEditingDebt({ id: '', name: '', amount: 0, interestRate: 0, dueDate: new Date().toISOString().split('T')[0] })} 
                    className="w-full mb-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Ajouter une nouvelle dette
                </button>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {debts.length > 0 ? debts.map(debt => (
                        <div key={debt.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                            <div className="flex-1 mb-2 md:mb-0">
                                <p className="font-bold text-lg text-primary-800 dark:text-primary-200">{debt.name}</p>
                                <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    <span className="mr-4"><strong>Montant:</strong> {debt.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                    <span className="mr-4"><strong>Taux:</strong> {debt.interestRate}%</span>
                                    <span><strong>Échéance:</strong> {new Date(debt.dueDate).toLocaleDateString('fr-CA')}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 self-end md:self-center">
                                <button onClick={() => setEditingDebt(debt)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Modifier">✏️</button>
                                <button onClick={() => handleRemove(debt)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Supprimer">🗑️</button>
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

export default Debts;