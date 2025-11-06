import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifier } from '../contexts/NotificationContext';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

const ResetPasswordModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { resetPasswordAndData } = useAuth();
    const notifier = useNotifier();
    const [confirmText, setConfirmText] = useState('');
    const CONFIRM_KEYWORD = 'SUPPRIMER';
    const isConfirmed = confirmText === CONFIRM_KEYWORD;

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            await resetPasswordAndData();
            notifier.success("Application réinitialisée. Vous pouvez maintenant créer un nouveau mot de passe.");
            onClose();
        } catch (error) {
            notifier.error("La réinitialisation a échoué.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Attention : Réinitialisation de l'Application</h3>
                
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 mb-4 text-sm">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">Pourquoi la récupération n'est-elle pas possible ?</p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                        Pour votre sécurité, vos données sont chiffrées avec un mot de passe que vous êtes le seul à connaître. Il est donc impossible de le récupérer. La seule option en cas d'oubli est de tout réinitialiser.
                    </p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Cette action va <strong>supprimer définitivement toutes vos données financières</strong> de cet appareil. Vous pourrez ensuite créer un nouveau mot de passe et recommencer.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Veuillez taper <strong className="font-mono text-red-500">{CONFIRM_KEYWORD}</strong> pour confirmer.
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Annuler</button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isConfirmed}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
                    >
                        Supprimer mes données
                    </button>
                </div>
            </div>
        </div>
    );
};


const LockScreen: React.FC = () => {
    const { hasPasswordBeenSet, unlock, setPassword } = useAuth();
    const notifier = useNotifier();
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await unlock(pass);
        } catch (error) {
            notifier.error((error as Error).message);
        } finally {
            setIsLoading(false);
            setPass('');
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pass !== confirmPass) {
            notifier.error("Les mots de passe ne correspondent pas.");
            return;
        }
        if (pass.length < 8) {
            notifier.error("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        setIsLoading(true);
        try {
            await setPassword(pass);
            notifier.success("Votre coffre-fort financier est maintenant sécurisé !");
        } catch (error) {
            notifier.error("Impossible de définir le mot de passe.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
             <ResetPasswordModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">Hadj Finance</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">Votre Boussole Financière Sécurisée</p>
                </div>

                {hasPasswordBeenSet ? (
                    <Card title="Déverrouiller">
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Mot de passe</label>
                                <input
                                    type="password"
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 flex justify-center"
                            >
                                {isLoading ? <Spinner /> : 'Déverrouiller'}
                            </button>
                             <div className="text-center mt-4">
                                <a href="#" onClick={(e) => { e.preventDefault(); setIsResetModalOpen(true); }} className="text-sm text-primary-600 hover:underline">
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </form>
                    </Card>
                ) : (
                    <Card title="Créer votre mot de passe">
                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                           Bienvenue ! Veuillez créer un mot de passe pour chiffrer et protéger vos données.
                           <strong>Ce mot de passe ne peut pas être récupéré, ne l'oubliez pas !</strong>
                        </p>
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nouveau mot de passe (8+ caractères)</label>
                                <input
                                    type="password"
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-secondary-700 disabled:bg-secondary-300 flex justify-center"
                            >
                                {isLoading ? <Spinner /> : 'Sauvegarder et Démarrer'}
                            </button>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LockScreen;