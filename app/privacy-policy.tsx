
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
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              MalaiTech (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) is committed to protecting your privacy.
            </Text>
            <Text style={styles.paragraph}>
              This Privacy Policy explains how Friend2Lend handles your information when you use the App.
            </Text>
            <Text style={styles.paragraph}>
              Friend2Lend is designed with privacy first:
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>We do not collect, store, or transfer your personal data.</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>All data remains on your device only.</Text>
            </View>

            <Text style={styles.sectionTitle}>2. Information We Do NOT Collect</Text>
            <Text style={styles.paragraph}>
              MalaiTech does not:
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Collect personal information</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Store user data on servers</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Transmit data outside your device</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Use tracking technologies (cookies, analytics, advertising IDs)</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Use third-party analytics</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Sell or share data with any third party</Text>
            </View>
            <Text style={styles.paragraphAfterBullets}>
              This means your data never leaves your phone.
            </Text>

            <Text style={styles.sectionTitle}>3. Information Stored on Your Device (Local Only)</Text>
            <Text style={styles.paragraph}>
              The following information may be stored locally on your device only, and only with your permission:
            </Text>

            <Text style={styles.subsectionTitle}>Contact Information:</Text>
            <Text style={styles.subsectionParagraph}>
              The App may request access to your device&apos;s Contacts to allow selecting names for record-keeping. We do not upload, store, or transmit contact information.
            </Text>

            <Text style={styles.subsectionTitle}>Photos and Camera</Text>
            <Text style={styles.subsectionParagraph}>
              Used only when you attach optional images to your loan entries. Images are stored on your device only.
            </Text>

            <Text style={styles.subsectionTitle}>Calendar & Reminders</Text>
            <Text style={styles.subsectionParagraph}>
              If you enable due date reminders or calendar exports, entries are added to your device&apos;s local Calendar or Reminders app.
            </Text>

            <Text style={styles.subsectionTitle}>Biometric Authentication</Text>
            <Text style={styles.subsectionParagraph}>
              Face ID or Touch ID is used only to secure access to the App. Biometric data is never accessed or stored by Friend2Lend.
            </Text>

            <Text style={styles.subsectionTitle}>Loan Records</Text>
            <Text style={styles.subsectionParagraph}>
              Amounts, names, due dates, notes, and photos are saved locally on your device.
            </Text>

            <Text style={styles.sectionTitle}>4. No Account, No Cloud Storage</Text>
            <Text style={styles.paragraph}>
              Friend2Lend does not require you to create an account.
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>There is no login</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>There is no cloud sync</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>All information remains on the device unless you manually export it</Text>
            </View>
            <Text style={styles.paragraphAfterBullets}>
              You have full control over your data at all times.
            </Text>

            <Text style={styles.sectionTitle}>5. Data Sharing</Text>
            <Text style={styles.paragraph}>
              Since the App does not collect or transmit data, we do not share information with:
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Advertisers</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Analytics providers</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Third parties</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Government agencies</Text>
            </View>
            <Text style={styles.paragraphAfterBullets}>
              Your data is yours alone.
            </Text>

            <Text style={styles.sectionTitle}>6. Permissions Explained</Text>
            <Text style={styles.paragraph}>
              Friend2Lend may request the following optional device permissions:
            </Text>

            <Text style={styles.subsectionTitle}>Contacts</Text>
            <Text style={styles.subsectionParagraph}>
              Used to select borrowers. Not uploaded or stored by MalaiTech.
            </Text>

            <Text style={styles.subsectionTitle}>Camera / Photos</Text>
            <Text style={styles.subsectionParagraph}>
              Used to attach optional images. Images remain on your device.
            </Text>

            <Text style={styles.subsectionTitle}>Calendar / Reminders</Text>
            <Text style={styles.subsectionParagraph}>
              To allow adding due dates to your personal calendar. No data is shared externally.
            </Text>

            <Text style={styles.subsectionTitle}>Biometrics (Face ID / Touch ID)</Text>
            <Text style={styles.subsectionParagraph}>
              Used for App security only. Biometric data never leaves the device.
            </Text>

            <Text style={styles.sectionTitle}>7. GDPR Compliance</Text>
            <Text style={styles.paragraph}>
              If you are in the European Union, GDPR grants you the right to:
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Access your data</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Correct your data</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Delete your data</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Restrict processing</Text>
            </View>
            <Text style={styles.paragraphAfterBullets}>
              Since all data stays on your device: You can exercise these rights simply by deleting or modifying the data within the App, or by deleting the App itself. MalaiTech holds no personal data, so GDPR does not require us to process or store any user requests.
            </Text>

            <Text style={styles.sectionTitle}>8. CCPA Compliance</Text>
            <Text style={styles.paragraph}>
              Under the California Consumer Privacy Act (CCPA):
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>We do not sell personal information</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>We do not collect personal information</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>No opt-out is required because no data is collected</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>CCPA rights can be exercised by managing your data on your device</Text>
            </View>

            <Text style={styles.sectionTitle}>9. Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              Friend2Lend is not intended for children under 13. We do not knowingly collect data from children.
            </Text>
            <Text style={styles.paragraph}>
              If a parent believes their child has entered personal data into the App, deleting the App removes all stored data.
            </Text>

            <Text style={styles.sectionTitle}>10. Data Security</Text>
            <Text style={styles.paragraph}>
              Your data is protected by:
            </Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Your device&apos;s operating system security</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Optional Face ID / Touch ID</Text>
            </View>
            <View style={styles.bulletContainer}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>No external data transmission</Text>
            </View>
            <Text style={styles.paragraphAfterBullets}>
              MalaiTech has no access to your information.
            </Text>

            <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy to reflect App improvements or legal requirements.
            </Text>
            <Text style={styles.paragraph}>
              Updates will be posted on our website. Continued use of the App after changes constitutes acceptance of the updated policy.
            </Text>

            <Text style={styles.sectionTitle}>12. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions regarding these Terms, please contact us at www.malai.nl
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 28,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 12,
    opacity: 0.9,
  },
  subsectionParagraph: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 14,
    opacity: 0.9,
  },
  paragraphAfterBullets: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginTop: 8,
    marginBottom: 12,
    opacity: 0.9,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginRight: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    opacity: 0.9,
  },
});
