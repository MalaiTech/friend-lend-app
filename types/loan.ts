
export interface Loan {
  id: string;
  borrowerName: string;
  amount: number; // Whole number
  interestRate: number; // Whole number (monthly rate)
  interestType: 'simple' | 'compound';
  startDate: string;
  dueDate: string;
  notes: string;
  status: 'active' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
  lastInterestPaymentDate?: string; // Track last interest payment
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number; // Whole number
  date: string;
  note: string;
  type: 'principal' | 'interest'; // Payment type
  createdAt: string;
}

export interface LoanSummary {
  totalLent: number;
  totalRepaid: number;
  outstandingBalance: number;
  interestEarned: number;
}

export interface InterestPaymentStatus {
  monthsOverdue: number;
  amountDue: number;
  lastPaymentDate?: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  supabaseEnabled: boolean;
  lastBackupDate?: string;
}
