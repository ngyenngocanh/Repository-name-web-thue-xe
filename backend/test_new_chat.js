require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simulate what the backend does exactly
    const systemInstruction = "Bạn là trợ lý.";
    const actualModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    let history = [{ role: 'model', content: "Xin chào" }];
    let chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || ' ' }],
      }));
      
    while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      chatHistory.shift();
    }

    const chat = actualModel.startChat({ history: chatHistory });
    const result = await chat.sendMessage("hello");
    console.log("Success:", result.response.text());
  } catch(e) {
    console.error("ERROR CAUGHT IN TRY:");
    console.error(e);
  }
}
run();
