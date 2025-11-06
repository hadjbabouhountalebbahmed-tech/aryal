import React, { useEffect, useState, useCallback } from 'react';
import { useFinancialsState } from '../hooks/useFinancials.ts';
import { useApi } from '../contexts/ApiContext.tsx';
import { getDashboardInsights } from '../services/geminiService.ts';
import { DashboardInsight } from '../types.ts';
import Card from './shared/Card.tsx';
import Spinner from './shared/Spinner.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const Dashboard: React.FC = () => {
    const financials = useFinancialsState();
    const { ai, isApiAvailable, openApiKeyModal } = useApi();
    const [insights, setInsights] = useState<DashboardInsight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const notifier = useNotifier();

    const fetchInsights = useCallback(async () => {
        if (!isApiAvailable) {
            notifier.error("Veuillez d'abord configurer votre clé API Gemini.", {
                label: 'Configurer',
                onClick: openApiKeyModal,
            });
            return;
        }
        if (ai && financials) {
            setIsLoading(true);
            try {
                const result = await getDashboardInsights(ai, financials);
                setInsights(result);
            } catch (error) {
                console.error("Failed to get dashboard insights:", error);
                notifier.error("Impossible de générer les aperçus. La clé API est peut-être invalide.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [ai, financials, isApiAvailable, notifier, openApiKeyModal]);

    useEffect(() => {
        if (isApiAvailable && insights.length === 0) {
            fetchInsights();
        }
    }, [isApiAvailable, insights.length, fetchInsights]);

    const totalIncome = financials.incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financials.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netFlow = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Aperçu du Mois</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Revenus Mensuels">
                    <p className="text-2xl sm:text-3xl font-bold text-green-500">{totalIncome.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                </Card>
                <Card title="Dépenses Mensuelles">
                    <p className="text-2xl sm:text-3xl font-bold text-red-500">{totalExpenses.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                </Card>
                <Card title="Flux de Trésorerie Net">
                    <p className={`text-2xl sm:text-3xl font-bold ${netFlow >= 0 ? 'text-primary-500' : 'text-yellow-500'}`}>{netFlow.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                </Card>
            </div>

            <Card title="Aperçus de Hadj ✨">
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Spinner /> <span className="ml-2">Analyse en cours...</span>
                    </div>
                ) : !isApiAvailable ? (
                     <div className="text-center p-4">
                        <p className="text-yellow-600 dark:text-yellow-400 mb-4">Le service IA n'est pas configuré.</p>
                        <button onClick={openApiKeyModal} className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                            Configurer la clé API
                        </button>
                    </div>
                ) : insights.length > 0 ? (
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.type === 'success' ? 'bg-green-50 dark:bg-gray-700 border-green-500' : insight.type === 'warning' ? 'bg-yellow-50 dark:bg-gray-700 border-yellow-500' : 'bg-blue-50 dark:bg-gray-700 border-blue-500'}`}>
                                <h4 className="font-bold">{insight.title}</h4>
                                <p>{insight.suggestion}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <p>Aucun aperçu n'a pu être généré.</p>
                        <button onClick={fetchInsights} className="mt-2 text-sm text-primary-600 hover:underline disabled:text-gray-400" disabled={isLoading}>
                            {isLoading ? "Chargement..." : "Générer les aperçus"}
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;