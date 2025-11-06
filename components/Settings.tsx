import React, { useState } from 'react';
// Fix: added .ts and .tsx extensions
import { useFinancialsState, useFinancialsActions } from '../hooks/useFinancials.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import Card from './shared/Card.tsx';
import { useNotifier } from '../contexts/NotificationContext.tsx';
import Spinner from './shared/Spinner.tsx';

const Settings: React.FC = () => {
    const { settings } = useFinancialsState();
    const { updateSettings } = useFinancialsActions();
    const { changePassword, resetPasswordAndData } = useAuth();
    const notifier = useNotifier();

    const [cadToDzdRate, setCadToDzdRate] = useState(settings.cadToDzdRate.toString());
    const [goldPricePerGram, setGoldPricePerGram] = useState(settings.goldPricePerGram.toString());
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        const rate = parseFloat(cadToDzdRate);
        const price = parseFloat(goldPricePerGram);

        if (isNaN(rate) || isNaN(price) || rate <= 0 || price <= 0) {
            notifier.error("Veuillez entrer des valeurs numériques valides et positives.");
            return;
        }
        setIsSaving(true);
        try {
            updateSettings({ cadToDzdRate: rate, goldPricePerGram: price });
            notifier.success("Paramètres sauvegardés.");
        } catch (error) {
             notifier.error("La sauvegarde a échoué.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            notifier.error("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        if (newPassword.length < 8) {
             notifier.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setIsChangingPass(true);
        try {
            await changePassword(oldPassword, newPassword);
            notifier.success("Mot de passe changé avec succès !");
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            notifier.error((error as Error).message);
        } finally {
            setIsChangingPass(false);
        }
    };

    const ResetConfirmationModal: React.FC = () => {
        const [confirmText, setConfirmText] = useState('');
        const CONFIRM_KEYWORD = 'SUPPRIMER';

        if (!isResetModalOpen) return null;

        const handleConfirm = async () => {
            await resetPasswordAndData();
            // The app will lock, so this component will unmount. No need for further state changes.
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Réinitialisation Complète</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Vous êtes sur le point de <strong>supprimer définitivement toutes vos données</strong> de cette application. Cette action est irréversible.
                    </p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Pour confirmer, tapez <strong className="font-mono text-red-500">{CONFIRM_KEYWORD}</strong>
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsResetModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Annuler</button>
                        <button onClick={handleConfirm} disabled={confirmText !== CONFIRM_KEYWORD} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed">
                            Oui, tout supprimer
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
             <ResetConfirmationModal />
            <Card title="Paramètres Généraux">
                <form onSubmit={handleSettingsSave} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Taux de change CAD vers DZD</label>
                            <input type="number" step="any" value={cadToDzdRate} onChange={e => setCadToDzdRate(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Prix de l'or par gramme (CAD)</label>
                            <input type="number" step="any" value={goldPricePerGram} onChange={e => setGoldPricePerGram(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300 flex items-center justify-center" disabled={isSaving}>
                            {isSaving ? <Spinner /> : 'Sauvegarder les paramètres'}
                        </button>
                    </div>
                </form>
            </Card>

            <Card title="Sécurité">
                 <form onSubmit={handleChangePassword} className="space-y-4">
                    <h4 className="font-semibold text-lg">Changer le mot de passe</h4>
                    <div>
                        <label className="block text-sm font-medium">Ancien mot de passe</label>
                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nouveau mot de passe</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Confirmer le nouveau mot de passe</label>
                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300 flex items-center justify-center" disabled={isChangingPass}>
                            {isChangingPass ? <Spinner /> : 'Changer le mot de passe'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <h4 className="font-semibold text-lg text-red-700 dark:text-red-400">Zone de Danger</h4>
                     <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold">Réinitialiser l'application</p>
                            <p className="text-sm text-red-800 dark:text-red-200">Ceci supprimera toutes vos données financières de façon permanente.</p>
                        </div>
                        <button onClick={() => setIsResetModalOpen(true)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300">
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;