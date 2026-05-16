import { GoogleGenerativeAI } from '@google/generative-ai';

const buildSummaryPrompt = (params) => {
  const targetLang = params.language || 'Français';
  return `Génère un résumé (pitch) court et accrocheur d'une histoire avec ces critères :
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
};

const buildStoryPrompt = (params, summary) => {
  const targetLang = params.language || 'Français';
  return `Écris une histoire complète à partir de ce résumé : "${summary}"
  
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
};

const runTextAI = async (prompt, provider, keys) => {
  try {
    if (provider === 'Gemini') {
      if (!keys.gemini) throw new Error("Clé API Gemini manquante. Veuillez la configurer dans les Paramètres.");
      const genAI = new GoogleGenerativeAI(keys.gemini);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
    
    if (provider === 'OpenAI') {
      if (!keys.openai) throw new Error("Clé API OpenAI manquante.");
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.openai}` },
        body: JSON.stringify({ model: 'gpt-4o', messages: [{role: 'user', content: prompt}] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.choices[0].message.content;
    }

    if (provider === 'Anthropic') {
      if (!keys.anthropic) throw new Error("Clé API Anthropic manquante.");
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': keys.anthropic,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20240620', max_tokens: 2048, messages: [{role: 'user', content: prompt}] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.content[0].text;
    }

    if (provider === 'Mistral') {
      if (!keys.mistral) throw new Error("Clé API Mistral manquante.");
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.mistral}` },
        body: JSON.stringify({ model: 'mistral-large-latest', messages: [{role: 'user', content: prompt}] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.choices[0].message.content;
    }

    throw new Error("Fournisseur inconnu: " + provider);
  } catch (error) {
    console.error(`Error in ${provider}:`, error);
    throw error;
  }
};

export const generateStorySummary = async (params, provider, keys) => {
  return runTextAI(buildSummaryPrompt(params), provider, keys);
};

export const generateFullStory = async (params, summary, provider, keys) => {
  return runTextAI(buildStoryPrompt(params, summary), provider, keys);
};

export const generateStoryImage = async (summary, provider, keys) => {
  try {
    const prompt = `A beautiful, highly detailed, child-friendly illustration for a story. The story is about: ${summary}. The style should be vibrant, high quality, digital art, suitable for a storybook cover. No text in the image.`;
    
    if (provider === 'OpenAI') {
      if (!keys.openai) throw new Error("Clé API OpenAI manquante.");
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keys.openai}` },
        body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024' })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.data[0].url; // Returns the image URL
    }

    if (provider === 'Gemini') {
      if (!keys.gemini) throw new Error("Clé API Gemini manquante.");
      // Using Imagen 3 API endpoint
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${keys.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: "1:1" }
        })
      });
      const json = await res.json();
      if (json.error) {
        const msg = json.error.message || "";
        if (msg.includes("not found") || json.error.code === 404 || json.error.code === 403) {
          throw new Error("Votre clé Gemini n'a pas accès au modèle d'image (Imagen 3). Vérifiez les droits de votre clé ou utilisez une clé OpenAI dans les Paramètres.");
        }
        throw new Error(json.error.message);
      }
      if (json.predictions && json.predictions.length > 0) {
        return `data:${json.predictions[0].mimeType};base64,${json.predictions[0].bytesBase64Encoded}`;
      }
      throw new Error("Erreur lors de la génération de l'image via Gemini.");
    }

    if (provider === 'Anthropic' || provider === 'Mistral') {
      throw new Error(`Le fournisseur ${provider} ne permet pas encore de générer des images. Veuillez utiliser OpenAI ou Gemini, ou décochez l'option image.`);
    }

    throw new Error("Fournisseur inconnu pour la génération d'image: " + provider);
  } catch (error) {
    console.error(`Error generating image with ${provider}:`, error);
    throw error;
  }
};

