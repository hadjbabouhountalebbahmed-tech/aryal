import React from 'react';
import Card from './shared/Card.tsx';
import { useFinancialsState } from '../hooks/useFinancials.ts';
import { exportDataAsJson } from '../services/exportService.ts';
import { useNotifier } from '../contexts/NotificationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const DataManagement: React.FC = () => {
    const financials = useFinancialsState();
    const notifier = useNotifier();
    const { resetPasswordAndData, resetFinancialsToZero } = useAuth();


    const handleExport = () => {
        if(!financials) {
            notifier.error("Les données financières ne sont pas disponibles pour l'exportation.");
            return;
        }
        const result = exportDataAsJson(financials);
        if (result.success) {
            notifier.success("Données exportées avec succès !");
        } else {
            notifier.error(result.error || "L'exportation a échoué.");
        }
    };
    
    const handleReset = () => {
        if(window.confirm("Êtes-vous sûr ? Cette action est irréversible et supprimera toutes vos données et votre mot de passe.")) {
            resetPasswordAndData().then(() => {
                notifier.info("L'application a été réinitialisée.");
            });
        }
    }
    
    const handleRestart = () => {
        if (window.confirm("Êtes-vous sûr de vouloir remettre tous vos chiffres à zéro ? Vos paramètres seront conservés, mais toutes vos transactions, objectifs, dettes, etc., seront effacés. Cette action est irréversible.")) {
            resetFinancialsToZero().then(() => {
                notifier.success("Vos données financières ont été remises à zéro.");
            }).catch((err) => {
                console.error("Restart failed", err);
                notifier.error("La remise à zéro a échoué.");
            });
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card title="Exporter vos Données">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Sauvegardez une copie de toutes vos données financières dans un fichier JSON. Vous pouvez utiliser ce fichier comme sauvegarde ou pour importer vos données ailleurs.</p>
                    <button onClick={handleExport} className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                        Exporter les données (.json)
                    </button>
                </div>
            </Card>
             <Card title="Zone de Danger">
                 <div className="space-y-4 p-4 border border-yellow-500 rounded-lg">
                    <h4 className="font-bold text-yellow-600 dark:text-yellow-400">Recommencer à zéro</h4>
                    <p className="text-gray-600 dark:text-gray-300">Cette action réinitialisera tous vos chiffres financiers (revenus, dépenses, dettes, etc.) à zéro, mais <strong>conservera vos paramètres</strong>. Utile pour un nouveau départ (ex: nouvelle année fiscale).</p>
                    <button onClick={handleRestart} className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600">
                        Remettre les chiffres à zéro
                    </button>
                </div>
                <div className="mt-4 space-y-4 p-4 border border-red-500 rounded-lg">
                    <h4 className="font-bold text-red-600 dark:text-red-400">Réinitialiser l'application</h4>
                    <p className="text-gray-600 dark:text-gray-300">Cette action supprimera <strong>définitivement</strong> toutes vos données et votre mot de passe de cet appareil. Cette action est irréversible.</p>
                    <button onClick={handleReset} className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                        Réinitialiser et supprimer toutes les données
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default DataManagement;