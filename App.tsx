import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext.tsx';
import LockScreen from './components/LockScreen.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import Header from './components/layout/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import Incomes from './components/Incomes.tsx';
import Expenses from './components/Expenses.tsx';
import Debts from './components/Debts.tsx';
import Investments from './components/Investments.tsx';
import Taxes from './components/Taxes.tsx';
import Zakat from './components/Zakat.tsx';
import Reports from './components/Reports.tsx';
import AiSpace from './components/AiSpace.tsx';
import Settings from './components/Settings.tsx';
import DataManagement from './components/DataManagement.tsx';
import { View, Financials } from './types.ts';
import ToastContainer from './components/shared/ToastContainer.tsx';
import Spinner from './components/shared/Spinner.tsx';
import { useFinancialsActions, FinancialsProvider } from './hooks/useFinancials.ts';


const AppContent: React.FC = () => {
    const { lock } = useAuth();
    const { processRecurringExpenses } = useFinancialsActions();
    
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Run recurring expense processing on startup.
        // The user will see the new expenses in their list.
        // A notification is tricky due to async state updates, so we omit it for a cleaner UX.
        processRecurringExpenses();
    }, [processRecurringExpenses]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard />;
            case 'income': return <Incomes />;
            case 'expenses': return <Expenses />;
            case 'debts': return <Debts />;
            case 'investments': return <Investments />;
            case 'taxes': return <Taxes />;
            case 'zakat': return <Zakat />;
            case 'reports': return <Reports />;
            case 'ai-space': return <AiSpace />;
            case 'settings': return <Settings />;
            case 'data-management': return <DataManagement />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <ToastContainer />
            <Sidebar 
                currentView={currentView} 
                setCurrentView={(view) => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                }}
                onLock={lock}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentView={currentView} theme={theme} toggleTheme={toggleTheme} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const { isLocked, decryptedData } = useAuth();

    if (isLocked) {
        return <LockScreen />;
    }

    if (!decryptedData) {
        // This is a transient state between unlock and data being ready.
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <Spinner />
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Chargement de vos données sécurisées...</p>
                </div>
            </div>
        );
    }
    
    // Once data is decrypted and available, render the provider and the main app
    return (
        <FinancialsProvider initialData={decryptedData}>
            <AppContent />
        </FinancialsProvider>
    );
};


export default App;