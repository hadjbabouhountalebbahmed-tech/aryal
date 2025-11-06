
import React, { useState, useEffect } from 'react';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import { Expense, RecurringExpense } from '../types.ts';
import { expenseCategories } from '../data/categories.ts';
import Card from './shared/Card.tsx';
import FormModal from './shared/FormModal.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const Expenses: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();
    const notifier = useNotifier();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Expense | RecurringExpense | null>(null);

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: Expense | RecurringExpense) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };
    
    const handleDelete = async (itemToDelete: Expense | RecurringExpense) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;

        let newExpenses = financials.expenses;
        let newRecurringExpenses = financials.recurringExpenses;

        if ('recurrence' in itemToDelete) {
             newRecurringExpenses = financials.recurringExpenses.filter(item => item.id !== itemToDelete.id);
        } else {
            newExpenses = financials.expenses.filter(item => item.id !== itemToDelete.id);
        }
        
        await updateFinancials({ ...financials, expenses: newExpenses, recurringExpenses: newRecurringExpenses });
        notifier.success("Dépense supprimée.");
    };

    const handleSubmit = async (formData: any) => {
        const isRecurring = !!formData.isRecurring;
        const wasRecurring = editingItem ? 'recurrence' in editingItem : false;
        
        let newExpenses = [...financials.expenses];
        let newRecurringExpenses = [...financials.recurringExpenses];
        
        if (editingItem) { // --- UPDATE LOGIC ---
            if (wasRecurring && !isRecurring) { // Convert Recurring -> Single
                newRecurringExpenses = newRecurringExpenses.filter(i => i.id !== editingItem.id);
                const newItem: Expense = {
                    id: editingItem.id,
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    category: formData.category,
                    date: formData.startDate,
                };
                newExpenses.push(newItem);
                notifier.success("Dépense convertie en ponctuelle.");
            } else if (!wasRecurring && isRecurring) { // Convert Single -> Recurring
                newExpenses = newExpenses.filter(i => i.id !== editingItem.id);
                const startDate = formData.date;
                const newItem: RecurringExpense = {
                    id: editingItem.id,
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    category: formData.category,
                    recurrence: 'monthly',
                    dayOfMonth: new Date(startDate).getDate(),
                    startDate: startDate,
                    endDate: formData.endDate || undefined,
                    lastProcessedDate: startDate,
                };
                newRecurringExpenses.push(newItem);
                notifier.success("Dépense convertie en récurrente.");
            } else if (isRecurring) { // Update Recurring
                const updatedItem: RecurringExpense = {
                    ...(editingItem as RecurringExpense),
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    category: formData.category,
                    startDate: formData.startDate,
                    endDate: formData.endDate || undefined,
                    dayOfMonth: new Date(formData.startDate).getDate(),
                };
                newRecurringExpenses = newRecurringExpenses.map(i => i.id === updatedItem.id ? updatedItem : i);
                notifier.success("Dépense récurrente mise à jour.");
            } else { // Update Single
                const updatedItem: Expense = {
                    ...(editingItem as Expense),
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    category: formData.category,
                    date: formData.date,
                };
                newExpenses = newExpenses.map(i => i.id === updatedItem.id ? updatedItem : i);
                notifier.success("Dépense mise à jour.");
            }
        } else { // --- ADD LOGIC ---
             if (isRecurring) {
                const startDate = formData.date;
                const newItem: RecurringExpense = {
                    id: crypto.randomUUID(),
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    category: formData.category,
                    recurrence: 'monthly',
                    dayOfMonth: new Date(startDate).getDate(),
                    startDate: startDate,
                    endDate: formData.endDate || undefined,
                    lastProcessedDate: startDate,
                };
                newRecurringExpenses.push(newItem);
                notifier.success("Dépense récurrente ajoutée.");
            } else {
                const newItem: Expense = {
                    id: crypto.randomUUID(),
                    description: formData.description,
                    amount: parseFloat(formData.amount) || 0,
                    category: formData.category,
                    date: formData.date,
                };
                newExpenses.push(newItem);
                notifier.success("Dépense ajoutée.");
            }
        }
        await updateFinancials({ ...financials, expenses: newExpenses, recurringExpenses: newRecurringExpenses });
    };

    return (
        <>
            <Card title="Gestion des Dépenses">
                <div className="flex justify-end mb-4">
                    <button onClick={handleOpenAddModal} className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                        Ajouter une Dépense
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold mb-2 border-b dark:border-gray-700 pb-1">Dépenses Récurrentes</h4>
                        <div className="space-y-3">
                            {financials.recurringExpenses.length > 0 ? (
                                financials.recurringExpenses.map(item => <RecurringExpenseItem key={item.id} item={item} onEdit={handleOpenEditModal} onDelete={handleDelete} />)
                            ) : (
                                <p className="text-center text-gray-500 py-4">Aucune dépense récurrente.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-2 border-b dark:border-gray-700 pb-1">Dépenses Ponctuelles</h4>
                        <div className="space-y-3">
                            {financials.expenses.length > 0 ? (
                                financials.expenses.map(item => <ExpenseItem key={item.id} item={item} onEdit={handleOpenEditModal} onDelete={handleDelete} />)
                            ) : (
                                <p className="text-center text-gray-500 py-4">Aucune dépense ponctuelle pour ce mois.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
            {isModalOpen && 
                <ExpenseFormModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    onSubmit={handleSubmit} 
                    initialData={editingItem}
                />
            }
        </>
    );
};

// --- Child Components for Rendering Items ---

const ExpenseItem: React.FC<{item: Expense, onEdit: (i: Expense) => void, onDelete: (i: Expense) => void}> = ({ item, onEdit, onDelete }) => (
    <div className="p-3 border rounded-lg dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex-grow">
            <span className="font-semibold">{item.description}</span>
            <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <span className="font-bold text-red-500 text-lg">{item.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
            <div className="flex-shrink-0 flex gap-1">
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                <button onClick={() => onDelete(item)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
            </div>
        </div>
    </div>
);

const RecurringExpenseItem: React.FC<{item: RecurringExpense, onEdit: (i: RecurringExpense) => void, onDelete: (i: RecurringExpense) => void}> = ({ item, onEdit, onDelete }) => (
    <div className="p-3 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex-grow">
            <span className="font-semibold">{item.description}</span>
            <p className="text-sm text-gray-500">{item.category} (Le {item.dayOfMonth} de chaque mois)</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <span className="font-bold text-red-500 text-lg">{item.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
            <div className="flex-shrink-0 flex gap-1">
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                <button onClick={() => onDelete(item)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
            </div>
        </div>
    </div>
);

// --- Custom Form Modal for Expenses ---
interface ExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData: Expense | RecurringExpense | null;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditingRecurring = initialData ? 'recurrence' in initialData : false;
    const [formData, setFormData] = useState({
        description: initialData?.description || '',
        category: initialData?.category || '',
        amount: initialData?.amount.toString() || '',
        date: (initialData && !isEditingRecurring) ? (initialData as Expense).date : new Date().toISOString().split('T')[0],
        isRecurring: isEditingRecurring,
        startDate: (initialData && isEditingRecurring) ? (initialData as RecurringExpense).startDate : new Date().toISOString().split('T')[0],
        endDate: (initialData && isEditingRecurring) ? (initialData as RecurringExpense).endDate || '' : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    const title = initialData ? "Modifier la Dépense" : "Ajouter une Dépense";
    const dateFieldLabel = formData.isRecurring ? "Date de début" : "Date";
    const dateFieldName = formData.isRecurring ? "startDate" : "date";
    const dateFieldValue = formData.isRecurring ? formData.startDate : formData.date;

    return (
        <FormModal isOpen={isOpen} onClose={onClose} onSubmit={handleFormSubmit} title={title} initialData={null} fields={[]}>
             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input name="description" value={formData.description} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                        <option value="">Sélectionner...</option>
                        {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Montant</label>
                    <input name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">{dateFieldLabel}</label>
                    <input name={dateFieldName} type="date" value={dateFieldValue} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="flex items-center gap-2">
                    <input id="isRecurring" name="isRecurring" type="checkbox" checked={formData.isRecurring} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <label htmlFor="isRecurring" className="text-sm font-medium">Dépense récurrente</label>
                </div>
                {formData.isRecurring && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Date de fin (optionnel)</label>
                        <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                )}
            </div>
        </FormModal>
    );
};

// We need a custom implementation of FormModal's body for conditional logic,
// so we pass children to a modified base FormModal
declare module './shared/FormModal.tsx' {
    interface FormModalProps<T> {
        children?: React.ReactNode;
    }
}

export default Expenses;