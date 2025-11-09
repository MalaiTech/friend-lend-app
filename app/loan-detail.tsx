
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { IconSymbol } from '@/components/IconSymbol';
import {
  calculateLoanBalance,
  calculateInterest,
  formatCurrency,
  formatDate,
} from '@/utils/loanCalculations';

export default function LoanDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loanId = params.id as string;

  const { loans, getPaymentsForLoan, markAsPaid, deleteLoan } = useLoans();
  const loan = loans.find((l) => l.id === loanId);
  const payments = getPaymentsForLoan(loanId);

  if (!loan) {
    return (
      <View style={commonStyles.container}>
        <Text style={styles.errorText}>Loan not found</Text>
      </View>
    );
  }

  const balance = calculateLoanBalance(loan, payments);
  const interest = calculateInterest(loan);
  const totalRepaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = () => {
    router.push(`/add-payment?loanId=${loanId}`);
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this loan as fully paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            try {
              await markAsPaid(loanId);
              Alert.alert('Success', 'Loan marked as paid');
            } catch (error) {
              console.error('Error marking as paid:', error);
              Alert.alert('Error', 'Failed to mark loan as paid');
            }
          },
        },
      ]
    );
  };

  const handleSendReminder = async () => {
    const message = `Hi ${loan.borrowerName},\n\nHere's your loan summary:\n• Outstanding: ${formatCurrency(balance)}\n• Interest: ${formatCurrency(interest)}\n• Next Due: ${formatDate(loan.dueDate)}\n\nPlease confirm or make your next payment. Thank you!`;

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        // Fallback: Copy to clipboard or show alert
        Alert.alert(
          'Loan Reminder',
          message,
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      // Create a temporary text file to share
      const FileSystem = require('expo-file-system');
      const fileUri = `${FileSystem.cacheDirectory}loan-reminder.txt`;
      
      await FileSystem.writeAsStringAsync(fileUri, message);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Send Loan Reminder',
        UTI: 'public.plain-text',
      });
      
    } catch (error: any) {
      console.error('Error sharing:', error);
      // Fallback: Show the message in an alert
      Alert.alert(
        'Loan Reminder',
        message,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const handleDeleteLoan = () => {
    Alert.alert(
      'Delete Loan',
      'Are you sure you want to delete this loan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLoan(loanId);
              Alert.alert('Success', 'Loan deleted', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error) {
              console.error('Error deleting loan:', error);
              Alert.alert('Error', 'Failed to delete loan');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: loan.borrowerName,
          headerBackTitle: 'Back',
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    loan.status === 'paid'
                      ? colors.secondary + '20'
                      : loan.status === 'overdue'
                      ? colors.error + '20'
                      : colors.primary + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      loan.status === 'paid'
                        ? colors.secondary
                        : loan.status === 'overdue'
                        ? colors.error
                        : colors.primary,
                  },
                ]}
              >
                {loan.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Summary Card */}
          <View style={[commonStyles.card, styles.summaryCard]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Loan Amount</Text>
                <Text style={styles.summaryValue}>{formatCurrency(loan.amount)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: balance > 0 ? colors.error : colors.secondary },
                  ]}
                >
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>

            <View style={commonStyles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Interest</Text>
                <Text style={styles.summaryValue}>{formatCurrency(interest)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Repaid</Text>
                <Text style={[styles.summaryValue, { color: colors.secondary }]}>
                  {formatCurrency(totalRepaid)}
                </Text>
              </View>
            </View>
          </View>

          {/* Details Card */}
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>Loan Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Rate</Text>
              <Text style={styles.detailValue}>
                {loan.interestRate}% ({loan.interestType})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(loan.startDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailValue}>{formatDate(loan.dueDate)}</Text>
            </View>
            {loan.notes && (
              <>
                <View style={commonStyles.divider} />
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.notesText}>{loan.notes}</Text>
              </>
            )}
          </View>

          {/* Payment History */}
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>Payment History</Text>
            {payments.length === 0 ? (
              <Text style={styles.emptyText}>No payments yet</Text>
            ) : (
              payments.map((payment) => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                    {payment.note && (
                      <Text style={styles.paymentNote}>{payment.note}</Text>
                    )}
                  </View>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={24}
                    color={colors.secondary}
                  />
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          {loan.status !== 'paid' && (
            <>
              <Pressable style={buttonStyles.primary} onPress={handleAddPayment}>
                <Text style={buttonStyles.text}>Add Payment</Text>
              </Pressable>

              <Pressable style={buttonStyles.secondary} onPress={handleMarkAsPaid}>
                <Text style={buttonStyles.text}>Mark as Paid</Text>
              </Pressable>
            </>
          )}

          <Pressable style={buttonStyles.outline} onPress={handleSendReminder}>
            <Text style={buttonStyles.textOutline}>Send Reminder</Text>
          </Pressable>

          {/* Delete Button */}
          <Pressable style={styles.deleteButton} onPress={handleDeleteLoan}>
            <Text style={styles.deleteButtonText}>Delete Loan</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  notesText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  paymentNote: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
