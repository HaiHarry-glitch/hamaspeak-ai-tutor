// Đảm bảo đọc biến môi trường chính xác từ file .env
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Hàm đọc file .env và xử lý BOM (Byte Order Mark)
function getApiKeyFromEnvFile() {
  try {
    const envPath = path.resolve(__dirname, '.env');
    console.log('Đọc file .env từ đường dẫn:', envPath);
    
    // Đọc file binary trước để xử lý BOM
    const envBuffer = fs.readFileSync(envPath);
    
    // Chuyển đổi sang string và xử lý BOM
    let envContent = envBuffer.toString('utf8');
    
    // Loại bỏ BOM (Byte Order Mark) nếu có
    if (envContent.charCodeAt(0) === 0xFEFF) {
      console.log('Phát hiện BOM trong file .env, đang xử lý...');
      envContent = envContent.slice(1);
    }
    
    console.log('Nội dung file .env sau khi xử lý BOM:', envContent);
    
    // Phân tích nội dung để lấy API key
    const lines = envContent.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^GEMINI_API_KEY=(.+)$/);
      if (match && match[1]) {
        const apiKey = match[1].trim();
        console.log(`Đã đọc API key từ file: ${apiKey.substring(0, 10)}...`);
        return apiKey;
      }
    }
    
    console.log('Không tìm thấy GEMINI_API_KEY trong file .env');
    return null;
  } catch (error) {
    console.error('Lỗi khi đọc file .env:', error.message);
    return null;
  }
}

// Nạp API key
require('dotenv').config();
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Nếu không lấy được từ process.env, đọc trực tiếp từ file
if (!GEMINI_API_KEY) {
  console.log('Không tìm thấy API key từ process.env, đọc trực tiếp từ file .env...');
  GEMINI_API_KEY = getApiKeyFromEnvFile();
}

// Backup key nếu không đọc được từ file .env
if (!GEMINI_API_KEY) {
  GEMINI_API_KEY = 'AIzaSyBrdY3Qcm_tTgGJxGFaebyC7WQjbUVyUWk';
  console.log('⚠️ Sử dụng backup API key vì không đọc được từ file .env');
}

// Kiểm tra API key đã được đọc chưa
console.log(`🔑 API key: ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'không tìm thấy'}`);

// Dữ liệu mẫu để kiểm tra
const testTexts = [
  {
    name: 'Văn bản tiếng Anh ngắn',
    text: 'There was a time when I was unsure about participating in an English speaking contest at my high school. At first, I hesitated because I didn\'t feel confident in my English skills and was worried about making mistakes in front of my classmates and teachers.'
  },
  {
    name: 'Văn bản tiếng Việt',
    text: 'Khi tôi còn đang học trung học, tôi đã tham gia vào một cuộc thi hùng biện tiếng Anh. Ban đầu, tôi cảm thấy không tự tin về khả năng ngôn ngữ của mình và lo lắng về việc mắc lỗi trước mặt bạn bè và giáo viên.'
  },
  {
    name: 'Đoạn văn học thuật',
    text: 'The research findings indicate a strong correlation between sleep quality and academic performance. Students who consistently get adequate sleep tend to perform better on exams and complete assignments more efficiently. Furthermore, good sleep habits contribute to improved concentration and information retention.'
  }
];

// URL của API trích xuất collocations
const API_URL = 'http://localhost:3000/api/extract';

/**
 * Gọi trực tiếp Gemini API với API key từ .env
 */
async function testDirectGeminiAPI(text) {
  console.log('🔄 Thử nghiệm gọi trực tiếp Gemini API với API key từ .env...');
  
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Không tìm thấy API key trong file .env');
    }
    
    const response = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{ 
            text: `Extract all collocations (words that commonly go together) from the following text and list them with bullet points, without adding any explanations:\n\n${text}` 
          }]
        }]
      },
      timeout: 30000
    });
    
    console.log('✅ Gọi trực tiếp Gemini API thành công!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi gọi trực tiếp Gemini API:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

/**
 * Kiểm tra API trích xuất collocations
 */
async function testExtraction() {
  console.log('🔍 BẮT ĐẦU KIỂM TRA CHỨC NĂNG TRÍCH XUẤT COLLOCATIONS\n');
  
  for (const [index, test] of testTexts.entries()) {
    console.log(`\n📝 TEST #${index + 1}: ${test.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Văn bản: "${test.text.substring(0, 100)}${test.text.length > 100 ? '...' : ''}"`);
    
    try {
      console.log('🔄 Đang gọi API...');
      const start = Date.now();
      
      const response = await axios.post(API_URL, {
        text: test.text
      });
      
      const duration = Date.now() - start;
      
      if (response.data.success) {
        const { collocations, count } = response.data.data;
        
        console.log('✅ Thành công!');
        console.log(`⏱️ Thời gian xử lý: ${duration}ms`);
        console.log(`📊 Số lượng collocations tìm thấy: ${count}`);
        
        if (count > 0) {
          console.log('📝 Danh sách collocations:');
          collocations.forEach((item, i) => {
            console.log(`   ${i + 1}. ${item}`);
          });
        } else {
          console.log('❌ Không tìm thấy collocations nào.');
        }
      } else {
        console.log(`❌ Lỗi: ${response.data.error}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi gọi API:', error.message);
      if (error.response) {
        console.error('Chi tiết lỗi:', error.response.data);
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  
  console.log('🏁 HOÀN THÀNH KIỂM TRA!\n');
}

/**
 * Kiểm tra tính khả dụng của API
 */
async function checkAPIAvailability() {
  try {
    console.log('🔄 Kiểm tra kết nối đến API...');
    await axios.get('http://localhost:3000');
    console.log('✅ API đang hoạt động!');
    return true;
  } catch (error) {
    console.error('❌ Không thể kết nối đến API. Vui lòng đảm bảo server đang chạy trên cổng 3000.');
    return false;
  }
}

// Chạy các bài kiểm tra
async function runTests() {
  console.log('🤖 GEMINI COLLOCATION AGENT - KIỂM TRA CHỨC NĂNG\n');
  
  // Thử nghiệm gọi trực tiếp Gemini API với API key từ .env
  const directApiSuccess = await testDirectGeminiAPI(testTexts[0].text);
  
  if (directApiSuccess) {
    console.log('✅ API key từ .env hoạt động tốt! Không cần hardcode API key nữa.');
  } else {
    console.log('❌ API key từ .env không hoạt động. Vui lòng kiểm tra lại file .env.');
  }
  
  const isAPIAvailable = await checkAPIAvailability();
  
  if (isAPIAvailable && directApiSuccess) {
    await testExtraction();
  } else {
    console.log('\n❗ Vui lòng khởi động server bằng lệnh "npm start" trước khi chạy kiểm tra.');
  }
}

// Bắt đầu kiểm tra
runTests(); 