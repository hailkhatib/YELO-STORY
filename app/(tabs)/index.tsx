import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { AppContext } from '../../src/context/AppContext';
import { useContext } from 'react';

const TRANSLATIONS = {
  'Français': {
    empty: "Aucune histoire pour le moment.",
    emptySub: "Allez dans l'onglet Créer pour inventer votre première histoire !",
    newStory: "Nouvelle histoire",
    read: "Lire"
  },
  'Anglais': {
    empty: "No stories yet.",
    emptySub: "Go to the Create tab to invent your first story!",
    newStory: "New story",
    read: "Read"
  },
  'Espagnol': {
    empty: "No hay historias todavía.",
    emptySub: "¡Ve a la pestaña Crear para inventar tu primera historia!",
    newStory: "Nueva historia",
    read: "Leer"
  }
};

export default function LibraryScreen() {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const isFocused = useIsFocused();
  const { language, isLoaded } = useContext(AppContext);

  const t = (isLoaded && TRANSLATIONS[language]) ? TRANSLATIONS[language] : TRANSLATIONS['Français'];

  useEffect(() => {
    if (isFocused) {
      loadStories();
    }
  }, [isFocused]);

  const loadStories = async () => {
    try {
      const stored = await AsyncStorage.getItem('yelo_stories');
      if (stored) setStories(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {stories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.empty}</Text>
          <Text style={styles.emptySub}>{t.emptySub}</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.imagePlaceholder}>
                {item.coverImage ? (
                  <Image 
                    source={{uri: item.coverImage}} 
                    style={{width: '100%', height: '100%', resizeMode: 'cover'}} 
                  />
                ) : (
                  <MaterialIcons name="auto-stories" size={40} color="#38b6cd" />
                )}
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title || (item.summary ? item.summary.substring(0, 50) + '...' : t.newStory)}</Text>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>3 min</Text>
                  </View>
                </View>
                <Text style={styles.cardTags}>{item.genre} • {item.tone} • {item.age}</Text>
                <TouchableOpacity style={styles.readBtn} onPress={() => router.push(`/story/${item.id}`)}>
                  <Text style={styles.readBtnText}>{t.read}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#0b1c30', fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  emptySub: { color: '#6d797c', textAlign: 'center', marginTop: 10, fontFamily: 'Montserrat_500Medium' },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    flexDirection: 'column', 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#bcc9cc',
    shadowColor: '#38b6cd',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden'
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#eaf1ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardContent: {
    padding: 15
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  cardTitle: { color: '#0b1c30', fontSize: 16, fontFamily: 'Montserrat_700Bold', lineHeight: 22, flex: 1, marginRight: 10 },
  durationBadge: {
    backgroundColor: '#eaf1ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  durationText: { color: '#6d797c', fontSize: 12, fontFamily: 'Montserrat_600SemiBold' },
  cardTags: { color: '#38b6cd', fontSize: 12, fontFamily: 'Montserrat_700Bold', marginBottom: 15 },
  readBtn: {
    backgroundColor: '#38b6cd',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end'
  },
  readBtnText: {
    color: '#ffffff',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14
  }
});
