import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
// Fix: added .ts extension
import { Financials, Income, Expense, Debt, Investment, Settings, ZakatAsset, ZakatDebt, RecurringExpense } from '../types.ts';
// Fix: added .tsx extension
import { useAuth } from '../contexts/AuthContext.tsx';
// Fix: added .ts extension
import { expenseCategories, incomeSources, investmentSectors } from '../data/categories.ts';

// --- UTILS ---
const simpleUUID = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// --- ACTION TYPES ---
type Action =
  | { type: 'SET_FINANCIALS'; payload: Financials }
  | { type: 'ADD_INCOME'; payload: Omit<Income, 'id'> }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'REMOVE_INCOME'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id'> }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'ADD_DEBT'; payload: Omit<Debt, 'id'> }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'REMOVE_DEBT'; payload: string }
  | { type: 'ADD_INVESTMENT'; payload: Omit<Investment, 'id'> }
  | { type: 'UPDATE_INVESTMENT'; payload: Investment }
  | { type: 'REMOVE_INVESTMENT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_GOLD'; payload: number }
  | { type: 'ADD_ZAKAT_ASSET'; payload: Omit<ZakatAsset, 'id'> }
  | { type: 'REMOVE_ZAKAT_ASSET'; payload: string }
  | { type: 'ADD_ZAKAT_DEBT'; payload: Omit<ZakatDebt, 'id'> }
  | { type: 'REMOVE_ZAKAT_DEBT'; payload: string }
  | { type: 'ADD_RECURRING_EXPENSE'; payload: Omit<RecurringExpense, 'id'> }
  | { type: 'UPDATE_RECURRING_EXPENSE'; payload: RecurringExpense }
  | { type: 'REMOVE_RECURRING_EXPENSE'; payload: string }
  | { type: 'PROCESS_RECURRING_EXPENSES' }
  | { type: 'IMPORT_DATA', payload: Financials };


// --- REDUCER ---
const financialsReducer = (state: Financials, action: Action): Financials => {
  switch (action.type) {
    case 'SET_FINANCIALS':
    case 'IMPORT_DATA':
      return action.payload;
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, { ...action.payload, id: simpleUUID() }] };
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'REMOVE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, { ...action.payload, id: simpleUUID() }] };
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
     case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, { ...action.payload, id: simpleUUID() }] };
    case 'UPDATE_DEBT':
      return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'REMOVE_DEBT':
      return { ...state, debts: state.debts.filter(d => d.id !== action.payload) };
    case 'ADD_INVESTMENT':
       return { ...state, investments: [...state.investments, { ...action.payload, id: simpleUUID() }] };
    case 'UPDATE_INVESTMENT':
      return { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'REMOVE_INVESTMENT':
      return { ...state, investments: state.investments.filter(i => i.id !== action.payload) };
    case 'UPDATE_SETTINGS':
       return { ...state, settings: action.payload };
    case 'UPDATE_GOLD':
       return { ...state, zakatInfo: { ...state.zakatInfo, goldInGrams: action.payload } };
    case 'ADD_ZAKAT_ASSET':
       return { ...state, zakatInfo: { ...state.zakatInfo, assets: [...state.zakatInfo.assets, { ...action.payload, id: simpleUUID() }] } };
    case 'REMOVE_ZAKAT_ASSET':
       return { ...state, zakatInfo: { ...state.zakatInfo, assets: state.zakatInfo.assets.filter(a => a.id !== action.payload) } };
    case 'ADD_ZAKAT_DEBT':
       return { ...state, zakatInfo: { ...state.zakatInfo, debts: [...state.zakatInfo.debts, { ...action.payload, id: simpleUUID() }] } };
    case 'REMOVE_ZAKAT_DEBT':
        return { ...state, zakatInfo: { ...state.zakatInfo, debts: state.zakatInfo.debts.filter(d => d.id !== action.payload) } };
    case 'ADD_RECURRING_EXPENSE':
        return { ...state, recurringExpenses: [...state.recurringExpenses, { ...action.payload, id: simpleUUID() }] };
    case 'UPDATE_RECURRING_EXPENSE':
        return { ...state, recurringExpenses: state.recurringExpenses.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'REMOVE_RECURRING_EXPENSE':
        return { ...state, recurringExpenses: state.recurringExpenses.filter(r => r.id !== action.payload) };
    case 'PROCESS_RECURRING_EXPENSES': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newExpenses: Expense[] = [];
        let hasChanges = false;
        
        const updatedRecurringExpenses = state.recurringExpenses.map(rec => {
            const lastProcessed = rec.lastProcessedDate ? new Date(rec.lastProcessedDate) : new Date(rec.startDate);
            lastProcessed.setHours(0,0,0,0);
            const startDate = new Date(rec.startDate);
            
            if (startDate > today || (rec.endDate && new Date(rec.endDate) < today)) {
                return rec;
            }
            
            let nextDueDate = new Date(lastProcessed.getFullYear(), lastProcessed.getMonth(), rec.dayOfMonth);
            if (nextDueDate <= lastProcessed) { // If already processed this month, check next month
                 nextDueDate = new Date(lastProcessed.getFullYear(), lastProcessed.getMonth() + 1, rec.dayOfMonth);
            }
            
            let recurringExpenseUpdated = false;
            while (nextDueDate <= today) {
                if(nextDueDate > lastProcessed && (!rec.endDate || nextDueDate <= new Date(rec.endDate))) {
                     newExpenses.push({
                        id: simpleUUID(),
                        category: rec.category,
                        description: rec.description,
                        amount: rec.amount,
                        date: nextDueDate.toISOString().split('T')[0],
                        sourceRecurringId: rec.id
                    });
                    recurringExpenseUpdated = true;
                }
                nextDueDate = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, rec.dayOfMonth);
            }

            if (recurringExpenseUpdated) {
                hasChanges = true;
                return { ...rec, lastProcessedDate: today.toISOString().split('T')[0] };
            }
            return rec;
        });

        if (hasChanges) {
            return {
                ...state,
                expenses: [...state.expenses, ...newExpenses],
                recurringExpenses: updatedRecurringExpenses
            };
        }
        return state;
    }
    default:
      return state;
  }
};

