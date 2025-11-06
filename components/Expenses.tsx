import React, { useState, useMemo } from 'react';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions, useCategories } from '../hooks/useFinancials.ts';
// Fix: added .ts extension
import { Expense, RecurringExpense } from '../types.ts';
import Card from './shared/Card.tsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const EditExpenseModal: React.FC<{ expense: Expense | null, onClose: () => void }> = ({ expense, onClose }) => {
    const { addExpense, updateExpense } = useFinancialsActions();
    const { getExpenseCategories } = useCategories();
    const notifier = useNotifier();
    const isEditing = !!expense;

    const [category, setCategory] = useState(expense?.category || '');
    const [description, setDescription] = useState(expense?.description || '');
    const [amount, setAmount] = useState(expense?.amount.toString() || '');
    const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);

    const expenseCategoriesList = getExpenseCategories();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData = { category, description, amount: parseFloat(amount), date };
        if (isEditing && expense) {
            updateExpense({ ...expenseData, id: expense.id });
            notifier.success(`Dépense "${description}" mise à jour.`);
        } else {
            addExpense(expenseData);
            notifier.success(`Dépense "${description}" ajoutée.`);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{isEditing ? 'Modifier' : 'Ajouter'} une Dépense</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">Catégorie</label>
                        <input 
                            type="text" 
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            required 
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            list="expense-categories-list"
                        />
                         <datalist id="expense-categories-list">
                            {expenseCategoriesList.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
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
             <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}} .animate-fade-in{animation:fade-in .2s ease-out forwards} @keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}} .animate-scale-in{animation:scale-in .2s ease-out forwards}`}</style>
        </div>
    );
};

const EditRecurringExpenseModal: React.FC<{ expense: RecurringExpense | null, onClose: () => void }> = ({ expense, onClose }) => {
    const { addRecurringExpense, updateRecurringExpense } = useFinancialsActions();
    const { getExpenseCategories } = useCategories();
    const notifier = useNotifier();
    const isEditing = !!expense;

    const [description, setDescription] = useState(expense?.description || '');
    const [amount, setAmount] = useState(expense?.amount.toString() || '');
    const [category, setCategory] = useState(expense?.category || '');
    const [dayOfMonth, setDayOfMonth] = useState(expense?.dayOfMonth?.toString() || '1');
    const [startDate, setStartDate] = useState(expense?.startDate || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(expense?.endDate || '');

    const expenseCategoriesList = getExpenseCategories();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData = {
            description,
            amount: parseFloat(amount),
            category,
            recurrence: 'monthly' as 'monthly',
            dayOfMonth: parseInt(dayOfMonth),
            startDate,
            endDate: endDate || undefined
        };

        if (isEditing && expense) {
            updateRecurringExpense({ ...expenseData, id: expense.id, lastProcessedDate: expense.lastProcessedDate });
            notifier.success(`Dépense récurrente "${description}" mise à jour.`);
        } else {
            addRecurringExpense(expenseData);
            notifier.success(`Dépense récurrente "${description}" ajoutée.`);
        }
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{isEditing ? 'Modifier' : 'Ajouter'} une Dépense Récurrente</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Description</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Montant</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Catégorie</label>
                            <input 
                                type="text" 
                                value={category} 
                                onChange={e => setCategory(e.target.value)} 
                                required 
                                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                list="expense-categories-list"
                            />
                            <datalist id="expense-categories-list">
                                {expenseCategoriesList.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Jour du mois</label>
                            <input type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Date de début</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Date de fin (optionnel)</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Sauvegarder</button>
                    </div>
                </form>
            </div>
             <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}} .animate-fade-in{animation:fade-in .2s ease-out forwards} @keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}} .animate-scale-in{animation:scale-in .2s ease-out forwards}`}</style>
        </div>
    );
};


type ModalState = 
    | { type: 'CLOSED' }
    | { type: 'ADD_EXPENSE' }
    | { type: 'EDIT_EXPENSE', data: Expense }
    | { type: 'ADD_RECURRING' }
    | { type: 'EDIT_RECURRING', data: RecurringExpense };

