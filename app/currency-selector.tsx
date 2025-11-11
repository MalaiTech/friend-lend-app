
import React, { useState, useRef, useEffect } from 'react';
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
  const isNavigatingRef = useRef(false);

  // Prevent navigation loops
  useEffect(() => {
    return () => {
      isNavigatingRef.current = false;
    };
  }, []);

  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurrency = async (currency: Currency) => {
    // Prevent multiple selections
    if (isNavigatingRef.current) {
      console.log('Already navigating, ignoring selection');
      return;
    }

    console.log('Currency selected:', currency.code);
    isNavigatingRef.current = true;
    
    try {
      // Save currency
      await setCurrency(currency.code, currency.symbol);
      console.log('Currency saved successfully');
      
      // Navigate back
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error) {
      console.error('Error selecting currency:', error);
      isNavigatingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (isNavigatingRef.current) {
      return;
    }
    
    console.log('Currency selection cancelled');
    isNavigatingRef.current = true;
    
    if (router.canGoBack()) {
      router.back();
    }
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === settings.currency;

    return (
      <Pressable
        style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
        onPress={() => handleSelectCurrency(item)}
        disabled={isNavigatingRef.current}
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
            <Pressable onPress={handleCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
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
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
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
});
