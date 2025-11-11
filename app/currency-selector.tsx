
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useSettings } from '@/hooks/useSettings';
import { CURRENCIES, Currency } from '@/utils/currencies';
import { IconSymbol } from '@/components/IconSymbol';

export default function CurrencySelectorScreen() {
  const router = useRouter();
  const { settings, setCurrency } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);

  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurrency = async (currency: Currency) => {
    if (isSelecting) {
      console.log('Already selecting a currency, ignoring');
      return;
    }

    console.log('Currency selected:', currency.code, currency.symbol);
    setIsSelecting(true);
    
    try {
      // Save currency
      await setCurrency(currency.code, currency.symbol);
      console.log('Currency saved successfully');
      
      // Navigate back immediately
      router.back();
    } catch (error) {
      console.error('Error selecting currency:', error);
      setIsSelecting(false);
    }
  };

  const handleCancel = () => {
    console.log('Currency selection cancelled');
    router.back();
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === settings.currency;

    return (
      <Pressable
        style={[
          styles.currencyItem, 
          isSelected && styles.currencyItemSelected,
          isSelecting && styles.currencyItemDisabled
        ]}
        onPress={() => handleSelectCurrency(item)}
        disabled={isSelecting}
      >
        <View style={styles.currencyInfo}>
          <Text style={styles.currencySymbol}>{item.symbol}</Text>
          <View style={styles.currencyDetails}>
            <Text style={styles.currencyCode}>{item.code}</Text>
            <Text style={styles.currencyName}>{item.name}</Text>
          </View>
        </View>
        {isSelected && (
          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Currency',
          presentation: 'modal',
          headerLeft: () => (
            <Pressable onPress={handleCancel} disabled={isSelecting}>
              <Text style={[styles.cancelButton, isSelecting && styles.cancelButtonDisabled]}>
                Cancel
              </Text>
            </Pressable>
          ),
        }}
      />
      <View style={commonStyles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search currencies..."
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            editable={!isSelecting}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} disabled={isSelecting}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Currency List */}
        <FlatList
          data={filteredCurrencies}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isSelecting}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  currencyItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  currencyItemDisabled: {
    opacity: 0.5,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    width: 50,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
});
