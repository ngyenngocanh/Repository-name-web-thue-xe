require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey.substring(0, 8) + '...');
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
  const data = await response.json();
  
  if (data && data.models) {
    console.log("Available models:");
    data.models.forEach(m => console.log(m.name));
  } else {
    console.log("Error or no models:");
    console.log(data);
  }
}
listModels();
