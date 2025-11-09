
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { formatCurrency } from '@/utils/loanCalculations';
import { IconSymbol } from './IconSymbol';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  color: string;
}

export default function SummaryCard({ title, amount, icon, color }: SummaryCardProps) {
  return (
    <View style={[commonStyles.card, styles.card]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
