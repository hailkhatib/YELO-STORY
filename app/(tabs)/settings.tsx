import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../src/context/AppContext';

const LANGUAGES = [
  { id: 'Français', flag: '🇫🇷' },
  { id: 'Anglais', flag: '🇬🇧' },
  { id: 'Espagnol', flag: '🇪🇸' }
];

const TEXT_PROVIDERS = ['Gemini', 'OpenAI', 'Anthropic', 'Mistral'];
const VOICE_PROVIDERS = ['ElevenLabs', 'OpenAI'];

const T = {
  'Français': {
    title: 'Paramètres', langTitle: 'Langue Globale', textTitle: 'Scénario (Texte)', voiceTitle: 'Voix & Narration',
    saveBtn: 'Sauvegarder mes clés API', getKey: 'Obtenir une clé',
    openaiVoiceNote: "Utilise la clé OpenAI définie ci-dessus. (Attention : le clonage de voix n'est pas supporté par l'API publique OpenAI)."
  },
  'Anglais': {
    title: 'Settings', langTitle: 'Global Language', textTitle: 'Story (Text)', voiceTitle: 'Voice & Narration',
    saveBtn: 'Save my API keys', getKey: 'Get an API key',
    openaiVoiceNote: "Uses the OpenAI key defined above. (Note: voice cloning is not supported by the public OpenAI API)."
  },
  'Espagnol': {
    title: 'Ajustes', langTitle: 'Idioma Global', textTitle: 'Historia (Texto)', voiceTitle: 'Voz y Narración',
    saveBtn: 'Guardar mis claves API', getKey: 'Obtener una clave',
    openaiVoiceNote: "Usa la clave de OpenAI definida arriba. (Nota: la clonación de voz no es compatible con la API pública de OpenAI)."
  }
};

