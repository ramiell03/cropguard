import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const ScanScreen = ({ route, navigation }) => {
  const [progress, setProgress] = useState('Initializing...');
  const [progressPercent, setProgressPercent] = useState(0);
  const { sceneInfo } = route.params;

  useEffect(() => {
    const processAnalysis = async () => {
  try {
    setProgress('Selecting random satellite data...');
    setProgressPercent(20);

    // Get a random zip from backend
    const randomFileResponse = await axios.get('http://172.20.10.3:8000/api/v1/get_random_zip');
    const filePath = randomFileResponse.data.filePath;

    setProgress('Preparing scene data...');
    setProgressPercent(40);

    // Use URLSearchParams instead of FormData
    const params = new URLSearchParams();
    params.append('sceneId', filePath);
    params.append('threshold', '0.6');
    params.append('generate_map', 'true');

    const analysisResponse = await axios.post(
      'http://172.20.10.3:8000/api/v1/detect_disease',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 60000,
      }
    );

        setProgress('Processing vegetation indices...');
        setProgressPercent(80);

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProgress('Analysis complete!');
        setProgressPercent(100);

        // Navigate to results after a short delay
        setTimeout(() => {
          navigation.navigate('Result', {
            analysisResult: analysisResponse.data,
            sceneInfo: {
              ...sceneInfo,
              filePath: filePath
            }
          });
        }, 1500);

      } catch (error) {
        console.error('Processing error:', error);
        
        let errorMessage = 'Failed to complete analysis';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setProgress('Analysis failed. Please try again.');
        setProgressPercent(0);
        
        Alert.alert(
          'Processing Error',
          errorMessage,
          [
            {
              text: 'Try Again',
              onPress: () => navigation.goBack()
            },
            {
              text: 'Cancel',
              onPress: () => navigation.navigate('Upload'),
              style: 'cancel'
            }
          ]
        );
      }
    };

    processAnalysis();
  }, [navigation, sceneInfo]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Satellite Analysis</Text>
      
      <View style={styles.sceneInfoContainer}>
        <Text style={styles.sceneInfoTitle}>Scene Information</Text>
        <Text style={styles.sceneInfoText}>ID: {sceneInfo.displayId}</Text>
        <Text style={styles.sceneInfoText}>Date: {sceneInfo.date}</Text>
      </View>

      <View style={styles.progressContainer}>
        <ActivityIndicator size="large" color="#1a5f23" />
        <Text style={styles.progressText}>{progress}</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{progressPercent}%</Text>
      </View>

      <View style={styles.processingSteps}>
        <Text style={styles.stepsTitle}>Processing Steps:</Text>
        <Text style={[styles.stepText, progressPercent >= 20 && styles.stepCompleted]}>
          • Selecting satellite data
        </Text>
        <Text style={[styles.stepText, progressPercent >= 40 && styles.stepCompleted]}>
          • Preparing scene data
        </Text>
        <Text style={[styles.stepText, progressPercent >= 60 && styles.stepCompleted]}>
          • Analyzing imagery
        </Text>
        <Text style={[styles.stepText, progressPercent >= 80 && styles.stepCompleted]}>
          • Processing vegetation indices
        </Text>
        <Text style={[styles.stepText, progressPercent >= 100 && styles.stepCompleted]}>
          • Generating results
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fdf6',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a5f23',
    marginBottom: 20,
    textAlign: 'center',
  },
  sceneInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sceneInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f23',
    marginBottom: 8,
  },
  sceneInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2e8b57',
    borderRadius: 5,
    transition: 'width 0.3s ease',
  },
  progressPercent: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  processingSteps: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f23',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
    paddingLeft: 10,
  },
  stepCompleted: {
    color: '#2e8b57',
    fontWeight: '500',
  },
});

export default ScanScreen;