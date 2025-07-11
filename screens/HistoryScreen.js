import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Dimensions, ActivityIndicator, Alert 
} from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const { width } = Dimensions.get('window');

  // Function to update home screen stats
  const updateHomeStats = async () => {
    try {
      const reports = await AsyncStorage.getItem('maizeResults');
      if (reports) {
        const parsed = JSON.parse(reports);
        const healthyCount = parsed.filter(r => r.confidence < 40).length;
        const warningCount = parsed.filter(r => r.confidence >= 40 && r.confidence < 70).length;
        const criticalCount = parsed.filter(r => r.confidence >= 70).length;

        // Pass the updated stats back to home screen
        if (route.params?.onStatsUpdate) {
          route.params.onStatsUpdate({
            totalScans: parsed.length,
            healthy: healthyCount,
            warnings: warningCount,
            critical: criticalCount
          });
        }
      }
    } catch (error) {
      console.error('Error updating home stats:', error);
    }
  };

  const loadScansFromAPI = async () => {
    try {
      const response = await fetch('http://172.20.10.3:8000/api/v1/scan_history');
      const data = await response.json();
      if (data.history) {
        const sortedScans = data.history.reverse();
        setScans(sortedScans);
        
        // Save to AsyncStorage for offline access
        await AsyncStorage.setItem('maizeResults', JSON.stringify(sortedScans));
        
        // Update home screen stats
        await updateHomeStats();
      }
    } catch (error) {
      console.error('Failed to fetch scan history:', error);
      // Fallback to local storage if API fails
      const localScans = await AsyncStorage.getItem('maizeResults');
      if (localScans) {
        setScans(JSON.parse(localScans));
      } else {
        Alert.alert('Error', 'Could not load scan history');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadScansFromAPI();
  };

  const handleDelete = async (scanId) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Delete from API
              await fetch(`http://1172.20.10.3:8000/api/v1/scan_history/${scanId}`, {
                method: 'DELETE'
              });
              
              // Update local state
              const updatedScans = scans.filter(scan => scan.id !== scanId);
              setScans(updatedScans);
              
              // Update AsyncStorage
              await AsyncStorage.setItem('maizeResults', JSON.stringify(updatedScans));
              
              // Update home screen stats
              await updateHomeStats();
              
              Alert.alert('Success', 'Scan deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete scan');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  useEffect(() => {
    if (isFocused) {
      loadScansFromAPI();
    }
  }, [isFocused]);

  const getStatusColor = (confidence) => {
    if (confidence > 80) return theme.danger;
    if (confidence > 60) return theme.warning;
    if (confidence > 40) return theme.info;
    return theme.success;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderItem = ({ item }) => {
    const { day, date, month, time } = formatDate(item.timestamp);
    const statusColor = getStatusColor(item.confidence);
    
    return (
      <TouchableOpacity
        style={[styles.scanCard, { 
          backgroundColor: theme.cardBackground,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
          width: width * 0.92,
        }]}
        onPress={() => navigation.navigate('Result', {
          result: item.result,
          confidence: item.confidence,
          advice: item.advice,
          ndvi: item.ndvi,
          onDelete: () => handleDelete(item.id) // Pass delete handler to Result screen
        })}
      >
        <View style={styles.scanHeader}>
          <View style={styles.dateBadge}>
            <Text style={[styles.dayText, { color: theme.primary }]}>{day}</Text>
            <Text style={[styles.dateText, { color: theme.text }]}>{date}</Text>
            <Text style={[styles.monthText, { color: theme.text }]}>{month}</Text>
          </View>

          <View style={styles.scanInfo}>
            <Text style={[styles.scanTitle, { color: theme.text }]} numberOfLines={1}>
              {item.result}
            </Text>
            <View style={styles.timeContainer}>
              <MaterialIcons name="access-time" size={14} color={theme.secondaryText} />
              <Text style={[styles.scanTime, { color: theme.secondaryText }]}>{time}</Text>
            </View>
          </View>

          <View style={styles.confidenceBadge}>
            <Text style={[styles.confidenceValue, { color: statusColor }]}>
              {item.confidence}%
            </Text>
            <Text style={[styles.confidenceLabel, { color: theme.secondaryText }]}>Confidence</Text>
          </View>
        </View>

        {item.ndvi && (
          <View style={styles.ndviContainer}>
            <View style={styles.ndviLabel}>
              <MaterialIcons name="grass" size={16} color={theme.primary} />
              <Text style={[styles.ndviText, { color: theme.text }]}>NDVI</Text>
            </View>
            <View style={[styles.ndviValue, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.ndviValueText, { color: theme.primary }]}>
                {item.ndvi}
              </Text>
            </View>
          </View>
        )}

        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={theme.secondaryText} 
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Scan History</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your scans...</Text>
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="find-in-page" size={60} color={theme.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No scan history yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
            Your analyzed fields will appear here
          </Text>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={{ height: 10 }} />}
          ListFooterComponent={<View style={{ height: 30 }} />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
  },
  scanCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBadge: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  monthText: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  scanInfo: {
    flex: 1,
    marginRight: 12,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanTime: {
    fontSize: 13,
    marginLeft: 4,
  },
  confidenceBadge: {
    alignItems: 'center',
    minWidth: 60,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  confidenceLabel: {
    fontSize: 11,
  },
  ndviContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  ndviLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ndviText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  ndviValue: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ndviValueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 15,
    marginBottom: 24,
  },
  scanButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});