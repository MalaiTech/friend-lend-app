
export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  interestType: 'simple' | 'compound';
  startDate: string;
  dueDate: string;
  notes: string;
  status: 'active' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface LoanSummary {
  totalLent: number;
  totalRepaid: number;
  outstandingBalance: number;
  interestEarned: number;
}
