
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { clearAllData, getAllData } from '@/utils/storage';
import { useSettings } from '@/hooks/useSettings';
import { useLoans } from '@/hooks/useLoans';
import { getCurrencyByCode } from '@/utils/currencies';
import { formatCurrency, formatDate, calculateLoanOutstanding, calculateInterestOutstanding } from '@/utils/loanCalculations';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { refreshData, loans, payments, getPaymentsForLoan } = useLoans();
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const handleEnableBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use passcode',
      });
      
      if (result.success) {
        Alert.alert('Success', 'Biometric authentication enabled');
      } else {
        Alert.alert('Failed', 'Authentication failed');
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication');
    }
  };

  const handleCurrencySettings = () => {
    router.push('/currency-selector');
  };

  const generateCSV = () => {
    // CSV Header
    let csv = 'Borrower,Loan Amount,Interest Rate,Interest Type,Start Date,Status,Loan Outstanding,Interest Outstanding,Total Repaid,Interest Paid,Closure Date,Notes\n';
    
    // Add loan data
    loans.forEach(loan => {
      const loanPayments = getPaymentsForLoan(loan.id);
      const loanOutstanding = calculateLoanOutstanding(loan, loanPayments);
      const interestOutstanding = calculateInterestOutstanding(loan, loanPayments);
      const principalPayments = loanPayments.filter(p => p.type === 'principal');
      const interestPayments = loanPayments.filter(p => p.type === 'interest');
      const totalRepaid = principalPayments.reduce((sum, p) => sum + p.amount, 0);
      const interestPaid = interestPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Escape quotes and commas in text fields
      const escapeCsvField = (field: string) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };
      
      csv += `${escapeCsvField(loan.borrowerName)},`;
      csv += `${loan.amount},`;
      csv += `${loan.interestRate}%,`;
      csv += `${loan.interestType},`;
      csv += `${formatDate(loan.startDate)},`;
      csv += `${loan.status},`;
      csv += `${loanOutstanding},`;
      csv += `${interestOutstanding},`;
      csv += `${totalRepaid},`;
      csv += `${interestPaid},`;
      csv += `${loan.closeDate ? formatDate(loan.closeDate) : 'N/A'},`;
      csv += `${escapeCsvField(loan.notes || '')}\n`;
    });
    
    return csv;
  };

  const generatePDFHTML = () => {
    const currencySymbol = settings.currencySymbol;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>FriendLend Loans Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #007AFF;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 10px;
          }
          h2 {
            color: #555;
            margin-top: 30px;
          }
          .summary {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .loan-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .loan-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .loan-name {
            font-size: 18px;
            font-weight: bold;
          }
          .status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-active {
            background-color: #007AFF20;
            color: #007AFF;
          }
          .status-paid {
            background-color: #34C75920;
            color: #34C759;
          }
          .status-overdue {
            background-color: #FF3B3020;
            color: #FF3B30;
          }
          .loan-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
          }
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          .detail-label {
            font-size: 12px;
            color: #888;
          }
          .detail-value {
            font-size: 14px;
            font-weight: 600;
            margin-top: 2px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #888;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>FriendLend Loans Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    `;
    
    // Add summary
    const totalLent = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const loanRepaid = payments.filter(p => p.type === 'principal').reduce((sum, p) => sum + p.amount, 0);
    const loanOutstanding = totalLent - loanRepaid;
    const interestPaid = payments.filter(p => p.type === 'interest').reduce((sum, p) => sum + p.amount, 0);
    const interestOutstanding = loans.reduce((sum, loan) => {
      if (loan.status === 'paid') return sum;
      const loanPayments = getPaymentsForLoan(loan.id);
      return sum + calculateInterestOutstanding(loan, loanPayments);
    }, 0);
    
    html += `
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">
          <span>Total Loans:</span>
          <strong>${loans.length}</strong>
        </div>
        <div class="summary-item">
          <span>Loan Outstanding:</span>
          <strong>${formatCurrency(loanOutstanding, currencySymbol)}</strong>
        </div>
        <div class="summary-item">
          <span>Loan Repaid:</span>
          <strong>${formatCurrency(loanRepaid, currencySymbol)}</strong>
        </div>
        <div class="summary-item">
          <span>Interest Outstanding:</span>
          <strong>${formatCurrency(interestOutstanding, currencySymbol)}</strong>
        </div>
        <div class="summary-item">
          <span>Interest Paid:</span>
          <strong>${formatCurrency(interestPaid, currencySymbol)}</strong>
        </div>
      </div>
    `;
    
    // Add individual loans
    html += '<h2>Loan Details</h2>';
    
    loans.forEach(loan => {
      const loanPayments = getPaymentsForLoan(loan.id);
      const loanOut = calculateLoanOutstanding(loan, loanPayments);
      const interestOut = calculateInterestOutstanding(loan, loanPayments);
      const principalPayments = loanPayments.filter(p => p.type === 'principal');
      const totalRepaid = principalPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const statusClass = loan.status === 'paid' ? 'status-paid' : loan.status === 'overdue' ? 'status-overdue' : 'status-active';
      
      html += `
        <div class="loan-card">
          <div class="loan-header">
            <div class="loan-name">${loan.borrowerName}</div>
            <div class="status ${statusClass}">${loan.status}</div>
          </div>
          <div class="loan-details">
            <div class="detail-item">
              <span class="detail-label">Loan Amount</span>
              <span class="detail-value">${formatCurrency(loan.amount, currencySymbol)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Interest Rate</span>
              <span class="detail-value">${loan.interestRate}% (${loan.interestType})</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Loan Outstanding</span>
              <span class="detail-value">${formatCurrency(loanOut, currencySymbol)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Interest Outstanding</span>
              <span class="detail-value">${formatCurrency(interestOut, currencySymbol)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Repaid</span>
              <span class="detail-value">${formatCurrency(totalRepaid, currencySymbol)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Start Date</span>
              <span class="detail-value">${formatDate(loan.startDate)}</span>
            </div>
            ${loan.closeDate ? `
            <div class="detail-item">
              <span class="detail-label">Closure Date</span>
              <span class="detail-value">${formatDate(loan.closeDate)}</span>
            </div>
            ` : ''}
          </div>
          ${loan.notes ? `<p style="margin-top: 10px; font-style: italic; color: #666;">${loan.notes}</p>` : ''}
        </div>
      `;
    });
    
    html += `
        <div class="footer">
          <p>Generated by FriendLend</p>
        </div>
      </body>
      </html>
    `;
    
    return html;
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export as PDF', onPress: handleExportPDF },
        { text: 'Export as CSV', onPress: handleExportCSV },
      ]
    );
  };

  const handleExportPDF = async () => {
    try {
      console.log('Starting PDF export...');
      
      const html = generatePDFHTML();
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      console.log('PDF generated at:', uri);
      
      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Loans as PDF',
          UTI: 'com.adobe.pdf',
        });
        console.log('PDF shared successfully');
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    }
  };

  const handleExportCSV = async () => {
    try {
      console.log('Starting CSV export...');
      
      const csv = generateCSV();
      
      // Save CSV to file
      const fileName = `friendlend-loans-${Date.now()}.csv`;
      const fileUri = `${FileSystem.Paths.cache}/${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csv);
      
      console.log('CSV generated at:', fileUri);
      
      // Share the CSV
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Loans as CSV',
          UTI: 'public.comma-separated-values-text',
        });
        console.log('CSV shared successfully');
      } else {
        Alert.alert('Success', `CSV saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all loans and payments? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await refreshData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const currency = getCurrencyByCode(settings.currency);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLargeTitle: true,
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Currency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency</Text>
            <View style={commonStyles.card}>
              <Pressable style={styles.settingItem} onPress={handleCurrencySettings}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                    <IconSymbol name="dollarsign.circle" size={24} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Default Currency</Text>
                    <Text style={styles.settingSubtitle}>
                      {currency?.name || 'Euro'} ({settings.currencySymbol})
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={commonStyles.card}>
              <Pressable
                style={styles.settingItem}
                onPress={handleEnableBiometric}
                disabled={!biometricAvailable}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol name="faceid" size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Biometric Lock</Text>
                    <Text style={styles.settingSubtitle}>
                      {biometricAvailable ? 'Secure app with Face ID/Touch ID' : 'Not available on this device'}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={commonStyles.card}>
              <Pressable style={styles.settingItem} onPress={handleExportData}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                    <IconSymbol name="square.and.arrow.up" size={24} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Export Data</Text>
                    <Text style={styles.settingSubtitle}>Export loans as PDF or CSV</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.settingItem} onPress={handleClearData}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                    <IconSymbol name="trash" size={24} color={colors.error} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: colors.error }]}>Clear All Data</Text>
                    <Text style={styles.settingSubtitle}>Delete all loans and payments</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={commonStyles.card}>
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>1.0.0</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.aboutItem}>
                <Text style={styles.aboutLabel}>Storage</Text>
                <Text style={styles.aboutValue}>Local Only</Text>
              </View>
            </View>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            FriendLend stores all data locally on your device. Use the export feature to backup your data.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 16,
    color: colors.text,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
