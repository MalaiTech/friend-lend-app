
import { Loan, Payment } from '@/types/loan';

export function calculateSimpleInterest(
  principal: number,
  rate: number,
  startDate: string,
  endDate: string = new Date().toISOString()
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const years = days / 365;
  return principal * (rate / 100) * years;
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  startDate: string,
  endDate: string = new Date().toISOString()
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const years = days / 365;
  // Compound monthly
  const n = 12;
  const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
  return amount - principal;
}

export function calculateInterest(loan: Loan, endDate?: string): number {
  if (loan.interestType === 'simple') {
    return calculateSimpleInterest(loan.amount, loan.interestRate, loan.startDate, endDate);
  } else {
    return calculateCompoundInterest(loan.amount, loan.interestRate, loan.startDate, endDate);
  }
}

export function calculateLoanBalance(loan: Loan, payments: Payment[]): number {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const interest = calculateInterest(loan);
  return loan.amount + interest - totalPaid;
}

export function calculateTotalRepaid(payments: Payment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function isLoanOverdue(loan: Loan): boolean {
  if (loan.status === 'paid') return false;
  const dueDate = new Date(loan.dueDate);
  const today = new Date();
  return today > dueDate;
}

export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
