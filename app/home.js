import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../components/HomeScreen';

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <HomeScreen />;
}
