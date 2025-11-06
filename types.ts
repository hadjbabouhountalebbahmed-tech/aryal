export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  sourceRecurringId?: string; // Optional: links to the recurring expense that generated it
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  recurrence: 'monthly'; // Could be extended later
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  lastProcessedDate?: string; // To track when it was last run
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  dueDate: string; // YYYY-MM-DD
}

export type InvestmentCountry = 'Canada' | 'Algeria' | 'Other';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  country: InvestmentCountry;
  sector: string;
  expectedReturn: number;
  duration: number; // in years
  riskLevel: 'Low' | 'Medium' | 'High';
  shariaComplianceNotes?: string;
}

export interface Settings {
  cadToDzdRate: number;
  goldPricePerGram: number; // in CAD
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

export interface Financials {
  incomes: Income[];
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  debts: Debt[];
  investments: Investment[];
  settings: Settings;
  zakatInfo: ZakatInfo;
}

export type View =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'debts'
  | 'investments'
  | 'taxes'
  | 'zakat'
  | 'reports'
  | 'ai-space'
  | 'settings'
  | 'data-management';

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

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
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

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface EncryptedData {
    ciphertext: string;
    salt: string;
    iv: string;
}