export default function SettingsScreen() {
  const { 
    language, saveLanguage, 
    textProvider, saveTextProvider, 
    voiceProvider, saveVoiceProvider, 
    apiKeys, saveApiKeys, 
    isLoaded 
  } = useContext(AppContext);

  const [localKeys, setLocalKeys] = useState(apiKeys);

  useEffect(() => {
    setLocalKeys(apiKeys);
  }, [apiKeys]);

  const updateKey = (providerKey, val) => {
    setLocalKeys({ ...localKeys, [providerKey]: val });
  };

  const handleSaveKeys = () => {
    saveApiKeys(localKeys);
    Alert.alert("Succès", language === 'Français' ? "Vos clés API ont bien été sauvegardées." : "API keys saved successfully.");
  };

  if (!isLoaded) return <View style={styles.container}><Text style={styles.text}>...</Text></View>;

  const t = T[language] || T['Français'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }}>
      <Text style={styles.pageTitle}>{t.title}</Text>

      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.langTitle}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 15}}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity 
              key={lang.id} 
              onPress={() => saveLanguage(lang.id)}
              style={{
                opacity: language === lang.id ? 1 : 0.4,
                transform: [{scale: language === lang.id ? 1.2 : 1}]
              }}
            >
              <Text style={{fontSize: 28}}>{lang.flag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.textTitle}</Text>
        </View>
        <View style={styles.pillRow}>
          {TEXT_PROVIDERS.map(p => (
            <TouchableOpacity 
              key={p} 
              style={[styles.pill, textProvider === p && styles.pillActive]}
              onPress={() => saveTextProvider(p)}
            >
              <Text style={[styles.pillText, textProvider === p && styles.pillTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {textProvider === 'Gemini' && (
          <View>
            <TextInput style={styles.input} placeholder="API Key Gemini" placeholderTextColor="#64748b" secureTextEntry value={localKeys.gemini} onChangeText={v => updateKey('gemini', v)} />
            <TouchableOpacity onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}><Text style={styles.linkText}>{t.getKey} Gemini ↗</Text></TouchableOpacity>
          </View>
        )}
        {textProvider === 'OpenAI' && (
          <View>
            <TextInput style={styles.input} placeholder="API Key OpenAI" placeholderTextColor="#64748b" secureTextEntry value={localKeys.openai} onChangeText={v => updateKey('openai', v)} />
            <TouchableOpacity onPress={() => Linking.openURL('https://platform.openai.com/api-keys')}><Text style={styles.linkText}>{t.getKey} OpenAI ↗</Text></TouchableOpacity>
          </View>
        )}
        {textProvider === 'Anthropic' && (
          <View>
            <TextInput style={styles.input} placeholder="API Key Anthropic" placeholderTextColor="#64748b" secureTextEntry value={localKeys.anthropic} onChangeText={v => updateKey('anthropic', v)} />
            <TouchableOpacity onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys')}><Text style={styles.linkText}>{t.getKey} Anthropic ↗</Text></TouchableOpacity>
          </View>
        )}
        {textProvider === 'Mistral' && (
          <View>
            <TextInput style={styles.input} placeholder="API Key Mistral" placeholderTextColor="#64748b" secureTextEntry value={localKeys.mistral} onChangeText={v => updateKey('mistral', v)} />
            <TouchableOpacity onPress={() => Linking.openURL('https://console.mistral.ai/api-keys/')}><Text style={styles.linkText}>{t.getKey} Mistral ↗</Text></TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.voiceTitle}</Text>
        </View>
        <View style={styles.pillRow}>
          {VOICE_PROVIDERS.map(p => (
            <TouchableOpacity 
              key={p} 
              style={[styles.pill, voiceProvider === p && styles.pillActive]}
              onPress={() => saveVoiceProvider(p)}
            >
              <Text style={[styles.pillText, voiceProvider === p && styles.pillTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {voiceProvider === 'ElevenLabs' && (
          <View>
            <TextInput style={styles.input} placeholder="API Key ElevenLabs" placeholderTextColor="#64748b" secureTextEntry value={localKeys.elevenlabs} onChangeText={v => updateKey('elevenlabs', v)} />
            <TouchableOpacity onPress={() => Linking.openURL('https://elevenlabs.io/app/speech-synthesis')}><Text style={styles.linkText}>{t.getKey} ElevenLabs ↗</Text></TouchableOpacity>
          </View>
        )}
        {voiceProvider === 'OpenAI' && (
           <Text style={styles.infoText}>{t.openaiVoiceNote}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveKeys}>
        <Text style={styles.saveBtnText}>{t.saveBtn}</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 20 },
  pageTitle: { color: '#0b1c30', fontSize: 28, fontFamily: 'Montserrat_700Bold', marginBottom: 25 },
  section: { marginBottom: 25 },
  sectionTitle: { color: '#0b1c30', fontSize: 16, fontFamily: 'Montserrat_700Bold' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  pill: { backgroundColor: '#ffffff', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 30, borderWidth: 1, borderColor: '#bcc9cc' },
  pillActive: { backgroundColor: '#006877', borderColor: '#006877' },
  pillText: { color: '#3d494c', fontFamily: 'Montserrat_600SemiBold' },
  pillTextActive: { color: '#ffffff' },
  input: { backgroundColor: '#eff4ff', color: '#0b1c30', padding: 15, borderRadius: 12, borderWidth: 0, fontFamily: 'Montserrat_500Medium' },
  text: { color: '#0b1c30' },
  infoText: { color: '#6d797c', fontStyle: 'italic', fontSize: 13, lineHeight: 20, fontFamily: 'Montserrat_500Medium' },
  saveBtn: { backgroundColor: '#006877', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#ffffff', fontFamily: 'Montserrat_700Bold', fontSize: 16 },
  linkText: { color: '#38b6cd', fontSize: 14, marginTop: 8, textDecorationLine: 'underline', alignSelf: 'flex-end', fontFamily: 'Montserrat_600SemiBold' }
});
