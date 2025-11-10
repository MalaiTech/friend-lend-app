
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform, Pressable, Image } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { useSettings } from '@/hooks/useSettings';
import SummaryCard from '@/components/SummaryCard';
import LoanCard from '@/components/LoanCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import { IconSymbol } from '@/components/IconSymbol';

export default function DashboardScreen() {
  const router = useRouter();
  const { loans, payments, loading, getLoanSummary, getPaymentsForLoan, refreshData } = useLoans();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paid' | 'overdue'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const summary = getLoanSummary();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard screen focused, refreshing data...');
      refreshData();
    }, [refreshData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleAddLoan = () => {
    router.push('/add-loan');
  };

  const handleLoanPress = (loanId: string) => {
    router.push(`/loan-detail?id=${loanId}`);
  };

  const handleMetricPress = (metricId: string, title: string) => {
    router.push(`/metric-graph?metricId=${metricId}&title=${encodeURIComponent(title)}`);
  };

  // Filter and sort loans
  const filteredAndSortedLoans = loans
    .filter(loan => {
      if (filterStatus === 'all') return true;
      return loan.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.borrowerName.localeCompare(b.borrowerName);
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <View style={styles.headerIconContainer}>
                <Image 
                  source={require('@/assets/images/ad6209b2-efa8-49b8-89c3-bd81dff2c5ea.png')} 
                  style={styles.headerIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.headerTitle}>FriendLend</Text>
            </View>
          ),
          headerLargeTitle: false,
          headerTransparent: false,
          headerLeft: () => null,
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
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => handleMetricPress('loanOutstanding', 'Loan Outstanding')}
              >
                <SummaryCard
                  title="Loan Outstanding"
                  amount={summary.loanOutstanding}
                  icon="arrow.up.circle.fill"
                  color={colors.primary}
                  currencySymbol={settings.currencySymbol}
                />
              </Pressable>
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => handleMetricPress('loanRepaid', 'Loan Repaid')}
              >
                <SummaryCard
                  title="Loan Repaid"
                  amount={summary.loanRepaid}
                  icon="arrow.down.circle.fill"
                  color={colors.secondary}
                  currencySymbol={settings.currencySymbol}
                />
              </Pressable>
            </View>
            <View style={styles.summaryRow}>
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => handleMetricPress('interestOutstanding', 'Interest Outstanding')}
              >
                <SummaryCard
                  title="Interest Outstanding"
                  amount={summary.interestOutstanding}
                  icon="exclamationmark.circle.fill"
                  color={colors.accent}
                  currencySymbol={settings.currencySymbol}
                />
              </Pressable>
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => handleMetricPress('interestPaid', 'Interest Paid')}
              >
                <SummaryCard
                  title="Interest Paid"
                  amount={summary.interestPaid}
                  icon="chart.line.uptrend.xyaxis"
                  color={colors.secondary}
                  currencySymbol={settings.currencySymbol}
                />
              </Pressable>
            </View>
          </View>

          {/* Loans List Header */}
          <View style={styles.loansHeader}>
            <Text style={styles.sectionTitle}>Your Loans</Text>
            <Pressable 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <IconSymbol name="line.3.horizontal.decrease.circle" size={24} color={colors.primary} />
            </Pressable>
          </View>

          {/* Filters */}
          {showFilters && (
            <View style={[commonStyles.card, styles.filtersCard]}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.filterOptions}>
                <Pressable
                  style={[styles.filterOption, sortBy === 'name' && styles.filterOptionActive]}
                  onPress={() => setSortBy('name')}
                >
                  <Text style={[styles.filterOptionText, sortBy === 'name' && styles.filterOptionTextActive]}>
                    Name
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterOption, sortBy === 'amount' && styles.filterOptionActive]}
                  onPress={() => setSortBy('amount')}
                >
                  <Text style={[styles.filterOptionText, sortBy === 'amount' && styles.filterOptionTextActive]}>
                    Amount
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterOption, sortBy === 'date' && styles.filterOptionActive]}
                  onPress={() => setSortBy('date')}
                >
                  <Text style={[styles.filterOptionText, sortBy === 'date' && styles.filterOptionTextActive]}>
                    Date
                  </Text>
                </Pressable>
              </View>

              <Text style={[styles.filterLabel, { marginTop: 16 }]}>Filter By Status</Text>
              <View style={styles.filterOptions}>
                <Pressable
                  style={[styles.filterOption, filterStatus === 'all' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('all')}
                >
                  <Text style={[styles.filterOptionText, filterStatus === 'all' && styles.filterOptionTextActive]}>
                    All
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterOption, filterStatus === 'active' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('active')}
                >
                  <Text style={[styles.filterOptionText, filterStatus === 'active' && styles.filterOptionTextActive]}>
                    Active
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterOption, filterStatus === 'paid' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('paid')}
                >
                  <Text style={[styles.filterOptionText, filterStatus === 'paid' && styles.filterOptionTextActive]}>
                    Paid
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.filterOption, filterStatus === 'overdue' && styles.filterOptionActive]}
                  onPress={() => setFilterStatus('overdue')}
                >
                  <Text style={[styles.filterOptionText, filterStatus === 'overdue' && styles.filterOptionTextActive]}>
                    Overdue
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Loans List */}
          <View style={styles.loansSection}>
            {filteredAndSortedLoans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {filterStatus === 'all' ? 'No loans yet' : `No ${filterStatus} loans`}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {filterStatus === 'all' 
                    ? 'Tap the + button to add your first loan'
                    : 'Try changing the filter'}
                </Text>
              </View>
            ) : (
              filteredAndSortedLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  payments={getPaymentsForLoan(loan.id)}
                  onPress={() => handleLoanPress(loan.id)}
                  currencySymbol={settings.currencySymbol}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
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
  loansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  filterButton: {
    padding: 4,
  },
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterOptionTextActive: {
    color: colors.primary,
  },
  loansSection: {
    marginBottom: 16,
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
