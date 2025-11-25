
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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { colors, commonStyles, buttonStyles, useThemeColors } from '@/styles/commonStyles';
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
import { copyImageToLocalStorage } from '@/utils/imageUtils';

export default function LoanDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const loanId = params.id as string;
  const themeColors = useThemeColors();

  const { loans, getPaymentsForLoan, deleteLoan, updateLoan, updatePayment, deletePayment, refreshData } = useLoans();
  const { settings, reloadSettings } = useSettings();
  const loan = loans.find((l) => l.id === loanId);
  const payments = getPaymentsForLoan(loanId);

  // Refresh data and settings when screen comes into focus (e.g., after adding a payment)
  useFocusEffect(
    React.useCallback(() => {
      console.log('Loan detail screen focused, refreshing data and settings...');
      refreshData();
      reloadSettings();
    }, [refreshData, reloadSettings])
  );

  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState(false);
  const [editBorrowerName, setEditBorrowerName] = useState('');

  // Recalculate values when data changes
  const loanOutstanding = loan ? calculateLoanOutstanding(loan, payments) : 0;
  const interestOutstanding = loan ? calculateInterestOutstanding(loan, payments) : 0;
  const principalPayments = payments.filter(p => p.type === 'principal');
  const interestPayments = payments.filter(p => p.type === 'interest');
  const totalRepaid = principalPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalInterestPaid = interestPayments.reduce((sum, p) => sum + p.amount, 0);
  const interestStatus = loan ? getInterestPaymentStatus(loan, payments) : { monthsOverdue: 0, amountDue: 0 };
  const monthlyInterest = loan ? calculateMonthlyInterest(loan.amount, loan.interestRate) : 0;

  if (!loan) {
    return (
      <View style={[commonStyles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>Loan not found</Text>
      </View>
    );
  }

  const handleAddPayment = () => {
    router.push(`/add-payment?loanId=${loanId}`);
  };

  const handleSendReminder = async () => {
    const message = `Hi ${loan.borrowerName},\n\nHere's your loan summary:\n• Loan Outstanding: ${formatCurrency(loanOutstanding, settings.currencySymbol)}\n• Interest Outstanding: ${formatCurrency(interestOutstanding, settings.currencySymbol)}\n• Monthly Interest: ${formatCurrency(monthlyInterest, settings.currencySymbol)}\n\nPlease make your payment. Thank you!`;

    try {
      // Copy the message to clipboard
      await Clipboard.setStringAsync(message);
      
      Alert.alert(
        'Reminder Copied',
        'The loan reminder has been copied to your clipboard. You can now paste it into your messaging app.',
        [{ text: 'OK', style: 'default' }]
      );
      
      console.log('Reminder message copied to clipboard');
    } catch (error: any) {
      console.error('Error copying to clipboard:', error);
      
      // Fallback to showing the message in an alert
      Alert.alert(
        'Loan Reminder',
        message,
        [{ text: 'OK', style: 'default' }]
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
        console.log('Contact selected from picker:', result);
        
        const updateData: any = {};
        
        // Extract name from the picker result
        let fullName = '';
        if (result.firstName || result.lastName) {
          const firstName = result.firstName || '';
          const lastName = result.lastName || '';
          fullName = `${firstName} ${lastName}`.trim();
        } else if (result.name) {
          fullName = result.name;
        }
        
        // Set the name
        if (fullName) {
          updateData.borrowerName = fullName;
          console.log('Set borrower name:', fullName);
        }
        
        // Now fetch the full contact details including the image
        try {
          console.log('Fetching full contact details for ID:', result.id);
          
          const fullContact = await Contacts.getContactByIdAsync(result.id, [
            Contacts.Fields.Image,
            Contacts.Fields.ImageAvailable,
          ]);
          
          console.log('Full contact retrieved:', {
            id: fullContact?.id,
            imageAvailable: fullContact?.imageAvailable,
            hasImage: !!fullContact?.image,
          });
          
          if (fullContact?.imageAvailable && fullContact?.image?.uri) {
            console.log('Contact has image, attempting to copy');
            
            // Copy the image to local storage
            const localUri = await copyImageToLocalStorage(fullContact.image.uri);
            
            if (localUri) {
              console.log('Successfully set contact image');
              updateData.borrowerPhoto = localUri;
            }
          } else {
            console.log('Contact does not have an image available');
          }
        } catch (imageError) {
          console.log('Could not access contact photo');
          // Silently continue - photo is optional
        }
        
        // Update the loan
        if (Object.keys(updateData).length > 0) {
          await updateLoan(loanId, updateData);
          setEditingBorrower(false);
        }
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
      Alert.alert('Error', 'Failed to select contact. Please try again.');
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
        console.log('Photo selected from library');
        // Copy the selected image to local storage
        const localUri = await copyImageToLocalStorage(result.assets[0].uri);
        if (localUri) {
          await updateLoan(loanId, { borrowerPhoto: localUri });
          console.log('Photo updated successfully');
        }
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const handleEditPayment = (payment: any) => {
    console.log('Editing payment:', payment);
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    // Initialize with the original payment date
    const paymentDate = new Date(payment.date);
    console.log('Setting initial edit date to:', paymentDate.toISOString());
    setEditDate(paymentDate);
  };

  const handleEditDateChange = (event: any, selectedDate?: Date) => {
    console.log('Edit date picker event:', event.type, 'Selected date:', selectedDate);
    
    // On Android, hide the picker after selection or dismissal
    if (Platform.OS === 'android') {
      setShowEditDatePicker(false);
    }
    
    // Update the date if a valid date was selected and not cancelled
    if (event.type === 'set' && selectedDate) {
      console.log('Setting edit date to:', selectedDate.toISOString());
      setEditDate(selectedDate);
    }
  };

  const handleSavePaymentEdit = async () => {
    const amountNum = parseInt(editAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    console.log('Saving payment edit with date:', editDate.toISOString());
    await updatePayment(editingPayment.id, {
      amount: amountNum,
      date: editDate.toISOString(),
    });
    setEditingPayment(null);
    setShowEditDatePicker(false);
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
      <View style={[commonStyles.container, { backgroundColor: themeColors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Borrower Info */}
          <View style={[commonStyles.card, styles.borrowerCard, { backgroundColor: themeColors.card }]}>
            <Pressable style={styles.photoContainer} onPress={handleChangePhoto}>
              {loan.borrowerPhoto ? (
                <Image source={{ uri: loan.borrowerPhoto }} style={styles.photo} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: themeColors.border }]}>
                  <IconSymbol 
                    ios_icon_name="person.fill" 
                    android_material_icon_name="person" 
                    size={40} 
                    color={themeColors.textSecondary} 
                  />
                </View>
              )}
              <View style={[styles.editIconContainer, { backgroundColor: themeColors.card }]}>
                <IconSymbol 
                  ios_icon_name="pencil.circle.fill" 
                  android_material_icon_name="edit" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
            </Pressable>
            <Pressable onPress={handleEditBorrower} style={styles.nameEditButton}>
              <Text style={[styles.borrowerNameLarge, { color: themeColors.text }]}>{loan.borrowerName}</Text>
              <IconSymbol 
                ios_icon_name="pencil" 
                android_material_icon_name="edit" 
                size={18} 
                color={colors.primary} 
              />
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
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={28} 
                  color={colors.error} 
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.warningTitle}>Interest Payment Overdue!</Text>
                  <Text style={[styles.warningText, { color: themeColors.text }]}>
                    {interestStatus.monthsOverdue} month{interestStatus.monthsOverdue > 1 ? 's' : ''} unpaid
                  </Text>
                </View>
              </View>
              <View style={styles.warningAmountContainer}>
                <Text style={[styles.warningLabel, { color: themeColors.text }]}>Amount Due:</Text>
                <Text style={styles.warningAmount}>
                  {formatCurrency(interestStatus.amountDue, settings.currencySymbol)}
                </Text>
              </View>
            </View>
          )}

          {/* Dashboard Summary */}
          <View style={[commonStyles.card, styles.summaryCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Loan Overview</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Loan Outstanding</Text>
                <Text style={[styles.summaryValue, { color: loanOutstanding > 0 ? colors.primary : colors.secondary }]}>
                  {formatCurrency(loanOutstanding, settings.currencySymbol)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Loan Repaid</Text>
                <Text style={[styles.summaryValue, { color: colors.secondary }]}>
                  {formatCurrency(totalRepaid, settings.currencySymbol)}
                </Text>
              </View>
            </View>

            <View style={[commonStyles.divider, { backgroundColor: themeColors.border }]} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Interest Outstanding</Text>
                <Text style={[styles.summaryValue, { color: interestOutstanding > 0 ? colors.accent : colors.secondary }]}>
                  {formatCurrency(interestOutstanding, settings.currencySymbol)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Interest Paid</Text>
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
          <View style={[commonStyles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Loan Details</Text>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Loan Amount</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>
                {formatCurrency(loan.amount, settings.currencySymbol)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Interest Rate</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>
                {loan.interestRate}% monthly ({loan.interestType})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Monthly Interest</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>
                {formatCurrency(monthlyInterest, settings.currencySymbol)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Start Date</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{formatDate(loan.startDate)}</Text>
            </View>
            {loan.closeDate && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Closure Date</Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>{formatDate(loan.closeDate)}</Text>
              </View>
            )}
            {loan.notes && (
              <>
                <View style={[commonStyles.divider, { backgroundColor: themeColors.border }]} />
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Notes</Text>
                <Text style={[styles.notesText, { color: themeColors.text }]}>{loan.notes}</Text>
              </>
            )}
          </View>

          {/* Payment History */}
          <View style={[commonStyles.card, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Payment History</Text>
            {payments.length === 0 ? (
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No payments yet</Text>
            ) : (
              <>
                {principalPayments.length > 0 && (
                  <>
                    <Text style={[styles.paymentTypeHeader, { color: themeColors.text }]}>Principal Payments</Text>
                    {principalPayments.map((payment) => (
                      <View key={payment.id} style={[styles.paymentItem, { borderBottomColor: themeColors.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.paymentAmount, { color: themeColors.text }]}>
                            {formatCurrency(payment.amount, settings.currencySymbol)}
                          </Text>
                          <Text style={[styles.paymentDate, { color: themeColors.textSecondary }]}>{formatDate(payment.date)}</Text>
                          {payment.note && (
                            <Text style={[styles.paymentNote, { color: themeColors.textSecondary }]}>{payment.note}</Text>
                          )}
                        </View>
                        <View style={styles.paymentActions}>
                          <Pressable onPress={() => handleEditPayment(payment)} style={styles.actionIcon}>
                            <IconSymbol 
                              ios_icon_name="pencil" 
                              android_material_icon_name="edit" 
                              size={20} 
                              color={colors.primary} 
                            />
                          </Pressable>
                          <Pressable onPress={() => handleDeletePayment(payment.id)} style={styles.actionIcon}>
                            <IconSymbol 
                              ios_icon_name="trash" 
                              android_material_icon_name="delete" 
                              size={20} 
                              color={colors.error} 
                            />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </>
                )}
                
                {interestPayments.length > 0 && (
                  <>
                    <Text style={[styles.paymentTypeHeader, { color: themeColors.text }]}>Interest Payments</Text>
                    {interestPayments.map((payment) => (
                      <View key={payment.id} style={[styles.paymentItem, { borderBottomColor: themeColors.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.paymentAmount, { color: themeColors.text }]}>
                            {formatCurrency(payment.amount, settings.currencySymbol)}
                          </Text>
                          <Text style={[styles.paymentDate, { color: themeColors.textSecondary }]}>{formatDate(payment.date)}</Text>
                          {payment.note && (
                            <Text style={[styles.paymentNote, { color: themeColors.textSecondary }]}>{payment.note}</Text>
                          )}
                        </View>
                        <View style={styles.paymentActions}>
                          <Pressable onPress={() => handleEditPayment(payment)} style={styles.actionIcon}>
                            <IconSymbol 
                              ios_icon_name="pencil" 
                              android_material_icon_name="edit" 
                              size={20} 
                              color={colors.primary} 
                            />
                          </Pressable>
                          <Pressable onPress={() => handleDeletePayment(payment.id)} style={styles.actionIcon}>
                            <IconSymbol 
                              ios_icon_name="trash" 
                              android_material_icon_name="delete" 
                              size={20} 
                              color={colors.error} 
                            />
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
          <Pressable style={[styles.deleteButton, { borderColor: colors.error }]} onPress={handleDeleteLoan}>
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
        onRequestClose={() => {
          setEditingPayment(null);
          setShowEditDatePicker(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Edit Payment</Text>
                
                <Text style={[styles.modalLabel, { color: themeColors.text }]}>Amount ({settings.currencySymbol})</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]}
                  value={editAmount}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setEditAmount(cleaned);
                  }}
                  keyboardType="number-pad"
                  placeholderTextColor={themeColors.textSecondary}
                />

                <Text style={[styles.modalLabel, { color: themeColors.text }]}>Date</Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={editDate}
                    mode="date"
                    display="inline"
                    onChange={handleEditDateChange}
                    style={styles.iosDatePicker}
                    maximumDate={new Date()}
                  />
                ) : (
                  <>
                    <Pressable
                      style={[styles.modalDateButton, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                      onPress={() => {
                        console.log('Opening edit date picker with date:', editDate.toISOString());
                        setShowEditDatePicker(true);
                      }}
                    >
                      <Text style={[styles.modalDateText, { color: themeColors.text }]}>{formatDate(editDate.toISOString())}</Text>
                      <IconSymbol 
                        ios_icon_name="calendar" 
                        android_material_icon_name="calendar_today" 
                        size={20} 
                        color={colors.primary} 
                      />
                    </Pressable>
                    {showEditDatePicker && (
                      <DateTimePicker
                        value={editDate}
                        mode="date"
                        display="default"
                        onChange={handleEditDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}

                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                    onPress={() => {
                      setEditingPayment(null);
                      setShowEditDatePicker(false);
                    }}
                  >
                    <Text style={[styles.modalButtonTextCancel, { color: themeColors.text }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: colors.primary }]}
                    onPress={handleSavePaymentEdit}
                  >
                    <Text style={[styles.modalButtonTextSave, { color: themeColors.card }]}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Borrower Modal */}
      <Modal
        visible={editingBorrower}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingBorrower(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Edit Borrower</Text>
                
                <Text style={[styles.modalLabel, { color: themeColors.text }]}>Name</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]}
                  value={editBorrowerName}
                  onChangeText={setEditBorrowerName}
                  placeholder="Enter borrower name"
                  placeholderTextColor={themeColors.textSecondary}
                />

                <Pressable style={[styles.contactsButton, { borderColor: themeColors.border, backgroundColor: themeColors.background }]} onPress={handleSelectFromContacts}>
                  <IconSymbol 
                    ios_icon_name="person.crop.circle.badge.plus" 
                    android_material_icon_name="person_add" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={styles.contactsButtonText}>Select from Contacts</Text>
                </Pressable>

                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                    onPress={() => setEditingBorrower(false)}
                  >
                    <Text style={[styles.modalButtonTextCancel, { color: themeColors.text }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: colors.primary }]}
                    onPress={handleSaveBorrowerName}
                  >
                    <Text style={[styles.modalButtonTextSave, { color: themeColors.card }]}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
    marginTop: 2,
  },
  warningAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningLabel: {
    fontSize: 15,
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
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  paymentTypeHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
  },
  paymentNote: {
    fontSize: 13,
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
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalDateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  modalDateText: {
    fontSize: 16,
  },
  iosDatePicker: {
    width: '100%',
    marginBottom: 20,
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
    borderWidth: 1,
  },
  modalButtonSave: {
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
  },
});
