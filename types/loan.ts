
export interface Loan {
  id: string;
  borrowerName: string;
  borrowerPhoto?: string; // Photo URI
  amount: number; // Whole number
  interestRate: number; // Whole number (monthly rate)
  interestType: 'simple' | 'compound';
  startDate: string;
  notes: string;
  status: 'active' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
  lastInterestPaymentDate?: string; // Track last interest payment
  closeDate?: string; // Date when loan is fully paid
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
  loanOutstanding: number; // Total Lent - Total Repaid
  loanRepaid: number; // Sum of fully or partially repaid loans
  interestOutstanding: number; // Total unpaid interest
  interestPaid: number; // Total interest paid
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

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  icon: string;
  color: string;
  description: string;
}
