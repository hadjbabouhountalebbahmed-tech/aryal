
import React from 'react';
import EditableSection from './shared/EditableSection.tsx';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import { FormFieldConfig, LoanAndBorrow } from '../types.ts';

const fields: FormFieldConfig[] = [
    { name: 'type', label: 'Type', type: 'select', required: true, options: [{value: 'loan', label: 'Prêt (argent que j\'ai prêté)'}, {value: 'borrow', label: 'Emprunt (argent que j\'ai emprunté)'}] },
    { name: 'personName', label: 'Nom de la personne', type: 'text', required: true },
    { name: 'amount', label: 'Montant', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'description', label: 'Description', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'dueDate', label: 'Date d\'échéance (optionnel)', type: 'date' },
];

const ItemRenderer = (item: LoanAndBorrow, onEdit: (item: LoanAndBorrow) => void, onDelete: (id: string) => void) => (
    <div key={item.id} className="p-3 border rounded-lg dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex-grow w-full">
            <span className="font-semibold">{item.type === 'loan' ? 'Prêt à' : 'Emprunt de'} {item.personName}</span>
            <p className="text-xs text-gray-500">{item.description}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <span className={`font-bold text-lg ${item.type === 'loan' ? 'text-blue-500' : 'text-orange-500'}`}>
                {item.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
            </span>
            <div className="flex-shrink-0 flex gap-1">
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
            </div>
        </div>
    </div>
);

const LoansAndBorrows: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();

     const handleAdd = async (newItemData: Omit<LoanAndBorrow, 'id'>) => {
        const newItem = { ...newItemData, id: crypto.randomUUID() };
        await updateFinancials({ ...financials, loansAndBorrows: [...financials.loansAndBorrows, newItem] });
    };

    const handleUpdate = async (updatedItem: LoanAndBorrow) => {
        const newItems = financials.loansAndBorrows.map(item => item.id === updatedItem.id ? updatedItem : item);
        await updateFinancials({ ...financials, loansAndBorrows: newItems });
    };

    const handleDelete = async (id: string) => {
        const newItems = financials.loansAndBorrows.filter(item => item.id !== id);
        await updateFinancials({ ...financials, loansAndBorrows: newItems });
    };

    return (
        <EditableSection<LoanAndBorrow>
            title="Prêts & Emprunts"
            items={financials.loansAndBorrows}
            fields={fields}
            itemRenderer={ItemRenderer}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            addModalTitle="Ajouter une transaction"
            editModalTitle="Modifier la transaction"
        />
    );
};

export default LoansAndBorrows;