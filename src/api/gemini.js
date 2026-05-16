import { GoogleGenerativeAI } from '@google/generative-ai';

// Clé API à remplacer pour Gemini
const GEMINI_API_KEY = 'AIzaSyBY7m8cN-ea07nJupGPPp8w7amkQHI1Ro8';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateStorySummary = async (params) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const targetLang = params.language || 'Français';
    const prompt = `Génère un résumé (pitch) court et accrocheur d'une histoire avec ces critères :
    - Public cible : ${params.age}
    - Genre : ${params.genre}
    - Ton : ${params.tone}
    - Langue de l'histoire : ${targetLang}
    ${params.title ? `- Titre imposé : ${params.title}` : ''}
    ${params.heroName ? `- Nom du héros principal : ${params.heroName}` : ''}
    ${params.keywords ? `- Mots-clés / Thèmes imposés : ${params.keywords}` : ''}
    - Voix utilisée (pour adapter le contexte) : ${params.voiceName}
    
    IMPORTANT: Tu dois OBLIGATOIREMENT rédiger ce résumé en ${targetLang}.
    Le résumé doit faire 2 à 3 phrases maximum. Pas de formatage complexe.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    throw error;
  }
};

export const generateFullStory = async (params, summary) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const targetLang = params.language || 'Français';
    const prompt = `Écris une histoire complète à partir de ce résumé : "${summary}"
    
    Critères à respecter absolument :
    - Public cible : ${params.age}
    - Genre : ${params.genre}
    - Ton : ${params.tone}
    - Langue de l'histoire : ${targetLang}
    ${params.title ? `- Titre imposé : ${params.title}` : ''}
    ${params.heroName ? `- Nom du héros principal : ${params.heroName}` : ''}
    ${params.keywords ? `- Mots-clés / Thèmes imposés : ${params.keywords}` : ''}
    - Durée de lecture : Environ ${params.duration} minutes (adapte la longueur du texte).
    
    Consignes :
    - IMPORTANT: Tu dois OBLIGATOIREMENT rédiger toute l'histoire en ${targetLang}.
    - Écris l'histoire de manière fluide, idéale pour être lue à voix haute (Audio / Podcast).
    - Pas de titres, de chapitres ou de texte entre crochets. Juste le texte de l'histoire à lire.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Full Story Error:", error);
    throw error;
  }
};
