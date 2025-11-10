
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useLoans } from '@/hooks/useLoans';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency, calculateInterest } from '@/utils/loanCalculations';

type Period = '1month' | '6months' | '1year' | '5years';

interface PeriodOption {
  id: Period;
  label: string;
  months: number;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { id: '1month', label: '1 Month', months: 1 },
  { id: '6months', label: '6 Months', months: 6 },
  { id: '1year', label: '1 Year', months: 12 },
  { id: '5years', label: '5 Years', months: 60 },
];

export default function MetricGraphScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const metricId = params.metricId as string;
  const metricTitle = params.title as string;
  
  const { loans, payments, getPaymentsForLoan } = useLoans();
  const { settings } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1year');

  const screenWidth = Dimensions.get('window').width;

  // Calculate historical data for the selected metric
  const chartData = useMemo(() => {
    const period = PERIOD_OPTIONS.find(p => p.id === selectedPeriod)!;
    const now = new Date();
    const dataPoints: number[] = [];
    const labels: string[] = [];

    // Determine the number of data points and interval
    let numPoints: number;
    let intervalMonths: number;
    
    if (period.id === '1month') {
      numPoints = 4; // 4 weeks
      intervalMonths = 0.25;
    } else if (period.id === '6months') {
      numPoints = 6; // 6 months
      intervalMonths = 1;
    } else if (period.id === '1year') {
      numPoints = 4; // 4 quarters
      intervalMonths = 3;
    } else {
      numPoints = 5; // 5 years
      intervalMonths = 12;
    }

    // Generate data points going backwards in time
    for (let i = numPoints - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (i * intervalMonths));
      
      // Calculate metric value at this point in time
      let value = 0;
      
      if (metricId === 'loanOutstanding') {
        // Total lent up to this date minus total repaid up to this date
        const totalLent = loans
          .filter(l => new Date(l.startDate) <= date)
          .reduce((sum, l) => sum + l.amount, 0);
        const totalRepaid = payments
          .filter(p => p.type === 'principal' && new Date(p.date) <= date)
          .reduce((sum, p) => sum + p.amount, 0);
        value = totalLent - totalRepaid;
      } else if (metricId === 'loanRepaid') {
        // Sum of all principal payments up to this date
        value = payments
          .filter(p => p.type === 'principal' && new Date(p.date) <= date)
          .reduce((sum, p) => sum + p.amount, 0);
      } else if (metricId === 'interestOutstanding') {
        // Calculate interest outstanding at this date
        const activeLoans = loans.filter(l => {
          const loanStart = new Date(l.startDate);
          const loanClose = l.closeDate ? new Date(l.closeDate) : null;
          return loanStart <= date && (!loanClose || loanClose > date);
        });
        
        value = activeLoans.reduce((sum, loan) => {
          // Get all payments for this loan up to the date
          const loanPayments = payments.filter(p => 
            p.loanId === loan.id && new Date(p.date) <= date
          );
          
          // Calculate total interest accrued up to this date
          const totalInterest = calculateInterest(loan, date.toISOString());
          
          // Calculate interest paid up to this date
          const interestPaid = loanPayments
            .filter(p => p.type === 'interest')
            .reduce((s, p) => s + p.amount, 0);
          
          // Interest outstanding is the difference
          const outstanding = Math.max(0, totalInterest - interestPaid);
          return sum + outstanding;
        }, 0);
      } else if (metricId === 'interestPaid') {
        // Sum of all interest payments up to this date
        value = payments
          .filter(p => p.type === 'interest' && new Date(p.date) <= date)
          .reduce((sum, p) => sum + p.amount, 0);
      }
      
      dataPoints.push(value);
      
      // Generate label
      if (period.id === '1month') {
        labels.push(`W${numPoints - i}`);
      } else if (period.id === '6months') {
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      } else if (period.id === '1year') {
        labels.push(`Q${Math.floor(date.getMonth() / 3) + 1}`);
      } else {
        labels.push(date.getFullYear().toString());
      }
    }

    // Ensure we always have at least one data point
    if (dataPoints.length === 0) {
      dataPoints.push(0);
      labels.push('N/A');
    }

    return {
      labels,
      datasets: [
        {
          data: dataPoints,
        },
      ],
    };
  }, [selectedPeriod, metricId, loans, payments]);

  return (
    <>
      <Stack.Screen
        options={{
          title: metricTitle,
          headerBackTitle: 'Back',
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {PERIOD_OPTIONS.map((period) => (
              <Pressable
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.id && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={280}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(117, 117, 117, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
              }}
              bezier
              style={styles.chart}
              formatYLabel={(value) => {
                const num = parseFloat(value);
                if (num >= 1000) {
                  return `${(num / 1000).toFixed(1)}k`;
                }
                return num.toFixed(0);
              }}
            />
          </View>

          {/* Current Value */}
          <View style={[commonStyles.card, styles.currentValueCard]}>
            <Text style={styles.currentValueLabel}>Current Value</Text>
            <Text style={styles.currentValueAmount}>
              {formatCurrency(
                chartData.datasets[0].data[chartData.datasets[0].data.length - 1],
                settings.currencySymbol
              )}
            </Text>
          </View>

          {/* Info */}
          <View style={commonStyles.card}>
            <Text style={styles.infoTitle}>About This Metric</Text>
            <Text style={styles.infoText}>
              {metricId === 'loanOutstanding' && 
                'Loan Outstanding represents the total amount of principal that is still owed to you. It is calculated as Total Lent minus Total Repaid.'}
              {metricId === 'loanRepaid' && 
                'Loan Repaid shows the total amount of principal that has been paid back to you by all borrowers.'}
              {metricId === 'interestOutstanding' && 
                'Interest Outstanding is the total amount of interest that has accrued but has not yet been paid. This is based on the monthly interest rate and the time elapsed since the loan started or the last interest payment.'}
              {metricId === 'interestPaid' && 
                'Interest Paid represents the total amount of interest that has been paid to you by all borrowers.'}
            </Text>
          </View>
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
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  periodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  currentValueCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentValueLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  currentValueAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
