
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loan, Payment } from '@/types/loan';

const LOANS_KEY = '@friendlend_loans';
const PAYMENTS_KEY = '@friendlend_payments';

export async function saveLoans(loans: Loan[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    console.log('Loans saved successfully');
  } catch (error) {
    console.error('Error saving loans:', error);
    throw error;
  }
}

export async function loadLoans(): Promise<Loan[]> {
  try {
    const data = await AsyncStorage.getItem(LOANS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading loans:', error);
    return [];
  }
}

export async function savePayments(payments: Payment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    console.log('Payments saved successfully');
  } catch (error) {
    console.error('Error saving payments:', error);
    throw error;
  }
}

export async function loadPayments(): Promise<Payment[]> {
  try {
    const data = await AsyncStorage.getItem(PAYMENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading payments:', error);
    return [];
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([LOANS_KEY, PAYMENTS_KEY]);
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
