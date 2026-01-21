import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function BloodPressureScreen() {
  const router = useRouter();
  const { addBloodPressureReading, getBloodPressureReadings } = useAuth();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    const data = await getBloodPressureReadings();
    setReadings(data);
  };

  const handleAddReading = async () => {
    if (!systolic || !diastolic || !heartRate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const hr = parseInt(heartRate);

    if (sys < 40 || sys > 250 || dia < 30 || dia > 150 || hr < 30 || hr > 200) {
      Alert.alert('Error', 'Please enter valid readings');
      return;
    }

    try {
      await addBloodPressureReading({
        systolic: sys,
        diastolic: dia,
        heartRate: hr,
      });

      setSystolic('');
      setDiastolic('');
      setHeartRate
        'Success',
        'Blood pressure reading saved successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => loadReadings()
          },
          {
            text: 'Go to Dashboard',
            onPress: () => router.push('/home')
          }
        ]
      
      Alert.alert('Success', 'Reading added successfully!');
      loadReadings();
    } catch (error) {
      Alert.alert('Error', 'Failed to add reading');
    }
  };

  const getCategory = (sys, dia) => {
    if (sys < 120 && dia < 80) return { text: 'Normal', color: '#4CAF50' };
    if (sys < 130 && dia < 80) return { text: 'Elevated', color: '#FFC107' };
    if (sys < 140 || dia < 90) return { text: 'High BP Stage 1', color: '#FF9800' };
    if (sys < 180 || dia < 120) return { text: 'High BP Stage 2', color: '#F44336' };
    return { text: 'Hypertensive Crisis', color: '#D32F2F' };
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blood Pressure Tracker</Text>
        <Text style={styles.subtitle}>Monitor your blood pressure readings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.addCard}>
          <Text style={styles.cardTitle}>Add New Reading</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.label}>Systolic (SYS)</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.label}>Diastolic (DIA)</Text>
              <TextInput
                style={styles.input}
                placeholder="80"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Heart Rate (BPM)</Text>
            <TextInput
              style={styles.input}
              placeholder="72"
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddReading}>
            <Text style={styles.addButtonText}>Add Reading</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Reading History</Text>
          
          {readings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No readings yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first blood pressure reading above
              </Text>
            </View>
          ) : (
            readings.map((reading) => {
              const category = getCategory(reading.systolic, reading.diastolic);
              return (
                <View key={reading.id} style={styles.readingCard}>
                  <View style={styles.readingHeader}>
                    <View style={styles.readingValues}>
                      <Text style={styles.readingMainValue}>
                        {reading.systolic}/{reading.diastolic}
                      </Text>
                      <Text style={styles.readingLabel}>mmHg</Text>
                    </View>
                    <View style={styles.heartRateContainer}>
                      <Text style={styles.heartRateValue}>❤️ {reading.heartRate}</Text>
                      <Text style={styles.heartRateLabel}>BPM</Text>
                    </View>
                  </View>
                  
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: category.color },
                    ]}
                  >
                    <Text style={styles.categoryText}>{category.text}</Text>
                  </View>
                  
                  <Text style={styles.readingDate}>
                    {formatDate(reading.timestamp)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 30,
    paddingTop: Platform.OS === 'web' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  addCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputHalf: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  readingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  readingMainValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  readingLabel: {
    fontSize: 14,
    color: '#666',
  },
  heartRateContainer: {
    alignItems: 'center',
  },
  heartRateValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  heartRateLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  readingDate: {
    fontSize: 12,
    color: '#999',
  },
});
