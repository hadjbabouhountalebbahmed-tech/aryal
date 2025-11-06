
import React, { useState } from 'react';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import Card from './shared/Card.tsx';
import HadjInsights from './HadjInsights.tsx';
import FormModal from './shared/FormModal.tsx';
import { Investment, FormFieldConfig, InvestmentCountry, InvestmentRiskLevel } from '../types.ts';
import { investmentSectors } from '../data/categories.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const investmentFields: FormFieldConfig[] = [
    { name: 'name', label: 'Nom de l\'investissement', type: 'text', required: true },
    { name: 'amount', label: 'Montant Investi (CAD)', type: 'number', required: true, min: 0, step: '0.01' },
    { name: 'country', label: 'Pays', type: 'select', required: true, options: ['Canada', 'Algeria', 'Other'] as InvestmentCountry[] },
    { name: 'sector', label: 'Secteur', type: 'select', required: true, options: investmentSectors },
    { name: 'expectedReturn', label: 'Rendement Attendu (%)', type: 'number', required: true, min: 0, step: '0.1' },
    { name: 'duration', label: 'Durée (années)', type: 'number', required: true, min: 1 },
    { name: 'riskLevel', label: 'Niveau de Risque', type: 'select', required: true, options: ['Low', 'Medium', 'High'] as InvestmentRiskLevel[] },
    { name: 'shariaComplianceNotes', label: 'Notes de Conformité Charia', type: 'textarea', placeholder: 'ex: Certifié par XYZ, exempt d\'intérêt...' }
];

const Investments: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();
    const notifier = useNotifier();

    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    
    const handleOpenAddModal = () => {
        setEditingInvestment(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (investment: Investment) => {
        setEditingInvestment(investment);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet investissement ?')) {
            const newItems = financials.investments.filter(item => item.id !== id);
            await updateFinancials({ ...financials, investments: newItems });
            if (selectedInvestment?.id === id) {
                setSelectedInvestment(null);
            }
            notifier.success("Investissement supprimé.");
        }
    };

    const handleSubmit = async (data: Investment) => {
        try {
            if (editingInvestment) {
                const updatedItem = { ...editingInvestment, ...data };
                const newItems = financials.investments.map(item => item.id === updatedItem.id ? updatedItem : item);
                await updateFinancials({ ...financials, investments: newItems });
                notifier.success("Investissement mis à jour.");
            } else {
                const newItem = { ...data, id: crypto.randomUUID() };
                await updateFinancials({ ...financials, investments: [...financials.investments, newItem] });
                notifier.success("Investissement ajouté.");
            }
        } catch (error) {
            notifier.error("Erreur lors de la sauvegarde.");
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Portefeuille d'Investissements">
                        <div className="flex justify-end mb-4">
                            <button onClick={handleOpenAddModal} className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                                Ajouter un Investissement
                            </button>
                        </div>
                        <div className="space-y-4">
                            {financials.investments.map(inv => (
                                <div key={inv.id} className="p-4 rounded-lg border dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{inv.name}</h4>
                                        <p className="text-sm text-gray-500">{inv.sector} - {inv.country}</p>
                                    </div>
                                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{inv.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                                            <button onClick={() => setSelectedInvestment(inv)} className="text-sm text-primary-600 hover:underline">
                                                Analyser
                                            </button>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-1">
                                             <button onClick={() => handleOpenEditModal(inv)} className="p-1 text-gray-500 hover:text-blue-500">✏️</button>
                                            <button onClick={() => handleDelete(inv.id)} className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                             {financials.investments.length === 0 && <p className="text-center text-gray-500 py-4">Vous n'avez pas encore d'investissements.</p>}
                        </div>
                    </Card>
                </div>
                <div>
                    {selectedInvestment ? (
                        <HadjInsights investment={selectedInvestment} onClose={() => setSelectedInvestment(null)} />
                    ) : (
                        <Card title="Analyse d'Investissement">
                            <p className="text-center text-gray-500 p-8">Sélectionnez un investissement pour obtenir une analyse de Hadj.</p>
                        </Card>
                    )}
                </div>
            </div>
             <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingInvestment}
                fields={investmentFields}
                title={editingInvestment ? "Modifier l'Investissement" : "Ajouter un Investissement"}
            />
        </>
    );
};

export default Investments;