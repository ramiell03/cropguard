import React, { useContext, useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Dimensions, 
  ImageBackground, ActivityIndicator, ScrollView, Platform, 
  SafeAreaView, Alert, Image 
} from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');
const BACKGROUND_IMAGE = require('../assets/maize-field.jpg');
const CAMEROON_MAP = require('../assets/cameroon-map.jpg');

// Define Cameroon regions with their coordinates
const CAMEROON_REGIONS = [
  { name: 'Centre', lat: 3.8480, lon: 11.5021, capital: 'Yaounde' },
  { name: 'Littoral', lat: 4.0511, lon: 9.7679, capital: 'Douala' },
  { name: 'North-West', lat: 5.9636, lon: 10.1593, capital: 'Bamenda' },
  { name: 'North', lat: 9.3041, lon: 13.3936, capital: 'Garoua' },
  { name: 'Far North', lat: 10.5956, lon: 14.3247, capital: 'Maroua' },
  { name: 'East', lat: 4.3547, lon: 13.6732, capital: 'Bertoua' },
  { name: 'South', lat: 2.9167, lon: 10.8833, capital: 'Ebolowa' },
  { name: 'South-West', lat: 4.1549, lon: 9.2317, capital: 'Buea' },
  { name: 'Adamawa', lat: 6.5000, lon: 12.5000, capital: 'Ngaoundere' },
  { name: 'West', lat: 5.4500, lon: 10.4167, capital: 'Bafoussam' }
];

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [stats, setStats] = useState({
    totalScans: 0,
    healthy: 0,
    warnings: 0,
    critical: 0,
    lastScan: null
  });
  const [weather, setWeather] = useState({
    temp: 0,
    condition: "",
    advice: "",
    icon: "cloud"
  });
  const [currentRegion, setCurrentRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  const healthData = [
    { label: 'Healthy', value: stats.healthy, color: '#4CAF50', icon: 'check-circle' },
    { label: 'Warnings', value: stats.warnings, color: '#FFC107', icon: 'exclamation-triangle' },
    { label: 'Critical', value: stats.critical, color: '#F44336', icon: 'times-circle' }
  ];

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to find nearest region based on coordinates
  const getRegionByCoordinates = (lat, lon) => {
    let nearest = CAMEROON_REGIONS[0];
    let minDist = Number.MAX_VALUE;

    CAMEROON_REGIONS.forEach(region => {
      const distance = calculateDistance(lat, lon, region.lat, region.lon);
      if (distance < minDist) {
        minDist = distance;
        nearest = region;
      }
    });

    return nearest;
  };

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const region = getRegionByCoordinates(
        location.coords.latitude, 
        location.coords.longitude
      );

      setCurrentRegion(region);
      return region;
    } catch (error) {
      console.warn('Location error:', error.message);
      // Fallback to Centre region if location fails
      const fallbackRegion = CAMEROON_REGIONS.find(r => r.name === 'Centre');
      setCurrentRegion(fallbackRegion);
      return fallbackRegion;
    }
  };

  // Function to fetch scan data from storage
  const fetchScanData = async () => {
    try {
      const reports = await AsyncStorage.getItem('maizeResults');
      if (reports) {
        const parsed = JSON.parse(reports);
        const healthyCount = parsed.filter(r => r.confidence < 40).length;
        const warningCount = parsed.filter(r => r.confidence >= 40 && r.confidence < 70).length;
        const criticalCount = parsed.filter(r => r.confidence >= 70).length;

        setStats({
          totalScans: parsed.length,
          healthy: healthyCount,
          warnings: warningCount,
          critical: criticalCount,
          lastScan: parsed.length > 0 ? new Date(parsed[0].timestamp) : null
        });
      } else {
        // Initialize with empty stats if no data exists
        setStats({
          totalScans: 0,
          healthy: 0,
          warnings: 0,
          critical: 0,
          lastScan: null
        });
      }
    } catch (error) {
      console.error('Error loading scan data:', error);
      Alert.alert('Data Error', 'Could not load scan history');
    }
  };

  // Function to fetch weather data
  const fetchWeatherData = async (region) => {
    try {
      // Use the region's capital city for weather data
      const cityName = region.capital || region.name;
      const response = await fetch(
        `http://172.20.10.3:8000/api/weather?region=${encodeURIComponent(cityName)}`
      );
      
      const data = await response.json();

      if (response.ok) {
        setWeather({
          temp: data.temp || 0,
          condition: data.condition || 'Unknown',
          advice: data.advice || 'No advice available',
          icon: data.icon || 'cloud'
        });
      } else {
        console.error("Weather API error:", data);
        // Set default weather data instead of showing alert
        setWeather({
          temp: 25,
          condition: 'Partly Cloudy',
          advice: 'Good conditions for farming',
          icon: 'cloud'
        });
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Set default weather data on network error
      setWeather({
        temp: 25,
        condition: 'Weather Unavailable',
        advice: 'Check network connection',
        icon: 'cloud'
      });
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      try {
        // Load scan data first (this should always work)
        await fetchScanData();
        
        // Get current region
        const region = await getCurrentLocation();
        
        // Fetch weather data for the region
        if (region) {
          await fetchWeatherData(region);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Initialization Error', 'Some data could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchScanData();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your farm data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={BACKGROUND_IMAGE}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          style={styles.gradientOverlay}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Maize Monitor</Text>
              <Text style={styles.subtitle}>Your field insights at a glance</Text>
            </View>

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location-outline" size={24} color="#FFF" />
                <Text style={styles.locationTitle}>Current Region</Text>
              </View>

              <View style={styles.locationContent}>
                <Image source={CAMEROON_MAP} style={styles.mapImage} />
                <View style={styles.locationDetails}>
                  <Text style={styles.regionName}>
                    {currentRegion?.name || "Unknown"}
                  </Text>
                  <Text style={styles.regionCapital}>
                    Capital: {currentRegion?.capital || "—"}
                  </Text>
                  <View
                    style={[
                      styles.regionIndicator,
                      { backgroundColor: '#4CAF50' }
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Weather Card */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <MaterialIcons name="cloud" size={24} color="#FFF" />
                <Text style={styles.weatherTitle}>Weather Update</Text>
              </View>

              <View style={styles.weatherContent}>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
                <Text style={styles.weatherAdvice}>{weather.advice}</Text>
              </View>
            </View>

            {/* Health Summary Card */}
            <View style={styles.healthCard}>
              <Text style={styles.healthTitle}>Crop Health Summary</Text>

              <View style={styles.summaryContainer}>
                <View style={styles.totalScans}>
                  <Text style={styles.totalScansValue}>{stats.totalScans}</Text>
                  <Text style={styles.totalScansLabel}>Total Scans</Text>
                </View>

                <View style={styles.healthBars}>
                  {healthData.map((item, index) => (
                    <View key={index} style={styles.healthBarContainer}>
                      <View style={styles.healthBarLabel}>
                        <FontAwesome5 name={item.icon} size={14} color={item.color} />
                        <Text style={styles.healthBarText}>{item.label}</Text>
                      </View>
                      <View style={styles.healthBarBackground}>
                        <View
                          style={[
                            styles.healthBarFill,
                            {
                              width: `${stats.totalScans > 0 ? (item.value / stats.totalScans) * 100 : 0}%`,
                              backgroundColor: item.color
                            }
                          ]}
                        />
                        <Text style={styles.healthBarValue}>{item.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {stats.lastScan && (
                <Text style={styles.lastScanText}>
                  Last scan: {stats.lastScan.toLocaleString()}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.buttonGradient}
                >
                  <MaterialIcons name="camera-alt" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>New Scan</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('History')}
              >
                <LinearGradient
                  colors={['#2196F3', '#0D47A1']}
                  style={styles.buttonGradient}
                >
                  <MaterialIcons name="history" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>View History</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4CAF50',
  },

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  locationCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapImage: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  locationDetails: {
    flex: 1,
  },
  regionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  regionCapital: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  regionIndicator: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  weatherCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  weatherContent: {
    paddingLeft: 34,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  weatherAdvice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  healthCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  totalScans: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  totalScansValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  totalScansLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  healthBars: {
    flex: 1,
  },
  healthBarContainer: {
    marginBottom: 12,
  },
  healthBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  healthBarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  healthBarBackground: {
    height: 20,
    backgroundColor: '#EEE',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  healthBarFill: {
    position: 'absolute',
    left: 0,
    height: '100%',
    borderRadius: 10,
    opacity: 0.2,
  },
  healthBarValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 1,
  },
  lastScanText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
});