import React, { useEffect, useState } from 'react';
import { Investment, HadjAnalysis } from '../types.ts';
import { useApi } from '../contexts/ApiContext.tsx';
import { useFinancialsState } from '../hooks/useFinancials.ts';
import { analyzeInvestment } from '../services/geminiService.ts';
import Card from './shared/Card.tsx';
import Spinner from './shared/Spinner.tsx';

interface HadjInsightsProps {
    investment: Investment;
    onClose: () => void;
}

const HadjInsights: React.FC<HadjInsightsProps> = ({ investment, onClose }) => {
    const { ai, isApiAvailable, openApiKeyModal } = useApi();
    const financials = useFinancialsState();
    const [analysis, setAnalysis] = useState<HadjAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isApiAvailable) {
            return;
        }

        const getAnalysis = async () => {
            if (!ai || !financials) {
                setError("Les données financières ne sont pas disponibles.");
                return;
            }
            setIsLoading(true);
            setError(null);
            setAnalysis(null);
            try {
                const result = await analyzeInvestment(ai, investment, financials);
                setAnalysis(result);
            } catch (err) {
                setError("Une erreur est survenue lors de l'analyse.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        getAnalysis();
    }, [investment, ai, financials, isApiAvailable]);

    return (
        <Card title={`Analyse pour: ${investment.name}`} className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl font-bold">&times;</button>
            <div className="p-2">
                {!isApiAvailable ? (
                    <div className="text-center p-8">
                        <p className="text-yellow-600 dark:text-yellow-400 mb-4">Le service IA n'est pas configuré pour l'analyse.</p>
                        <button onClick={openApiKeyModal} className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                            Configurer la clé API
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /> <span className="ml-2">Analyse en cours...</span></div>
                ) : error ? (
                    <p className="text-red-500 text-center p-4">{error}</p>
                ) : analysis ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-400">Recommandation</h4>
                            <p className={`text-xl font-bold ${analysis.isRecommended ? 'text-green-500' : 'text-red-500'}`}>{analysis.recommendation}</p>
                        </div>
                         <hr className="dark:border-gray-700"/>
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-400">Rentabilité</h4>
                            <p className="text-sm">{analysis.profitability}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-400">Risque</h4>
                            <p className="text-sm">{analysis.risk}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-400">Conformité Charia</h4>
                             <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                <li><strong>Riba-Free:</strong> {analysis.hadjRule.ribaFree}</li>
                                <li><strong>Dette/Capitaux:</strong> {analysis.hadjRule.debtToEquity}</li>
                                <li><strong>ROI:</strong> {analysis.hadjRule.returnOnInvestment}</li>
                            </ul>
                        </div>
                    </div>
                ) : null}
            </div>
        </Card>
    );
};

export default HadjInsights;
