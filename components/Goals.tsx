
import React from 'react';
import EditableSection from './shared/EditableSection.tsx';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import { FormFieldConfig, FinancialGoal } from '../types.ts';

const fields: FormFieldConfig[] = [
    { name: 'name', label: 'Nom de l\'objectif', type: 'text', required: true },
    { name: 'targetAmount', label: 'Montant Cible', type: 'number', required: true, min: 1, step: '0.01' },
    { name: 'currentAmount', label: 'Montant Actuel', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'targetDate', label: 'Date Cible', type: 'date', required: true },
];

const ItemRenderer = (goal: FinancialGoal, onEdit: (item: FinancialGoal) => void, onDelete: (id: string) => void) => {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    return (
        <div key={goal.id} className="p-3 border rounded-lg dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-1">
                <span className="font-semibold">{goal.name}</span>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-400">{Math.round(progress)}%</span>
                    <button onClick={() => onEdit(goal)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                    <button onClick={() => onDelete(goal.id)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div className="bg-primary-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-sm mt-1 text-gray-600 dark:text-gray-400">
                <span>{goal.currentAmount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                <span>{goal.targetAmount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
            </div>
        </div>
    );
};

const Goals: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();

    const handleAdd = async (newItemData: Omit<FinancialGoal, 'id'>) => {
        const newItem = { ...newItemData, id: crypto.randomUUID() };
        await updateFinancials({ ...financials, goals: [...financials.goals, newItem] });
    };

    const handleUpdate = async (updatedItem: FinancialGoal) => {
        const newItems = financials.goals.map(item => item.id === updatedItem.id ? updatedItem : item);
        await updateFinancials({ ...financials, goals: newItems });
    };

    const handleDelete = async (id: string) => {
        const newItems = financials.goals.filter(item => item.id !== id);
        await updateFinancials({ ...financials, goals: newItems });
    };

    return (
        <EditableSection<FinancialGoal>
            title="Gestion des Objectifs Financiers"
            items={financials.goals}
            fields={fields}
            itemRenderer={ItemRenderer}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            addModalTitle="Ajouter un Objectif"
            editModalTitle="Modifier l'Objectif"
            emptyStateMessage="Vous n'avez pas encore défini d'objectif."
        />
    );
};

export default Goals;