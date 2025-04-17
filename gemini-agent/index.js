require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const { sanitizeInput, formatCollocations, detectLanguage } = require('./utils/textProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// Dùng hardcode API key thay vì đọc từ .env để tránh vấn đề với việc đọc file
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY = 'AIzaSyBrdY3Qcm_tTgGJxGFaebyC7WQjbUVyUWk';
console.log('==== KHỞI ĐỘNG SERVER GEMINI COLLOCATION AGENT ====');
console.log(`API key (hardcode): ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'không tìm thấy'}`);
console.log('=====================================================');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Tạo prompt thông minh dựa trên loại văn bản và ngôn ngữ
 */
const createPrompt = (text, options = {}) => {
  const { language = detectLanguage(text) } = options;
  
  const promptMap = {
    vi: `Hãy trích xuất tất cả các collocation (cụm từ thường đi với nhau) từ đoạn văn sau đây và liệt kê dưới dạng danh sách có dấu chấm đầu dòng, không thêm bất kỳ giải thích nào:\n\n${text}`,
    en: `Extract all collocations (words that commonly go together) from the following text and list them with bullet points, without adding any explanations:\n\n${text}`
  };
  
  return promptMap[language] || promptMap.en;
};

/**
 * Gọi Gemini API để trích xuất collocations
 */
const extractCollocations = async (text, options = {}) => {
  try {
    // Vệ sinh đầu vào
    const sanitizedText = sanitizeInput(text);
    if (!sanitizedText) {
      throw new Error('Văn bản đầu vào không hợp lệ');
    }
    
    // Tạo prompt phù hợp
    const prompt = createPrompt(sanitizedText, options);
    console.log('Ngôn ngữ phát hiện:', detectLanguage(sanitizedText));
    
    // Kiểm tra API key ngay tại hàm này
    if (!GEMINI_API_KEY) {
      throw new Error('API key không được cấu hình. Vui lòng kiểm tra file .env');
    }
    
    console.log('🔑 API Key được sử dụng (debug):', GEMINI_API_KEY.substring(0, 10) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5));
    
    // Chuẩn bị request URL và data
    const apiKey = GEMINI_API_KEY.trim(); // Đảm bảo không có khoảng trắng
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    console.log('URL API (debug):', requestUrl.substring(0, 75) + '...[API KEY]');
    
    const requestData = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    
    console.log('📡 Gửi request đến Gemini API...');
    
    // Gọi API Gemini
    const response = await axios({
      method: 'post',
      url: requestUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 20000 // 20 giây timeout
    });
    
    console.log('✅ Gemini API response status:', response.status);
    
    // Kiểm tra response
    if (!response.data) {
      console.error('❌ Response không có data');
      throw new Error('Không nhận được data từ Gemini API');
    }
    
    if (!response.data.candidates || response.data.candidates.length === 0) {
      console.error('❌ Response không có candidates:', JSON.stringify(response.data));
      throw new Error('Không tìm thấy candidates trong phản hồi từ Gemini API');
    }
    
    if (!response.data.candidates[0].content || !response.data.candidates[0].content.parts || !response.data.candidates[0].content.parts[0].text) {
      console.error('❌ Cấu trúc data không đúng:', JSON.stringify(response.data.candidates[0]));
      throw new Error('Cấu trúc phản hồi từ Gemini API không đúng định dạng');
    }
    
    const rawResult = response.data.candidates[0].content.parts[0].text;
    console.log('📝 Kết quả thô từ Gemini API:', rawResult.substring(0, 100) + (rawResult.length > 100 ? '...' : ''));
    
    // Định dạng và phân tích kết quả
    const formattedResult = formatCollocations(rawResult);
    console.log(`🔍 Đã tìm thấy ${formattedResult.length} collocations`);
    
    return formattedResult;
    
  } catch (error) {
    console.error('❌ Lỗi khi gọi Gemini API:', error.message);
    
    // Xử lý chi tiết lỗi
    if (error.response) {
      console.error('❌ Chi tiết lỗi từ API:');
      console.error('- Status:', error.response.status);
      console.error('- Headers:', JSON.stringify(error.response.headers));
      console.error('- Data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('❌ Không nhận được phản hồi từ API');
      console.error('- Request:', error.request);
    } else {
      console.error('❌ Lỗi khi thiết lập request:', error.message);
    }
    
    throw new Error(`Lỗi khi trích xuất collocations: ${error.message}`);
  }
};

// API endpoint để trích xuất collocations
app.post('/api/extract', async (req, res) => {
  try {
    console.log('📥 Nhận request POST đến /api/extract');
    
    const { text } = req.body;
    
    if (!text) {
      console.log('❌ Không có văn bản được cung cấp');
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp văn bản để trích xuất collocations'
      });
    }
    
    console.log(`📝 Xử lý văn bản (${text.length} ký tự): ${text.substring(0, 50)}...`);
    
    const collocations = await extractCollocations(text);
    
    console.log('📤 Gửi phản hồi với', collocations.length, 'collocations');
    
    return res.json({
      success: true,
      data: {
        collocations,
        count: collocations.length
      }
    });
  } catch (error) {
    console.error('❌ Lỗi trong route /api/extract:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route chính cho webapp
app.get('/', (req, res) => {
  console.log('📄 Đang phục vụ trang index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn'
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🤖 Gemini Collocation Agent đang chạy tại http://localhost:${PORT}`);
  console.log('👉 Truy cập URL này trong trình duyệt của bạn để bắt đầu sử dụng agent');
}); 