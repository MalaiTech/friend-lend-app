
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
  const isSelectingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
    };
  }, []);

  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurrency = (currency: Currency) => {
    // Prevent multiple selections
    if (isSelectingRef.current) {
      console.log('Already selecting, ignoring...');
      return;
    }
    
    // Check if it's the same currency
    if (currency.code === settings.currency) {
      console.log('Same currency selected, going back...');
      if (router.canGoBack()) {
        router.back();
      }
      return;
    }
    
    isSelectingRef.current = true;
    console.log('Selecting currency:', currency.code);
    
    // Navigate back FIRST, then update settings
    if (router.canGoBack()) {
      router.back();
    }
    
    // Update settings after navigation with a small delay
    setTimeout(() => {
      if (isMountedRef.current) {
        console.log('Updating currency setting');
        setCurrency(currency.code, currency.symbol);
      }
    }, 100);
  };

  const handleCancel = () => {
    if (!isSelectingRef.current && router.canGoBack()) {
      router.back();
    }
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === settings.currency;

    return (
      <Pressable
        style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
        onPress={() => handleSelectCurrency(item)}
        disabled={isSelectingRef.current}
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
            editable={!isSelectingRef.current}
          />
          {searchQuery.length > 0 && (
            <Pressable 
              onPress={() => setSearchQuery('')}
              disabled={isSelectingRef.current}
            >
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
          scrollEnabled={!isSelectingRef.current}
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
