
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
  useColorScheme,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import { colors, commonStyles, buttonStyles, useThemeColors } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { useSettings } from '@/hooks/useSettings';
import { IconSymbol } from '@/components/IconSymbol';
import { copyImageToLocalStorage } from '@/utils/imageUtils';

export default function AddLoanScreen() {
  const router = useRouter();
  const { addLoan } = useLoans();
  const { settings } = useSettings();
  const themeColors = useThemeColors();

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
        console.log('Contact selected from picker:', result);
        
        // Extract name from the picker result
        let fullName = '';
        if (result.firstName || result.lastName) {
          const firstName = result.firstName || '';
          const lastName = result.lastName || '';
          fullName = `${firstName} ${lastName}`.trim();
        } else if (result.name) {
          fullName = result.name;
        }
        
        // Set the name immediately
        if (fullName) {
          setBorrowerName(fullName);
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
              setBorrowerPhoto(localUri);
            }
          } else {
            console.log('Contact does not have an image available');
          }
        } catch (imageError) {
          console.log('Could not access contact photo');
          // Silently continue - photo is optional
        }
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
      Alert.alert('Error', 'Failed to select contact. Please try again.');
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
        console.log('Photo selected from library');
        // Copy the selected image to local storage
        const localUri = await copyImageToLocalStorage(result.assets[0].uri);
        if (localUri) {
          setBorrowerPhoto(localUri);
          console.log('Photo set successfully');
        }
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
      <View style={[commonStyles.container, { backgroundColor: themeColors.background }]}>
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
                <View style={[styles.photoPlaceholder, { backgroundColor: themeColors.border }]}>
                  <IconSymbol name="person.fill" size={40} color={themeColors.textSecondary} />
                </View>
              )}
              <View style={[styles.editIconContainer, { backgroundColor: themeColors.card }]}>
                <IconSymbol name="pencil.circle.fill" size={32} color={colors.primary} />
              </View>
            </Pressable>
            <Text style={[styles.photoHint, { color: themeColors.textSecondary }]}>Tap to add photo</Text>
          </View>

          {/* Borrower Name */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.label, { color: themeColors.text }]}>Borrower Name</Text>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={[commonStyles.input, styles.nameInput, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }]}
                value={borrowerName}
                onChangeText={setBorrowerName}
                placeholder="Enter borrower name"
                placeholderTextColor={themeColors.textSecondary}
              />
              <Pressable style={[styles.contactButton, { borderColor: themeColors.border, backgroundColor: themeColors.card }]} onPress={handleSelectFromContacts}>
                <IconSymbol name="person.crop.circle.badge.plus" size={28} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.label, { color: themeColors.text }]}>Loan Amount ({settings.currencySymbol})</Text>
            <TextInput
              style={[commonStyles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }]}
              value={amount}
              onChangeText={(text) => {
                // Only allow whole numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                setAmount(cleaned);
              }}
              placeholder="0"
              placeholderTextColor={themeColors.textSecondary}
              keyboardType="number-pad"
            />
          </View>

          {/* Interest Rate */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.label, { color: themeColors.text }]}>Monthly Interest Rate (%)</Text>
            <TextInput
              style={[commonStyles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }]}
              value={interestRate}
              onChangeText={(text) => {
                // Only allow whole numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                setInterestRate(cleaned);
              }}
              placeholder="0"
              placeholderTextColor={themeColors.textSecondary}
              keyboardType="number-pad"
            />
            <Text style={[styles.helperText, { color: themeColors.textSecondary }]}>
              This is the monthly interest rate to be paid each month
            </Text>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.label, { color: themeColors.text }]}>Start Date</Text>
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
                  style={[styles.dateButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={[styles.dateButtonText, { color: themeColors.text }]}>
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
            <Text style={[commonStyles.label, { color: themeColors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[commonStyles.input, styles.notesInput, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor={themeColors.textSecondary}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 16,
  },
  photoHint: {
    fontSize: 13,
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
    height: 50,
  },
  helperText: {
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateButtonText: {
    fontSize: 16,
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
