import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

export default function HomeScreen() {
  const { user, getBloodPressureReadings } = useAuth();
  const router = useRouter();
  const [bpReadings, setBpReadings] = useState([]);
  const [bmi, setBmi] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user) {
      const readings = await getBloodPressureReadings();
      setBpReadings(readings);
      
      if (user.height && user.weight) {
        const heightInMeters = parseFloat(user.height) / 100;
        const weightInKg = parseFloat(user.weight);
        const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setBmi(bmiValue);
      }
    }
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { text: 'N/A', color: '#999' };
    if (bmi < 18.5) return { text: 'Underweight', color: '#FF9800' };
    if (bmi < 25) return { text: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { text: 'Overweight', color: '#FF9800' };
    return { text: 'Obese', color: '#F44336' };
  };

  const getLatestBP = () => {
    if (bpReadings.length === 0) return null;
    return bpReadings[0];
  };

  const getBPCategory = (sys, dia) => {
    if (!sys || !dia) return { text: 'N/A', color: '#999' };
    if (sys < 120 && dia < 80) return { text: 'Normal', color: '#4CAF50' };
    if (sys < 130 && dia < 80) return { text: 'Elevated', color: '#FFC107' };
    if (sys < 140 || dia < 90) return { text: 'High BP Stage 1', color: '#FF9800' };
    if (sys < 180 || dia < 120) return { text: 'High BP Stage 2', color: '#F44336' };
    return { text: 'Crisis', color: '#D32F2F' };
  };

  const getChartData = () => {
    if (bpReadings.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          { data: [120], color: () => '#FF6B6B', strokeWidth: 2 },
          { data: [80], color: () => '#4ECDC4', strokeWidth: 2 },
          { data: [70], color: () => '#FFD93D', strokeWidth: 2 }
        ]
      };
    }

    const last15 = bpReadings.slice(0, 15).reverse();
    return {
      labels: last15.map(r => {
        const date = new Date(r.timestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}/${day}\n${hours}:${minutes}`;
      }),
      datasets: [
        {
          data: last15.map(r => r.systolic),
          color: () => '#FF6B6B',
          strokeWidth: 2.5
        },
        {
          data: last15.map(r => r.diastolic),
          color: () => '#4ECDC4',
          strokeWidth: 2.5
        },
        {
          data: last15.map(r => r.heartRate),
          color: () => '#FFD93D',
          strokeWidth: 2.5
        }
      ],
      legend: ['Systolic (mmHg)', 'Diastolic (mmHg)', 'Heart Rate (BPM)']
    };
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return bpReadings.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(bpReadings.length / rowsPerPage);

  const bmiData = getBMICategory(bmi);
  const latestBP = getLatestBP();
  const bpCategory = latestBP ? getBPCategory(latestBP.systolic, latestBP.diastolic) : { text: 'N/A', color: '#999' };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>hi, {user?.name}</Text>
      </View>

      {/* Health Score Card */}
      <View style={styles.healthScoreCard}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{bmi || '--'}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreTitle}>Health Score</Text>
          <Text style={styles.scoreDescription}>
            BMI: {bmiData.text}
          </Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Widget Grid */}
      <View style={styles.widgetGrid}>
        {/* BP Widget */}
        <TouchableOpacity 
          style={styles.widgetCard}
          onPress={() => router.push('/blood-pressure')}
        >
          <Text style={styles.widgetIcon}>❤️</Text>
          <Text style={styles.widgetLabel}>Blood Pressure</Text>
          <Text style={styles.widgetValue}>
            {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
          </Text>
        </TouchableOpacity>

        {/* Heart Rate Widget */}
        <TouchableOpacity style={styles.widgetCard}>
          <Text style={styles.widgetIcon}>💓</Text>
          <Text style={styles.widgetLabel}>Heart rate</Text>
          <Text style={styles.widgetValue}>
            {latestBP ? `${latestBP.heartRate} bpm` : '-- bpm'}
          </Text>
        </TouchableOpacity>

        {/* BMI Widget */}
        <TouchableOpacity 
          style={styles.widgetCard}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.widgetIcon}>⚖️</Text>
          <Text style={styles.widgetLabel}>BMI</Text>
          <Text style={styles.widgetValue}>{bmi || '--'}</Text>
        </TouchableOpacity>

        {/* Readings Widget */}
        <TouchableOpacity style={styles.widgetCard}>
          <Text style={styles.widgetIcon}>📊</Text>
          <Text style={styles.widgetLabel}>Total Readings</Text>
          <Text style={styles.widgetValue}>{bpReadings.length}</Text>
        </TouchableOpacity>
      </View>

      {/* BP Trend Chart */}
      {bpReadings.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>� Activity Trend</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={getChartData()}
              width={Math.max(Dimensions.get('window').width - 60, bpReadings.length * 50)}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 195, 247, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#4FC3F7'
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#f0f0f0',
                  strokeWidth: 1,
                  opacity: 0.8
                }
              }}
              withVerticalLines={false}
              withHorizontalLines={true}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              bezier
              style={styles.chart}
            />
          </ScrollView>

          {/* Blood Pressure Data Table */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Blood Pressure History</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Date & Time</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>SYS</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>DIA</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>HR</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Status</Text>
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody}>
              {getPaginatedData().map((reading, index) => {
                const category = getBPCategory(reading.systolic, reading.diastolic);
                return (
                  <View key={index} style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                  ]}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {formatDateTime(reading.timestamp)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, color: '#FF6B6B' }]}>
                      {reading.systolic}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, color: '#4ECDC4' }]}>
                      {reading.diastolic}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, color: '#FFD93D' }]}>
                      {reading.heartRate}
                    </Text>
                    <View style={[styles.tableCell, { flex: 1.5 }]}>
                      <View style={[styles.statusBadge, { backgroundColor: category.color }]}>
                        <Text style={styles.statusBadgeText}>{category.text}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationButtonText}>‹ Prev</Text>
                </TouchableOpacity>

                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <Text style={styles.paginationSubtext}>
                    {bpReadings.length} total records
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.paginationButtonText}>Next ›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Bottom Navigation Spacer */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 50,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '400',
    color: '#666',
  },
  healthScoreCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    borderWidth: 6,
    borderColor: '#66BB6A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    fontSize: 13,
    color: '#4FC3F7',
    fontWeight: '500',
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  widgetCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  widgetIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  widgetLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  widgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tableContainer: {
    marginTop: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  tableHeaderText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA',
  },
  tableRowOdd: {
    backgroundColor: '#fff',
  },
  tableCell: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paginationButton: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
  },
  paginationButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationSubtext: {
    color: '#999',
    fontSize: 11,
    marginTop: 2,
  },
});
