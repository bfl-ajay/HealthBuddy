import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import BloodPressureScreen from '../components/BloodPressureScreen';

export default function BloodPressure() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <BloodPressureScreen />;
}
