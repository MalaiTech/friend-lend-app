
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
import { Stack, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { IconSymbol } from '@/components/IconSymbol';

export default function AddLoanScreen() {
  const router = useRouter();
  const { addLoan } = useLoans();

  const [borrowerName, setBorrowerName] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [notes, setNotes] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const handleSave = async () => {
    if (!borrowerName.trim()) {
      Alert.alert('Error', 'Please enter borrower name');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const rateNum = parseFloat(interestRate);
    if (isNaN(rateNum) || rateNum < 0) {
      Alert.alert('Error', 'Please enter a valid interest rate');
      return;
    }

    if (dueDate <= startDate) {
      Alert.alert('Error', 'Due date must be after start date');
      return;
    }

    try {
      await addLoan({
        borrowerName: borrowerName.trim(),
        amount: amountNum,
        interestRate: rateNum,
        interestType,
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        notes: notes.trim(),
      });

      Alert.alert('Success', 'Loan added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error adding loan:', error);
      Alert.alert('Error', 'Failed to add loan');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Loan',
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
          {/* Borrower Name */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Borrower Name</Text>
            <TextInput
              style={commonStyles.input}
              value={borrowerName}
              onChangeText={setBorrowerName}
              placeholder="Enter borrower name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Loan Amount (€)</Text>
            <TextInput
              style={commonStyles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Interest Rate */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Interest Rate (%)</Text>
            <TextInput
              style={commonStyles.input}
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="0.0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Interest Type */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Interest Type</Text>
            <View style={styles.interestTypeContainer}>
              <Pressable
                style={[
                  styles.interestTypeButton,
                  interestType === 'simple' && styles.interestTypeButtonActive,
                ]}
                onPress={() => setInterestType('simple')}
              >
                <Text
                  style={[
                    styles.interestTypeText,
                    interestType === 'simple' && styles.interestTypeTextActive,
                  ]}
                >
                  Simple
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.interestTypeButton,
                  interestType === 'compound' && styles.interestTypeButtonActive,
                ]}
                onPress={() => setInterestType('compound')}
              >
                <Text
                  style={[
                    styles.interestTypeText,
                    interestType === 'compound' && styles.interestTypeTextActive,
                  ]}
                >
                  Compound
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Start Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {startDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
            </Pressable>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Due Date</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dueDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
            </Pressable>
            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowDueDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Notes (Optional)</Text>
            <TextInput
              style={[commonStyles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <Pressable style={buttonStyles.primary} onPress={handleSave}>
            <Text style={buttonStyles.text}>Add Loan</Text>
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
  inputGroup: {
    marginBottom: 20,
  },
  interestTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  interestTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  interestTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  interestTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  interestTypeTextActive: {
    color: colors.primary,
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
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
});
