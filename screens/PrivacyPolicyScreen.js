// screens/PrivacyPolicyScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => (
  <ScrollView 
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
  >
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Image 
          source={require('../assets/privacy-shield.jpg')} 
          style={styles.headerIcon}
        />
      </View>
      <Text style={styles.title}>Data Privacy Commitment</Text>
      <Text style={styles.subtitle}>For CropGuardAI Disease Detection</Text>
    </View>
    
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="security" size={20} color="#27ae60" />
        <Text style={styles.sectionTitle}>Your Data Security</Text>
      </View>
      <Text style={styles.paragraph}>
        CropGuardAI processes your field images exclusively on your device. We employ edge computing to analyze satellite and drone imagery locally, ensuring your farm data never leaves your control without explicit consent.
      </Text>
    </View>
    
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="analytics" size={20} color="#2980b9" />
        <Text style={styles.sectionTitle}>Anonymous Improvements</Text>
      </View>
      <Text style={styles.paragraph}>
        To enhance our disease detection algorithms, we may process anonymized image patterns. This helps improve accuracy for common maize diseases like rust, blight, and gray leaf spot without compromising your identity or exact location.
      </Text>
    </View>
    
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="storage" size={20} color="#e67e22" />
        <Text style={styles.sectionTitle}>Data Retention</Text>
      </View>
      <Text style={styles.paragraph}>
        Field scan results are stored securely on your device for 30 days unless deleted. You can manually clear data anytime via Settings. Our AI models don't retain geotags or personally identifiable field coordinates.
      </Text>
    </View>
    
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="share" size={20} color="#9b59b6" />
        <Text style={styles.sectionTitle}>Third-Party Disclosure</Text>
      </View>
      <Text style={styles.paragraph}>
        We never sell or share your farm data with seed companies, insurers, or commodity traders. Aggregate insights are only used to improve agricultural AI research.
      </Text>
    </View>
    
    <View style={styles.contactSection}>
      <MaterialIcons name="contact-support" size={24} color="#3498db" />
      <Text style={styles.contactText}>
        For agricultural data questions: {"\n"}
        <Text style={styles.email}>CropGuardAI-support@maizeai.com</Text>
      </Text>
    </View>
    
    <Text style={styles.footer}>
      Updated for v1.1 - Satellite Remote Imaging Module
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f5',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d5e8d5',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#34495e',
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#edf5ff',
    borderRadius: 10,
  },
  contactText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 10,
    textAlign: 'center',
  },
  email: {
    color: '#27ae60',
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
});

export default PrivacyPolicyScreen;