
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { useSettings } from '@/hooks/useSettings';
import { IconSymbol } from '@/components/IconSymbol';
import { getInterestPaymentStatus, calculateMonthlyInterest } from '@/utils/loanCalculations';

export default function AddPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loanId = params.loanId as string;

  const { addPayment, loans, getPaymentsForLoan } = useLoans();
  const { settings } = useSettings();
  const loan = loans.find((l) => l.id === loanId);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [paymentType, setPaymentType] = useState<'principal' | 'interest'>('principal');
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!loan) {
    return (
      <View style={commonStyles.container}>
        <Text style={styles.errorText}>Loan not found</Text>
      </View>
    );
  }

  const interestStatus = getInterestPaymentStatus(loan, getPaymentsForLoan(loanId));
  const monthlyInterest = calculateMonthlyInterest(loan.amount, loan.interestRate);

  const handleSave = async () => {
    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount (whole number)');
      return;
    }

    try {
      await addPayment({
        loanId,
        amount: amountNum,
        date: date.toISOString(),
        note: note.trim(),
        type: paymentType,
      });

      Alert.alert('Success', `${paymentType === 'principal' ? 'Loan' : 'Interest'} payment added successfully`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error adding payment:', error);
      Alert.alert('Error', 'Failed to add payment');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Payment',
          presentation: 'modal',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Loan Info */}
          <View style={[commonStyles.card, styles.loanInfoCard]}>
            <Text style={styles.loanInfoLabel}>Payment for</Text>
            <Text style={styles.loanInfoValue}>{loan.borrowerName}</Text>
          </View>

          {/* Interest Warning */}
          {interestStatus.monthsOverdue > 0 && (
            <View style={[commonStyles.card, styles.warningCard]}>
              <View style={styles.warningHeader}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.error} />
                <Text style={styles.warningTitle}>Interest Payment Overdue</Text>
              </View>
              <Text style={styles.warningText}>
                {interestStatus.monthsOverdue} month{interestStatus.monthsOverdue > 1 ? 's' : ''} of interest unpaid
              </Text>
              <Text style={styles.warningAmount}>
                Amount due: {settings.currencySymbol}{interestStatus.amountDue.toLocaleString()}
              </Text>
              <Text style={styles.warningSubtext}>
                Monthly interest: {settings.currencySymbol}{monthlyInterest.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Payment Type */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Payment Type</Text>
            <View style={styles.paymentTypeContainer}>
              <Pressable
                style={[
                  styles.paymentTypeButton,
                  paymentType === 'principal' && styles.paymentTypeButtonActive,
                ]}
                onPress={() => setPaymentType('principal')}
              >
                <IconSymbol 
                  name="banknote" 
                  size={20} 
                  color={paymentType === 'principal' ? colors.primary : colors.textSecondary} 
                />
                <Text
                  style={[
                    styles.paymentTypeText,
                    paymentType === 'principal' && styles.paymentTypeTextActive,
                  ]}
                >
                  Loan Payment
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.paymentTypeButton,
                  paymentType === 'interest' && styles.paymentTypeButtonActive,
                ]}
                onPress={() => setPaymentType('interest')}
              >
                <IconSymbol 
                  name="percent" 
                  size={20} 
                  color={paymentType === 'interest' ? colors.primary : colors.textSecondary} 
                />
                <Text
                  style={[
                    styles.paymentTypeText,
                    paymentType === 'interest' && styles.paymentTypeTextActive,
                  ]}
                >
                  Interest Payment
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>
              Payment Amount ({settings.currencySymbol})
            </Text>
            <TextInput
              style={commonStyles.input}
              value={amount}
              onChangeText={(text) => {
                // Only allow whole numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                setAmount(cleaned);
              }}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              autoFocus
            />
            {paymentType === 'interest' && monthlyInterest > 0 && (
              <Pressable 
                style={styles.quickFillButton}
                onPress={() => setAmount(monthlyInterest.toString())}
              >
                <Text style={styles.quickFillText}>
                  Quick fill: {settings.currencySymbol}{monthlyInterest.toLocaleString()} (1 month)
                </Text>
              </Pressable>
            )}
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Payment Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Note (Optional)</Text>
            <TextInput
              style={[commonStyles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="e.g., Bank transfer, Cash payment..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <Pressable style={buttonStyles.primary} onPress={handleSave}>
            <Text style={buttonStyles.text}>Add Payment</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  loanInfoCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  loanInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  loanInfoValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  warningAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 8,
  },
  paymentTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  paymentTypeTextActive: {
    color: colors.primary,
  },
  quickFillButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quickFillText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  noteInput: {
    height: 80,
    paddingTop: 12,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
});
