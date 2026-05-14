require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let history = [
      { role: 'user', parts: [{ text: "Hello" }] },
      { role: 'user', parts: [{ text: "Are you there" }] }
    ];
    
    console.log("Starting chat...");
    const chat = model.startChat({ history });
    console.log("Sending msg...");
    const result = await chat.sendMessage('test');
    console.log("Reply:", result.response.text());
  } catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
}
run();
