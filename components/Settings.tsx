import React, { useState } from 'react';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import Card from './shared/Card.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const Settings: React.FC = () => {
    const financials = useFinancialsState();
    const updateFinancials = useFinancialsUpdater();
    const notifier = useNotifier();

    const [cadToDzdRate, setCadToDzdRate] = useState(financials.settings.cadToDzdRate.toString());
    const [goldPricePerGram, setGoldPricePerGram] = useState(financials.settings.goldPricePerGram.toString());
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const newSettings = {
            cadToDzdRate: parseFloat(cadToDzdRate) || 0,
            goldPricePerGram: parseFloat(goldPricePerGram) || 0,
        };
        
        try {
            await updateFinancials({ ...financials, settings: newSettings });
            notifier.success("Paramètres sauvegardés avec succès !");
        } catch (error) {
            notifier.error("Erreur lors de la sauvegarde des paramètres.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <Card title="Paramètres Généraux">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Taux de change (1 CAD en DZD)</label>
                        <input
                            type="number"
                            value={cadToDzdRate}
                            onChange={(e) => setCadToDzdRate(e.target.value)}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Prix de l'or par gramme (CAD)</label>
                        <input
                            type="number"
                            value={goldPricePerGram}
                            onChange={(e) => setGoldPricePerGram(e.target.value)}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Utilisé pour le calcul du Nissab de la Zakat.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300"
                    >
                        {isSaving ? "Sauvegarde..." : "Sauvegarder les changements"}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
