import React from 'react';
// Fix: added .ts extension
import { View } from '../../types.ts';

interface HeaderProps {
    currentView: View;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    toggleSidebar: () => void;
}

const viewTitles: Record<View, string> = {
    dashboard: 'Tableau de Bord Global',
    income: 'Gestion des Revenus',
    expenses: 'Suivi des Dépenses',
    debts: 'Gestion des Dettes',
    taxes: 'Calcul des Impôts',
    zakat: 'Calcul de la Zakat',
    investments: 'Analyse d\'Investissements',
    'ai-space': 'Réflexion Financière avec l\'IA',
    settings: 'Paramètres de l\'Application',
    reports: 'Générateur de Rapports',
    'data-management': 'Gestion des Données'
};

const Header: React.FC<HeaderProps> = ({ currentView, theme, toggleTheme, toggleSidebar }) => {
    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                 <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 mr-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                    aria-label="Open sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">{viewTitles[currentView]}</h2>
            </div>
            <div className="flex items-center">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                >
                    {theme === 'light' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    }
                </button>
            </div>
        </header>
    );
};

export default Header;