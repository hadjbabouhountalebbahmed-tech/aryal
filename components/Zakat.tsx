
import React, { useState } from 'react';
import Card from './shared/Card.tsx';
import FormModal from './shared/FormModal.tsx';
import { useFinancialsState, useFinancialsUpdater } from '../hooks/useFinancials.ts';
import { ZakatAsset, ZakatDebt, FormFieldConfig } from '../types.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';

type ModalState = {
    isOpen: boolean;
    type: 'asset' | 'debt' | 'gold' | null;
    data: ZakatAsset | ZakatDebt | { goldInGrams: number } | null;
}

const Zakat: React.FC = () => {
    const financials = useFinancialsState();
    const { zakatInfo, settings } = financials;
    const updateFinancials = useFinancialsUpdater();
    const notifier = useNotifier();

    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null, data: null });

    // Zakat Calculation Logic
    const NISSAB_GOLD_GRAMS = 85;
    const ZAKAT_RATE = 0.025;
    const nissabValue = NISSAB_GOLD_GRAMS * settings.goldPricePerGram;
    const totalAssets = zakatInfo.assets.reduce((sum, asset) => sum + asset.value, 0) + (zakatInfo.goldInGrams * settings.goldPricePerGram);
    const totalDebts = zakatInfo.debts.reduce((sum, debt) => sum + debt.amount, 0);
    const zakatableAmount = totalAssets - totalDebts;
    const isNissabReached = zakatableAmount >= nissabValue;
    const zakatDue = isNissabReached ? zakatableAmount * ZAKAT_RATE : 0;

    const handleOpenModal = (type: 'asset' | 'debt' | 'gold', data: any | null = null) => {
        setModalState({ isOpen: true, type, data });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, type: null, data: null });
    };

    const handleDelete = async (type: 'asset' | 'debt', id: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
        
        let newZakatInfo = { ...zakatInfo };
        if (type === 'asset') {
            newZakatInfo.assets = zakatInfo.assets.filter(a => a.id !== id);
        } else {
            newZakatInfo.debts = zakatInfo.debts.filter(d => d.id !== id);
        }
        await updateFinancials({ ...financials, zakatInfo: newZakatInfo });
        notifier.success("Élément supprimé.");
    };

    const handleSubmit = async (formData: any) => {
        const { type, data } = modalState;
        let newZakatInfo = { ...zakatInfo };

        if (type === 'gold') {
            newZakatInfo.goldInGrams = parseFloat(formData.goldInGrams) || 0;
        } else if (type === 'asset') {
            if (data) { // Editing
                newZakatInfo.assets = zakatInfo.assets.map(a => a.id === (data as ZakatAsset).id ? { ...a, ...formData } : a);
            } else { // Adding
                newZakatInfo.assets.push({ ...formData, id: crypto.randomUUID() });
            }
        } else if (type === 'debt') {
             if (data) { // Editing
                newZakatInfo.debts = zakatInfo.debts.map(d => d.id === (data as ZakatDebt).id ? { ...d, ...formData } : d);
            } else { // Adding
                newZakatInfo.debts.push({ ...formData, id: crypto.randomUUID() });
            }
        }
        
        await updateFinancials({ ...financials, zakatInfo: newZakatInfo });
        notifier.success("Données Zakat mises à jour.");
    };

    const getModalConfig = (): { fields: FormFieldConfig[], title: string } => {
        switch (modalState.type) {
            case 'gold': return {
                title: 'Modifier la quantité d\'or',
                fields: [{ name: 'goldInGrams', label: 'Or (grammes)', type: 'number', required: true, min: 0 }]
            };
            case 'asset': return {
                title: modalState.data ? "Modifier l'Actif" : "Ajouter un Actif",
                fields: [
                    { name: 'name', label: 'Nom de l\'actif', type: 'text', required: true },
                    { name: 'value', label: 'Valeur (CAD)', type: 'number', required: true, min: 0 }
                ]
            };
            case 'debt': return {
                title: modalState.data ? 'Modifier la Dette' : 'Ajouter une Dette',
                fields: [
                    { name: 'name', label: 'Nom de la dette', type: 'text', required: true },
                    { name: 'amount', label: 'Montant (CAD)', type: 'number', required: true, min: 0 }
                ]
            };
            default: return { fields: [], title: '' };
        }
    };

    const { fields, title } = getModalConfig();

    return (
        <>
            <Card title="Calcul de la Zakat">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Cette page est un simulateur basé sur vos données et ne remplace pas l'avis d'un savant qualifié.</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Actifs Zakatable</h4>
                            <button onClick={() => handleOpenModal('asset')} className="text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 px-2 py-1 rounded hover:bg-primary-200">+</button>
                        </div>
                        <ul className="space-y-2">
                            {zakatInfo.assets.map(asset => (
                                <li key={asset.id} className="flex justify-between items-center group">
                                    <span>{asset.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span>{asset.value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                        <button onClick={() => handleOpenModal('asset', asset)} className="p-1 text-gray-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">✏️</button>
                                        <button onClick={() => handleDelete('asset', asset.id)} className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                    </div>
                                </li>
                            ))}
                            <li className="flex justify-between items-center group">
                                <span>Or ({zakatInfo.goldInGrams}g)</span>
                                <div className="flex items-center gap-2">
                                    <span>{(zakatInfo.goldInGrams * settings.goldPricePerGram).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                    <button onClick={() => handleOpenModal('gold', { goldInGrams: zakatInfo.goldInGrams })} className="p-1 text-gray-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">✏️</button>
                                </div>
                            </li>
                        </ul>
                        <hr className="my-2 dark:border-gray-700"/>
                        <p className="flex justify-between font-bold"><span>Total Actifs</span><span>{totalAssets.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span></p>
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Dettes Déductibles</h4>
                            <button onClick={() => handleOpenModal('debt')} className="text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 px-2 py-1 rounded hover:bg-primary-200">+</button>
                        </div>
                        <ul className="space-y-2">
                            {zakatInfo.debts.map(debt => (
                                <li key={debt.id} className="flex justify-between items-center group">
                                    <span>{debt.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span>({debt.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })})</span>
                                        <button onClick={() => handleOpenModal('debt', debt)} className="p-1 text-gray-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">✏️</button>
                                        <button onClick={() => handleDelete('debt', debt.id)} className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <hr className="my-2 dark:border-gray-700"/>
                        <p className="flex justify-between font-bold"><span>Total Dettes</span><span>({totalDebts.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })})</span></p>
                    </div>
                </div>
                <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <p className="flex justify-between"><span>Montant Zakatable Net</span> <strong>{zakatableAmount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</strong></p>
                    <p className="flex justify-between mt-2"><span>Nissab (seuil) actuel</span> <span>{nissabValue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span></p>
                    
                    {isNissabReached ? (
                        <div className="mt-4 p-4 text-center bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <p className="font-semibold text-green-800 dark:text-green-200">Le Nissab est atteint. Montant de la Zakat à payer :</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{zakatDue.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 text-center bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                            <p className="font-semibold text-yellow-800 dark:text-yellow-200">Le Nissab n'est pas atteint. Aucune Zakat n'est due cette année.</p>
                        </div>
                    )}
                </div>
            </Card>
            {modalState.isOpen && (
                 <FormModal
                    isOpen={modalState.isOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    initialData={modalState.data}
                    fields={fields}
                    title={title}
                />
            )}
        </>
    );
};

export default Zakat;
