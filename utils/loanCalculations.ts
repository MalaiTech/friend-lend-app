
import { Loan, Payment, InterestPaymentStatus } from '@/types/loan';

// Calculate monthly interest for a loan
export function calculateMonthlyInterest(principal: number, monthlyRate: number): number {
  return Math.round((principal * monthlyRate) / 100);
}

// Calculate total interest accrued based on months elapsed
export function calculateSimpleInterest(
  principal: number,
  monthlyRate: number,
  startDate: string,
  endDate: string = new Date().toISOString()
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return Math.round((principal * monthlyRate * months) / 100);
}

// Calculate compound interest (monthly compounding)
export function calculateCompoundInterest(
  principal: number,
  monthlyRate: number,
  startDate: string,
  endDate: string = new Date().toISOString()
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const amount = principal * Math.pow(1 + monthlyRate / 100, months);
  return Math.round(amount - principal);
}

export function calculateInterest(loan: Loan, endDate?: string): number {
  if (loan.interestType === 'simple') {
    return calculateSimpleInterest(loan.amount, loan.interestRate, loan.startDate, endDate);
  } else {
    return calculateCompoundInterest(loan.amount, loan.interestRate, loan.startDate, endDate);
  }
}

// Calculate loan balance (principal + interest - payments)
export function calculateLoanBalance(loan: Loan, payments: Payment[]): number {
  const principalPayments = payments
    .filter(p => p.type === 'principal')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const interest = calculateInterest(loan);
  return loan.amount + interest - principalPayments;
}

// Calculate total principal repaid
export function calculateTotalRepaid(payments: Payment[]): number {
  return payments
    .filter(p => p.type === 'principal')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

// Check interest payment status
export function getInterestPaymentStatus(loan: Loan, payments: Payment[]): InterestPaymentStatus {
  const now = new Date();
  const startDate = new Date(loan.startDate);
  const lastPaymentDate = loan.lastInterestPaymentDate 
    ? new Date(loan.lastInterestPaymentDate) 
    : startDate;
  
  // Calculate months since last interest payment
  const monthsSinceLastPayment = Math.floor(
    (now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  const monthlyInterest = calculateMonthlyInterest(loan.amount, loan.interestRate);
  const amountDue = monthlyInterest * monthsSinceLastPayment;
  
  return {
    monthsOverdue: monthsSinceLastPayment,
    amountDue,
    lastPaymentDate: loan.lastInterestPaymentDate,
  };
}

export function isLoanOverdue(loan: Loan): boolean {
  if (loan.status === 'paid') return false;
  const dueDate = new Date(loan.dueDate);
  const today = new Date();
  return today > dueDate;
}

export function formatCurrency(amount: number, currencySymbol: string = '€'): string {
  // Format as whole number
  return `${currencySymbol}${Math.round(amount).toLocaleString()}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
