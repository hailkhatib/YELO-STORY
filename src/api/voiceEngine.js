import * as FileSystem from 'expo-file-system/legacy';

export const OPENAI_VOICES = [
  { id: 'onyx', name: 'Onyx', description: 'Grave et sérieuse', image: '👨' },
  { id: 'echo', name: 'Echo', description: 'Douce et posée', image: '👱‍♂️' },
  { id: 'nova', name: 'Nova', description: 'Énergique et chaleureuse', image: '👩' },
  { id: 'shimmer', name: 'Shimmer', description: 'Claire et articulée', image: '👱‍♀️' }
];

export const ELEVENLABS_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Grave, Narration', image: '👨' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Intense, Aventure', image: '👱‍♂️' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calme, Documentaire', image: '👩' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Douce, Chaleureuse', image: '👱‍♀️' }
];

export const getBaseVoices = (provider) => {
  if (provider === 'OpenAI') return OPENAI_VOICES;
  return ELEVENLABS_VOICES;
};

export const getRemoteVoices = async (provider, keys) => {
  if (provider === 'ElevenLabs' && keys?.elevenlabs) {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': keys.elevenlabs }
      });
      if (res.ok) {
        const data = await res.json();
        // Keep only custom cloned or generated voices (category !== 'premade')
        const customVoices = data.voices.filter(v => v.category !== 'premade');
        return customVoices.map(v => ({
          id: v.voice_id,
          name: v.name,
          description: 'Bibliothèque Web',
          image: '☁️',
          isCustom: true
        }));
      }
    } catch (e) {
      console.warn("Erreur chargement voix distantes", e);
    }
  }
  return [];
};

const saveAudioResponse = async (response) => {
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const fileUri = `${FileSystem.documentDirectory}story_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: 'base64' });
        resolve(fileUri);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateSpeech = async (text, voiceId, provider, keys) => {
  if (provider === 'OpenAI') {
    if (!keys.openai) throw new Error("Clé API OpenAI manquante. Veuillez configurer dans Paramètres.");
    const url = 'https://api.openai.com/v1/audio/speech';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keys.openai}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceId
      })
    });
    
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`Erreur OpenAI TTS: ${err}`);
    }
    return saveAudioResponse(response);
  }
  
  if (provider === 'ElevenLabs') {
    if (!keys.elevenlabs) throw new Error("Clé API ElevenLabs manquante. Veuillez configurer dans Paramètres.");
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': keys.elevenlabs,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`Erreur ElevenLabs: ${err}`);
    }
    return saveAudioResponse(response);
  }

  throw new Error("Fournisseur voix inconnu.");
};

export const addVoiceElevenLabs = async (name, audioUri, keys) => {
  if (!keys.elevenlabs) throw new Error("Clé API ElevenLabs manquante.");
  const formData = new FormData();
  formData.append('name', name);
  formData.append('files', {
    uri: audioUri,
    name: 'voice_sample.m4a',
    type: 'audio/m4a'
  });

  const url = 'https://api.elevenlabs.io/v1/voices/add';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': keys.elevenlabs, 'Accept': 'application/json' },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erreur ElevenLabs Voice Add: ${errText}`);
  }
  const data = await response.json();
  return data.voice_id;
};
