
import React from 'react';
import EditableSection from './shared/EditableSection.tsx';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import { FormFieldConfig, Income } from '../types.ts';

const incomeFields: FormFieldConfig[] = [
    { name: 'source', label: 'Source', type: 'text', required: true, placeholder: 'ex: Salaire' },
    { name: 'amount', label: 'Montant', type: 'number', required: true, placeholder: 'ex: 4500', min: 0, step: '0.01' },
    { name: 'date', label: 'Date', type: 'date', required: true },
];

const ItemRenderer = (item: Income, onEdit: (item: Income) => void, onDelete: (id: string) => void) => (
    <div key={item.id} className="p-3 border rounded-lg dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex-grow">
            <span className="font-semibold">{item.source}</span>
            <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('fr-CA')}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <span className="font-bold text-green-500 text-lg">{item.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
            <div className="flex-shrink-0 flex gap-1">
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
            </div>
        </div>
    </div>
);

const Incomes: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();

    const handleAdd = async (newItemData: Omit<Income, 'id'>) => {
        const newItem = { ...newItemData, id: crypto.randomUUID() };
        await updateFinancials({ ...financials, incomes: [...financials.incomes, newItem] });
    };
    
    const handleUpdate = async (updatedItem: Income) => {
        const newItems = financials.incomes.map(item => item.id === updatedItem.id ? updatedItem : item);
        await updateFinancials({ ...financials, incomes: newItems });
    };

    const handleDelete = async (id: string) => {
        const newItems = financials.incomes.filter(item => item.id !== id);
        await updateFinancials({ ...financials, incomes: newItems });
    };

    return (
        <EditableSection<Income>
            title="Gestion des Revenus"
            items={financials.incomes}
            fields={incomeFields}
            itemRenderer={ItemRenderer}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            addModalTitle="Ajouter un Revenu"
            editModalTitle="Modifier le Revenu"
        />
    );
};

export default Incomes;