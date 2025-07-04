import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ThemeContext } from '../theme/ThemeContext';

const SettingsScreen = ({ navigation }) => {

  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const [storageSize, setStorageSize] = useState('0 MB');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [scanRemindersEnabled, setScanRemindersEnabled] = useState(false);

  useEffect(() => {
    calculateStorageSize();

    const loadSettings = async () => {
      const scan = await AsyncStorage.getItem('scanRemindersEnabled');
      const notif = await AsyncStorage.getItem('notificationsEnabled');
      const analytics = await AsyncStorage.getItem('analyticsEnabled');
      if (scan !== null) setScanRemindersEnabled(scan === 'true');
      if (notif !== null) setNotificationsEnabled(notif === 'true');
      if (analytics !== null) setAnalyticsEnabled(analytics === 'true');
    };

    loadSettings();
  }, []);
  

  const toggleScanReminders = async () => {
    const newValue = !scanRemindersEnabled;
    setScanRemindersEnabled(newValue);
    await AsyncStorage.setItem('scanRemindersEnabled', newValue.toString());
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem('notificationsEnabled', newValue.toString());
  };

  const toggleAnalytics = async () => {
    const newValue = !analyticsEnabled;
    setAnalyticsEnabled(newValue);
    await AsyncStorage.setItem('analyticsEnabled', newValue.toString());
  };

  const calculateStorageSize = async () => {
    try {
      const reports = await AsyncStorage.getItem('maizeReports');
      if (reports) {
        const sizeInBytes = new Blob([reports]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        setStorageSize(`${sizeInMB} MB`);
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
  };

  const clearAllReports = async () => {
    Alert.alert(
      'Clear All Reports',
      `This will delete all ${storageSize} of saved reports. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('maizeReports');
            setStorageSize('0 MB');
            Alert.alert('Success', 'All reports have been cleared.');
          },
        },
      ]
    );
  };

  const exportAllReports = async () => {
    try {
      const reports = await AsyncStorage.getItem('maizeReports');
      if (!reports) {
        Alert.alert('No Reports', 'There are no reports to export.');
        return;
      }

      const parsedReports = JSON.parse(reports);
      const csvContent = convertToCSV(parsedReports);
      const fileUri = FileSystem.documentDirectory + `maize_reports_${new Date().toISOString()}.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export All Reports',
        UTI: 'public.comma-separated-values-text'
      });
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export reports. Please try again.');
    }
  };

  const convertToCSV = (reports) => {
    const headers = ['Date', 'Diagnosis', 'Confidence', 'Status', 'NDVI', 'Advice'];
    const rows = reports.map(report => [
      new Date(report.timestamp).toLocaleString(),
      report.result,
      `${report.confidence}%`,
      report.status || 'N/A',
      report.ndvi || 'N/A',
      report.advice || 'N/A'
    ]);
    return [headers, ...rows].map(row =>
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy-policy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms');
  };

  const contactSupport = () => {
    Linking.openURL('mailto:support@maizeapp.com?subject=Maize%20App%20Support');
  };

  const openAppStoreReview = () => {
    Alert.alert('Rate App', 'Would you like to rate our app?', [
      { text: 'Not Now' },
      { text: 'Rate Now', onPress: () => Linking.openURL('market://details?id=your.package.name') }
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Appearance */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>Appearance</Text>
      <View style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="brightness-4" size={24} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={theme.primary}
            trackColor={{ true: theme.primaryLight, false: '#f4f4f4' }}
          />
        </View>
      </View>

      {/* Notifications */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>Notifications</Text>
      <View style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="notifications" size={24} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            thumbColor={theme.primary}
            trackColor={{ true: theme.primaryLight, false: '#f4f4f4' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="sms" size={24} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Scan Reminders (SMS)</Text>
          </View>
          <Switch
            value={scanRemindersEnabled}
            onValueChange={toggleScanReminders}
            thumbColor={theme.primary}
            trackColor={{ true: theme.primaryLight, false: '#f4f4f4' }}
          />
        </View>
      </View>

      {/* Data */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>Data</Text>
      <View style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="storage" size={24} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Storage Used</Text>
          </View>
          <Text style={[styles.settingValue, { color: theme.secondaryText }]}>{storageSize}</Text>
        </View>

        <TouchableOpacity style={styles.settingAction} onPress={exportAllReports}>
          <MaterialIcons name="file-download" size={20} color={theme.primary} />
          <Text style={[styles.settingActionText, { color: theme.primary }]}>Export All Reports as CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingAction} onPress={clearAllReports}>
          <MaterialIcons name="delete" size={20} color={theme.danger} />
          <Text style={[styles.settingActionText, { color: theme.danger }]}>Clear All Reports</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>About</Text>
      <View style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('PrivacyPolicy')}>
  <View style={styles.settingInfo}>
    <MaterialIcons name="privacy-tip" size={24} color={theme.primary} />
    <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
  </View>
  <MaterialIcons name="chevron-right" size={24} color={theme.secondaryText} />
</TouchableOpacity>

<TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('TermsOfService')}>
  <View style={styles.settingInfo}>
    <MaterialIcons name="description" size={24} color={theme.primary} />
    <Text style={[styles.settingLabel, { color: theme.text }]}>Terms of Service</Text>
  </View>
  <MaterialIcons name="chevron-right" size={24} color={theme.secondaryText} />
</TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={contactSupport}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="support-agent" size={24} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Contact Support</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={openAppStoreReview}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="star-rate" size={24} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Rate the App</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.versionText, { color: theme.secondaryText }]}>Maize AI v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingActionText: {
    fontSize: 15,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SettingsScreen;
