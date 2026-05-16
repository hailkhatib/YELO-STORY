const ELEVENLABS_API_KEY = 'sk_009ba3312e0ab156db062cf53feda9f5099f1f6819026028';

async function test() {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Bonjour, ceci est un test de voix.",
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      })
    });
    
    if (!response.ok) {
      const txt = await response.text();
      console.error("FAILED:", txt);
    } else {
      console.log("SUCCESS! Got audio blob.");
    }
  } catch(e) {
    console.error(e);
  }
}
test();
