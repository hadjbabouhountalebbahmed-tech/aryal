import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { mockData } from '../data/mockData.ts';
import { encryptData, decryptData } from '../services/cryptoService.ts';
import { Financials } from '../types.ts';
import { useNotifier } from './NotificationContext.tsx';

const ENCRYPTED_DATA_KEY = 'hadj-finance-data';

export interface AuthContextType {
    isLocked: boolean;
    hasPasswordBeenSet: boolean;
    financials: Financials | null;
    unlock: (password: string) => Promise<void>;
    lock: () => void;
    setPassword: (password: string) => Promise<void>;
    updateFinancials: (newFinancials: Financials) => Promise<void>;
    resetPasswordAndData: () => Promise<void>;
    resetFinancialsToZero: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [hasPasswordBeenSet, setHasPasswordBeenSet] = useState(false);
    const [passwordKey, setPasswordKey] = useState<string | null>(null);
    const [financials, setFinancials] = useState<Financials | null>(null);
    const notifier = useNotifier();

    useEffect(() => {
        const encryptedData = localStorage.getItem(ENCRYPTED_DATA_KEY);
        setHasPasswordBeenSet(!!encryptedData);
    }, []);

    const saveFinancials = useCallback(async (data: Financials, password: string) => {
        try {
            const encryptedString = await encryptData(data, password);
            localStorage.setItem(ENCRYPTED_DATA_KEY, encryptedString);
        } catch (error) {
            console.error("Failed to save data:", error);
            notifier.error("Une erreur est survenue lors de la sauvegarde des données.");
            throw error;
        }
    }, [notifier]);

    const unlock = async (password: string) => {
        const encryptedJson = localStorage.getItem(ENCRYPTED_DATA_KEY);
        if (!encryptedJson) {
            throw new Error("Aucune donnée n'a été trouvée.");
        }
        try {
            const decryptedData = await decryptData(encryptedJson, password);
            setFinancials(decryptedData);
            setPasswordKey(password);
            setIsLocked(false);
            notifier.success("Bienvenue ! Vos données sont déverrouillées.");
        } catch (error) {
            throw new Error("Mot de passe incorrect.");
        }
    };

    const lock = () => {
        setIsLocked(true);
        setPasswordKey(null);
        setFinancials(null);
        // Do not clear financials from state immediately to avoid UI flicker on lock
    };

    const setPassword = async (password: string) => {
        if (localStorage.getItem(ENCRYPTED_DATA_KEY)) {
            throw new Error("Un mot de passe a déjà été défini.");
        }
        await saveFinancials(mockData, password);
        setHasPasswordBeenSet(true);
        await unlock(password);
    };
    
    const updateFinancials = async (newFinancials: Financials) => {
        if (!passwordKey) {
            notifier.error("Session non authentifiée. Impossible de sauvegarder.");
            throw new Error("Not authenticated");
        }
        setFinancials(newFinancials);
        await saveFinancials(newFinancials, passwordKey);
    };

    const resetPasswordAndData = async () => {
        localStorage.removeItem(ENCRYPTED_DATA_KEY);
        setPasswordKey(null);
        setFinancials(null);
        setIsLocked(true);
        setHasPasswordBeenSet(false);
    };

    const resetFinancialsToZero = async () => {
        if (!financials) {
            notifier.error("Aucune donnée à réinitialiser.");
            throw new Error("No financials to reset");
        }
    
        const zeroedFinancials: Financials = {
            settings: financials.settings, // Keep settings
            incomes: [],
            expenses: [],
            recurringExpenses: [],
            debts: [],
            investments: [],
            loansAndBorrows: [],
            goals: [],
            zakatInfo: {
                goldInGrams: 0,
                assets: [],
                debts: [],
                paymentHistory: [],
            },
        };
    
        await updateFinancials(zeroedFinancials);
    };

    const value: AuthContextType = {
        isLocked,
        hasPasswordBeenSet,
        financials,
        unlock,
        lock,
        setPassword,
        updateFinancials,
        resetPasswordAndData,
        resetFinancialsToZero,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};