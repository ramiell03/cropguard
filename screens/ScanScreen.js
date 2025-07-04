import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';

export default function ScanScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setProgress(0);
    
    const apiUrl = 'http://172.20.10.2:8000/analyze';
    // ⚠️ replace <YOUR_IP>

    try {
      const fileInfo = await FileSystem.getInfoAsync(image);
      const formData = new FormData();

      formData.append('file', {
        uri: fileInfo.uri,
        name: 'maize.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Simulate progress for demo (remove in production)
      const simulateProgress = () => {
        if (progress < 100) {
          setProgress(prev => Math.min(prev + 10, 90));
          setTimeout(simulateProgress, 300);
        }
      };
      simulateProgress();

      // After analysis completes
      setTimeout(() => {
        setProgress(100);
        setIsAnalyzing(false);
        navigation.navigate('Result', { 
          imageUri: image, 
          result: result.disease || 'Unknown',
          confidence: result.confidence || 0,
          advice: result.advice || 'No specific advice available',
          ndvi: result.ndvi || null
        });
      }, 2000);

    } catch (error) {
      setIsAnalyzing(false);
      Alert.alert(
        'Analysis Failed',
        'Could not analyze the image. Please try again.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
      console.error('Analysis error:', error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Camera Permission Required",
        "We need access to your camera to take photos of your maize field.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>🌽 Maize Field Analysis</Text>
      <Text style={[styles.subheader, { color: theme.secondaryText }]}>
        Upload or capture an image of your maize field for disease detection
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={pickImage}
        >
          <MaterialIcons name="photo-library" size={24} color={theme.buttonText} />
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={takePhoto}
        >
          <MaterialIcons name="photo-camera" size={24} color={theme.buttonText} />
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.image} 
            resizeMode="contain"
          />
          
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size="large" 
                color={theme.primary} 
                style={styles.spinner}
              />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Analyzing... {progress}%
              </Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: theme.primary,
                    }
                  ]}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: theme.primary }]}
              onPress={analyzeImage}
            >
              <MaterialIcons name="search" size={24} color={theme.buttonText} />
              <Text style={[styles.analyzeButtonText, { color: theme.buttonText }]}>
                Analyze Image
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!image && (
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={24} color={theme.primary} />
          <Text style={[styles.tipText, { color: theme.secondaryText }]}>
            Tip: Capture clear images of affected leaves for best results
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    width: '100%',
    elevation: 2,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 15,
  },
  spinner: {
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(242, 201, 76, 0.1)',
  },
  tipText: {
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1,
  },
});