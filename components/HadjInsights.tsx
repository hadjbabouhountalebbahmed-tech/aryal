import React, { useState, useEffect } from 'react';
// Fix: added .ts extension
import { useFinancialsState } from '../hooks/useFinancials.ts';
import { getDashboardInsights } from '../services/geminiService.ts';
// Fix: added .ts extension
import { DashboardInsight } from '../types.ts';
import Card from './shared/Card.tsx';
import Spinner from './shared/Spinner.tsx';

const Insight: React.FC<{ insight: DashboardInsight }> = ({ insight }) => {
    const typeClasses = {
        info: {
            icon: 'ℹ️',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            text: 'text-blue-800 dark:text-blue-200'
        },
        warning: {
            icon: '⚠️',
            bg: 'bg-yellow-50 dark:bg-yellow-900/30',
            text: 'text-yellow-800 dark:text-yellow-200'
        },
        success: {
            icon: '✅',
            bg: 'bg-green-50 dark:bg-green-900/30',
            text: 'text-green-800 dark:text-green-200'
        },
    };

    const classes = typeClasses[insight.type] || typeClasses.info;

    return (
        <div className={`p-4 rounded-lg flex items-start gap-4 ${classes.bg}`}>
            <span className="text-xl mt-1">{classes.icon}</span>
            <div>
                <h4 className={`font-bold ${classes.text}`}>{insight.title}</h4>
                <p className={`text-sm ${classes.text}`}>{insight.suggestion}</p>
            </div>
        </div>
    );
};

const HadjInsights: React.FC = () => {
    const financials = useFinancialsState();
    const [insights, setInsights] = useState<DashboardInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError('');
            try {
                const results = await getDashboardInsights(financials);
                setInsights(results);
            } catch (e) {
                setError("Erreur lors de la récupération des aperçus de l'IA.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, [financials]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <Spinner />
                    <p>Hadj analyse votre situation...</p>
                </div>
            );
        }
        if (error) {
            return <p className="text-red-500 text-center">{error}</p>;
        }
        if (insights.length === 0) {
            return <p className="text-gray-500 dark:text-gray-400 text-center">Aucun aperçu disponible pour le moment.</p>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                    <Insight key={index} insight={insight} />
                ))}
            </div>
        );
    };

    return (
        <Card title="Aperçus de Hadj">
            {renderContent()}
        </Card>
    );
};

export default HadjInsights;