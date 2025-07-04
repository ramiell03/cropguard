import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install expo vector icons

const ReportsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const [reports, setReports] = useState([]);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const unsubscribe = fetchReports();
    return () => unsubscribe;
  }, []);

  const fetchReports = async () => {
    try {
      const storedReports = await AsyncStorage.getItem('maizeReports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    } catch (error) {
      console.log('Failed to load reports', error);
    }
  };

  const deleteReport = (id) => {
    Alert.alert(
      'Delete Report', 
      'Are you sure you want to delete this report?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Cancel Pressed')
        },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => removeReport(id) 
        },
      ],
      { cancelable: true }
    );
  };

  const removeReport = async (id) => {
    try {
      const filteredReports = reports.filter((report) => report.id !== id);
      setReports(filteredReports);
      await AsyncStorage.setItem('maizeReports', JSON.stringify(filteredReports));
    } catch (error) {
      console.log('Failed to delete report', error);
      Alert.alert('Error', 'Failed to delete report');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.reportItem, 
      { 
        backgroundColor: theme.cardBackground || '#fff',
        shadowColor: theme.shadow,
        width: width * 0.9,
      }
    ]}>
      <View style={styles.reportHeader}>
        <MaterialIcons 
          name="description" 
          size={24} 
          color={theme.primary} 
          style={styles.reportIcon}
        />
        <Text style={[styles.date, { color: theme.text }]}>
          {item.date}
        </Text>
      </View>
      
      <View style={styles.reportContent}>
        <Text style={[styles.content, { color: theme.text }]}>
          {item.content}
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        {item.status && (
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: getStatusColor(item.status, theme),
            }
          ]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.deleteButton, 
          { 
            backgroundColor: theme.danger || '#e55353',
          }
        ]}
        onPress={() => deleteReport(item.id)}
      >
        <MaterialIcons name="delete" size={18} color="#fff" />
        <Text style={styles.deleteButtonText}>
          Delete
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getStatusColor = (status, theme) => {
    const statusColors = {
      healthy: theme.success || '#4CAF50',
      moderate: theme.warning || '#FFC107',
      severe: theme.danger || '#F44336',
      high: theme.primary || '#2196F3',
    };
    return statusColors[status.toLowerCase()] || theme.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>
        Your Reports
      </Text>
      
      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons 
            name="find-in-page" 
            size={60} 
            color={theme.secondaryText} 
          />
          <Text style={[styles.noReports, { color: theme.secondaryText }]}>
            No saved reports yet
          </Text>
          <Text style={[styles.noReportsSubtext, { color: theme.secondaryText }]}>
            Scan a field to generate your first report
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  reportItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIcon: {
    marginRight: 10,
  },
  date: {
    fontWeight: '600',
    fontSize: 16,
  },
  reportContent: {
    marginBottom: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  noReports: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  noReportsSubtext: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default ReportsScreen;