// UploadScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, FlatList, Image, Alert, Modal,
  ScrollView, Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const UploadScreen = () => {
  const navigation = useNavigation();

  const [regions] = useState([
    'Adamawa', 'Ngaoundéré',
    'Centre', 'Yaoundé', 'Mbalmayo',
    'East', 'Bertoua', 'Batouri',
    'Far North', 'Maroua', 'Kousséri',
    'Littoral', 'Douala', 'Nkongsamba',
    'North', 'Garoua', 'Guider',
    'Northwest', 'Bamenda', 'Kumbo',
    'South', 'Ebolowa', 'Kribi',
    'Southwest', 'Buea', 'Limbe',
    'West', 'Bafoussam', 'Dschang'
  ]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cloudCover, setCloudCover] = useState(20);
  const [scenes, setScenes] = useState([]);
  const [selectedScene, setSelectedScene] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showScenesModal, setShowScenesModal] = useState(false);

  const fetchScenes = async () => {
    if (!selectedRegion || !date || cloudCover === '') return;

    setLoading(true);
    try {
      const url = `http://172.20.10.3:8000/landsat_scenes?region=${encodeURIComponent(selectedRegion)}&date=${encodeURIComponent(date)}&max_cloud=${encodeURIComponent(cloudCover)}`;
      
      const response = await axios.get(url, { timeout: 30000 });
      
      const scenesList = response.data.results || response.data || [];
      setScenes(scenesList);
      setShowScenesModal(true);
    } catch (error) {
      console.error('Fetch error', error.message);
      Alert.alert('Error', 'Failed to fetch scenes from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedScene) return;
    
    try {
      setShowScenesModal(false);
      // Navigate to Scan screen with scene information
      navigation.navigate('Scan', {
        sceneInfo: {
          displayId: selectedScene.entityId,
          date: new Date().toLocaleDateString(),
          thumbnail: selectedScene.thumbnailPath,
          sceneId: selectedScene.entityId // Pass the scene ID
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to start analysis process');
    }
  };

  const renderRegionDropdown = () => (
    <Modal
      visible={showRegionDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRegionDropdown(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={() => setShowRegionDropdown(false)}
      >
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownTitle}>Select Region</Text>
          <ScrollView style={styles.dropdownScroll}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.dropdownItem,
                  selectedRegion === region && styles.selectedDropdownItem
                ]}
                onPress={() => {
                  setSelectedRegion(region);
                  setShowRegionDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedRegion === region && styles.selectedDropdownText
                ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderScenesModal = () => (
    <Modal
      visible={showScenesModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowScenesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.scenesModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Available Scenes</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowScenesModal(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scenesScrollView}>
            {scenes.length === 0 ? (
              <View style={styles.noScenesContainer}>
                <Text style={styles.noScenesText}>No scenes found for the selected criteria</Text>
              </View>
            ) : (
              scenes.map((scene, index) => (
                <TouchableOpacity
                  key={scene.entityId || index}
                  style={[
                    styles.sceneModalCard,
                    selectedScene?.entityId === scene.entityId && styles.selectedSceneModal
                  ]}
                  onPress={() => setSelectedScene(scene)}
                >
                  {scene.thumbnailPath && (
                    <Image
                      source={{ uri: scene.thumbnailPath }}
                      style={styles.sceneModalImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.sceneModalInfo}>
                    <Text style={styles.sceneModalTitle}>Scene ID: {scene.entityId || 'N/A'}</Text>
                    <Text style={styles.sceneModalDetail}>
                      Date: {scene.acquisitionDate ? new Date(scene.acquisitionDate).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={styles.sceneModalDetail}>
                      Cloud Cover: {scene.cloudCover ? `${scene.cloudCover}%` : 'N/A'}
                    </Text>
                    {scene.path && scene.row && (
                      <Text style={styles.sceneModalDetail}>
                        Path/Row: {scene.path}/{scene.row}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          {selectedScene && (
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.analyzeModalButton} 
                onPress={handleAnalyze}
              >
                <Text style={styles.analyzeModalText}>Download Satellite Scene</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop Disease Detection</Text>

      {/* Region Selection */}
      <Text style={styles.label}>Region</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowRegionDropdown(true)}
      >
        <Text style={[styles.dropdownButtonText, !selectedRegion && styles.placeholder]}>
          {selectedRegion || 'Select region'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Date Input */}
      <Text style={styles.label}>Date</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
      />

      {/* Cloud Cover Input */}
      <Text style={styles.label}>Max Cloud Cover %</Text>
      <TextInput
        value={cloudCover.toString()}
        onChangeText={(val) => setCloudCover(Number(val))}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, (!selectedRegion || !date || cloudCover === '') && styles.buttonDisabled]}
        onPress={fetchScenes}
        disabled={!selectedRegion || !date || cloudCover === ''}
      >
        <Text style={styles.buttonText}>Fetch Scenes</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a5f23" />
          <Text style={styles.loadingText}>Fetching scenes...</Text>
        </View>
      )}

      {renderRegionDropdown()}
      {renderScenesModal()}
    </View>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5fdf6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a5f23',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2e8b57',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#1a5f23',
    fontSize: 16,
  },
  
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: width * 0.8,
    maxHeight: height * 0.6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center',
    color: '#1a5f23',
  },
  dropdownScroll: {
    maxHeight: height * 0.4,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDropdownItem: {
    backgroundColor: '#e9f6ef',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownText: {
    color: '#1a5f23',
    fontWeight: 'bold',
  },
  
  // Scenes modal styles
  scenesModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: width * 0.95,
    height: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5f23',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  scenesScrollView: {
    flex: 1,
    padding: 15,
  },
  noScenesContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noScenesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sceneModalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedSceneModal: {
    borderColor: '#1a5f23',
    borderWidth: 2,
    backgroundColor: '#e9f6ef',
  },
  sceneModalImage: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    marginBottom: 10,
  },
  sceneModalInfo: {
    flex: 1,
  },
  sceneModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a5f23',
    marginBottom: 5,
  },
  sceneModalDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  analyzeModalButton: {
    backgroundColor: '#1a5f23',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  analyzeModalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});