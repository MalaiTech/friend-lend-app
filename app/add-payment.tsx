
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
import { IconSymbol } from '@/components/IconSymbol';

export default function AddPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loanId = params.loanId as string;

  const { addPayment, loans } = useLoans();
  const loan = loans.find((l) => l.id === loanId);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!loan) {
    return (
      <View style={commonStyles.container}>
        <Text style={styles.errorText}>Loan not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await addPayment({
        loanId,
        amount: amountNum,
        date: date.toISOString(),
        note: note.trim(),
      });

      Alert.alert('Success', 'Payment added successfully', [
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

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Payment Amount (€)</Text>
            <TextInput
              style={commonStyles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              autoFocus
            />
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
    marginBottom: 24,
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
  inputGroup: {
    marginBottom: 20,
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
