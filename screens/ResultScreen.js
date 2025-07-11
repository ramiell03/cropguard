import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Dimensions
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://172.20.10.3:8000'; // Add your API base URL

const ResultScreen = ({ route, navigation }) => {
  const { analysisResult, sceneInfo } = route.params;

  // Helper function to get color based on severity
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return '#e53935';
      case 'medium': return '#fb8c00';
      case 'low': return '#43a047';
      default: return '#757575';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1a5f23', '#2e8b57']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
      </LinearGradient>

      {/* Scene info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Satellite Scene Analyzed</Text>
        <View style={styles.sceneInfo}>
          {sceneInfo.thumbnail && (
            <Image 
              source={{ uri: sceneInfo.thumbnail }} 
              style={styles.sceneThumbnail}
            />
          )}
          <View style={styles.sceneDetails}>
            <Text style={styles.sceneName}>{sceneInfo.displayId}</Text>
            <Text style={styles.sceneDate}>{sceneInfo.date}</Text>
            {sceneInfo.filePath && (
              <Text style={styles.sceneFile}>
                File: {sceneInfo.filePath.split('/').pop()}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Disease prediction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disease Detection</Text>
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Text style={styles.predictionLabel}>Identified Condition:</Text>
            <Text style={[
              styles.predictionValue,
              { color: analysisResult.prediction.is_healthy ? '#43a047' : '#e53935' }
            ]}>
              {analysisResult.prediction.class}
            </Text>
          </View>
          
          <View style={styles.confidenceMeter}>
            <View style={styles.meterLabels}>
              <Text style={styles.meterLabel}>Confidence:</Text>
              <Text style={styles.meterValue}>
                {(analysisResult.prediction.confidence * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.meterBar}>
              <View 
                style={[
                  styles.meterFill,
                  { 
                    width: `${analysisResult.prediction.confidence * 100}%`,
                    backgroundColor: getSeverityColor(analysisResult.prediction.severity)
                  }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.severityBadge}>
            <Text style={styles.severityText}>Severity: </Text>
            <Text style={[
              styles.severityValue,
              { color: getSeverityColor(analysisResult.prediction.severity) }
            ]}>
              {analysisResult.prediction.severity}
            </Text>
          </View>
        </View>
      </View>

      {/* Vegetation indices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vegetation Health Indices</Text>
        <View style={styles.indicesGrid}>
          <View style={styles.indexCard}>
            <Text style={styles.indexName}>NDVI</Text>
            <Text style={styles.indexValue}>
              {analysisResult.vegetation_indices.ndvi.mean.toFixed(3)}
            </Text>
            <Text style={styles.indexRange}>
              Range: {analysisResult.vegetation_indices.ndvi.min.toFixed(3)} - {analysisResult.vegetation_indices.ndvi.max.toFixed(3)}
            </Text>
            <Text style={styles.indexDescription}>
              Normalized Difference Vegetation Index (measures plant health)
            </Text>
          </View>
          <View style={styles.indexCard}>
            <Text style={styles.indexName}>NDWI</Text>
            <Text style={styles.indexValue}>
              {analysisResult.vegetation_indices.ndwi.toFixed(3)}
            </Text>
            <Text style={styles.indexDescription}>
              Normalized Difference Water Index (measures water content)
            </Text>
          </View>
        </View>
      </View>

      {/* Visualization */}
      {analysisResult.visualization && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vegetation Health Map</Text>
          <Image 
            source={{ uri: `${API_BASE_URL}${analysisResult.visualization}` }} 
            style={styles.visualizationImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Recommendations from API */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendations}>
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 ? (
            analysisResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <FontAwesome 
                  name={analysisResult.prediction.is_healthy ? "check-circle" : "exclamation-triangle"} 
                  size={16} 
                  color={analysisResult.prediction.is_healthy ? "#43a047" : "#fb8c00"} 
                />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))
          ) : (
            <View style={styles.recommendationItem}>
              <FontAwesome name="info-circle" size={16} color="#757575" />
              <Text style={styles.recommendationText}>No specific recommendations.</Text>
            </View>
          )}
        </View>
      </View>

    </ScrollView>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4faf4',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5f23',
    marginBottom: 10,
  },
  sceneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sceneThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  sceneDetails: {
    flex: 1,
  },
  sceneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  sceneDate: {
    fontSize: 14,
    color: '#666',
  },
  sceneFile: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  predictionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionLabel: {
    fontSize: 16,
    color: '#444',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceMeter: {
    marginTop: 12,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: {
    fontSize: 14,
    color: '#555',
  },
  meterValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  meterBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: 8,
    borderRadius: 4,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  severityText: {
    fontSize: 14,
    color: '#444',
  },
  severityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  indicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indexCard: {
    backgroundColor: '#fff',
    width: (width - 48) / 2,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    elevation: 1,
  },
  indexName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e8b57',
  },
  indexValue: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
  },
  indexRange: {
    fontSize: 12,
    color: '#777',
  },
  indexDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  visualizationImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginTop: 8,
  },
  recommendations: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#444',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default ResultScreen;