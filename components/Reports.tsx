import React, { useState } from 'react';
// Fix: added .ts extension
import { useFinancialsState } from '../hooks/useFinancials.ts';
import { generatePdfReport } from '../services/reportService.ts';
import Card from './shared/Card.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const Reports: React.FC = () => {
    const financials = useFinancialsState();
    const notifier = useNotifier();

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            notifier.error("Veuillez sélectionner une date de début et une date de fin.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            notifier.error("La date de début ne peut pas être postérieure à la date de fin.");
            return;
        }

        setIsLoading(true);
        try {
            // This is a synchronous operation but can be slow on huge datasets,
            // so we simulate loading to give user feedback.
            setTimeout(() => {
                generatePdfReport(financials, startDate, endDate);
                notifier.success("Votre rapport a été généré avec succès !");
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error("Failed to generate report:", error);
            notifier.error("Une erreur est survenue lors de la génération du rapport.");
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card title="Générateur de Rapports Financiers">
                <div className="space-y-6 p-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Sélectionnez une période pour générer un rapport PDF détaillé de vos finances. Le rapport inclura un résumé, la liste de vos revenus, dépenses, investissements et dettes pour la période choisie.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date de début
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading || !startDate || !endDate}
                        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 flex items-center justify-center text-lg font-semibold"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                Génération en cours...
                            </>
                        ) : 'Générer et Télécharger le Rapport (PDF)'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Reports;