// --- CONTEXT ---
interface FinancialsContextType {
  state: Financials;
  dispatch: React.Dispatch<Action>;
}

const FinancialsContext = createContext<FinancialsContextType | undefined>(undefined);

// --- DEFAULT STATE FOR DATA MIGRATION ---
const defaultFinancialsState: Financials = {
    incomes: [],
    expenses: [],
    recurringExpenses: [],
    debts: [],
    investments: [],
    settings: {
        cadToDzdRate: 100,
        goldPricePerGram: 100
    },
    zakatInfo: {
        goldInGrams: 0,
        assets: [],
        debts: [],
        paymentHistory: []
    }
};


// --- PROVIDER ---
export const FinancialsProvider: React.FC<{ children: ReactNode, initialData: Financials }> = ({ children, initialData }) => {
  const { saveEncryptedData } = useAuth();
  
  // Robust merge of initialData with defaults. This ensures that if data from localStorage is from an older
  // version (e.g., missing the recurringExpenses array), the app won't crash.
  const mergedInitialData = {
      ...defaultFinancialsState,
      ...initialData,
      recurringExpenses: initialData.recurringExpenses || [],
      settings: { ...defaultFinancialsState.settings, ...(initialData.settings || {}) },
      zakatInfo: { ...defaultFinancialsState.zakatInfo, ...(initialData.zakatInfo || {}) },
  };
  
  const [state, dispatch] = useReducer(financialsReducer, mergedInitialData);

  useEffect(() => {
    if (state) {
        saveEncryptedData(state);
    }
  }, [state, saveEncryptedData]);
  
  return React.createElement(FinancialsContext.Provider, { value: { state, dispatch } }, children);
};

// --- HOOKS ---
const useFinancialsContext = (): FinancialsContextType => {
  const context = useContext(FinancialsContext);
  if (!context) {
    throw new Error('useFinancialsContext must be used within a FinancialsProvider');
  }
  return context;
};

export const useFinancialsState = (): Financials => {
    const { state } = useFinancialsContext();
    return state;
};

