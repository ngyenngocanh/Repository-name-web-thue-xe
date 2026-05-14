require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    console.log("Sending msg to gemini-1.5-pro...");
    const result = await model.generateContent('hi');
    console.log("Reply:", result.response.text());
  } catch(e) {
    console.error("ERROR 1.5-pro:");
    console.error(e.message);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log("Sending msg to gemini-pro...");
    const result = await model.generateContent('hi');
    console.log("Reply:", result.response.text());
  } catch(e) {
    console.error("ERROR gemini-pro:");
    console.error(e.message);
  }
}
run();
