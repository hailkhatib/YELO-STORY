import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addVoiceElevenLabs } from '../../src/api/voiceEngine';
import { AppContext } from '../../src/context/AppContext';

const TRANSLATIONS = {
  'Français': {
    title: "Clonage Vocal",
    providerError: "Le clonage vocal n'est disponible qu'avec le fournisseur ElevenLabs. Actuellement, vous utilisez",
    yourVoices: "Vos voix clonées :",
    oldVoice: "Ma Voix (Ancienne)",
    instruction: "Pour un nouveau clone parfait, enregistrez-vous en train de lire un texte clairement pendant environ 30 à 60 secondes.",
    micDenied: "Permission micro refusée",
    nameRequired: "Veuillez donner un nom à cette voix.",
    success: "Voix clonée avec succès !",
    cloneError: "Erreur de clonage: ",
    recordingDone: "Enregistrement terminé !",
    namePlaceholder: "Nom de cette voix (ex: Papa, Maman...)",
    cloneBtn: "Cloner cette voix",
    restartBtn: "Recommencer l'enregistrement",
    recordingNow: "Enregistrement en cours..."
  },
  'Anglais': {
    title: "Voice Cloning",
    providerError: "Voice cloning is only available with ElevenLabs. Currently using",
    yourVoices: "Your cloned voices:",
    oldVoice: "My Voice (Old)",
    instruction: "For a perfect new clone, record yourself reading a text clearly for about 30 to 60 seconds.",
    micDenied: "Microphone permission denied",
    nameRequired: "Please give a name to this voice.",
    success: "Voice cloned successfully!",
    cloneError: "Cloning error: ",
    recordingDone: "Recording finished!",
    namePlaceholder: "Voice name (e.g. Dad, Mom...)",
    cloneBtn: "Clone this voice",
    restartBtn: "Restart recording",
    recordingNow: "Recording in progress..."
  },
  'Espagnol': {
    title: "Clonación de Voz",
    providerError: "La clonación de voz solo está disponible con ElevenLabs. Actualmente usas",
    yourVoices: "Tus voces clonadas:",
    oldVoice: "Mi Voz (Antigua)",
    instruction: "Para un nuevo clon perfecto, grábate leyendo un texto claramente durante unos 30 a 60 segundos.",
    micDenied: "Permiso de micrófono denegado",
    nameRequired: "Por favor, dale un nombre a esta voz.",
    success: "¡Voz clonada con éxito!",
    cloneError: "Error de clonación: ",
    recordingDone: "¡Grabación terminada!",
    namePlaceholder: "Nombre de la voz (ej: Papá, Mamá...)",
    cloneBtn: "Clonar esta voz",
    restartBtn: "Reiniciar grabación",
    recordingNow: "Grabación en curso..."
  }
};

