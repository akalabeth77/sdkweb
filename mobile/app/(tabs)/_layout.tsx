import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/lib/auth-context';

function Icon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdminOrEditor = user?.role === 'admin' || user?.role === 'editor';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a1a2e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e8e8e8' },
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Eventy', tabBarIcon: () => <Icon emoji="📅" /> }}
      />
      <Tabs.Screen
        name="articles"
        options={{ title: 'Články', tabBarIcon: () => <Icon emoji="📰" /> }}
      />
      <Tabs.Screen
        name="gallery"
        options={{ title: 'Galéria', tabBarIcon: () => <Icon emoji="🖼️" /> }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdminOrEditor ? undefined : null,
          tabBarIcon: () => <Icon emoji="⚙️" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: () => <Icon emoji="👤" /> }}
      />
    </Tabs>
  );
}
