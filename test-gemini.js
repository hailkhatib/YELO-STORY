const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyBY7m8cN-ea07nJupGPPp8w7amkQHI1Ro8';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function run() {
  try {
    const fetch = globalThis.fetch;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
            console.log(m.name);
        }
    });
  } catch (e) {
    console.error(e);
  }
}
run();