export default function VoiceScreen() {
  const { voiceProvider, apiKeys, language, isLoaded } = useContext(AppContext);
  
  const t = (isLoaded && TRANSLATIONS[language]) ? TRANSLATIONS[language] : TRANSLATIONS['Français'];
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clonedVoices, setClonedVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');

  useEffect(() => {
    checkExistingClones();
  }, []);

  const checkExistingClones = async () => {
    const data = await AsyncStorage.getItem('yelo_cloned_voices');
    if (data) {
      setClonedVoices(JSON.parse(data));
    } else {
      // Migration from old single ID system
      const oldId = await AsyncStorage.getItem('yelo_cloned_voice_id');
      if (oldId) {
        const migrated = [{ id: oldId, name: t.oldVoice }];
        await AsyncStorage.setItem('yelo_cloned_voices', JSON.stringify(migrated));
        setClonedVoices(migrated);
        await AsyncStorage.removeItem('yelo_cloned_voice_id');
      }
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setAudioUri(null);
      } else {
        alert(t.micDenied);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const uploadVoice = async () => {
    if (!audioUri) return;
    if (!voiceName.trim()) {
      alert(t.nameRequired);
      return;
    }
    setIsUploading(true);
    try {
      const newVoiceId = await addVoiceElevenLabs(voiceName, audioUri, apiKeys);
      const newVoice = { id: newVoiceId, name: voiceName };
      const updatedVoices = [...clonedVoices, newVoice];
      
      await AsyncStorage.setItem('yelo_cloned_voices', JSON.stringify(updatedVoices));
      setClonedVoices(updatedVoices);
      setAudioUri(null);
      setVoiceName('');
      alert(t.success);
    } catch (e) {
      alert(t.cloneError + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVoice = async (idToDelete) => {
    const updated = clonedVoices.filter(v => v.id !== idToDelete);
    await AsyncStorage.setItem('yelo_cloned_voices', JSON.stringify(updated));
    setClonedVoices(updated);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center', paddingBottom: 40}}>
      <Text style={styles.title}>{t.title}</Text>
      
      {voiceProvider !== 'ElevenLabs' ? (
        <View style={styles.previewBox}>
           <Text style={[styles.text, {marginBottom: 0}]}>{t.providerError} {voiceProvider}.</Text>
        </View>
      ) : (
        <>
          {clonedVoices.length > 0 && (
        <View style={styles.voicesListContainer}>
          <Text style={styles.sectionTitle}>{t.yourVoices}</Text>
          {clonedVoices.map(v => (
            <View key={v.id} style={styles.voiceItem}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialIcons name="check-circle" size={24} color="#006877" style={{marginRight: 10}}/>
                <Text style={styles.voiceItemText}>{v.name}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteVoice(v.id)}>
                <MaterialIcons name="delete" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.text}>
        {t.instruction}
      </Text>
      
      {!audioUri ? (
        <TouchableOpacity 
          style={[styles.recordBtn, recording && styles.recordingActive]} 
          onPress={recording ? stopRecording : startRecording}
        >
          {recording ? <MaterialIcons name="stop" size={48} color="#fff" /> : <MaterialIcons name="mic" size={48} color="#fff" />}
        </TouchableOpacity>
      ) : (
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>{t.recordingDone}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.namePlaceholder}
            placeholderTextColor="#64748b"
            value={voiceName}
            onChangeText={setVoiceName}
          />
          <TouchableOpacity style={styles.uploadBtn} onPress={uploadVoice} disabled={isUploading}>
            {isUploading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.uploadBtnText}>{t.cloneBtn}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop: 15}} onPress={() => setAudioUri(null)}>
            <Text style={{color: '#6d797c', fontFamily: 'Montserrat_500Medium'}}>{t.restartBtn}</Text>
          </TouchableOpacity>
        </View>
      )}

      {recording && <Text style={styles.recordingText}>{t.recordingNow}</Text>}
      </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 30 },
  title: { color: '#0b1c30', fontSize: 24, fontFamily: 'Montserrat_700Bold', marginBottom: 15, marginTop: 20 },
  text: { color: '#6d797c', textAlign: 'center', lineHeight: 24, marginBottom: 40, fontSize: 16, fontFamily: 'Montserrat_500Medium' },
  voicesListContainer: { width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 15, marginBottom: 30, borderWidth: 1, borderColor: '#bcc9cc' },
  sectionTitle: { color: '#006877', fontFamily: 'Montserrat_700Bold', marginBottom: 10 },
  voiceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff4ff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#006877' },
  voiceItemText: { color: '#006877', fontFamily: 'Montserrat_700Bold', fontSize: 16 },
  recordBtn: { backgroundColor: '#006877', width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#38b6cd', alignSelf: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  recordingActive: { backgroundColor: '#ef4444', borderColor: '#fca5a5' },
  recordingText: { color: '#ef4444', marginTop: 20, fontFamily: 'Montserrat_700Bold', fontSize: 16, alignSelf: 'center' },
  previewBox: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#38b6cd' },
  previewText: { color: '#006877', fontFamily: 'Montserrat_700Bold', fontSize: 18, marginBottom: 15 },
  input: { backgroundColor: '#eff4ff', color: '#0b1c30', padding: 15, borderRadius: 12, width: '100%', marginBottom: 15, borderWidth: 0, fontFamily: 'Montserrat_500Medium' },
  uploadBtn: { backgroundColor: '#006877', padding: 15, borderRadius: 30, width: '100%', alignItems: 'center' },
  uploadBtnText: { color: '#ffffff', fontFamily: 'Montserrat_700Bold', fontSize: 16 }
});
