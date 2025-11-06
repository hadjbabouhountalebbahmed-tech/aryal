import React, { useState, useMemo } from 'react';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions } from '../hooks/useFinancials.ts';
import Card from './shared/Card.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';

const Zakat: React.FC = () => {
    const { zakatInfo, settings } = useFinancialsState();
    const { addZakatAsset, removeZakatAsset, addZakatDebt, removeZakatDebt, updateGoldInGrams } = useFinancialsActions();
    const { assets, debts, paymentHistory, goldInGrams } = zakatInfo;
    const { goldPricePerGram, cadToDzdRate } = settings;
    const notifier = useNotifier();

    const [assetName, setAssetName] = useState('');
    const [assetValue, setAssetValue] = useState('');
    const [debtName, setDebtName] = useState('');
    const [debtAmount, setDebtAmount] = useState('');
    const [goldAmount, setGoldAmount] = useState(goldInGrams.toString());

    const goldValue = useMemo(() => goldInGrams * goldPricePerGram, [goldInGrams, goldPricePerGram]);
    const nisab = useMemo(() => goldPricePerGram * 85, [goldPricePerGram]);
    const totalAssets = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0) + goldValue, [assets, goldValue]);
    const totalDebts = useMemo(() => debts.reduce((sum, debt) => sum + debt.amount, 0), [debts]);
    const zakatableWealth = useMemo(() => Math.max(0, totalAssets - totalDebts), [totalAssets, totalDebts]);
    const isNisabMet = useMemo(() => zakatableWealth >= nisab, [zakatableWealth, nisab]);
    const zakatDue = useMemo(() => isNisabMet ? zakatableWealth * 0.025 : 0, [isNisabMet, zakatableWealth]);

    const handleAddAsset = (e: React.FormEvent) => {
        e.preventDefault();
        if (assetName && assetValue) {
            addZakatAsset({ name: assetName, value: parseFloat(assetValue) });
            setAssetName('');
            setAssetValue('');
        }
    };

    const handleAddDebt = (e: React.FormEvent) => {
        e.preventDefault();
        if (debtName && debtAmount) {
            addZakatDebt({ name: debtName, amount: parseFloat(debtAmount) });
            setDebtName('');
            setDebtAmount('');
        }
    };
    
     const handleSaveGold = () => {
        const grams = parseFloat(goldAmount);
        if (!isNaN(grams)) {
            updateGoldInGrams(grams);
            notifier.success('Quantité d\'or mise à jour.');
        } else {
            notifier.error('Veuillez entrer une valeur numérique pour l\'or.');
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Gestion de l'Or">
                     <div className="flex items-center gap-4">
                        <div className="flex-grow">
                            <label htmlFor="goldInGrams" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Quantité d'or que vous possédez (en grammes)
                            </label>
                            <input
                                type="number"
                                id="goldInGrams"
                                value={goldAmount}
                                onChange={(e) => setGoldAmount(e.target.value)}
                                className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                placeholder="ex: 85"
                            />
                        </div>
                        <button onClick={handleSaveGold} className="mt-6 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                            Sauvegarder
                        </button>
                    </div>
                </Card>
                <Card title="Gestion des Actifs et Dettes pour la Zakat">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Assets Management */}
                        <div>
                            <h4 className="font-semibold mb-2">Autres Actifs Zakatable</h4>
                            <form onSubmit={handleAddAsset} className="flex gap-2 mb-2">
                                <input type="text" placeholder="Nom de l'actif" value={assetName} onChange={e => setAssetName(e.target.value)} className="flex-grow p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                                <input type="number" placeholder="Valeur" value={assetValue} onChange={e => setAssetValue(e.target.value)} className="w-24 p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                                <button type="submit" className="bg-secondary-600 text-white p-2 rounded-md flex-shrink-0">+</button>
                            </form>
                            <ul className="space-y-1 text-sm">
                                {assets.map(asset => (
                                    <li key={asset.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <span>{asset.name}: {asset.value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                        <button onClick={() => removeZakatAsset(asset.id)} className="text-red-500">X</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Debts Management */}
                        <div>
                           <h4 className="font-semibold mb-2">Dettes Déductibles (Court terme)</h4>
                           <form onSubmit={handleAddDebt} className="flex gap-2 mb-2">
                                <input type="text" placeholder="Nom de la dette" value={debtName} onChange={e => setDebtName(e.target.value)} className="flex-grow p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                                <input type="number" placeholder="Montant" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="w-24 p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                                <button type="submit" className="bg-secondary-600 text-white p-2 rounded-md flex-shrink-0">+</button>
                            </form>
                             <ul className="space-y-1 text-sm">
                                {debts.map(debt => (
                                    <li key={debt.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <span>{debt.name}: {debt.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                        <button onClick={() => removeZakatDebt(debt.id)} className="text-red-500">X</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
                 <Card title="Historique des Paiements de Zakat">
                     {paymentHistory.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {paymentHistory.map(p => (
                                <li key={p.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                     <span>Date: {p.date}</span>
                                     <strong>{p.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</strong>
                                </li>
                            ))}
                        </ul>
                     ) : <p className="text-sm text-gray-500">Aucun paiement enregistré.</p>}
                 </Card>
            </div>

            <div className="lg:col-span-1">
                 <Card title="Calcul de la Zakat">
                     <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Seuil (Nisab)</p>
                            <p className="text-xl font-bold">{nisab.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">≈ {(nisab * cadToDzdRate).toLocaleString('fr-CA', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            <p className="text-xs text-gray-400 mt-1">(Basé sur 85g d'or à {goldPricePerGram}/g)</p>
                        </div>
                         <hr className="dark:border-gray-700"/>
                        <div className="flex justify-between text-sm">
                            <span>Total Actifs</span>
                            <div className="text-right">
                                <strong>{totalAssets.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</strong>
                                <p className="text-xs text-gray-500 dark:text-gray-400">≈ {(totalAssets * cadToDzdRate).toLocaleString('fr-CA', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Total Dettes</span> 
                            <div className="text-right">
                                <strong>({totalDebts.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })})</strong>
                                <p className="text-xs text-gray-500 dark:text-gray-400">≈ ({(totalDebts * cadToDzdRate).toLocaleString('fr-CA', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })})</p>
                            </div>
                        </div>
                         <hr className="dark:border-gray-700"/>
                        <div className="flex justify-between font-semibold">
                            <span>Richesse Nette</span>
                             <div className="text-right">
                                <span>{zakatableWealth.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">≈ {(zakatableWealth * cadToDzdRate).toLocaleString('fr-CA', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                        
                        {isNisabMet ? (
                            <p className="text-sm text-center text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900 rounded">✅ Le seuil du Nisab est atteint.</p>
                        ) : (
                            <p className="text-sm text-center text-red-500 p-2 bg-red-50 dark:bg-red-900 rounded">❌ Le seuil du Nisab n'est pas atteint.</p>
                        )}

                        <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-center">
                            <h4 className="text-lg font-semibold text-primary-800 dark:text-primary-200">Zakat Annuelle à Payer</h4>
                            <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 mt-2">
                                {zakatDue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                            </p>
                            <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
                                ≈ {(zakatDue * cadToDzdRate).toLocaleString('fr-CA', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default Zakat;