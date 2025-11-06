import { useContext } from 'react';
// Fix: Added .tsx extension to import
import { AuthContext } from '../contexts/AuthContext.tsx';

// A hook to get the full financial state
export const useFinancialsState = () => {
    const context = useContext(AuthContext);
    if (!context || !context.financials) {
        throw new Error('useFinancialsState must be used within an AuthProvider with loaded financials');
    }
    return context.financials;
};

// A hook to get the updater function
export const useFinancialsUpdater = () => {
    const context = useContext(AuthContext);
    if (!context || !context.updateFinancials) {
        throw new Error('useFinancialsUpdater must be used within an AuthProvider');
    }
    return context.updateFinancials;
};