export const useFinancialsActions = () => {
    const { dispatch } = useFinancialsContext();

    const processRecurringExpenses = useCallback(() => {
        dispatch({type: 'PROCESS_RECURRING_EXPENSES' });
    }, [dispatch]);

    const addRecurringExpense = useCallback((payload: Omit<RecurringExpense, 'id'>) => {
        dispatch({ type: 'ADD_RECURRING_EXPENSE', payload });
        processRecurringExpenses();
    }, [dispatch, processRecurringExpenses]);

    const updateRecurringExpense = useCallback((payload: RecurringExpense) => {
        dispatch({ type: 'UPDATE_RECURRING_EXPENSE', payload });
        processRecurringExpenses();
    }, [dispatch, processRecurringExpenses]);

    return useMemo(() => ({
        addIncome: (payload: Omit<Income, 'id'>) => dispatch({ type: 'ADD_INCOME', payload }),
        updateIncome: (payload: Income) => dispatch({ type: 'UPDATE_INCOME', payload }),
        removeIncome: (id: string) => dispatch({ type: 'REMOVE_INCOME', payload: id }),
        addExpense: (payload: Omit<Expense, 'id'>) => dispatch({ type: 'ADD_EXPENSE', payload }),
        updateExpense: (payload: Expense) => dispatch({ type: 'UPDATE_EXPENSE', payload }),
        removeExpense: (id: string) => dispatch({ type: 'REMOVE_EXPENSE', payload: id }),
        addDebt: (payload: Omit<Debt, 'id'>) => dispatch({ type: 'ADD_DEBT', payload }),
        updateDebt: (payload: Debt) => dispatch({ type: 'UPDATE_DEBT', payload }),
        removeDebt: (id: string) => dispatch({ type: 'REMOVE_DEBT', payload: id }),
        addInvestment: (payload: Omit<Investment, 'id'>) => dispatch({ type: 'ADD_INVESTMENT', payload }),
        updateInvestment: (payload: Investment) => dispatch({ type: 'UPDATE_INVESTMENT', payload }),
        removeInvestment: (id: string) => dispatch({ type: 'REMOVE_INVESTMENT', payload: id }),
        updateSettings: (payload: Settings) => dispatch({ type: 'UPDATE_SETTINGS', payload }),
        updateGoldInGrams: (grams: number) => dispatch({ type: 'UPDATE_GOLD', payload: grams }),
        addZakatAsset: (payload: Omit<ZakatAsset, 'id'>) => dispatch({ type: 'ADD_ZAKAT_ASSET', payload }),
        removeZakatAsset: (id: string) => dispatch({ type: 'REMOVE_ZAKAT_ASSET', payload: id }),
        addZakatDebt: (payload: Omit<ZakatDebt, 'id'>) => dispatch({ type: 'ADD_ZAKAT_DEBT', payload }),
        removeZakatDebt: (id: string) => dispatch({ type: 'REMOVE_ZAKAT_DEBT', payload: id }),
        addRecurringExpense,
        updateRecurringExpense,
        removeRecurringExpense: (id: string) => dispatch({ type: 'REMOVE_RECURRING_EXPENSE', payload: id }),
        processRecurringExpenses,
        importData: (payload: Financials) => dispatch({ type: 'IMPORT_DATA', payload }),
    }), [dispatch, addRecurringExpense, updateRecurringExpense, processRecurringExpenses]);
};

export const useCategories = () => {
    const state = useFinancialsState();

    const getExpenseCategories = useCallback(() => {
        const allCategories = new Set([...expenseCategories, ...state.expenses.map(e => e.category)]);
        return Array.from(allCategories);
    }, [state.expenses]);

    const getIncomeSources = useCallback(() => {
        const allSources = new Set([...incomeSources, ...state.incomes.map(i => i.source)]);
        return Array.from(allSources);
    }, [state.incomes]);

    const getInvestmentSectors = useCallback(() => {
        const allSectors = new Set([...investmentSectors, ...state.investments.map(i => i.sector)]);
        return Array.from(allSectors);
    }, [state.investments]);
    
    return { getExpenseCategories, getIncomeSources, getInvestmentSectors };
};