
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { useSettings } from '@/hooks/useSettings';
import { IconSymbol } from '@/components/IconSymbol';
import {
  calculateLoanOutstanding,
  calculateInterestOutstanding,
  calculateInterest,
  formatCurrency,
  formatDate,
  getInterestPaymentStatus,
  calculateMonthlyInterest,
} from '@/utils/loanCalculations';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LoanDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loanId = params.id as string;

  const { loans, getPaymentsForLoan, deleteLoan, updateLoan, updatePayment, deletePayment } = useLoans();
  const { settings } = useSettings();
  const loan = loans.find((l) => l.id === loanId);
  const payments = getPaymentsForLoan(loanId);

  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState(false);
  const [editBorrowerName, setEditBorrowerName] = useState('');

  if (!loan) {
    return (
      <View style={commonStyles.container}>
        <Text style={styles.errorText}>Loan not found</Text>
      </View>
    );
  }

  const loanOutstanding = calculateLoanOutstanding(loan, payments);
  const interestOutstanding = calculateInterestOutstanding(loan, payments);
  const principalPayments = payments.filter(p => p.type === 'principal');
  const interestPayments = payments.filter(p => p.type === 'interest');
  const totalRepaid = principalPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalInterestPaid = interestPayments.reduce((sum, p) => sum + p.amount, 0);
  const interestStatus = getInterestPaymentStatus(loan, payments);
  const monthlyInterest = calculateMonthlyInterest(loan.amount, loan.interestRate);

  const handleAddPayment = () => {
    router.push(`/add-payment?loanId=${loanId}`);
  };

  const handleSendReminder = async () => {
    const message = `Hi ${loan.borrowerName},\n\nHere's your loan summary:\n• Loan Outstanding: ${formatCurrency(loanOutstanding, settings.currencySymbol)}\n• Interest Outstanding: ${formatCurrency(interestOutstanding, settings.currencySymbol)}\n• Monthly Interest: ${formatCurrency(monthlyInterest, settings.currencySymbol)}\n\nPlease make your payment. Thank you!`;

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        console.log('Sharing not available, showing alert instead');
        Alert.alert(
          'Loan Reminder',
          message,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Create a file in the cache directory using the new FileSystem API
      const fileName = `loan-reminder-${Date.now()}.txt`;
      const file = new File(Paths.cache, fileName);
      
      // Write the message to the file
      await file.write(message);
      
      console.log('File created at:', file.uri);
      
      // Share the file
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: 'Send Loan Reminder',
        UTI: 'public.plain-text',
      });
      
      console.log('File shared successfully');
      
    } catch (error: any) {
      console.error('Error sharing loan reminder:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // Fallback to showing the message in an alert
      Alert.alert(
        'Unable to Share',
        `Could not open share dialog. Here's the reminder message:\n\n${message}`,
        [
          { 
            text: 'Copy Message', 
            onPress: () => {
              // On a real device, you could use Clipboard here
              console.log('Message to copy:', message);
            }
          },
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

  const handleEditBorrower = () => {
    setEditBorrowerName(loan.borrowerName);
    setEditingBorrower(true);
  };

  const handleSaveBorrowerName = async () => {
    if (editBorrowerName.trim()) {
      await updateLoan(loanId, { borrowerName: editBorrowerName.trim() });
      setEditingBorrower(false);
    }
  };

  const handleSelectFromContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant contacts permission to select a contact.');
        return;
      }

      const result = await Contacts.presentContactPickerAsync();
      
      if (result) {
        console.log('Contact selected:', result);
        
        const updateData: any = {};
        
        // Extract name from the initial result
        let fullName = '';
        if (result.firstName || result.lastName) {
          const firstName = result.firstName || '';
          const lastName = result.lastName || '';
          fullName = `${firstName} ${lastName}`.trim();
        } else if (result.name) {
          fullName = result.name;
        }
        
        // Set the name immediately from the picker result
        if (fullName) {
          updateData.borrowerName = fullName;
          console.log('Set borrower name from picker:', fullName);
        }
        
        // Try to get the photo from the picker result
        if (result.imageAvailable) {
          try {
            // Get full contact details with image
            const fullContact = await Contacts.getContactByIdAsync(result.id, [
              Contacts.Fields.Image,
            ]);
            
            console.log('Full contact details:', fullContact);
            
            if (fullContact && fullContact.image && fullContact.image.uri) {
              console.log('Setting photo from contact:', fullContact.image.uri);
              updateData.borrowerPhoto = fullContact.image.uri;
            } else {
              console.log('No image found in full contact details');
            }
          } catch (imageError) {
            console.error('Error fetching contact image:', imageError);
            // Continue without photo - name is already set
          }
        } else {
          console.log('Contact has no image available');
        }
        
        // Update the loan
        if (Object.keys(updateData).length > 0) {
          await updateLoan(loanId, updateData);
          setEditingBorrower(false);
        }
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
      Alert.alert('Error', 'Failed to select contact');
    }
  };

  const handleChangePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permission to select a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await updateLoan(loanId, { borrowerPhoto: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditDate(new Date(payment.date));
  };

  const handleSavePaymentEdit = async () => {
    const amountNum = parseInt(editAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    await updatePayment(editingPayment.id, {
      amount: amountNum,
      date: editDate.toISOString(),
    });
    setEditingPayment(null);
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePayment(paymentId);
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
          {/* Borrower Info */}
          <View style={[commonStyles.card, styles.borrowerCard]}>
            <Pressable style={styles.photoContainer} onPress={handleChangePhoto}>
              {loan.borrowerPhoto ? (
                <Image source={{ uri: loan.borrowerPhoto }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <IconSymbol name="person.fill" size={40} color={colors.textSecondary} />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <IconSymbol name="pencil.circle.fill" size={28} color={colors.primary} />
              </View>
            </Pressable>
            <Pressable onPress={handleEditBorrower} style={styles.nameEditButton}>
              <Text style={styles.borrowerNameLarge}>{loan.borrowerName}</Text>
              <IconSymbol name="pencil" size={18} color={colors.primary} />
            </Pressable>
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

          {/* Interest Warning */}
          {interestStatus.monthsOverdue > 0 && loan.status !== 'paid' && (
            <View style={[commonStyles.card, styles.warningCard]}>
              <View style={styles.warningHeader}>
                <IconSymbol name="exclamationmark.triangle.fill" size={28} color={colors.error} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.warningTitle}>Interest Payment Overdue!</Text>
                  <Text style={styles.warningText}>
                    {interestStatus.monthsOverdue} month{interestStatus.monthsOverdue > 1 ? 's' : ''} unpaid
                  </Text>
                </View>
              </View>
              <View style={styles.warningAmountContainer}>
                <Text style={styles.warningLabel}>Amount Due:</Text>
                <Text style={styles.warningAmount}>
                  {formatCurrency(interestStatus.amountDue, settings.currencySymbol)}
                </Text>
              </View>
            </View>
          )}

          {/* Dashboard Summary */}
          <View style={[commonStyles.card, styles.summaryCard]}>
            <Text style={styles.cardTitle}>Loan Overview</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Loan Outstanding</Text>
                <Text style={[styles.summaryValue, { color: loanOutstanding > 0 ? colors.primary : colors.secondary }]}>
                  {formatCurrency(loanOutstanding, settings.currencySymbol)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Loan Repaid</Text>
                <Text style={[styles.summaryValue, { color: colors.secondary }]}>
                  {formatCurrency(totalRepaid, settings.currencySymbol)}
                </Text>
              </View>
            </View>

            <View style={commonStyles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Interest Outstanding</Text>
                <Text style={[styles.summaryValue, { color: interestOutstanding > 0 ? colors.accent : colors.secondary }]}>
                  {formatCurrency(interestOutstanding, settings.currencySymbol)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Interest Paid</Text>
                <Text style={[styles.summaryValue, { color: colors.secondary }]}>
                  {formatCurrency(totalInterestPaid, settings.currencySymbol)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={[buttonStyles.primary, { flex: 1 }]} onPress={handleAddPayment}>
              <Text style={buttonStyles.text}>Add Payment</Text>
            </Pressable>
            <Pressable style={[buttonStyles.outline, { flex: 1 }]} onPress={handleSendReminder}>
              <Text style={buttonStyles.textOutline}>Send Reminder</Text>
            </Pressable>
          </View>

          {/* Details Card */}
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>Loan Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loan Amount</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(loan.amount, settings.currencySymbol)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Rate</Text>
              <Text style={styles.detailValue}>
                {loan.interestRate}% monthly ({loan.interestType})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Interest</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(monthlyInterest, settings.currencySymbol)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(loan.startDate)}</Text>
            </View>
            {loan.closeDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Close Date</Text>
                <Text style={styles.detailValue}>{formatDate(loan.closeDate)}</Text>
              </View>
            )}
            {loan.lastInterestPaymentDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Interest Payment</Text>
                <Text style={styles.detailValue}>
                  {formatDate(loan.lastInterestPaymentDate)}
                </Text>
              </View>
            )}
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
              <>
                {principalPayments.length > 0 && (
                  <>
                    <Text style={styles.paymentTypeHeader}>Principal Payments</Text>
                    {principalPayments.map((payment) => (
                      <View key={payment.id} style={styles.paymentItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentAmount}>
                            {formatCurrency(payment.amount, settings.currencySymbol)}
                          </Text>
                          <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                          {payment.note && (
                            <Text style={styles.paymentNote}>{payment.note}</Text>
                          )}
                        </View>
                        <View style={styles.paymentActions}>
                          <Pressable onPress={() => handleEditPayment(payment)} style={styles.actionIcon}>
                            <IconSymbol name="pencil" size={20} color={colors.primary} />
                          </Pressable>
                          <Pressable onPress={() => handleDeletePayment(payment.id)} style={styles.actionIcon}>
                            <IconSymbol name="trash" size={20} color={colors.error} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </>
                )}
                
                {interestPayments.length > 0 && (
                  <>
                    <Text style={styles.paymentTypeHeader}>Interest Payments</Text>
                    {interestPayments.map((payment) => (
                      <View key={payment.id} style={styles.paymentItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentAmount}>
                            {formatCurrency(payment.amount, settings.currencySymbol)}
                          </Text>
                          <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                          {payment.note && (
                            <Text style={styles.paymentNote}>{payment.note}</Text>
                          )}
                        </View>
                        <View style={styles.paymentActions}>
                          <Pressable onPress={() => handleEditPayment(payment)} style={styles.actionIcon}>
                            <IconSymbol name="pencil" size={20} color={colors.primary} />
                          </Pressable>
                          <Pressable onPress={() => handleDeletePayment(payment.id)} style={styles.actionIcon}>
                            <IconSymbol name="trash" size={20} color={colors.error} />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>

          {/* Delete Button */}
          <Pressable style={styles.deleteButton} onPress={handleDeleteLoan}>
            <Text style={styles.deleteButtonText}>Delete Loan</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Edit Payment Modal */}
      <Modal
        visible={editingPayment !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Payment</Text>
            
            <Text style={styles.modalLabel}>Amount ({settings.currencySymbol})</Text>
            <TextInput
              style={styles.modalInput}
              value={editAmount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setEditAmount(cleaned);
              }}
              keyboardType="number-pad"
            />

            <Text style={styles.modalLabel}>Date</Text>
            <Pressable
              style={styles.modalDateButton}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={styles.modalDateText}>{formatDate(editDate.toISOString())}</Text>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
            </Pressable>
            {showEditDatePicker && (
              <DateTimePicker
                value={editDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEditDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEditDate(selectedDate);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditingPayment(null)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSavePaymentEdit}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Borrower Modal */}
      <Modal
        visible={editingBorrower}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingBorrower(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Borrower</Text>
            
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editBorrowerName}
              onChangeText={setEditBorrowerName}
              placeholder="Enter borrower name"
              placeholderTextColor={colors.textSecondary}
            />

            <Pressable style={styles.contactsButton} onPress={handleSelectFromContacts}>
              <IconSymbol name="person.crop.circle.badge.plus" size={24} color={colors.primary} />
              <Text style={styles.contactsButtonText}>Select from Contacts</Text>
            </Pressable>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditingBorrower(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveBorrowerName}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  borrowerCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 14,
  },
  nameEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  borrowerNameLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
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
  warningCard: {
    marginBottom: 16,
    backgroundColor: colors.error + '10',
    borderWidth: 2,
    borderColor: colors.error + '40',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  warningAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  warningAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.error,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  paymentTypeHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
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
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  modalDateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  modalDateText: {
    fontSize: 16,
    color: colors.text,
  },
  contactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  contactsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
