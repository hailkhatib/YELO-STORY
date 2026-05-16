import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('Français');
  const [textProvider, setTextProvider] = useState('Gemini');
  const [voiceProvider, setVoiceProvider] = useState('ElevenLabs');
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: '',
    mistral: '',
    elevenlabs: ''
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('yelo_language');
        if (storedLang) setLanguage(storedLang);
        
        const storedText = await AsyncStorage.getItem('yelo_textProvider');
        if (storedText) setTextProvider(storedText);

        const storedVoice = await AsyncStorage.getItem('yelo_voiceProvider');
        if (storedVoice) setVoiceProvider(storedVoice);

        const storedKeys = await AsyncStorage.getItem('yelo_apiKeys');
        if (storedKeys) setApiKeys(JSON.parse(storedKeys));
      } catch (e) {
        console.error("Error loading settings", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  const saveLanguage = async (val) => { 
    setLanguage(val); 
    await AsyncStorage.setItem('yelo_language', val); 
  };
  
  const saveTextProvider = async (val) => { 
    setTextProvider(val); 
    await AsyncStorage.setItem('yelo_textProvider', val); 
  };
  
  const saveVoiceProvider = async (val) => { 
    setVoiceProvider(val); 
    await AsyncStorage.setItem('yelo_voiceProvider', val); 
  };
  
  const saveApiKeys = async (keys) => { 
    setApiKeys(keys); 
    await AsyncStorage.setItem('yelo_apiKeys', JSON.stringify(keys)); 
  };

  return (
    <AppContext.Provider value={{ 
      language, saveLanguage, 
      textProvider, saveTextProvider, 
      voiceProvider, saveVoiceProvider, 
      apiKeys, saveApiKeys, 
      isLoaded 
    }}>
      {children}
    </AppContext.Provider>
  );
};
