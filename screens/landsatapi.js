import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://172.20.10.3:8000';
const REGIONS = [
  { name: "Yaoundé", label: "Centre (Yaoundé)", lat: 3.9, lon: 11.5 },
  { name: "Douala", label: "Littoral (Douala)", lat: 4.05, lon: 9.7 },
  { name: "Bamenda", label: "Northwest (Bamenda)", lat: 6.3, lon: 10.2 },
  { name: "Bafoussam", label: "West (Bafoussam)", lat: 5.5, lon: 10.4 },
  { name: "Garoua", label: "North (Garoua)", lat: 9.3, lon: 13.4 },
  { name: "Maroua", label: "Far North (Maroua)", lat: 12.2, lon: 14.0 },
  { name: "Bertoua", label: "East (Bertoua)", lat: 4.3, lon: 14.7 },
  { name: "Ebolowa", label: "South (Ebolowa)", lat: 2.8, lon: 11.1 },
  { name: "Ngaoundéré", label: "Adamawa (Ngaoundéré)", lat: 7.3, lon: 13.6 },
  { name: "Kumba", label: "Southwest (Kumba)", lat: 4.0, lon: 9.4 },
];


export default function UploadScreen() {
  const [region, setRegion] = useState(REGIONS[0]);
  const [date, setDate] = useState(new Date());
  const [cloudCover, setCloudCover] = useState(20);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scenes, setScenes] = useState([]);

  const fetchScenes = async () => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      const url = `${API_BASE_URL}/api/landsat_scenes?region=${encodeURIComponent(region.name)}&date=${dateStr}&max_cloud=${cloudCover}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.scenes)) {
        setScenes(data.scenes);
      } else {
        Alert.alert("No scenes", "No scenes found for selected parameters");
        setScenes([]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch satellite scenes");
    } finally {
      setLoading(false);
    }
  };

  const downloadScene = async (sceneId) => {
    try {
      const zipUrl = `${API_BASE_URL}/api/landsat_download/${sceneId}`;
      const fileUri = `${FileSystem.documentDirectory}${sceneId}.zip`;
      const downloaded = await FileSystem.downloadAsync(zipUrl, fileUri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloaded.uri);
      } else {
        Alert.alert("Downloaded", "Saved to device");
      }
    } catch (err) {
      Alert.alert("Download Failed", "Could not download scene");
    }
  };

  useEffect(() => {
    fetchScenes();
  }, [region, date, cloudCover]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cameroon Landsat Explorer</Text>

      <Text style={styles.label}>{r.label}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
        {REGIONS.map(r => (
          <TouchableOpacity
            key={r.name}
            onPress={() => setRegion(r)}
            style={[styles.regionBtn, region.name === r.name && styles.regionActive]}
          >
            <Text style={[styles.regionText, region.name === r.name && styles.regionTextActive]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Select Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" onChange={(e, d) => {
          setShowDatePicker(false);
          if (d) setDate(d);
        }} />
      )}

      <Text style={styles.label}>Max Cloud Cover: {cloudCover}%</Text>
      <Slider value={cloudCover} onValueChange={setCloudCover} minimumValue={0} maximumValue={100} step={5} />

      {loading ? <ActivityIndicator size="large" color="green" /> : (
        scenes.map(scene => (
          <View key={scene.id} style={styles.sceneCard}>
            <Image source={{ uri: scene.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.sceneText}>{scene.date} - {scene.cloud_cover}% clouds</Text>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => downloadScene(scene.id)}>
              <Text style={styles.downloadText}>⬇ Download ZIP</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    marginVertical: 8
  },
  regionScroll: {
    flexDirection: 'row',
    marginBottom: 10
  },
  regionBtn: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    marginRight: 8
  },
  regionActive: {
    backgroundColor: '#007a5e'
  },
  regionText: {
    color: '#333'
  },
  regionTextActive: {
    color: '#fff'
  },
  dateBtn: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  sceneCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    elevation: 2
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 4
  },
  sceneText: {
    marginTop: 8,
    fontSize: 14
  },
  downloadBtn: {
    marginTop: 10,
    backgroundColor: '#007a5e',
    padding: 10,
    borderRadius: 6
  },
  downloadText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  }
});
