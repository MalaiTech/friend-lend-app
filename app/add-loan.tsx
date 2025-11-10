
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
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { useSettings } from '@/hooks/useSettings';
import { IconSymbol } from '@/components/IconSymbol';

export default function AddLoanScreen() {
  const router = useRouter();
  const { addLoan } = useLoans();
  const { settings } = useSettings();

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhoto, setBorrowerPhoto] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

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
          setBorrowerName(fullName);
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
              setBorrowerPhoto(fullContact.image.uri);
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
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
      Alert.alert('Error', 'Failed to select contact');
    }
  };

  const handleSelectPhoto = async () => {
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
        setBorrowerPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const handleSave = async () => {
    if (!borrowerName.trim()) {
      Alert.alert('Error', 'Please enter borrower name');
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount (whole number)');
      return;
    }

    const rateNum = parseInt(interestRate, 10);
    if (isNaN(rateNum) || rateNum < 0) {
      Alert.alert('Error', 'Please enter a valid monthly interest rate (whole number)');
      return;
    }

    try {
      await addLoan({
        borrowerName: borrowerName.trim(),
        borrowerPhoto,
        amount: amountNum,
        interestRate: rateNum,
        interestType,
        startDate: startDate.toISOString(),
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
          {/* Borrower Photo */}
          <View style={styles.photoSection}>
            <Pressable style={styles.photoContainer} onPress={handleSelectPhoto}>
              {borrowerPhoto ? (
                <Image source={{ uri: borrowerPhoto }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <IconSymbol name="person.fill" size={40} color={colors.textSecondary} />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <IconSymbol name="pencil.circle.fill" size={32} color={colors.primary} />
              </View>
            </Pressable>
            <Text style={styles.photoHint}>Tap to add photo</Text>
          </View>

          {/* Borrower Name */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Borrower Name</Text>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={[commonStyles.input, styles.nameInput]}
                value={borrowerName}
                onChangeText={setBorrowerName}
                placeholder="Enter borrower name"
                placeholderTextColor={colors.textSecondary}
              />
              <Pressable style={styles.contactButton} onPress={handleSelectFromContacts}>
                <IconSymbol name="person.crop.circle.badge.plus" size={28} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Loan Amount ({settings.currencySymbol})</Text>
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
            />
          </View>

          {/* Interest Rate */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Monthly Interest Rate (%)</Text>
            <TextInput
              style={commonStyles.input}
              value={interestRate}
              onChangeText={(text) => {
                // Only allow whole numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                setInterestRate(cleaned);
              }}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
            <Text style={styles.helperText}>
              This is the monthly interest rate to be paid each month
            </Text>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={commonStyles.label}>Start Date</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="inline"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
                style={styles.iosDatePicker}
              />
            ) : (
              <>
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
                      setShowStartDatePicker(false);
                      if (selectedDate) {
                        setStartDate(selectedDate);
                      }
                    }}
                  />
                )}
              </>
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
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
    borderRadius: 16,
  },
  photoHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  nameInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
  },
  contactButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    height: 50,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
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
  iosDatePicker: {
    width: '100%',
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
