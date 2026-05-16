import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { AppContext } from '../../src/context/AppContext';
import { generateStoryImage } from '../../src/api/textEngine';

const TRANSLATIONS = {
  'Français': {
    loading: "Chargement...",
    storyOf: "Histoire de",
    hero: "Héros :",
    genLoading: "Génération en cours...",
    regenImg: "Regénérer l'illustration",
    genImg: "Générer une illustration avec l'IA",
    imgError: "Erreur de génération d'image: "
  },
  'Anglais': {
    loading: "Loading...",
    storyOf: "Story of",
    hero: "Hero:",
    genLoading: "Generation in progress...",
    regenImg: "Regenerate illustration",
    genImg: "Generate illustration with AI",
    imgError: "Image generation error: "
  },
  'Espagnol': {
    loading: "Cargando...",
    storyOf: "Historia de",
    hero: "Héroe:",
    genLoading: "Generación en curso...",
    regenImg: "Regenerar ilustración",
    genImg: "Generar ilustración con IA",
    imgError: "Error de generación de imagen: "
  }
};

export default function StoryPlayerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [story, setStory] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const { language, textProvider, apiKeys, isLoaded } = useContext(AppContext);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const t = (isLoaded && TRANSLATIONS[language]) ? TRANSLATIONS[language] : TRANSLATIONS['Français'];

  useEffect(() => {
    loadStory();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [id]);

  const loadStory = async () => {
    try {
      const stored = await AsyncStorage.getItem('yelo_stories');
      if (stored) {
        const stories = JSON.parse(stored);
        const found = stories.find(s => s.id === id);
        setStory(found);
        setEditedTitle(found.title || `${t.storyOf} ${found.genre}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayPause = async () => {
    if (!story || !story.audioUri) return;

    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: story.audioUri },
        { shouldPlay: true, isLooping: false }
      );
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 1);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            await newSound.stopAsync();
          }
        }
      });
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleReplay = async () => {
    if (sound) {
      await sound.setPositionAsync(0);
      if (!isPlaying) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const handleBack = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    router.back();
  };

  const handleGenerateImage = async () => {
    if (!story) return;
    setIsGeneratingImage(true);
    try {
      const coverUrl = await generateStoryImage(story.summary, textProvider, apiKeys);
      const stored = await AsyncStorage.getItem('yelo_stories');
      if (stored) {
        const stories = JSON.parse(stored);
        const index = stories.findIndex(s => s.id === story.id);
        if (index !== -1) {
          stories[index].coverImage = coverUrl;
          await AsyncStorage.setItem('yelo_stories', JSON.stringify(stories));
          setStory({...stories[index]});
        }
      }
    } catch (e) {
      console.error("Image generation error:", e);
      alert(t.imgError + e.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!story) return;
    try {
      const stored = await AsyncStorage.getItem('yelo_stories');
      if (stored) {
        const stories = JSON.parse(stored);
        const index = stories.findIndex(s => s.id === story.id);
        if (index !== -1) {
          stories[index].title = editedTitle;
          await AsyncStorage.setItem('yelo_stories', JSON.stringify(stories));
          setStory(stories[index]);
          setIsEditingTitle(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!story) return <View style={styles.container}><Text style={styles.text}>{t.loading}</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" color="#0b1c30" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{story.title || `${t.storyOf} ${story.genre}`}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          {story.coverImage && (
            <View style={styles.coverSmallWrap}>
              <Image source={{uri: story.coverImage}} style={styles.coverSmall} />
            </View>
          )}
          <View style={styles.infoTextContainer}>
            {isEditingTitle ? (
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                <TextInput 
                  style={[styles.title, {flex: 1, backgroundColor: '#eff4ff', padding: 5, borderRadius: 8, color: '#006877', borderWidth: 1, borderColor: '#38b6cd', marginBottom: 0, fontSize: 16}]}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveTitle} style={{marginLeft: 10, padding: 5, backgroundColor: '#006877', borderRadius: 20}}>
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
                <Text style={[styles.title, {marginBottom: 0, flex: 1}]} numberOfLines={2}>{story.title || `${t.storyOf} ${story.genre}`}</Text>
                <TouchableOpacity onPress={() => setIsEditingTitle(true)} style={{marginLeft: 5, padding: 5}}>
                  <MaterialIcons name="edit" size={20} color="#6d797c" />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.tags}>{story.age} • {story.tone}</Text>
            {story.heroName ? <Text style={styles.heroText}>{t.hero} {story.heroName}</Text> : null}
          </View>
        </View>

        <TouchableOpacity style={styles.generateImgBtn} onPress={handleGenerateImage} disabled={isGeneratingImage}>
          {isGeneratingImage ? (
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <ActivityIndicator color="#006877" />
               <Text style={[styles.generateImgBtnText, {marginLeft: 10}]}>{t.genLoading}</Text>
             </View>
          ) : (
            <>
              <MaterialIcons name={story.coverImage ? "refresh" : "image"} size={20} color="#006877" style={{marginRight: 8}} />
              <Text style={styles.generateImgBtnText}>
                {story.coverImage ? t.regenImg : t.genImg}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <ScrollView style={styles.summaryContainer}>
          <Text style={styles.summaryText}>{story.summary}</Text>
          {story.fullText ? <Text style={[styles.summaryText, {marginTop: 20, color: '#6d797c'}]}>{story.fullText}</Text> : null}
        </ScrollView>

        <View style={styles.playerSection}>
          <View style={styles.sliderContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#38b6cd"
              maximumTrackTintColor="#dbe4e5"
              thumbTintColor="#006877"
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleReplay}>
              <MaterialIcons name="replay" color="#6d797c" size={32} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mainPlayBtn} onPress={handlePlayPause}>
              {isPlaying ? <MaterialIcons name="pause" color="#ffffff" size={36} /> : <MaterialIcons name="play-arrow" color="#ffffff" size={36} />}
            </TouchableOpacity>
            <View style={{ width: 50 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#dbe4e5' },
  backBtn: { padding: 5, marginRight: 10 },
  headerTitle: { color: '#0b1c30', fontSize: 18, fontFamily: 'Montserrat_700Bold', flex: 1 },
  content: { flex: 1, padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  coverSmallWrap: { marginRight: 15 },
  coverSmall: { width: 80, height: 80, backgroundColor: '#eaf1ff', borderRadius: 15, resizeMode: 'cover', borderWidth: 1, borderColor: '#dbe4e5' },
  infoTextContainer: { flex: 1 },
  generateImgBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaf1ff', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#38b6cd' },
  generateImgBtnText: { color: '#006877', fontFamily: 'Montserrat_700Bold', fontSize: 14 },
  title: { color: '#0b1c30', fontSize: 20, fontFamily: 'Montserrat_700Bold', marginBottom: 5 },
  tags: { color: '#38b6cd', fontFamily: 'Montserrat_700Bold', fontSize: 13, marginBottom: 2 },
  heroText: { color: '#6d797c', fontSize: 13, fontFamily: 'Montserrat_500Medium' },
  summaryContainer: { flex: 1, width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#bcc9cc', shadowColor: '#38b6cd', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  summaryText: { color: '#3d494c', lineHeight: 24, fontSize: 16, fontFamily: 'Montserrat_500Medium' },
  playerSection: { paddingVertical: 10 },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  slider: { flex: 1, height: 40, marginHorizontal: 10 },
  timeText: { color: '#6d797c', fontSize: 12, width: 40, textAlign: 'center', fontFamily: 'Montserrat_600SemiBold' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, marginBottom: 20 },
  iconBtn: { padding: 10 },
  mainPlayBtn: { backgroundColor: '#006877', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  text: { color: '#0b1c30', fontFamily: 'Montserrat_500Medium' }
});
