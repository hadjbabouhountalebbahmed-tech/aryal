import React, { useRef, useState } from 'react';
import Card from './shared/Card.tsx';
// Fix: added .ts extension
import { useFinancialsState, useFinancialsActions } from '../hooks/useFinancials.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';
// Fix: added .ts extension
import { Financials } from '../types.ts';
import { exportDataAsJson } from '../services/exportService.ts';

const ImportConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Confirmer l'Importation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Cette action est irréversible. Toutes vos données actuelles seront <strong>définitivement remplacées</strong> par les données du fichier de sauvegarde.
                </p>
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Êtes-vous certain de vouloir continuer ?
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        Oui, remplacer mes données
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};


const DataManagement: React.FC = () => {
    const financials = useFinancialsState();
    const { importData } = useFinancialsActions();
    const notifier = useNotifier();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dataToImport, setDataToImport] = useState<Financials | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleExport = () => {
        const result = exportDataAsJson(financials);
        if (result.success) {
            notifier.success("Exportation réussie ! Conservez ce fichier en lieu sûr.");
        } else {
            notifier.error(result.error || "L'exportation a échoué.");
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Le fichier est invalide.");
                }
                const parsedData = JSON.parse(text);

                // Basic validation
                if (parsedData.incomes && parsedData.expenses && parsedData.settings) {
                    setDataToImport(parsedData as Financials);
                    setIsModalOpen(true);
                } else {
                    throw new Error("Le fichier de sauvegarde semble corrompu ou mal formaté.");
                }

            } catch (error) {
                notifier.error((error as Error).message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input to allow re-uploading the same file
        event.target.value = '';
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const confirmImport = () => {
        if (dataToImport) {
            importData(dataToImport);
            notifier.success("Données importées avec succès !");
        }
        setIsModalOpen(false);
        setDataToImport(null);
    };

    return (
        <>
            <ImportConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmImport}
            />
            <div className="max-w-2xl mx-auto space-y-6">
                <Card title="Exporter vos Données">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Téléchargez une copie complète de toutes vos données financières. C'est la meilleure façon de créer une sauvegarde manuelle.
                    </p>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Avertissement de Sécurité</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Le fichier exporté est au format JSON et <strong>n'est pas chiffré</strong>. Il contient toutes vos informations financières. Assurez-vous de le conserver dans un endroit extrêmement sûr (coffre-fort numérique, clé USB chiffrée, etc.).
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleExport}
                            className="w-full max-w-xs bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 flex items-center justify-center text-lg font-semibold"
                        >
                            Exporter les Données (.json)
                        </button>
                    </div>
                </Card>

                <Card title="Importer vos Données">
                     <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Restaurez vos données à partir d'un fichier de sauvegarde `.json` précédemment exporté.
                    </p>
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg">
                        <h4 className="font-semibold text-red-800 dark:text-red-200">🛑 Attention</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                           L'importation <strong>remplacera définitivement</strong> toutes les données actuellement présentes dans l'application. Cette action est irréversible.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            onClick={handleImportClick}
                            className="w-full max-w-xs bg-secondary-600 text-white py-3 px-4 rounded-lg hover:bg-secondary-700 flex items-center justify-center text-lg font-semibold"
                        >
                            Importer depuis un Fichier (.json)
                        </button>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default DataManagement;