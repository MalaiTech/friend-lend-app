
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.paragraph}>
              FriendLend (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we handle your information when you use our mobile application.
            </Text>

            <Text style={styles.sectionTitle}>Data Collection and Storage</Text>
            <Text style={styles.paragraph}>
              FriendLend is designed with privacy as a core principle. All your data is stored locally on your device only. 
              We do not collect, transmit, or store any of your personal information on external servers.
            </Text>

            <Text style={styles.subsectionTitle}>Information Stored Locally:</Text>
            <Text style={styles.bulletPoint}>• Loan records (borrower names, amounts, dates, interest rates)</Text>
            <Text style={styles.bulletPoint}>• Payment history</Text>
            <Text style={styles.bulletPoint}>• App settings and preferences</Text>
            <Text style={styles.bulletPoint}>• Notes and attachments you add to loans</Text>

            <Text style={styles.sectionTitle}>Permissions We Request</Text>
            <Text style={styles.paragraph}>
              FriendLend requests the following permissions to provide its functionality:
            </Text>

            <Text style={styles.subsectionTitle}>Contacts Access:</Text>
            <Text style={styles.paragraph}>
              We request access to your contacts to help you quickly select borrowers when creating loans. 
              Contact information is only used within the app and is never transmitted externally.
            </Text>

            <Text style={styles.subsectionTitle}>Face ID / Touch ID:</Text>
            <Text style={styles.paragraph}>
              We use biometric authentication to secure your loan data and protect your privacy. 
              Biometric data is processed by your device&apos;s operating system and is never accessed or stored by FriendLend.
            </Text>

            <Text style={styles.subsectionTitle}>Photo Library and Camera:</Text>
            <Text style={styles.paragraph}>
              We request access to your photo library and camera to allow you to add photos related to loans. 
              Photos are stored locally on your device only.
            </Text>

            <Text style={styles.subsectionTitle}>Calendar and Reminders:</Text>
            <Text style={styles.paragraph}>
              We request access to add loan due dates to your calendar and create reminders. 
              This helps you track repayments. You control what gets added to your calendar.
            </Text>

            <Text style={styles.subsectionTitle}>Notifications:</Text>
            <Text style={styles.paragraph}>
              We use local notifications to remind you about upcoming or overdue loan payments. 
              These notifications are generated locally on your device.
            </Text>

            <Text style={styles.sectionTitle}>Data Sharing</Text>
            <Text style={styles.paragraph}>
              FriendLend does not share your data with any third parties. When you use the &quot;Share&quot; feature 
              to send loan summaries via messaging apps, you explicitly choose what information to share and with whom. 
              This sharing is handled by your device&apos;s native sharing functionality.
            </Text>

            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.paragraph}>
              Your data security is important to us. FriendLend implements the following security measures:
            </Text>
            <Text style={styles.bulletPoint}>• All data is stored locally on your device using secure storage mechanisms</Text>
            <Text style={styles.bulletPoint}>• Optional biometric authentication (Face ID/Touch ID) to protect app access</Text>
            <Text style={styles.bulletPoint}>• No data transmission to external servers</Text>
            <Text style={styles.bulletPoint}>• No third-party analytics or tracking</Text>

            <Text style={styles.sectionTitle}>Data Backup and Export</Text>
            <Text style={styles.paragraph}>
              You can export your data at any time using the Export feature in Settings. 
              Exported data can be saved as PDF or CSV files. You are responsible for securing any exported data.
            </Text>
            <Text style={styles.paragraph}>
              If you use iCloud backup on your device, your FriendLend data may be included in your iCloud backup. 
              This is controlled by your device&apos;s backup settings, not by FriendLend.
            </Text>

            <Text style={styles.sectionTitle}>Data Deletion</Text>
            <Text style={styles.paragraph}>
              You have complete control over your data. You can:
            </Text>
            <Text style={styles.bulletPoint}>• Delete individual loans and payments within the app</Text>
            <Text style={styles.bulletPoint}>• Clear all data using the &quot;Clear All Data&quot; option in Settings</Text>
            <Text style={styles.bulletPoint}>• Uninstall the app to remove all data from your device</Text>

            <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              FriendLend is not intended for use by children under the age of 13. 
              We do not knowingly collect information from children under 13.
            </Text>

            <Text style={styles.sectionTitle}>No Tracking or Analytics</Text>
            <Text style={styles.paragraph}>
              FriendLend does not use any analytics, tracking, or advertising services. 
              We do not collect usage statistics, crash reports, or any other telemetry data. 
              Your use of the app is completely private.
            </Text>

            <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. 
              Any changes will be reflected in the app with an updated &quot;Last Updated&quot; date. 
              We encourage you to review this Privacy Policy periodically.
            </Text>

            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.paragraph}>
              Since all data is stored locally on your device, you have complete control over your information:
            </Text>
            <Text style={styles.bulletPoint}>• Right to access: All your data is accessible within the app</Text>
            <Text style={styles.bulletPoint}>• Right to modify: You can edit any loan or payment information</Text>
            <Text style={styles.bulletPoint}>• Right to delete: You can delete any or all data at any time</Text>
            <Text style={styles.bulletPoint}>• Right to export: You can export your data in PDF or CSV format</Text>

            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions about this Privacy Policy or how FriendLend handles your information, 
              please contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: support@friendlend.app</Text>

            <Text style={styles.sectionTitle}>Compliance</Text>
            <Text style={styles.paragraph}>
              FriendLend is designed to comply with privacy regulations including GDPR, CCPA, and Apple&apos;s App Store 
              privacy requirements. Since we do not collect or transmit any personal data, most data protection 
              regulations do not apply to our data handling practices.
            </Text>

            <Text style={styles.footer}>
              By using FriendLend, you acknowledge that you have read and understood this Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
});
