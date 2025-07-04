import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';


export default function HistoryScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [scans, setScans] = useState([]);
  const isFocused = useIsFocused();
  const { width } = Dimensions.get('window');

  useEffect(() => {
  const loadScansFromAPI = async () => {
    try {
      const response = await fetch('http://192.168.1.117:8000/api/v1/scan_history');
      const data = await response.json();
      if (data.history) {
        setScans(data.history.reverse()); // Newest first
      }
    } catch (error) {
      console.error('Failed to fetch scan history from API:', error);
    }
  };

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
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderItem = ({ item }) => {
    const { day, date, time } = formatDate(item.timestamp);
    const statusColor = getStatusColor(item.confidence);
    
    return (
      <TouchableOpacity
        style={[styles.scanCard, { 
          backgroundColor: theme.cardBackground,
          shadowColor: theme.shadow,
          width: width * 0.9,
        }]}
        onPress={() => navigation.navigate('Result', {
          result: item.result,
          confidence: item.confidence,
          advice: item.advice,
          ndvi: item.ndvi
        })}
      >
        <View style={styles.scanHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={[styles.scanTitle, { color: theme.text }]}>{item.result}</Text>
          <Text style={[styles.scanTime, { color: theme.secondaryText }]}>{time}</Text>
        </View>

        <View style={styles.scanDetails}>
          <View style={styles.dateContainer}>
            <Text style={[styles.dayText, { color: theme.primary }]}>{day}</Text>
            <Text style={[styles.dateText, { color: theme.text }]}>{date}</Text>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceLabel, { color: theme.secondaryText }]}>Confidence</Text>
            <Text style={[styles.confidenceValue, { color: statusColor }]}>
              {item.confidence}%
            </Text>
          </View>
        </View>

        {item.ndvi && (
          <View style={styles.ndviContainer}>
            <MaterialIcons name="grass" size={16} color={theme.primary} />
            <Text style={[styles.ndviText, { color: theme.text }]}>
              NDVI: {item.ndvi}
            </Text>
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
      <Text style={[styles.header, { color: theme.text }]}>Scan History</Text>
      
      {scans.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="find-in-page" size={60} color={theme.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            No scan history yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
            Your analyzed fields will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  scanCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  scanTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  scanTime: {
    fontSize: 14,
  },
  scanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ndviContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ndviText: {
    fontSize: 14,
    marginLeft: 4,
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
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
  },
});