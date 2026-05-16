import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Switch, ImageBackground, Image } from 'react-native';
import { useState, useContext } from 'react';
import { getBaseVoices, getRemoteVoices, generateSpeech } from '../../src/api/voiceEngine';
import { generateStorySummary, generateFullStory, generateStoryImage } from '../../src/api/textEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { AppContext } from '../../src/context/AppContext';
import { MaterialIcons } from '@expo/vector-icons';

const LANGUAGES = [
  { id: 'Français', flag: '🇫🇷' },
  { id: 'Anglais', flag: '🇬🇧' },
  { id: 'Espagnol', flag: '🇪🇸' }
];

const TRANSLATIONS = {
  'Français': {
    ages: ['Enfants (3-7 ans)', 'Enfants (8-12 ans)', 'Adolescents', 'Adultes'],
    genres: ['Aventure', 'Romance', 'Comédie', 'Horreur', 'Sci-Fi', 'Mystère'],
    tones: ['Suspense', 'Douceur', 'Tension', 'Humour', 'Action'],
    durations: ['2 min', '5 min', '10 min', '20 min'],
    forWho: "Pour qui ?",
    style: "Quel style ?",
    ambiance: "Quelle ambiance ?",
    durationLabel: "Durée (environ)",
    titleLabel: "Titre de l'histoire (optionnel)",
    titlePlaceholder: "ex: Le mystère de la forêt",
    heroLabel: "Nom du héros (optionnel)",
    heroPlaceholder: "ex: Léo",
    keywordsLabel: "Mots-clés (optionnel, max 3)",
    keywordsPlaceholder: "ex: Pirate, princesse, bateau...",
    warning: "Veuillez utiliser des mots appropriés.",
    voiceLabel: "Quelle voix ?",
    genSummary: "Générer le synopsis de l'histoire",
    startLike: "Votre histoire commencera ainsi :",
    genAudio: "Valider et générer l'audio 🎙️",
    restart: "Recommencer",
    customVoiceDesc: "Clone IA",
    voiceLabels: {
      'pNInz6obpgDQGcFmaJgB': { name: 'Adam', desc: 'Grave, Narration', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1McuUM9ZJbhQmmVjaIaaiAIRwjngOTW1wSDToD9divzI3PaFnVZj0ZQfSdwHAI8GtfQfGOu8_0w3UCbpS-3pcTqQ_YALR_bLVeUSzppjeZbj_W-3qxfxvKfSg0JpWBhEzQjwL2xKCsyF-sm3PbX1sh2M78ODPm65Uhc2Wdj-VyJrV6gq9qq2wEszVjirXogHP358SY1XOptrxX6o3VinKBAohq4t8STA_jY1vm1nxUwUKDNOKsA7sXlP99PH39fNi7Q-k35OKiKAl' },
      'N2lVS1w4EtoT3dr4eOWO': { name: 'Callum', desc: 'Intense, Aventure', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDihgVY65falX4oH44FoomzvTiOOOFqKidPAKnQcunIfv9ABepjdnb1QjfSw2QPZU0Rm_o5bAo60vpy5ymHZnQJWVtpFXxUyqTnYL0tU-MfDYcuZL7cQk8QFV-y6hwTEcCjalNmRkxKrXEss4k0C4y7HJlVGV5IV3RhhpPP4zoqZALBMj24zQFEGz9VmliZcqCM-dBif8mSKXa4cuegV5XYQpazc7eQV1wnDZdNKZpwVM4eGrzLajLRYwFJ-IQdRhr29Nsmeqbe-BGO' },
      'IKne3meq5aSn9XLyUdCD': { name: 'Charlie', desc: 'Doux, Enfants', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz0iDLfV6hOdNFDHJuNP2pJ2ayL9WHx89f_q5X3nhy3Bgf6dNiC13asUyCcAK8IIRod3AONwGD1KQrW7Qp6XGHrB9sq6TuK9b-0F4ShFjBCF4cxWTVwWf9DMHV2yvPKZ2jJReUQC_dkIIF2lXxJtXMzvnrbqbTntQTccYN0o2oJGRLEdn58bUVnTy-cbtRbFJl4OzX2fGHXZTa_4K9O2hjosPER-StqLGMM8Fuza1HC7DLq75QV0EtCmsNq0gg5gpOtleM-4SQG7YG' },
      '21m00Tcm4TlvDq8ikWAM': { name: 'Rachel', desc: 'Calme, Documentaire', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
      'EXAVITQu4vr4xnSDxMaL': { name: 'Bella', desc: 'Douce, Chaleureuse', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
      'onyx': { name: 'Onyx', desc: 'Grave et sérieuse', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      'echo': { name: 'Echo', desc: 'Douce et posée', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      'nova': { name: 'Nova', desc: 'Énergique, chaleureuse', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      'shimmer': { name: 'Shimmer', desc: 'Claire et articulée', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80' }
    },
    genImageSwitch: "Générer une couverture avec l'IA",
    genImageDesc: "Nécessite OpenAI ou Gemini.",
    creationInProgress: "Création en cours..."
  },
  'Anglais': {
    ages: ['Kids (3-7 yrs)', 'Kids (8-12 yrs)', 'Teens', 'Adults'],
    genres: ['Adventure', 'Romance', 'Comedy', 'Horror', 'Sci-Fi', 'Mystery'],
    tones: ['Suspense', 'Sweetness', 'Tension', 'Humor', 'Action'],
    durations: ['2 min', '5 min', '10 min', '20 min'],
    forWho: "For who?",
    style: "Which style?",
    ambiance: "Which mood?",
    durationLabel: "Duration (approx)",
    titleLabel: "Story title (optional)",
    titlePlaceholder: "ex: The mystery of the forest",
    heroLabel: "Hero name (optional)",
    heroPlaceholder: "ex: Leo",
    keywordsLabel: "Keywords (optional, max 3)",
    keywordsPlaceholder: "ex: Pirate, princess, boat...",
    warning: "Please use appropriate words.",
    voiceLabel: "Which voice?",
    genSummary: "Generate story synopsis",
    startLike: "Your story will start like this:",
    genAudio: "Validate and generate audio 🎙️",
    restart: "Restart",
    customVoiceDesc: "AI Clone",
    voiceLabels: {
      'pNInz6obpgDQGcFmaJgB': { name: 'Adam', desc: 'Deep, Narration', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1McuUM9ZJbhQmmVjaIaaiAIRwjngOTW1wSDToD9divzI3PaFnVZj0ZQfSdwHAI8GtfQfGOu8_0w3UCbpS-3pcTqQ_YALR_bLVeUSzppjeZbj_W-3qxfxvKfSg0JpWBhEzQjwL2xKCsyF-sm3PbX1sh2M78ODPm65Uhc2Wdj-VyJrV6gq9qq2wEszVjirXogHP358SY1XOptrxX6o3VinKBAohq4t8STA_jY1vm1nxUwUKDNOKsA7sXlP99PH39fNi7Q-k35OKiKAl' },
      'N2lVS1w4EtoT3dr4eOWO': { name: 'Callum', desc: 'Intense, Adventure', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDihgVY65falX4oH44FoomzvTiOOOFqKidPAKnQcunIfv9ABepjdnb1QjfSw2QPZU0Rm_o5bAo60vpy5ymHZnQJWVtpFXxUyqTnYL0tU-MfDYcuZL7cQk8QFV-y6hwTEcCjalNmRkxKrXEss4k0C4y7HJlVGV5IV3RhhpPP4zoqZALBMj24zQFEGz9VmliZcqCM-dBif8mSKXa4cuegV5XYQpazc7eQV1wnDZdNKZpwVM4eGrzLajLRYwFJ-IQdRhr29Nsmeqbe-BGO' },
      'IKne3meq5aSn9XLyUdCD': { name: 'Charlie', desc: 'Sweet, Kids', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz0iDLfV6hOdNFDHJuNP2pJ2ayL9WHx89f_q5X3nhy3Bgf6dNiC13asUyCcAK8IIRod3AONwGD1KQrW7Qp6XGHrB9sq6TuK9b-0F4ShFjBCF4cxWTVwWf9DMHV2yvPKZ2jJReUQC_dkIIF2lXxJtXMzvnrbqbTntQTccYN0o2oJGRLEdn58bUVnTy-cbtRbFJl4OzX2fGHXZTa_4K9O2hjosPER-StqLGMM8Fuza1HC7DLq75QV0EtCmsNq0gg5gpOtleM-4SQG7YG' },
      '21m00Tcm4TlvDq8ikWAM': { name: 'Rachel', desc: 'Calm, Documentary', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
      'EXAVITQu4vr4xnSDxMaL': { name: 'Bella', desc: 'Sweet, Warm', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
      'onyx': { name: 'Onyx', desc: 'Deep, Serious', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      'echo': { name: 'Echo', desc: 'Sweet, Calm', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      'nova': { name: 'Nova', desc: 'Energetic, Warm', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      'shimmer': { name: 'Shimmer', desc: 'Clear, Articulate', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80' }
    },
    genImageSwitch: "Generate AI cover",
    genImageDesc: "Requires OpenAI or Gemini.",
    creationInProgress: "Creation in progress..."
  },
  'Espagnol': {
    ages: ['Niños (3-7 años)', 'Niños (8-12 años)', 'Adolescentes', 'Adultos'],
    genres: ['Aventura', 'Romance', 'Comedia', 'Horror', 'Ciencia Ficción', 'Misterio'],
    tones: ['Suspenso', 'Dulzura', 'Tensión', 'Humor', 'Acción'],
    durations: ['2 min', '5 min', '10 min', '20 min'],
    forWho: "¿Para quién?",
    style: "¿Qué estilo?",
    ambiance: "¿Qué ambiente?",
    durationLabel: "Duración (aprox)",
    titleLabel: "Título de la historia (opcional)",
    titlePlaceholder: "ej: El misterio del bosque",
    heroLabel: "Nombre del héroe (opcional)",
    heroPlaceholder: "ej: Leo",
    keywordsLabel: "Palabras clave (opcional, max 3)",
    keywordsPlaceholder: "ej: Pirata, princesa, barco...",
    warning: "Por favor use palabras apropiadas.",
    voiceLabel: "¿Qué voz?",
    genSummary: "Generar sinopsis de la historia",
    startLike: "Tu historia comenzará así:",
    genAudio: "Validar y generar audio 🎙️",
    restart: "Reiniciar",
    customVoiceDesc: "Clon IA",
    voiceLabels: {
      'pNInz6obpgDQGcFmaJgB': { name: 'Adam', desc: 'Grave, Narración', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1McuUM9ZJbhQmmVjaIaaiAIRwjngOTW1wSDToD9divzI3PaFnVZj0ZQfSdwHAI8GtfQfGOu8_0w3UCbpS-3pcTqQ_YALR_bLVeUSzppjeZbj_W-3qxfxvKfSg0JpWBhEzQjwL2xKCsyF-sm3PbX1sh2M78ODPm65Uhc2Wdj-VyJrV6gq9qq2wEszVjirXogHP358SY1XOptrxX6o3VinKBAohq4t8STA_jY1vm1nxUwUKDNOKsA7sXlP99PH39fNi7Q-k35OKiKAl' },
      'N2lVS1w4EtoT3dr4eOWO': { name: 'Callum', desc: 'Intenso, Aventura', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDihgVY65falX4oH44FoomzvTiOOOFqKidPAKnQcunIfv9ABepjdnb1QjfSw2QPZU0Rm_o5bAo60vpy5ymHZnQJWVtpFXxUyqTnYL0tU-MfDYcuZL7cQk8QFV-y6hwTEcCjalNmRkxKrXEss4k0C4y7HJlVGV5IV3RhhpPP4zoqZALBMj24zQFEGz9VmliZcqCM-dBif8mSKXa4cuegV5XYQpazc7eQV1wnDZdNKZpwVM4eGrzLajLRYwFJ-IQdRhr29Nsmeqbe-BGO' },
      'IKne3meq5aSn9XLyUdCD': { name: 'Charlie', desc: 'Dulce, Niños', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz0iDLfV6hOdNFDHJuNP2pJ2ayL9WHx89f_q5X3nhy3Bgf6dNiC13asUyCcAK8IIRod3AONwGD1KQrW7Qp6XGHrB9sq6TuK9b-0F4ShFjBCF4cxWTVwWf9DMHV2yvPKZ2jJReUQC_dkIIF2lXxJtXMzvnrbqbTntQTccYN0o2oJGRLEdn58bUVnTy-cbtRbFJl4OzX2fGHXZTa_4K9O2hjosPER-StqLGMM8Fuza1HC7DLq75QV0EtCmsNq0gg5gpOtleM-4SQG7YG' },
      '21m00Tcm4TlvDq8ikWAM': { name: 'Rachel', desc: 'Calma, Documental', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
      'EXAVITQu4vr4xnSDxMaL': { name: 'Bella', desc: 'Dulce, Cálida', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
      'onyx': { name: 'Onyx', desc: 'Grave y seria', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
      'echo': { name: 'Echo', desc: 'Dulce, Calma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
      'nova': { name: 'Nova', desc: 'Enérgica, Cálida', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
      'shimmer': { name: 'Shimmer', desc: 'Clara, Articulada', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80' }
    },
    genImageSwitch: "Generar portada con IA",
    genImageDesc: "Requiere OpenAI o Gemini.",
    creationInProgress: "Creación en curso..."
  }
};

const TONE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAaT5rmhgbN7egqWH2wNXb6UBHa8eWP69dihAFlH9GDY53dQSZ5p6DBvwEVfWxAaIrH9RSENzoNDVuXYPoCeOMMh2Qrc5JyiBQJLtVk8VSx8nfPNYAD2Le_7UoMiEEKK5p9PyWPFbEJYdnIq0SRQZfuCQlZNNTC65BOH-kxzXi4OtYNfXBgGCKp6tkcR_poDxu5iUGI0AtC-PmifNrdIpe3VqiaWunr4qG43LZVOqDYEoAw9S4aNkX3BWP51MEU3fuL19tOaWT0kGHh',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDdBp0y8N7qo_9azjsvqx99Z_LTd56pZiT1Q16LupbBhXJGbvE1L3HzRpf46zHOXh5fmSOeGcJnQYL1hJeSRZ4eSNiCpZFqOb47FvFupnuMOztLHGVYeK7sCEm29kzWvcOyOZgnf3mDne-dSx5NFinfDgH7MCpb3iTdvSS2ItzwDj-VEN0EiGUTcDkc-hTrFM7RrR0h4VG-bluaNY1xGjX8n4inhjxK-bIHka1AhXPN-n4mDRLBmSH07lVp5_F-63GD9PHxD9VHkcTy',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvNp2NddN59X8ruRglhHCmBaromnBsGIjItjQ1f39kmJFLGlTLgtirfoyGldruhPF1R-ST1fDMqZS5zup2_zcWk7K3NMOieYkQHK-vpQFCtEAz6aipqopiKtUKdJTuzqczNjyGYGfCMTjZ_jGxi78uf3-VIeOEcgOT7M8HNu_leQUBvKXmlaeXQJc5Ggj7dcxVqTw9zp3GcDnuClJqLMiFAwmWAn0gnAonkaEvtY6inch7qROiiODyn0Qrdlt3WWAnWi6RpCE6m_1X',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCA4NCtd8CJx3J_xNn36fzZeQW0pu3ldDKgrP-ToycuAJYeRxwAHpeZeXbQygBZh4NFEYqVQXuKMv1Xwbi3Nn4H19N7OdBQ4OlcovEoUbBUPH1NpI-GhXQ0e7rbZRu0744asLQdTuhF2Hcewr7JqSyjRDtLIV5sGrpPf6uwUZIzZeG54x1l4F0c_mOsSBsj_bWPgicML2wedQXTCZ7_7psWLvi2kK0KmhtxNnnD1PTJSwfWlwk-RU_fDD-DON-AuqlCyvHtNPy-VSS5',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAJalhIqAqgn9qMJdlcr6_jzrvTxWxWaSowYKeDEENaQjd5UNS5Dr276j9r2groDa70t_KCOgzhpsUAn9GmY84An5imu1rgdY9n1HNjd-c6P7fvjcVvbPFKO7q0iG2Z1DkG4faB0cpaBUk5f8wzcfzUHujijRC6Sjr3EVc8WZic-d1sITmu4SxVB-jfLI2bo4TAV5ykO5pdgcp5yv4oNq7k9n_z5piHIbBMSsWfgL8623Sm9MaChnS1VgLdWHl1Fs_OPwSJDpbzol_l'
];

const GENRE_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
  'https://images.unsplash.com/photo-1545987796-200677ee1011?w=400&q=80',
  'https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=400&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
  'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=80'
];

export default function CreateScreen() {
  const router = useRouter();
  const { language, textProvider, voiceProvider, apiKeys, isLoaded } = useContext(AppContext);
  
  const [ageIdx, setAgeIdx] = useState(0);
  const [genreIdx, setGenreIdx] = useState(0);
  const [toneIdx, setToneIdx] = useState(0);
  const [durationIdx, setDurationIdx] = useState(1);
  const [title, setTitle] = useState('');
  const [heroName, setHeroName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [generateImage, setGenerateImage] = useState(false);

  const t = (isLoaded && TRANSLATIONS[language]) ? TRANSLATIONS[language] : TRANSLATIONS['Français'];

  useFocusEffect(
    useCallback(() => {
      const loadCustomVoice = async () => {
        const base = getBaseVoices(voiceProvider);
        let customVoices = [];
        
        if (voiceProvider === 'ElevenLabs') {
          const data = await AsyncStorage.getItem('yelo_cloned_voices');
          if (data) {
            const parsed = JSON.parse(data);
            customVoices = parsed.map(v => ({ id: v.id, name: v.name, description: 'Clone IA', image: '🎙️', isCustom: true }));
          }
          
          // Récupère les voix de la librairie web ElevenLabs
          const remoteVoices = await getRemoteVoices(voiceProvider, apiKeys);
          
          // Fusionne sans doublon
          const localIds = new Set(customVoices.map(v => v.id));
          const uniqueRemote = remoteVoices.filter(v => !localIds.has(v.id));
          customVoices = [...customVoices, ...uniqueRemote];
        }
        
        const totalVoices = [...base, ...customVoices];
        setAvailableVoices(totalVoices);
        if (totalVoices.length > 0) {
          setVoiceId(totalVoices[0].id);
        }
      };
      if (isLoaded) loadCustomVoice();
    }, [voiceProvider, isLoaded])
  );

  const [loadingStep, setLoadingStep] = useState(null); 
  const [generatedSummary, setGeneratedSummary] = useState('');
  
  const handleGenerateSummary = async () => {
    setLoadingStep('summary');
    try {
      const voiceName = availableVoices.find(v => v.id === voiceId)?.name || 'Inconnue';
      const summary = await generateStorySummary({ 
        age: t.ages[ageIdx], 
        genre: t.genres[genreIdx], 
        tone: t.tones[toneIdx], 
        voiceName, keywords, language, title, heroName 
      }, textProvider, apiKeys);
      setGeneratedSummary(summary);
    } catch (error) {
      console.error(error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoadingStep(null);
    }
  };

  const handleCreateAudio = async () => {
    setLoadingStep('audio');
    try {
      const fullText = await generateFullStory({ 
        age: t.ages[ageIdx], 
        genre: t.genres[genreIdx], 
        tone: t.tones[toneIdx], 
        duration: t.durations[durationIdx], 
        keywords, language, title, heroName 
      }, generatedSummary, textProvider, apiKeys);
      
      let coverImage = null;
      if (generateImage) {
        try {
          coverImage = await generateStoryImage(generatedSummary, textProvider, apiKeys);
        } catch (imgError) {
          console.error("Erreur génération image:", imgError);
          alert(imgError.message);
          setLoadingStep(null);
          return; // Arrête le process si l'image foire
        }
      }

      const audioUri = await generateSpeech(fullText, voiceId, voiceProvider, apiKeys);
      
      const newStory = {
        id: Date.now().toString(),
        title: title || `Histoire : ${t.genres[genreIdx]}`,
        summary: generatedSummary,
        fullText,
        audioUri,
        coverImage,
        age: t.ages[ageIdx], 
        genre: t.genres[genreIdx], 
        tone: t.tones[toneIdx], 
        language, heroName,
        createdAt: new Date().toISOString()
      };
      
      const stored = await AsyncStorage.getItem('yelo_stories');
      const stories = stored ? JSON.parse(stored) : [];
      stories.unshift(newStory);
      await AsyncStorage.setItem('yelo_stories', JSON.stringify(stories));
      
      setGeneratedSummary('');
      router.push('/');
    } catch (error) {
      console.error(error);
      alert(`Erreur de génération : ${error.message}`);
    } finally {
      setLoadingStep(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }}>
      
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25}}>
        <Text style={{color: '#0b1c30', fontSize: 28, fontFamily: 'Montserrat_700Bold'}}>{t.create}</Text>
      </View>

      {/* Section Pour Qui */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.forWho}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
          {t.ages.map((opt, idx) => {
            const icons = ['child-friendly', 'face', 'mood', 'person'];
            return (
              <TouchableOpacity 
                key={idx} 
                style={[
                  {flex: 1, minWidth: '22%', paddingVertical: 15, alignItems: 'center', borderRadius: 12, borderWidth: 2, borderColor: '#38b6cd'},
                  ageIdx === idx ? {backgroundColor: '#eaf1ff'} : {backgroundColor: '#ffffff'}
                ]}
                onPress={() => setAgeIdx(idx)}
              >
                <MaterialIcons name={icons[idx % 4]} size={32} color="#006877" style={{marginBottom: 5}} />
                <Text style={{fontSize: 10, fontFamily: 'Montserrat_700Bold', color: '#0b1c30', textAlign: 'center'}}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section Quel Style */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.style}</Text>
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10}}>
          {t.genres.map((opt, idx) => (
            <TouchableOpacity 
              key={idx} 
              activeOpacity={0.8}
              style={{width: '48%'}}
              onPress={() => setGenreIdx(idx)}
            >
              <ImageBackground
                source={{uri: GENRE_IMAGES[idx]}}
                style={{
                  height: 60,
                  borderRadius: 12,
                  overflow: 'hidden',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 10
                }}
                imageStyle={{resizeMode: 'cover'}}
              >
                <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0,0,0,0.4)'}]} />
                
                {genreIdx === idx && (
                  <View style={[StyleSheet.absoluteFillObject, {borderWidth: 3, borderColor: '#38b6cd', borderRadius: 12}]} />
                )}

                <Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#ffffff', zIndex: 1, textAlign: 'center'}}>
                  {opt}
                </Text>
                
                {genreIdx === idx && (
                  <View style={{position: 'absolute', top: 5, right: 5, zIndex: 1}}>
                    <MaterialIcons name="check-circle" size={16} color="#ffffff" />
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Quelle Ambiance */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.ambiance}</Text>
        </View>
        <View style={{gap: 10}}>
          {t.tones.map((opt, idx) => (
            <TouchableOpacity 
              key={idx} 
              activeOpacity={0.8}
              onPress={() => setToneIdx(idx)}
            >
              <ImageBackground
                source={{uri: TONE_IMAGES[idx]}}
                style={{
                  height: 60,
                  borderRadius: 12,
                  overflow: 'hidden',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20
                }}
                imageStyle={{resizeMode: 'cover'}}
              >
                <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0,0,0,0.3)'}]} />
                
                {/* Border effect for selected item */}
                {toneIdx === idx && (
                  <View style={[StyleSheet.absoluteFillObject, {borderWidth: 3, borderColor: '#38b6cd', borderRadius: 12}]} />
                )}

                <Text style={{fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#ffffff', zIndex: 1}}>
                  {opt}
                </Text>
                
                {toneIdx === idx && (
                  <MaterialIcons name="check-circle" size={24} color="#ffffff" style={{zIndex: 1}} />
                )}
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Durée */}
      <View style={styles.section}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#006877', marginRight: 8}} />
          <Text style={styles.sectionTitle}>{t.durationLabel}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          {t.durations.map((opt, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[
                {flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1},
                durationIdx === idx ? {backgroundColor: '#38b6cd', borderColor: '#38b6cd'} : {backgroundColor: '#eff4ff', borderColor: '#eff4ff'}
              ]}
              onPress={() => setDurationIdx(idx)}
            >
              <Text style={[
                {fontFamily: 'Montserrat_700Bold', fontSize: 12},
                durationIdx === idx ? {color: '#ffffff'} : {color: '#0b1c30'}
              ]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.titleLabel}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.titlePlaceholder}
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.heroLabel}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.heroPlaceholder}
          placeholderTextColor="#64748b"
          value={heroName}
          onChangeText={setHeroName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.keywordsLabel}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.keywordsPlaceholder}
          placeholderTextColor="#64748b"
          value={keywords}
          onChangeText={setKeywords}
        />
        <Text style={{color: '#64748b', fontSize: 12, marginTop: 5, fontStyle: 'italic'}}>
          {t.warning}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
          <Text style={styles.sectionTitle}>{t.voiceLabel}</Text>
          <MaterialIcons name="spatial-audio" size={24} color="#006877" />
        </View>
        <View style={{gap: 15}}>
          {availableVoices.map(v => {
            let translatedName = v.name;
            let translatedDesc = v.description;
            let avatarUrl = null;
            
            if (t.voiceLabels && t.voiceLabels[v.id]) {
               translatedName = t.voiceLabels[v.id].name;
               translatedDesc = t.voiceLabels[v.id].desc;
               avatarUrl = t.voiceLabels[v.id].avatar;
            } else if (v.isCustom) {
               translatedDesc = t.customVoiceDesc;
            }

            return (
              <TouchableOpacity 
                key={v.id} 
                style={[styles.voiceCard, voiceId === v.id && styles.voiceCardSelected]}
                onPress={() => setVoiceId(v.id)}
              >
                <View style={[styles.voiceAvatar, voiceId === v.id ? {backgroundColor: '#38b6cd'} : {backgroundColor: '#e9e7e9'}]}>
                  {avatarUrl ? (
                    <Image source={{uri: avatarUrl}} style={{width: 60, height: 60, borderRadius: 30}} />
                  ) : (
                    <MaterialIcons name="mic" size={32} color={voiceId === v.id ? "#ffffff" : "#6d797c"} />
                  )}
                </View>
                <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={[styles.voiceCardTitle, voiceId === v.id && styles.voiceCardTitleSelected]}>{translatedName}</Text>
                    {voiceId === v.id && (
                      <MaterialIcons name="check-circle" size={20} color="#006877" />
                    )}
                  </View>
                  <Text style={styles.voiceDesc}>{translatedDesc}</Text>
                </View>
                {voiceId === v.id && (
                  <View style={{position: 'absolute', top: -10, right: -10, opacity: 0.1}}>
                    <MaterialIcons name="auto-awesome" size={60} color="#006877" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!generatedSummary ? (
        <TouchableOpacity style={styles.mainBtn} onPress={handleGenerateSummary} disabled={loadingStep !== null}>
          {loadingStep === 'summary' ? <ActivityIndicator color="#ffffff" /> : (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Text style={styles.mainBtnText}>{t.genSummary}</Text>
              <MaterialIcons name="auto-awesome" size={20} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>{t.startLike}</Text>
          <Text style={styles.summaryText}>{generatedSummary}</Text>
          
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 15, backgroundColor: '#f8f9ff', borderRadius: 10, borderWidth: 1, borderColor: '#dbe4e5'}}>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text style={{fontFamily: 'Montserrat_600SemiBold', color: '#0b1c30', fontSize: 14}}>{t.genImageSwitch}</Text>
              <Text style={{fontFamily: 'Montserrat_500Medium', color: '#6d797c', fontSize: 11, marginTop: 4}}>{t.genImageDesc}</Text>
            </View>
            <Switch
              trackColor={{ false: "#dbe4e5", true: "#a5eeff" }}
              thumbColor={generateImage ? "#38b6cd" : "#f4f3f4"}
              onValueChange={setGenerateImage}
              value={generateImage}
            />
          </View>

          <TouchableOpacity style={styles.audioBtn} onPress={handleCreateAudio} disabled={loadingStep !== null}>
            {loadingStep === 'audio' ? (
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.mainBtnText}>{t.creationInProgress}</Text>
              </View>
            ) : (
              <Text style={styles.mainBtnText}>{t.genAudio}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setGeneratedSummary('')} disabled={loadingStep !== null}>
            <Text style={styles.cancelBtnText}>{t.restart}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff', padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { color: '#0b1c30', fontSize: 16, fontFamily: 'Montserrat_700Bold', marginBottom: 10 },
  scrollRow: { gap: 10 },
  pill: { backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: '#bcc9cc' },
  pillActive: { backgroundColor: '#006877', borderColor: '#006877' },
  pillText: { color: '#3d494c', fontFamily: 'Montserrat_600SemiBold', fontSize: 14 },
  pillTextActive: { color: '#ffffff' },
  input: {
    backgroundColor: '#eff4ff',
    color: '#0b1c30',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 0,
    fontFamily: 'Montserrat_500Medium'
  },
  voiceCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#bcc9cc', flexDirection: 'row', alignItems: 'center', gap: 15, overflow: 'hidden' },
  voiceCardSelected: { borderColor: '#006877', backgroundColor: '#eff4ff', borderWidth: 2 },
  voiceAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  voiceCardTitle: { color: '#0b1c30', fontFamily: 'Montserrat_700Bold', fontSize: 16 },
  voiceCardTitleSelected: { color: '#006877' },
  voiceDesc: { color: '#6d797c', fontSize: 12, marginTop: 2, fontFamily: 'Montserrat_500Medium' },
  mainBtn: { backgroundColor: '#006877', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  mainBtnText: { color: '#ffffff', fontFamily: 'Montserrat_700Bold', fontSize: 16 },
  summaryBox: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: '#38b6cd' },
  summaryTitle: { color: '#38b6cd', fontFamily: 'Montserrat_700Bold', marginBottom: 10 },
  summaryText: { color: '#0b1c30', lineHeight: 22, marginBottom: 20, fontFamily: 'Montserrat_500Medium' },
  audioBtn: { backgroundColor: '#006877', padding: 18, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  cancelBtn: { padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { color: '#6d797c', fontFamily: 'Montserrat_600SemiBold' }
});
