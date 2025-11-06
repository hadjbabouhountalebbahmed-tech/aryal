import React, { useState } from 'react';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions, useCategories } from '../hooks/useFinancials.ts';
import { analyzeInvestment } from '../services/geminiService.ts';
// Fix: added .ts extension
import { Investment, HadjAnalysis, InvestmentCountry } from '../types.ts';
import Card from './shared/Card.tsx';
import Spinner from './shared/Spinner.tsx';

const InvestmentCard: React.FC<{ investment: Investment }> = ({ investment }) => {
    const financials = useFinancialsState();
    const [analysis, setAnalysis] = useState<HadjAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis(null);
        try {
            const result = await analyzeInvestment(investment, financials);
            if(result) {
                setAnalysis(result);
            } else {
                setError("L'analyse a échoué. Vérifiez votre clé API et la console.");
            }
        } catch (e) {
            setError("Une erreur est survenue lors de l'analyse.");
            console.error(e);
        }
        setIsLoading(false);
    };

    const recommendationColor = analysis?.isRecommended ? 'text-secondary-500' : 'text-red-500';
    const recommendationBg = analysis?.isRecommended ? 'bg-secondary-100 dark:bg-secondary-900' : 'bg-red-100 dark:bg-red-900';

    return (
        <Card title={investment.name}>
            <div className="space-y-2 text-sm">
                <p><strong>Montant:</strong> {investment.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                <p><strong>Pays:</strong> {investment.country}</p>
                 <p><strong>Secteur:</strong> {investment.sector}</p>
                <p><strong>Rendement Attendu:</strong> {investment.expectedReturn}%</p>
                <p><strong>Risque:</strong> {investment.riskLevel}</p>
                {investment.shariaComplianceNotes && <p><strong>Notes Conformité:</strong> {investment.shariaComplianceNotes}</p>}
            </div>
            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 flex items-center justify-center"
            >
                {isLoading ? <Spinner /> : 'Analyser avec IA'}
            </button>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            {analysis && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                    <h4 className={`text-lg font-bold text-center p-2 rounded ${recommendationBg} ${recommendationColor}`}>
                        Recommandation: {analysis.recommendation}
                    </h4>
                    <div>
                        <h5 className="font-semibold">Rentabilité:</h5>
                        <p className="text-sm">{analysis.profitability}</p>
                    </div>
                     <div>
                        <h5 className="font-semibold">Analyse de Risque:</h5>
                        <p className="text-sm">{analysis.risk}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold">Règle Hadj & Charia:</h5>
                        <ul className="list-disc list-inside text-sm">
                           <li>{analysis.hadjRule.debtToEquity}</li>
                           <li>{analysis.hadjRule.returnOnInvestment}</li>
                           <li>{analysis.hadjRule.ribaFree}</li>
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};

const AddInvestmentForm: React.FC = () => {
    const { addInvestment } = useFinancialsActions();
    const { getInvestmentSectors } = useCategories();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [country, setCountry] = useState<InvestmentCountry>('Canada');
    const [expectedReturn, setExpectedReturn] = useState('');
    const [duration, setDuration] = useState('');
    const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [sector, setSector] = useState('');
    const [shariaComplianceNotes, setShariaComplianceNotes] = useState('');

    const investmentSectorsList = getInvestmentSectors();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newInvestment = {
            name,
            amount: parseFloat(amount),
            country,
            expectedReturn: parseFloat(expectedReturn),
            duration: parseInt(duration),
            riskLevel,
            sector,
            shariaComplianceNotes
        };
        addInvestment(newInvestment);
        // Reset form
        setName('');
        setAmount('');
        setCountry('Canada');
        setExpectedReturn('');
        setDuration('');
        setRiskLevel('Medium');
        setSector('');
        setShariaComplianceNotes('');
    };

    return (
        <Card title="Ajouter un nouvel investissement">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Nom du projet</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Montant (CAD)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Secteur d'activité</label>
                        <input 
                            type="text" 
                            value={sector} 
                            onChange={e => setSector(e.target.value)} 
                            placeholder="Ex: Immobilier, Technologie" 
                            required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            list="investment-sectors-list"
                        />
                        <datalist id="investment-sectors-list">
                           {investmentSectorsList.map(sec => <option key={sec} value={sec} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Rendement attendu (%)</label>
                        <input type="number" value={expectedReturn} onChange={e => setExpectedReturn(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Durée (années)</label>
                        <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Niveau de risque</label>
                        <select value={riskLevel} onChange={e => setRiskLevel(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pays</label>
                        <select value={country} onChange={e => setCountry(e.target.value as any)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600">
                            <option>Canada</option>
                            <option>Algeria</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Notes sur la conformité (Charia)</label>
                    <textarea value={shariaComplianceNotes} onChange={e => setShariaComplianceNotes(e.target.value)} rows={3} placeholder="Ex: Sans intérêt (Riba), certifié Halal..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-secondary-600 text-white py-2 px-6 rounded-lg hover:bg-secondary-700">
                        Ajouter l'investissement
                    </button>
                </div>
            </form>
        </Card>
    );
};


const Investments: React.FC = () => {
    const { investments } = useFinancialsState();

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map(inv => (
                    <InvestmentCard key={inv.id} investment={inv} />
                ))}
            </div>
            <div className="mt-8">
                <AddInvestmentForm />
            </div>
        </div>
    );
};

export default Investments;