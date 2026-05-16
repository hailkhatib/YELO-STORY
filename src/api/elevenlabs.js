import * as FileSystem from 'expo-file-system/legacy';

// Clé API à remplacer pour ElevenLabs
export const ELEVENLABS_API_KEY = 'sk_778e11c416549c7103311b6c54b2f78c523187faff3f5d8d';

export const VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Grave, Narration', image: '👨' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Intense, Aventure', image: '👱‍♂️' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Doux, Enfants', image: '🧑' },
  // L'utilisateur pourra ajouter l'ID de sa voix clonée ici plus tard
  { id: 'CUSTOM_CLONED_VOICE_ID', name: 'Ma Voix', description: 'Voix Clonée', image: '🎙️' }
];

export const generateSpeech = async (text, voiceId) => {
  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Ce modèle gère très bien le Français
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erreur ElevenLabs: ${errText}`);
    }

    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Extraire uniquement les données base64
          const base64Data = reader.result.split(',')[1];
          // Générer un nom de fichier unique
          const fileUri = `${FileSystem.documentDirectory}story_${Date.now()}.mp3`;
          
          // Sauvegarder localement
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: 'base64',
          });
          resolve(fileUri);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error("Erreur de synthèse vocale:", error);
    throw error;
  }
};

export const addVoice = async (name, audioUri) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    // Dans React Native, pour envoyer un fichier, on passe un objet avec uri, name et type
    formData.append('files', {
      uri: audioUri,
      name: 'voice_sample.m4a',
      type: 'audio/m4a'
    });

    const url = 'https://api.elevenlabs.io/v1/voices/add';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Accept': 'application/json',
        // Ne pas forcer le Content-Type, fetch s'en charge avec le bon boundary pour FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erreur ElevenLabs Voice Add: ${errText}`);
    }

    const data = await response.json();
    return data.voice_id; // Retourne l'ID unique du clone
  } catch (error) {
    console.error("Erreur ajout de voix:", error);
    throw error;
  }
};
