import React, { useState } from 'react';
import { useApi } from '../contexts/ApiContext.tsx';
import Spinner from './shared/Spinner.tsx';

const ApiKeyModal: React.FC = () => {
    const { isApiKeyModalOpen, closeApiKeyModal, setApiKey } = useApi();
    const [key, setKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isApiKeyModalOpen) {
        return null;
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim()) {
            setError("La clé API ne peut pas être vide.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await setApiKey(key);
            closeApiKeyModal();
        } catch (err) {
            setError("Cette clé API semble invalide. Veuillez vérifier et réessayer.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleClose = () => {
        setKey('');
        setError(null);
        setIsSaving(false);
        closeApiKeyModal();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Configurer la Clé API Gemini</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Pour utiliser les fonctionnalités d'IA de Hadj Finance, vous devez fournir votre propre clé API Google Gemini.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Vous pouvez en obtenir une gratuitement sur{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        Google AI Studio
                    </a>.
                </p>
                
                <form onSubmit={handleSave}>
                    <div className="mb-4">
                        <label htmlFor="apiKey" className="block text-sm font-medium mb-1">Votre Clé API</label>
                        <input
                            id="apiKey"
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Entrez votre clé API ici"
                            autoFocus
                        />
                    </div>
                     {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
                        >
                            {isSaving ? <><Spinner /> <span className="ml-2">Sauvegarde...</span></> : 'Sauvegarder la Clé'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyModal;
