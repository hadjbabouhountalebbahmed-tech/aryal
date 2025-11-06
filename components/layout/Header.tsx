import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';

// Mapping from path to title
const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Tableau de Bord',
    '/ai-space': 'Espace IA - Discutez avec Hadj',
    '/incomes': 'Gestion des Revenus',
    '/expenses': 'Gestion des Dépenses',
    '/debts': 'Gestion des Dettes',
    '/investments': 'Portefeuille d\'Investissements',
    '/loans': 'Prêts & Emprunts',
    '/zakat': 'Calcul de la Zakat',
    '/taxes': 'Simulateur d\'Impôts',
    '/goals': 'Gestion des Objectifs Financiers',
    '/reports': 'Générateur de Rapports',
    '/data': 'Gestion des Données',
    '/settings': 'Paramètres'
};

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { lock } = useAuth();
    const location = useLocation();
    
    const title = pageTitles[location.pathname] || 'Hadj Finance';
    
    return (
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6h16M4 12h16m-7 6h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 ml-4">{title}</h2>
            </div>
            
            <div className="flex items-center">
                <button
                    onClick={lock}
                    className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                >
                    <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <span className="hidden sm:inline">Verrouiller</span>
                </button>
            </div>
        </header>
    );
};

export default Header;