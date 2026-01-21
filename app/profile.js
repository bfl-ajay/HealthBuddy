import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ProfileScreen from '../components/ProfileScreen';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <ProfileScreen />;
}
