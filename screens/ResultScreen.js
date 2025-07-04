import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Dimensions
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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

  // Get recommendations based on the analysis result
  const getRecommendations = () => {
    if (!analysisResult?.prediction) return [];
    
    const disease = analysisResult.prediction.class.toLowerCase();
    const isHealthy = analysisResult.prediction.is_healthy;
    
    if (isHealthy) {
      return [
        "Your crops appear healthy. Maintain current practices.",
        "Continue regular monitoring for early detection.",
        "Ensure proper irrigation and fertilization."
      ];
    }
    
    // Disease-specific recommendations
    const recommendations = {
      "maize leafblight": [
        "Apply fungicides containing chlorothalonil or mancozeb.",
        "Remove and destroy infected plant debris.",
        "Rotate crops with non-host species for 2-3 years."
      ],
      "maize rust": [
        "Apply fungicides at first sign of disease.",
        "Plant resistant varieties if available.",
        "Avoid overhead irrigation to reduce leaf wetness."
      ],
      "gray leaf spot": [
        "Use fungicide treatments in high-risk areas.",
        "Implement crop rotation with non-grass crops.",
        "Space plants adequately for better air circulation."
      ],
      // Add more disease-specific recommendations as needed
    };
    
    return recommendations[disease] || [
      "Isolate affected plants to prevent spread.",
      "Consult with agricultural extension services.",
      "Consider soil testing for nutrient imbalances."
    ];
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
          <Image 
            source={{ uri: sceneInfo.thumbnail }} 
            style={styles.sceneThumbnail}
          />
          <View style={styles.sceneDetails}>
            <Text style={styles.sceneName}>{sceneInfo.displayId}</Text>
            <Text style={styles.sceneDate}>{sceneInfo.date}</Text>
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

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <View style={styles.recommendations}>
          {getRecommendations().map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <FontAwesome 
                name={analysisResult.prediction.is_healthy ? "check-circle" : "exclamation-triangle"} 
                size={16} 
                color={analysisResult.prediction.is_healthy ? "#43a047" : "#fb8c00"} 
              />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* New analysis button */}
      <TouchableOpacity 
        style={styles.newAnalysisButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.newAnalysisText}>Perform New Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e8b57',
    marginBottom: 12,
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
    fontWeight: '600',
    color: '#333',
  },
  sceneDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  predictionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  predictionLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confidenceMeter: {
    marginBottom: 16,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  meterLabel: {
    fontSize: 14,
    color: '#555',
  },
  meterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  meterBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 5,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  severityText: {
    fontSize: 14,
    color: '#555',
  },
  severityValue: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  indicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  indexCard: {
    width: '100%',
    backgroundColor: '#f0f7f4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  indexName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e8b57',
    marginBottom: 4,
  },
  indexValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  indexRange: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  indexDescription: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  visualizationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  recommendations: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  newAnalysisButton: {
    backgroundColor: '#2e8b57',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newAnalysisText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultScreen;