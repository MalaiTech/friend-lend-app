
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
            <Text style={styles.bulletPoint}>- We do not collect, store, or transfer your personal data.</Text>
            <Text style={styles.bulletPoint}>- All data remains on your device only.</Text>

            <Text style={styles.sectionTitle}>2. Information We Do NOT Collect</Text>
            <Text style={styles.paragraph}>
              MalaiTech does not:
            </Text>
            <Text style={styles.bulletPoint}>- Collect personal information</Text>
            <Text style={styles.bulletPoint}>- Store user data on servers</Text>
            <Text style={styles.bulletPoint}>- Transmit data outside your device</Text>
            <Text style={styles.bulletPoint}>- Use tracking technologies (cookies, analytics, advertising IDs)</Text>
            <Text style={styles.bulletPoint}>- Use third-party analytics</Text>
            <Text style={styles.bulletPoint}>- Sell or share data with any third party</Text>
            <Text style={styles.paragraph}>
              This means your data never leaves your phone.
            </Text>

            <Text style={styles.sectionTitle}>3. Information Stored on Your Device (Local Only)</Text>
            <Text style={styles.paragraph}>
              The following information may be stored locally on your device only, and only with your permission:
            </Text>

            <Text style={styles.subsectionTitle}>Contact Information:</Text>
            <Text style={styles.paragraph}>
              The App may request access to your device&apos;s Contacts to allow selecting names for record-keeping.
            </Text>
            <Text style={styles.paragraph}>
              We do not upload, store, or transmit contact information.
            </Text>

            <Text style={styles.subsectionTitle}>Photos and Camera</Text>
            <Text style={styles.paragraph}>
              Used only when you attach optional images to your loan entries.
            </Text>
            <Text style={styles.paragraph}>
              Images are stored on your device only.
            </Text>

            <Text style={styles.subsectionTitle}>Calendar & Reminders</Text>
            <Text style={styles.paragraph}>
              If you enable due date reminders or calendar exports, entries are added to your device&apos;s local Calendar or Reminders app.
            </Text>

            <Text style={styles.subsectionTitle}>Biometric Authentication</Text>
            <Text style={styles.paragraph}>
              Face ID or Touch ID is used only to secure access to the App.
            </Text>
            <Text style={styles.paragraph}>
              Biometric data is never accessed or stored by Friend2Lend.
            </Text>

            <Text style={styles.subsectionTitle}>Loan Records</Text>
            <Text style={styles.paragraph}>
              Amounts, names, due dates, notes, and photos are saved locally on your device.
            </Text>

            <Text style={styles.sectionTitle}>4. No Account, No Cloud Storage</Text>
            <Text style={styles.paragraph}>
              Friend2Lend does not require you to create an account.
            </Text>
            <Text style={styles.bulletPoint}>- There is no login</Text>
            <Text style={styles.bulletPoint}>- There is no cloud sync</Text>
            <Text style={styles.bulletPoint}>- All information remains on the device unless you manually export it</Text>
            <Text style={styles.paragraph}>
              You have full control over your data at all times.
            </Text>

            <Text style={styles.sectionTitle}>5. Data Sharing</Text>
            <Text style={styles.paragraph}>
              Since the App does not collect or transmit data, we do not share information with:
            </Text>
            <Text style={styles.bulletPoint}>- Advertisers</Text>
            <Text style={styles.bulletPoint}>- Analytics providers</Text>
            <Text style={styles.bulletPoint}>- Third parties</Text>
            <Text style={styles.bulletPoint}>- Government agencies</Text>
            <Text style={styles.paragraph}>
              Your data is yours alone.
            </Text>

            <Text style={styles.sectionTitle}>6. Permissions Explained</Text>
            <Text style={styles.paragraph}>
              Friend2Lend may request the following optional device permissions:
            </Text>

            <Text style={styles.subsectionTitle}>Contacts</Text>
            <Text style={styles.paragraph}>
              Used to select borrowers.
            </Text>
            <Text style={styles.paragraph}>
              Not uploaded or stored by MalaiTech.
            </Text>

            <Text style={styles.subsectionTitle}>Camera / Photos</Text>
            <Text style={styles.paragraph}>
              Used to attach optional images.
            </Text>
            <Text style={styles.paragraph}>
              Images remain on your device.
            </Text>

            <Text style={styles.subsectionTitle}>Calendar / Reminders</Text>
            <Text style={styles.paragraph}>
              To allow adding due dates to your personal calendar.
            </Text>
            <Text style={styles.paragraph}>
              No data is shared externally.
            </Text>

            <Text style={styles.subsectionTitle}>Biometrics (Face ID / Touch ID)</Text>
            <Text style={styles.paragraph}>
              Used for App security only.
            </Text>
            <Text style={styles.paragraph}>
              Biometric data never leaves the device.
            </Text>

            <Text style={styles.sectionTitle}>7. GDPR Compliance</Text>
            <Text style={styles.paragraph}>
              If you are in the European Union, GDPR grants you the right to:
            </Text>
            <Text style={styles.bulletPoint}>- Access your data</Text>
            <Text style={styles.bulletPoint}>- Correct your data</Text>
            <Text style={styles.bulletPoint}>- Delete your data</Text>
            <Text style={styles.bulletPoint}>- Restrict processing</Text>
            <Text style={styles.paragraph}>
              Since all data stays on your device: You can exercise these rights simply by deleting or modifying the data within the App, or by deleting the App itself. MalaiTech holds no personal data, so GDPR does not require us to process or store any user requests.
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
});
