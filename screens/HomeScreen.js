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

// Complete list of Cameroon regions with coordinates
const CAMEROON_REGIONS = [
  { name: "Adamawa", capital: "Ngaoundéré", lat: 7.3167, lon: 13.5833, color: "#4CAF50" },
  { name: "Centre", capital: "Yaoundé", lat: 3.8667, lon: 11.5167, color: "#2196F3" },
  { name: "East", capital: "Bertoua", lat: 4.5833, lon: 13.6833, color: "#FF9800" },
  { name: "Far North", capital: "Maroua", lat: 10.5956, lon: 14.3247, color: "#9C27B0" },
  { name: "Littoral", capital: "Douala", lat: 4.0500, lon: 9.7000, color: "#009688" },
  { name: "North", capital: "Garoua", lat: 9.3000, lon: 13.4000, color: "#795548" },
  { name: "Northwest", capital: "Bamenda", lat: 5.9333, lon: 10.1667, color: "#607D8B" },
  { name: "South", capital: "Ebolowa", lat: 2.9167, lon: 11.1500, color: "#3F51B5" },
  { name: "Southwest", capital: "Buea", lat: 4.1667, lon: 9.2333, color: "#FF5722" },
  { name: "West", capital: "Bafoussam", lat: 5.4667, lon: 10.4167, color: "#E91E63" }
];

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [stats, setStats] = useState({
    totalScans: 42,
    healthy: 28,
    warnings: 9,
    critical: 5,
    lastScan: new Date()
  });
  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Partly Cloudy",
    advice: "Ideal conditions for maize growth",
    icon: "cloud-sun"
  });
  const [currentRegion, setCurrentRegion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Health data visualization
  const healthData = [
    { label: 'Healthy', value: stats.healthy, color: '#4CAF50', icon: 'check-circle' },
    { label: 'Warnings', value: stats.warnings, color: '#FFC107', icon: 'exclamation-triangle' },
    { label: 'Critical', value: stats.critical, color: '#F44336', icon: 'times-circle' }
  ];

  const getRegionByCoordinates = (lat, lon) => {
    let nearestRegion = CAMEROON_REGIONS[0];
    let minDistance = Number.MAX_VALUE;
    
    CAMEROON_REGIONS.forEach(region => {
      const distance = Math.sqrt(
        Math.pow(lat - region.lat, 2) + 
        Math.pow(lon - region.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestRegion = region;
      }
    });
    
    return nearestRegion;
  };

  const fetchScanData = async () => {
    try {
      // Simulated data - replace with your actual data fetching logic
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
      }
    } catch (error) {
      console.error('Error loading scan data:', error);
    }
  };

  const fetchWeatherData = async (regionName) => {
    try {
      // Simulated weather data - replace with your API call
      const weatherConditions = [
        { temp: 28, condition: "Sunny", advice: "Ideal conditions for maize", icon: "sun" },
        { temp: 24, condition: "Partly Cloudy", advice: "Good growing weather", icon: "cloud-sun" },
        { temp: 22, condition: "Rainy", advice: "Monitor for fungal diseases", icon: "cloud-rain" }
      ];
      
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      setWeather(randomWeather);
      
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchScanData();
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const region = getRegionByCoordinates(
            location.coords.latitude, 
            location.coords.longitude
          );
          setCurrentRegion(region);
          await fetchWeatherData(region.name);
        }
      } catch (error) {
        console.error('Location error:', error);
        // Default to Yaoundé if location fails
        setCurrentRegion(CAMEROON_REGIONS.find(r => r.name === "Centre"));
        await fetchWeatherData("Centre");
      }
      
      setLoading(false);
    };

    initializeData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
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
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)']}
          style={styles.gradientOverlay}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animatable.View 
              animation="fadeInDown" 
              duration={800}
              style={styles.header}
            >
              <Text style={styles.title}>MaizeGuard AI</Text>
              <Text style={styles.subtitle}>Precision Agriculture Monitoring</Text>
            </Animatable.View>

            {/* Current Location Card */}
            {currentRegion && (
              <Animatable.View 
                animation="fadeInLeft" 
                duration={800}
                delay={200}
                style={styles.locationCard}
              >
                <View style={styles.locationHeader}>
                  <Ionicons name="location-sharp" size={24} color="#FFF" />
                  <Text style={styles.locationTitle}>Current Region</Text>
                </View>
                <View style={styles.locationContent}>
                  <Image 
                    source={CAMEROON_MAP} 
                    style={styles.mapImage}
                    resizeMode="contain"
                  />
                  <View style={styles.locationDetails}>
                    <Text style={styles.regionName}>{currentRegion.name}</Text>
                    <Text style={styles.regionCapital}>{currentRegion.capital}</Text>
                    <View style={[
                      styles.regionIndicator, 
                      { backgroundColor: currentRegion.color }
                    ]} />
                  </View>
                </View>
              </Animatable.View>
            )}

            {/* Weather Card */}
            <Animatable.View 
              animation="fadeInRight" 
              duration={800}
              delay={200}
              style={styles.weatherCard}
            >
              <View style={styles.weatherHeader}>
                <FontAwesome5 
                  name={weather.icon} 
                  size={24} 
                  color="#FFF" 
                />
                <Text style={styles.weatherTitle}>Weather Conditions</Text>
              </View>
              <View style={styles.weatherContent}>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
                <Text style={styles.weatherAdvice}>{weather.advice}</Text>
              </View>
            </Animatable.View>

            {/* Health Overview Card */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={800}
              delay={400}
              style={styles.healthCard}
            >
              <Text style={styles.healthTitle}>Crop Health Overview</Text>
              
              {/* Summary Stats */}
              <View style={styles.summaryContainer}>
                <View style={styles.totalScans}>
                  <Text style={styles.totalScansValue}>{stats.totalScans}</Text>
                  <Text style={styles.totalScansLabel}>Total Scans</Text>
                </View>
                
                <View style={styles.healthBars}>
                  {healthData.map((item, index) => (
                    <View key={index} style={styles.healthBarContainer}>
                      <View style={styles.healthBarLabel}>
                        <FontAwesome5 
                          name={item.icon} 
                          size={16} 
                          color={item.color} 
                        />
                        <Text style={styles.healthBarText}>{item.label}</Text>
                      </View>
                      <View style={styles.healthBarBackground}>
                        <View 
                          style={[
                            styles.healthBarFill, 
                            { 
                              width: `${(item.value / stats.totalScans) * 100}%`,
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
                  Last scan: {stats.lastScan.toLocaleDateString()} at{' '}
                  {stats.lastScan.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              )}
            </Animatable.View>

            {/* Quick Actions */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={800}
              delay={600}
              style={styles.actionsContainer}
            >
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialIcons name="camera-alt" size={24} color="#FFF" />
                  <Text style={styles.actionButtonText}>New Scan</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Reports')}
              >
                <LinearGradient
                  colors={['#2196F3', '#1565C0']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialIcons name="history" size={24} color="#FFF" />
                  <Text style={styles.actionButtonText}>View History</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
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