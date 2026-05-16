const ELEVENLABS_API_KEY = 'sk_603ecdd103b6cd457fc1cd38d4b7e78104813a522162ca99';

async function test() {
  const url = `https://api.elevenlabs.io/v1/voices`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      }
    });
    const data = await response.json();
    if(data.voices) {
        console.log("Allowed Voices:");
        data.voices.forEach(v => console.log(v.voice_id, v.name));
    } else {
        console.log("Error:", data);
    }
  } catch(e) {
    console.error(e);
  }
}
test();
