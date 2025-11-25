
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, commonStyles, useThemeColors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={[commonStyles.container, { backgroundColor: themeColors.background }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>1. Introduction</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                MalaiTech (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) is committed to protecting your privacy.
              </Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                This Privacy Policy explains how Friend2Lend handles your information when you use the App.
              </Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Friend2Lend is designed with privacy first:
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>We do not collect, store, or transfer your personal data.</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>All data remains on your device only.</Text>
              </View>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>2. Information We Do NOT Collect</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                MalaiTech does not:
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Collect personal information</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Store user data on servers</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Transmit data outside your device</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Use tracking technologies (cookies, analytics, advertising IDs)</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Use third-party analytics</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Sell or share data with any third party</Text>
              </View>
              <Text style={[styles.paragraphAfterBullets, { color: themeColors.text }]}>
                This means your data never leaves your phone.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>3. Information Stored on Your Device (Local Only)</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                The following information may be stored locally on your device only, and only with your permission:
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Contact Information:</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                The App may request access to your device&apos;s Contacts to allow selecting names for record-keeping. We do not upload, store, or transmit contact information.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Photos and Camera</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                Used only when you attach optional images to your loan entries. Images are stored on your device only.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Calendar & Reminders</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                If you enable due date reminders or calendar exports, entries are added to your device&apos;s local Calendar or Reminders app.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Biometric Authentication</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                Face ID or Touch ID is used only to secure access to the App. Biometric data is never accessed or stored by Friend2Lend.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Loan Records</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                Amounts, names, due dates, notes, and photos are saved locally on your device.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>4. No Account, No Cloud Storage</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Friend2Lend does not require you to create an account.
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>There is no login</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>There is no cloud sync</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>All information remains on the device unless you manually export it</Text>
              </View>
              <Text style={[styles.paragraphAfterBullets, { color: themeColors.text }]}>
                You have full control over your data at all times.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>5. Data Sharing</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Since the App does not collect or transmit data, we do not share information with:
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Advertisers</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Analytics providers</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Third parties</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Government agencies</Text>
              </View>
              <Text style={[styles.paragraphAfterBullets, { color: themeColors.text }]}>
                Your data is yours alone.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>6. Permissions Explained</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Friend2Lend may request the following optional device permissions:
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Contacts</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                Used to select borrowers. Not uploaded or stored by MalaiTech.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Camera / Photos</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                Used to attach optional images. Images remain on your device.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Calendar / Reminders</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                To allow adding due dates to your personal calendar. No data is shared externally.
              </Text>

              <Text style={[styles.subsectionTitle, { color: themeColors.text }]}>Biometrics (Face ID / Touch ID)</Text>
              <Text style={[styles.subsectionParagraph, { color: themeColors.text }]}>
                Used for App security only. Biometric data never leaves the device.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>7. GDPR Compliance</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                If you are in the European Union, GDPR grants you the right to:
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Access your data</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Correct your data</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Delete your data</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Restrict processing</Text>
              </View>
              <Text style={[styles.paragraphAfterBullets, { color: themeColors.text }]}>
                Since all data stays on your device: You can exercise these rights simply by deleting or modifying the data within the App, or by deleting the App itself. MalaiTech holds no personal data, so GDPR does not require us to process or store any user requests.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>8. CCPA Compliance</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Under the California Consumer Privacy Act (CCPA):
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>We do not sell personal information</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>We do not collect personal information</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>No opt-out is required because no data is collected</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>CCPA rights can be exercised by managing your data on your device</Text>
              </View>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>9. Children&apos;s Privacy</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Friend2Lend is not intended for children under 13. We do not knowingly collect data from children.
              </Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                If a parent believes their child has entered personal data into the App, deleting the App removes all stored data.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>10. Data Security</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Your data is protected by:
              </Text>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Your device&apos;s operating system security</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>Optional Face ID / Touch ID</Text>
              </View>
              <View style={styles.bulletContainer}>
                <Text style={[styles.bullet, { color: themeColors.text }]}>•</Text>
                <Text style={[styles.bulletText, { color: themeColors.text }]}>No external data transmission</Text>
              </View>
              <Text style={[styles.paragraphAfterBullets, { color: themeColors.text }]}>
                MalaiTech has no access to your information.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>11. Changes to This Policy</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                We may update this Privacy Policy to reflect App improvements or legal requirements.
              </Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                Updates will be posted on our website. Continued use of the App after changes constitutes acceptance of the updated policy.
              </Text>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>12. Contact Information</Text>
              <Text style={[styles.paragraph, { color: themeColors.text }]}>
                For questions regarding these Terms, please contact us at www.malai.nl
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    marginTop: 28,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
    opacity: 0.9,
  },
  subsectionParagraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 14,
    opacity: 0.9,
  },
  paragraphAfterBullets: {
    fontSize: 15,
    lineHeight: 24,
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
    marginRight: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
});
