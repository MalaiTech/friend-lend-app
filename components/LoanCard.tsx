
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Loan, Payment } from '@/types/loan';
import { colors, commonStyles } from '@/styles/commonStyles';
import { calculateLoanBalance, formatCurrency, formatDate, getInterestPaymentStatus } from '@/utils/loanCalculations';
import { IconSymbol } from './IconSymbol';

interface LoanCardProps {
  loan: Loan;
  payments: Payment[];
  onPress: () => void;
  currencySymbol?: string;
}

export default function LoanCard({ loan, payments, onPress, currencySymbol = '€' }: LoanCardProps) {
  const balance = calculateLoanBalance(loan, payments);
  const interestStatus = getInterestPaymentStatus(loan, payments);
  const hasOverdueInterest = interestStatus.monthsOverdue > 0;
  
  const statusColor = 
    loan.status === 'paid' ? colors.secondary :
    loan.status === 'overdue' ? colors.error :
    colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        commonStyles.card,
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.borrowerInfo}>
          <View style={[styles.avatar, { backgroundColor: statusColor + '20' }]}>
            <IconSymbol name="person.fill" size={24} color={statusColor} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.borrowerName}>{loan.borrowerName}</Text>
            <Text style={styles.dueDate}>Due: {formatDate(loan.dueDate)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {loan.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Interest Warning */}
      {hasOverdueInterest && loan.status !== 'paid' && (
        <View style={styles.warningBanner}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.error} />
          <Text style={styles.warningText}>
            {interestStatus.monthsOverdue} month{interestStatus.monthsOverdue > 1 ? 's' : ''} interest overdue
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Loan Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(loan.amount, currencySymbol)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Balance</Text>
          <Text style={[styles.amountValue, { color: balance > 0 ? colors.error : colors.secondary }]}>
            {formatCurrency(balance, currencySymbol)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.interestInfo}>
          <IconSymbol name="percent" size={14} color={colors.textSecondary} />
          <Text style={styles.interestText}>{loan.interestRate}% monthly ({loan.interestType})</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  borrowerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interestText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
