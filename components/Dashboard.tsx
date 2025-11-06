import React, { useMemo, useState } from 'react';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions } from '../hooks/useFinancials.ts';
import Card from './shared/Card.tsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import HadjInsights from './HadjInsights.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const Dashboard: React.FC = () => {
    const financials = useFinancialsState();
    const { updateGoldInGrams } = useFinancialsActions();
    const notifier = useNotifier();
    const [isGoldModalOpen, setIsGoldModalOpen] = useState(false);
    const [goldGrams, setGoldGrams] = useState(financials.zakatInfo.goldInGrams.toString());

    const { incomes, expenses, debts, investments, settings, zakatInfo } = financials;
    const { cadToDzdRate, goldPricePerGram } = settings;

    const goldValue = useMemo(() => zakatInfo.goldInGrams * goldPricePerGram, [zakatInfo.goldInGrams, goldPricePerGram]);

    const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
    const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
    const totalDebts = useMemo(() => debts.reduce((sum, item) => sum + item.amount, 0), [debts]);
    
    const totalAssets = useMemo(() => {
        const investmentValue = investments.reduce((sum, item) => sum + item.amount, 0);
        const zakatAssetsValue = zakatInfo.assets.reduce((sum, asset) => sum + asset.value, 0);
        return investmentValue + zakatAssetsValue + goldValue;
    }, [investments, zakatInfo.assets, goldValue]);
    
    const netWorth = totalAssets - totalDebts;
    const cashFlow = totalIncome - totalExpenses;

    const cashFlowData = [{ name: 'Flux de trésorerie', revenus: totalIncome, depenses: totalExpenses }];
    
    const expenseByCategory = useMemo(() => {
        const grouped: { [key: string]: number } = {};
        expenses.forEach(expense => {
            if (!grouped[expense.category]) {
                grouped[expense.category] = 0;
            }
            grouped[expense.category] += expense.amount;
        });
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [expenses]);
    
    const COLORS = ['#058778', '#12d1b2', '#5ef7d8', '#92fae6', '#c6fef3'];

    const handleOpenGoldModal = () => {
        setGoldGrams(zakatInfo.goldInGrams.toString());
        setIsGoldModalOpen(true);
    };

    const handleSaveGold = (e: React.FormEvent) => {
        e.preventDefault();
        const newGrams = parseFloat(goldGrams);
        if (!isNaN(newGrams) && newGrams >= 0) {
            updateGoldInGrams(newGrams);
            notifier.success("Quantité d'or mise à jour.");
            setIsGoldModalOpen(false);
        } else {
            notifier.error("Veuillez entrer une valeur numérique valide.");
        }
    };
    
    const EditGoldModal = () => {
         if (!isGoldModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" onClick={() => setIsGoldModalOpen(false)}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-4">Modifier la quantité d'Or</h3>
                    <form onSubmit={handleSaveGold} className="space-y-4">
                        <div>
                            <label htmlFor="gold-grams-input" className="block text-sm font-medium">Quantité d'or (grammes)</label>
                            <input
                                id="gold-grams-input"
                                type="number"
                                value={goldGrams}
                                onChange={e => setGoldGrams(e.target.value)}
                                required
                                autoFocus
                                step="any"
                                min="0"
                                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <button type="button" onClick={() => setIsGoldModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Annuler</button>
                            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Sauvegarder</button>
                        </div>
                    </form>
                </div>
                 <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}} .animate-fade-in{animation:fade-in .2s ease-out forwards} @keyframes scale-in{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}} .animate-scale-in{animation:scale-in .2s ease-out forwards}`}</style>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <EditGoldModal />
            <HadjInsights />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card title="Actif Total">
                    <p className="text-3xl font-bold text-primary-500">{totalAssets.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {(totalAssets * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </Card>
                <Card title={`Or (${zakatInfo.goldInGrams}g)`}>
                    <div className="relative">
                        <p className="text-3xl font-bold text-yellow-500">{goldValue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ≈ {(goldValue * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <button 
                            onClick={handleOpenGoldModal}
                            className="absolute -top-1 -right-1 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            aria-label="Modifier la quantité d'or"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                            </svg>
                        </button>
                    </div>
                </Card>
                <Card title="Total des Dettes">
                    <p className="text-3xl font-bold text-red-500">{totalDebts.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {(totalDebts * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </Card>
                <Card title="Actif Net">
                     <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-500' : 'text-yellow-500'}`}>{netWorth.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {(netWorth * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </Card>
                <Card title="Flux de Trésorerie Mensuel">
                    <p className={`text-3xl font-bold ${cashFlow >= 0 ? 'text-secondary-500' : 'text-red-500'}`}>{cashFlow.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ≈ {(cashFlow * cadToDzdRate).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                     <Card title="Aperçu: Revenus vs Dépenses">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={cashFlowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickFormatter={(value) => `${value/1000}k`} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(value: number) => value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}/>
                                <Legend />
                                <Bar dataKey="revenus" fill="#07aa94" name="Revenus" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="depenses" fill="#f59e0b" name="Dépenses" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                     </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card title="Aperçu: Répartition des Dépenses">
                         <ResponsiveContainer width="100%" height={300}>
                             <PieChart>
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                     {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}/>
                                <Legend />
                            </PieChart>
                         </ResponsiveContainer>
                     </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;