const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Cấu hình AI Model với API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instruction (Prompt định hình tính cách/kiến thức cho Bot)
const systemInstruction = `
Bạn là "Trợ lý CaRental", nhân viên tư vấn nhiệt tình, chu đáo và chuyên nghiệp của chi nhánh Thuê Xe Ô Tô CaRental.
Dịch vụ của chúng tôi bao gồm: Cho thuê xe tự lái và xe có người lái.
Nhiệm vụ của bạn là hỗ trợ khách hàng: tư vấn chọn loại xe phù hợp, hướng dẫn thủ tục thuê xe (cần CCCD, Bằng lái xe, đặt cọc), và giải đáp các thắc mắc liên quan đến thuê xe, thanh toán, hợp đồng.
Hãy trả lời ngắn gọn, tự nhiên, bằng tiếng Việt chuẩn. Phân trang hoặc gạch đầu dòng cho dễ đọc nếu nội dung dài.
Nếu khách hàng hỏi về các chủ đề ngoài dịch vụ thuê xe, ô tô, du lịch, hãy từ chối một cách khéo léo và quay lại đề nghị hỗ trợ các thông tin về thuê xe.
`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Khởi tạo model Gemini Flash mới nhất - tránh bị giới hạn quota khu vực
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemInstruction,
    });

    // Chuyển đổi lịch sử chat từ dạng client gửi lên sang format của Google AI
    let chatHistory = [];
    if (history && Array.isArray(history)) {
      chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content || ' ' }],
      }));
      
      // Gemini bắt buộc lịch sử phải bắt đầu bằng tin nhắn của 'user' 
      // Nên ta sẽ loại bỏ các tin nhắn 'model' xuất hiện ở đầu mảng (ví dụ như câu chào mặc định)
      while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory.shift();
      }
    }

    // Bắt đầu hoặc tiếp tục phiên chat
    const chat = model.startChat({
      history: chatHistory,
    });

    // Gửi tin nhắn mới của người dùng
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Xin lỗi, tôi đang gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.' });
  }
});

module.exports = router;
