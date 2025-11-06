import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.tsx';
import LockScreen from './components/LockScreen.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import Header from './components/layout/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import AiSpace from './components/AiSpace.tsx';
import Incomes from './components/Incomes.tsx';
import Expenses from './components/Expenses.tsx';
import Debts from './components/Debts.tsx';
import Investments from './components/Investments.tsx';
import LoansAndBorrows from './components/LoansAndBorrows.tsx';
import Zakat from './components/Zakat.tsx';
import Taxes from './components/Taxes.tsx';
import Goals from './components/Goals.tsx';
import Reports from './components/Reports.tsx';
import DataManagement from './components/DataManagement.tsx';
import Settings from './components/Settings.tsx';
import ToastContainer from './components/shared/ToastContainer.tsx';
import ApiKeyModal from './components/ApiKeyModal.tsx';

const App: React.FC = () => {
    const { isLocked } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLocked) {
        return <LockScreen />;
    }

    return (
        <Router>
            <div className="flex h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 min-h-0">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/ai-space" element={<AiSpace />} />
                            <Route path="/incomes" element={<Incomes />} />
                            <Route path="/expenses" element={<Expenses />} />
                            <Route path="/debts" element={<Debts />} />
                            <Route path="/investments" element={<Investments />} />
                            <Route path="/loans" element={<LoansAndBorrows />} />
                            <Route path="/zakat" element={<Zakat />} />
                            <Route path="/taxes" element={<Taxes />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/data" element={<DataManagement />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </main>
                </div>
            </div>
            <ToastContainer />
            <ApiKeyModal />
        </Router>
    );
};

export default App;