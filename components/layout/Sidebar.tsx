import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navLinks = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: '🏠' },
    { name: 'Espace IA', path: '/ai-space', icon: '✨' },
    { name: 'Revenus', path: '/incomes', icon: '📈' },
    { name: 'Dépenses', path: '/expenses', icon: '📉' },
    { name: 'Dettes', path: '/debts', icon: '💳' },
    { name: 'Investissements', path: '/investments', icon: '💼' },
    { name: 'Prêts & Emprunts', path: '/loans', icon: '🤝' },
    { name: 'Zakat', path: '/zakat', icon: '🌙' },
    { name: 'Impôts', path: '/taxes', icon: '🧾' },
    { name: 'Objectifs', path: '/goals', icon: '🎯' },
    { name: 'Rapports', path: '/reports', icon: '📄' },
    { name: 'Données', path: '/data', icon: '💾' },
    { name: 'Paramètres', path: '/settings', icon: '⚙️' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const activeLinkClass = "bg-primary-500 text-white";
    const inactiveLinkClass = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <>
            <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                 onClick={() => setIsOpen(false)}>
            </div>
            <aside className={`fixed top-0 left-0 z-30 w-64 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Hadj Finance</h1>
                </div>
                <nav className="mt-4">
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <NavLink
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => 
                                        `flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
                                    }
                                >
                                    <span className="mr-3 text-lg">{link.icon}</span>
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
