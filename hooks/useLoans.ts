
import { useState, useEffect, useCallback } from 'react';
import { Loan, Payment, LoanSummary } from '@/types/loan';
import { saveLoans, loadLoans, savePayments, loadPayments } from '@/utils/storage';
import { calculateLoanBalance, calculateInterest, isLoanOverdue } from '@/utils/loanCalculations';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedLoans, loadedPayments] = await Promise.all([
        loadLoans(),
        loadPayments(),
      ]);
      setLoans(loadedLoans);
      setPayments(loadedPayments);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLoan = useCallback(async (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedLoans = [...loans, newLoan];
    setLoans(updatedLoans);
    await saveLoans(updatedLoans);
    return newLoan;
  }, [loans]);

  const updateLoan = useCallback(async (loanId: string, updates: Partial<Loan>) => {
    const updatedLoans = loans.map(loan =>
      loan.id === loanId
        ? { ...loan, ...updates, updatedAt: new Date().toISOString() }
        : loan
    );
    setLoans(updatedLoans);
    await saveLoans(updatedLoans);
  }, [loans]);

  const deleteLoan = useCallback(async (loanId: string) => {
    const updatedLoans = loans.filter(loan => loan.id !== loanId);
    const updatedPayments = payments.filter(payment => payment.loanId !== loanId);
    setLoans(updatedLoans);
    setPayments(updatedPayments);
    await Promise.all([
      saveLoans(updatedLoans),
      savePayments(updatedPayments),
    ]);
  }, [loans, payments]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    await savePayments(updatedPayments);

    // Update loan status if fully paid
    const loan = loans.find(l => l.id === payment.loanId);
    if (loan) {
      const loanPayments = updatedPayments.filter(p => p.loanId === payment.loanId);
      const balance = calculateLoanBalance(loan, loanPayments);
      if (balance <= 0) {
        await updateLoan(payment.loanId, { status: 'paid' });
      }
    }

    return newPayment;
  }, [payments, loans, updateLoan]);

  const getPaymentsForLoan = useCallback((loanId: string): Payment[] => {
    return payments.filter(payment => payment.loanId === loanId);
  }, [payments]);

  const getLoanSummary = useCallback((): LoanSummary => {
    const totalLent = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const interestEarned = loans.reduce((sum, loan) => {
      return sum + calculateInterest(loan);
    }, 0);
    const outstandingBalance = loans.reduce((sum, loan) => {
      if (loan.status === 'paid') return sum;
      const loanPayments = getPaymentsForLoan(loan.id);
      return sum + calculateLoanBalance(loan, loanPayments);
    }, 0);

    return {
      totalLent,
      totalRepaid,
      outstandingBalance,
      interestEarned,
    };
  }, [loans, payments, getPaymentsForLoan]);

  const markAsPaid = useCallback(async (loanId: string) => {
    await updateLoan(loanId, { status: 'paid' });
  }, [updateLoan]);

  // Update loan statuses based on due dates
  useEffect(() => {
    const updateStatuses = async () => {
      let hasChanges = false;
      const updatedLoans = loans.map(loan => {
        if (loan.status === 'active' && isLoanOverdue(loan)) {
          hasChanges = true;
          return { ...loan, status: 'overdue' as const, updatedAt: new Date().toISOString() };
        }
        return loan;
      });

      if (hasChanges) {
        setLoans(updatedLoans);
        await saveLoans(updatedLoans);
      }
    };

    updateStatuses();
  }, [loans]);

  return {
    loans,
    payments,
    loading,
    addLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    getPaymentsForLoan,
    getLoanSummary,
    markAsPaid,
  };
}
