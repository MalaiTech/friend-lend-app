
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Loan, Payment } from '@/types/loan';
import { colors, commonStyles } from '@/styles/commonStyles';
import { 
  calculateLoanOutstanding, 
  calculateInterestOutstanding, 
  formatCurrency, 
  formatDate, 
  getInterestPaymentStatus 
} from '@/utils/loanCalculations';
import { IconSymbol } from './IconSymbol';

interface LoanCardProps {
  loan: Loan;
  payments: Payment[];
  onPress: () => void;
  currencySymbol?: string;
}

export default function LoanCard({ loan, payments, onPress, currencySymbol = '€' }: LoanCardProps) {
  const loanOutstanding = calculateLoanOutstanding(loan, payments);
  const interestOutstanding = calculateInterestOutstanding(loan, payments);
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
          {/* Borrower Photo or Avatar */}
          {loan.borrowerPhoto ? (
            <Image 
              source={{ uri: loan.borrowerPhoto }} 
              style={styles.photo}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: statusColor + '20' }]}>
              <IconSymbol name="person.fill" size={24} color={statusColor} />
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.borrowerName}>{loan.borrowerName}</Text>
            <Text style={styles.startDate}>Started: {formatDate(loan.startDate)}</Text>
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
          <Text style={styles.amountLabel}>Loan Outstanding</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(loanOutstanding, currencySymbol)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Interest Outstanding</Text>
          <Text style={[styles.amountValue, { color: interestOutstanding > 0 ? colors.accent : colors.secondary }]}>
            {formatCurrency(interestOutstanding, currencySymbol)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
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
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
  startDate: {
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
