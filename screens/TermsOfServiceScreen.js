// screens/TermsOfServiceScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const TermsOfServiceScreen = ({ navigation }) => (
  <ScrollView 
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
  >
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
      </TouchableOpacity>
      <Image 
        source={require('../assets/terms-icon.png')} 
        style={styles.headerIcon}
      />
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.subtitle}>CropGuardAI Agricultural Use</Text>
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <FontAwesome5 name="seedling" size={18} color="#27ae60" />
        <Text style={styles.sectionTitle}>Educational Use Only</Text>
      </View>
      <Text style={styles.paragraph}>
        By using CropGuardAI, you agree to use the app for educational and diagnostic support purposes only.
        The app provides AI-generated insights and does not replace professional agricultural advice.
      </Text>
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="warning" size={20} color="#e67e22" />
        <Text style={styles.sectionTitle}>User Responsibility</Text>
      </View>
      <Text style={styles.paragraph}>
        You are responsible for how you use the information provided. We are not liable for crop outcomes
        based on app predictions. Always verify with agronomists before making significant farming decisions.
      </Text>
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="gavel" size={20} color="#9b59b6" />
        <Text style={styles.sectionTitle}>Proper Usage</Text>
      </View>
      <Text style={styles.paragraph}>
        Do not use the app in ways that violate agricultural laws or infringe on the rights of others.
        Misuse of the service may result in account restrictions. Commercial use requires special licensing.
      </Text>
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="update" size={20} color="#3498db" />
        <Text style={styles.sectionTitle}>Terms Updates</Text>
      </View>
      <Text style={styles.paragraph}>
        These terms may change with updates to our disease detection models. Continued use of the app means
        you accept the latest terms. Major changes will be communicated through the app notifications.
      </Text>
    </View>

    <View style={styles.agreementSection}>
      <MaterialIcons name="verified" size={24} color="#27ae60" />
      <Text style={styles.agreementText}>
        By using CropGuardAI, you acknowledge and agree to these Terms of Service
      </Text>
    </View>

    <Text style={styles.footer}>
      CropGuardAI v1.1 - Satellite Imaging Module
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
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
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
  agreementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#edf7ed',
    borderRadius: 10,
  },
  agreementText: {
    fontSize: 15,
    color: '#2c3e50',
    marginLeft: 10,
    textAlign: 'center',
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

export default TermsOfServiceScreen;