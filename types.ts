// types.ts

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  action?: NotificationAction;
}

export interface Income {
    id: string;
    source: string;
    amount: number;
    date: string; // YYYY-MM-DD
}

export interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: string; // YYYY-MM-DD
    sourceRecurringId?: string;
}

export interface RecurringExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    recurrence: 'monthly'; // For now, only monthly
    dayOfMonth: number;
    startDate: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    lastProcessedDate: string; // YYYY-MM-DD
}

export interface Debt {
    id: string;
    name: string;
    amount: number;
    interestRate: number;
    dueDate: string; // YYYY-MM-DD
}

export type InvestmentCountry = 'Canada' | 'Algeria' | 'Other';
export type InvestmentRiskLevel = 'Low' | 'Medium' | 'High';

export interface Investment {
    id: string;
    name: string;
    amount: number;
    country: InvestmentCountry;
    sector: string;
    expectedReturn: number;
    duration: number; // in years
    riskLevel: InvestmentRiskLevel;
    shariaComplianceNotes?: string;
}

export interface LoanAndBorrow {
    id: string;
    type: 'loan' | 'borrow';
    personName: string;
    amount: number;
    description: string;
    date: string; // YYYY-MM-DD
    dueDate?: string; // YYYY-MM-DD
}

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // YYYY-MM-DD
}

export interface ZakatAsset {
    id: string;
    name: string;
    value: number;
}

export interface ZakatDebt {
    id: string;
    name: string;
    amount: number;
}

export interface ZakatPayment {
    id: string;
    date: string;
    amount: number;
}

export interface ZakatInfo {
    goldInGrams: number;
    assets: ZakatAsset[];
    debts: ZakatDebt[];
    paymentHistory: ZakatPayment[];
}

export interface Settings {
    cadToDzdRate: number;
    goldPricePerGram: number;
}

export interface Financials {
    incomes: Income[];
    expenses: Expense[];
    recurringExpenses: RecurringExpense[];
    debts: Debt[];
    investments: Investment[];
    loansAndBorrows: LoanAndBorrow[];
    goals: FinancialGoal[];
    zakatInfo: ZakatInfo;
    settings: Settings;
}

export interface EncryptedData {
    ciphertext: string;
    salt: string;
    iv: string;
}

// AI-related types
export interface HadjAnalysis {
    isRecommended: boolean;
    profitability: string;
    risk: string;
    hadjRule: {
        debtToEquity: string;
        returnOnInvestment: string;
        ribaFree: string;
    };
    recommendation: string;
}

export interface DashboardInsight {
    title: string;
    suggestion: string;
    type: 'info' | 'warning' | 'success';
}

export interface TaxDetails {
    grossIncome: number;
    totalContributions: number;
    federalTax: number;
    provincialTax: number;
    totalIncomeTax: number;
    totalDeductions: number;
    netIncome: number;
    finalBalance: number;
}

// Form related types
export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface FormFieldConfig {
    name: string;
    label: string;
    type: FormFieldType;
    required?: boolean;
    placeholder?: string;
    options?: readonly { value: string; label: string }[] | readonly string[];
    min?: number;
    step?: string;
    rows?: number;
}
