// UploadScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, FlatList, Image, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

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

const fetchScenes = async () => {
  if (!selectedRegion) return;

  setLoading(true);
  try {
    // Step 1: Fetch all available scenes
    const response = await axios.get('http://192.168.1.117:8000/landsat_scenes', {
      params: {
        region: selectedRegion,
        date: date,
        max_cloud: cloudCover
      },
      timeout: 30000
    });

    const scenesList = response.data.results;

    // Optional: fetch full metadata for each scene (via POST /landsat_scene)
    const enrichedScenes = await Promise.all(
      scenesList.map(async (scene) => {
        try {
          const sceneResponse = await axios.post('http://192.168.1.117:8000/landsat_scene', {
            entityId: scene.entityId
          });

          return { ...scene, ...sceneResponse.data.data }; // Merge metadata if needed
        } catch (err) {
          console.warn('Scene metadata fetch failed for', scene.entityId);
          return scene; // fallback
        }
      })
    );

    setScenes(enrichedScenes);
  } catch (error) {
    console.error('Fetch error', error.message);
    Alert.alert('Error', error.message.includes('timeout') ? 'Request timed out. Try again.' : 'Failed to fetch scenes');
  } finally {
    setLoading(false);
  }
};


  const handleAnalyze = async () => {
    if (!selectedScene) return;

    try {
      const downloadResponse = await axios.post('/api/v1/landsat_download', {
        entityIds: [selectedScene.entityId],
        datasetName: 'landsat_ot_c2_l2'
      });

      const analysisResponse = await axios.post('/api/v1/detect_disease', {
        sceneId: selectedScene.entityId,
        generate_map: true
      });

      navigation.navigate('Results', {
        analysisResult: analysisResponse.data,
        sceneInfo: {
          displayId: selectedScene.entityId,
          date: new Date().toLocaleDateString(),
          thumbnail: selectedScene.thumbnailPath
        }
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Processing error', 'Try again later');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop Disease Detection</Text>

      {/* Region Picker */}
      <Text style={styles.label}>Region</Text>
      <Picker
  selectedValue={selectedRegion}
  onValueChange={setSelectedRegion}
  style={styles.input}
>
  <Picker.Item label="Select region" value="" />
  {regions.map(region => (
    <Picker.Item key={region} label={region} value={region} />
  ))}
</Picker>


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
        style={styles.button}
        onPress={fetchScenes}
        disabled={!selectedRegion}
      >
        <Text style={styles.buttonText}>Fetch Scenes</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#1a5f23" />}

      {/* Scene List */}
      <FlatList
        data={scenes}
        keyExtractor={(item) => item.entityId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.sceneCard,
              selectedScene?.entityId === item.entityId && styles.selectedScene
            ]}
            onPress={() => setSelectedScene(item)}
          >
            <Image
              source={{ uri: item.thumbnailPath }}
              style={{ height: 100, borderRadius: 5 }}
              resizeMode="cover"
            />
            <Text>ID: {item.entityId}</Text>
            <Text>Date: {new Date(item.acquisitionDate).toLocaleDateString()}</Text>
            <Text>Cloud Cover: {item.cloudCover}%</Text>
          </TouchableOpacity>
        )}
        style={{ marginVertical: 20 }}
      />

      {selectedScene && (
        <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
          <Text style={styles.analyzeText}>Analyze</Text>
        </TouchableOpacity>
      )}
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
    padding: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2e8b57',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sceneCard: {
    backgroundColor: '#e9f6ef',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedScene: {
    borderWidth: 2,
    borderColor: '#1a5f23',
  },
  analyzeButton: {
    backgroundColor: '#1a5f23',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  analyzeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
