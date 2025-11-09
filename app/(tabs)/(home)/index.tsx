
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import SummaryCard from '@/components/SummaryCard';
import LoanCard from '@/components/LoanCard';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function DashboardScreen() {
  const router = useRouter();
  const { loans, payments, loading, getLoanSummary, getPaymentsForLoan } = useLoans();
  const [refreshing, setRefreshing] = useState(false);
  const summary = getLoanSummary();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddLoan = () => {
    router.push('/add-loan');
  };

  const handleLoanPress = (loanId: string) => {
    router.push(`/loan-detail?id=${loanId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'FriendLend',
          headerLargeTitle: true,
          headerTransparent: false,
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <SummaryCard
                title="Total Lent"
                amount={summary.totalLent}
                icon="arrow.up.circle.fill"
                color={colors.primary}
              />
              <SummaryCard
                title="Total Repaid"
                amount={summary.totalRepaid}
                icon="arrow.down.circle.fill"
                color={colors.secondary}
              />
            </View>
            <View style={styles.summaryRow}>
              <SummaryCard
                title="Outstanding"
                amount={summary.outstandingBalance}
                icon="exclamationmark.circle.fill"
                color={colors.accent}
              />
              <SummaryCard
                title="Interest Earned"
                amount={summary.interestEarned}
                icon="chart.line.uptrend.xyaxis"
                color={colors.secondary}
              />
            </View>
          </View>

          {/* Loans List */}
          <View style={styles.loansSection}>
            <Text style={styles.sectionTitle}>Your Loans</Text>
            {loans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No loans yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap the + button to add your first loan
                </Text>
              </View>
            ) : (
              loans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  payments={getPaymentsForLoan(loan.id)}
                  onPress={() => handleLoanPress(loan.id)}
                />
              ))
            )}
          </View>

          {/* Bottom padding for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>

        <FloatingActionButton onPress={handleAddLoan} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
  },
  summaryContainer: {
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  loansSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
