import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { AppContext } from '../../src/context/AppContext';
import { Image, View } from 'react-native';

const TAB_TITLES = {
  'Français': { lib: 'Bibliothèque', create: 'Créer', voice: 'Ma Voix', settings: 'Paramètres' },
  'Anglais': { lib: 'Library', create: 'Create', voice: 'My Voice', settings: 'Settings' },
  'Espagnol': { lib: 'Biblioteca', create: 'Crear', voice: 'Mi Voz', settings: 'Ajustes' }
};

export default function TabLayout() {
  const { language, isLoaded } = useContext(AppContext);
  const t = (isLoaded && TAB_TITLES[language]) ? TAB_TITLES[language] : TAB_TITLES['Français'];

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#38b6cd', 
      tabBarInactiveTintColor: '#6d797c',
      tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#dbe4e5', paddingBottom: 5, height: 60 },
      headerStyle: { backgroundColor: '#f8f9ff', shadowOpacity: 0, elevation: 0, borderBottomWidth: 0 },
      headerTitle: () => (
        <Image source={require('../../assets/logo-yelo-story.png')} style={{height: 35, resizeMode: 'contain', marginLeft: 10}} />
      ),
      tabBarLabelStyle: { fontFamily: 'Montserrat_600SemiBold', fontSize: 10 }
    }}>
      <Tabs.Screen
        name="index"
        options={{ title: t.lib, tabBarIcon: ({ color }) => <MaterialIcons name="menu-book" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: t.create, tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="voice"
        options={{ title: t.voice, tabBarIcon: ({ color }) => <MaterialIcons name="mic" size={26} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t.settings, tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={26} color={color} /> }}
      />
    </Tabs>
  );
}
