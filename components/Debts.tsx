
import React from 'react';
import EditableSection from './shared/EditableSection.tsx';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import { FormFieldConfig, Debt } from '../types.ts';

const debtFields: FormFieldConfig[] = [
    { name: 'name', label: 'Nom de la dette', type: 'text', required: true, placeholder: 'ex: Prêt étudiant' },
    { name: 'amount', label: 'Montant Restant', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'interestRate', label: 'Taux d\'intérêt (%)', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'dueDate', label: 'Date d\'échéance', type: 'date', required: true },
];

const ItemRenderer = (item: Debt, onEdit: (item: Debt) => void, onDelete: (id: string) => void) => (
    <div key={item.id} className="p-3 border rounded-lg dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex-grow">
            <span className="font-semibold">{item.name}</span>
            <p className="text-sm text-gray-500">Taux: {item.interestRate}% | Échéance: {new Date(item.dueDate).toLocaleDateString('fr-CA')}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <span className="font-bold text-lg">{item.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
             <div className="flex-shrink-0 flex gap-1">
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
            </div>
        </div>
    </div>
);

const Debts: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();

     const handleAdd = async (newItemData: Omit<Debt, 'id'>) => {
        const newItem = { ...newItemData, id: crypto.randomUUID() };
        await updateFinancials({ ...financials, debts: [...financials.debts, newItem] });
    };

    const handleUpdate = async (updatedItem: Debt) => {
        const newItems = financials.debts.map(item => item.id === updatedItem.id ? updatedItem : item);
        await updateFinancials({ ...financials, debts: newItems });
    };

    const handleDelete = async (id: string) => {
        const newItems = financials.debts.filter(item => item.id !== id);
        await updateFinancials({ ...financials, debts: newItems });
    };

    return (
        <EditableSection<Debt>
            title="Gestion des Dettes"
            items={financials.debts}
            fields={debtFields}
            itemRenderer={ItemRenderer}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            addModalTitle="Ajouter une Dette"
            editModalTitle="Modifier la Dette"
        />
    );
};

export default Debts;