require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const actualModel = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: "Bạn là trợ lý CaRental.",
    });

    const chat = actualModel.startChat({ history: [] });
    const result = await chat.sendMessage("hello");
    console.log("Success:", result.response.text());
  } catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
}
run();
