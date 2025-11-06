import React from 'react';
// Fix: added .ts extension
import { View } from '../../types.ts';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    onLock: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const NavItem: React.FC<{
    view: View;
    label: string;
    icon: React.ReactNode;
    currentView: View;
    onClick: (view: View) => void;
}> = ({ view, label, icon, currentView, onClick }) => {
    const isActive = currentView === view;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClick(view); }}
                className={`flex items-center p-3 rounded-lg text-base font-normal ${
                    isActive 
                        ? 'bg-primary-500 text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </a>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLock, isOpen, onClose }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-md transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col`}>
            <div>
                <div className="flex items-center justify-between p-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Hadj Finance</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Votre Boussole Financière</p>
                    </div>
                     <button onClick={onClose} className="md:hidden p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="px-4">
                    <ul className="space-y-2">
                        <NavItem 
                            view="dashboard" 
                            label="Tableau de Bord" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <NavItem 
                            view="income" 
                            label="Revenus" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V3m0 8h8m-8 0l-8 8"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <NavItem 
                            view="expenses" 
                            label="Dépenses" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <NavItem 
                            view="debts" 
                            label="Dettes" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <NavItem 
                            view="investments" 
                            label="Investissements" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <NavItem 
                            view="taxes" 
                            label="Impôts (QC)" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 4h4m5 6H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                         <NavItem 
                            view="zakat" 
                            label="Zakat" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m5.657 5.657l-3-3M4.343 12l3-3m5.657-2.657l3 3m-5.657 5.657l-3 3M12 21a9 9 0 110-18 9 9 0 010 18z"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                         <NavItem 
                            view="reports" 
                            label="Rapports" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                         <NavItem 
                            view="ai-space" 
                            label="Espace IA" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                    </ul>
                </nav>
            </div>
            <div className="mt-auto p-4">
                 <nav>
                    <ul className="space-y-2 border-t dark:border-gray-700 pt-4">
                        <NavItem 
                            view="data-management" 
                            label="Gestion des Données" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10m16-10v10M4 17h16M4 7h16H4zm0 0L12 3l8 4M4 7v10h16V7L12 3 4 7z"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <NavItem 
                            view="settings" 
                            label="Paramètres" 
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                            currentView={currentView} 
                            onClick={setCurrentView} 
                        />
                        <li>
                             <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onLock(); }}
                                className="flex items-center p-3 rounded-lg text-base font-normal text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-700/50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span className="ml-3">Verrouiller</span>
                            </a>
                        </li>
                    </ul>
                 </nav>
            </div>
        </aside>
    );
};

export default Sidebar;