const Expenses: React.FC = () => {
    const { expenses, recurringExpenses, settings } = useFinancialsState();
    const { removeExpense, removeRecurringExpense } = useFinancialsActions();
    const notifier = useNotifier();
    const [modal, setModal] = useState<ModalState>({ type: 'CLOSED' });

    const { cadToDzdRate } = settings;

    const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
    
    const expenseByCategory = useMemo(() => {
        const grouped: { [key: string]: number } = {};
        expenses.forEach(expense => {
            if (!grouped[expense.category]) {
                grouped[expense.category] = 0;
            }
            grouped[expense.category] += expense.amount;
        });
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [expenses]);
    
    const COLORS = ['#058778', '#12d1b2', '#5ef7d8', '#92fae6', '#c6fef3', '#07aa94', '#f59e0b'];

    const handleCloseModal = () => setModal({ type: 'CLOSED' });

    const handleRemoveExpense = (exp: Expense) => {
         if (window.confirm(`Êtes-vous sûr de vouloir supprimer la dépense "${exp.description}" ?`)) {
            removeExpense(exp.id);
            notifier.info(`Dépense "${exp.description}" supprimée.`);
        }
    };
    
    const handleRemoveRecurring = (rec: RecurringExpense) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la dépense récurrente "${rec.description}" ?`)) {
            removeRecurringExpense(rec.id);
            notifier.info(`Dépense récurrente "${rec.description}" supprimée.`);
        }
    };
    
    const EmptyState = () => (
         <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Aucune dépense enregistrée</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Commencez par ajouter votre première dépense.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {(modal.type === 'ADD_EXPENSE' || modal.type === 'EDIT_EXPENSE') && (
                <EditExpenseModal 
                    expense={modal.type === 'EDIT_EXPENSE' ? modal.data : null}
                    onClose={handleCloseModal}
                />
            )}
             {(modal.type === 'ADD_RECURRING' || modal.type === 'EDIT_RECURRING') && (
                <EditRecurringExpenseModal 
                    expense={modal.type === 'EDIT_RECURRING' ? modal.data : null}
                    onClose={handleCloseModal}
                />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Total des Dépenses">
                        <p className="text-3xl font-bold text-red-500">{totalExpenses.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ≈ {(totalExpenses * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </Card>
                </div>
                 <div className="lg:col-span-3">
                     <Card title="Répartition des Dépenses par Catégorie">
                         <ResponsiveContainer width="100%" height={200}>
                             <PieChart>
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                     {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}/>
                                <Legend />
                            </PieChart>
                         </ResponsiveContainer>
                     </Card>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="Dépenses Récurrentes">
                    <button 
                        onClick={() => setModal({ type: 'ADD_RECURRING' })} 
                        className="w-full mb-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                    >
                        Ajouter une dépense récurrente
                    </button>
                     <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                        {recurringExpenses.map(rec => (
                            <div key={rec.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="font-semibold">{rec.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {rec.amount.toLocaleString('fr-CA', {currency: 'CAD', style: 'currency'})} chaque {rec.dayOfMonth} du mois
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => setModal({ type: 'EDIT_RECURRING', data: rec })} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Modifier">✏️</button>
                                     <button onClick={() => handleRemoveRecurring(rec)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Supprimer">🗑️</button>
                                </div>
                            </div>
                        ))}
                     </div>
                </Card>

                <Card title="Toutes les Transactions de Dépenses">
                    <button 
                        onClick={() => setModal({ type: 'ADD_EXPENSE' })} 
                        className="w-full mb-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Ajouter une dépense unique
                    </button>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                        {expenses.length > 0 ? expenses.map(exp => (
                            <div key={exp.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                <div className="flex-1 mb-2 md:mb-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-lg text-primary-800 dark:text-primary-200">{exp.description}</p>
                                        {exp.sourceRecurringId && <span title="Généré automatiquement">🔄</span>}
                                    </div>
                                    <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        <span className="mr-4"><strong>Montant:</strong> {exp.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                        <span className="mr-4"><strong>Catégorie:</strong> {exp.category}</span>
                                        <span><strong>Date:</strong> {new Date(exp.date).toLocaleDateString('fr-CA')}</span>
                                    </div>
                                </div>
                                {!exp.sourceRecurringId && (
                                <div className="flex gap-2 self-end md:self-center">
                                    <button onClick={() => setModal({ type: 'EDIT_EXPENSE', data: exp })} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Modifier">✏️</button>
                                    <button onClick={() => handleRemoveExpense(exp)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Supprimer">🗑️</button>
                                </div>
                                )}
                            </div>
                        )) : (
                            <EmptyState />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Expenses;