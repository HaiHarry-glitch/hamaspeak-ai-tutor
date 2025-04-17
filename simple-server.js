const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS với cấu hình cụ thể hơn
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Phục vụ file HTML từ thư mục gốc
app.use(express.static(__dirname, {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.html')) {
      res.set('Content-Type', 'text/html');
    }
  }
}));

// Test route
app.get('/test-route', (req, res) => {
  res.send('Server is working properly!');
});

// Route cho trang chủ index.html
app.get('/', (req, res) => {
  console.log('Serving index.html from:', path.join(__dirname, 'index.html'));
  
  // Kiểm tra file tồn tại trước khi gửi
  if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    console.log('File index.html NOT FOUND! Falling back to test.html');
    if (fs.existsSync(path.join(__dirname, 'test.html'))) {
      res.sendFile(path.join(__dirname, 'test.html'));
    } else {
      res.status(404).send('Landing page not found');
    }
  }
});

// Route cho trang test
app.get('/test.html', (req, res) => {
  console.log('Serving test.html from:', path.join(__dirname, 'test.html'));
  
  // Kiểm tra file tồn tại trước khi gửi
  if (fs.existsSync(path.join(__dirname, 'test.html'))) {
    res.sendFile(path.join(__dirname, 'test.html'));
  } else {
    res.status(404).send('File test.html not found');
  }
});

// Nhiều route cho trang pronunciation test
app.get('/pronunciation', (req, res) => {
  console.log('Serving pronunciation-test.html from:', path.join(__dirname, 'pronunciation-test.html'));
  
  // Kiểm tra file tồn tại trước khi gửi
  if (fs.existsSync(path.join(__dirname, 'pronunciation-test.html'))) {
    res.sendFile(path.join(__dirname, 'pronunciation-test.html'));
  } else {
    res.status(404).send('File pronunciation-test.html not found');
  }
});

// Route cho trang pronunciation đơn giản
app.get('/simple', (req, res) => {
  console.log('Serving simple-pronunciation.html from:', path.join(__dirname, 'simple-pronunciation.html'));
  
  // Kiểm tra file tồn tại trước khi gửi
  if (fs.existsSync(path.join(__dirname, 'simple-pronunciation.html'))) {
    console.log('File simple-pronunciation.html exists, sending file...');
    res.sendFile(path.join(__dirname, 'simple-pronunciation.html'));
  } else {
    console.log('File simple-pronunciation.html NOT FOUND!');
    res.status(404).send('File simple-pronunciation.html not found');
  }
});

// Thêm route trực tiếp cho simple-pronunciation.html
app.get('/simple-pronunciation.html', (req, res) => {
  console.log('Serving from direct simple-pronunciation.html route');
  if (fs.existsSync(path.join(__dirname, 'simple-pronunciation.html'))) {
    res.sendFile(path.join(__dirname, 'simple-pronunciation.html'));
  } else {
    res.status(404).send('File simple-pronunciation.html not found');
  }
});

// Thêm route không có dấu / ở cuối
app.get('/pronunciation-test.html', (req, res) => {
  console.log('Serving from direct pronunciation-test.html route');
  res.sendFile(path.join(__dirname, 'pronunciation-test.html'));
});

// Endpoint xử lý phân tích phát âm với file audio (giữ nguyên route ban đầu nhưng cải thiện xử lý lỗi)
app.post('/api/pronunciation/analyze', upload.single('audio'), (req, res) => {
  try {
    console.log('Received analyze request with audio');
    console.log('Request body:', req.body);
    
    // Kiểm tra có file audio không (nếu không có vẫn tiếp tục xử lý)
    if (req.file) {
      console.log('Received audio file:', req.file.originalname || 'unnamed', 'size:', req.file.size, 'bytes');
    } else {
      console.log('No audio file received, continuing with text-only analysis');
    }
    
    // Lấy text từ request
    const text = req.body.text || 'Default text for analysis';
    console.log(`Analyzing text: "${text}"`);
    
    // Tạo mock response
    const wordScores = createWordScores(text);
    
    // Tạo response theo định dạng giống như server.js
    const response = {
      overallScore: Math.round(Math.random() * 30 + 70),
      fluencyScore: Math.round(Math.random() * 30 + 70),
      accuracyScore: Math.round(Math.random() * 30 + 70),
      prosodyScore: Math.round(Math.random() * 30 + 70),
      wordScores: wordScores,
      feedback: [
        "Your pronunciation is generally clear and understandable.",
        "Try to focus on the stress of longer words.",
        "Your intonation patterns could be improved for questions."
      ]
    };
    
    // Thêm delay để giả lập thời gian phân tích
    setTimeout(() => {
      res.json(response);
    }, 500);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Endpoint chỉ xử lý text
app.post('/api/pronunciation/analyze-text', express.json(), (req, res) => {
  try {
    console.log('Received text-only analysis request');
    console.log('Request body:', req.body);
    
    // Lấy text từ request
    const text = req.body.text || 'Default text for analysis';
    console.log(`Analyzing text: "${text}"`);
    
    // Tạo mock response
    const wordScores = createWordScores(text);
    
    // Tạo response theo định dạng giống như server.js
    const response = {
      overallScore: Math.round(Math.random() * 30 + 70),
      fluencyScore: Math.round(Math.random() * 30 + 70),
      accuracyScore: Math.round(Math.random() * 30 + 70),
      prosodyScore: Math.round(Math.random() * 30 + 70),
      wordScores: wordScores,
      feedback: [
        "Your pronunciation is generally clear and understandable.",
        "Try to focus on the stress of longer words.",
        "Your intonation patterns could be improved for questions."
      ]
    };
    
    // Thêm delay để giả lập thời gian phân tích
    setTimeout(() => {
      res.json(response);
    }, 500);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Hàm tạo kết quả cho từng từ
function createWordScores(text) {
  // Tách text thành các từ
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  if (words.length === 0) {
    return [{ 
      word: "sample", 
      score: 80, 
      startTime: 0, 
      endTime: 1,
      phonemeScores: "sample".split('').map(char => ({
        phoneme: char,
        score: Math.round(Math.random() * 30 + 70)
      }))
    }];
  }
  
  // Tạo score cho từng từ
  return words.map(word => ({
    word: word,
    score: Math.round(Math.random() * 30 + 70),
    startTime: 0,
    endTime: 1,
    phonemeScores: word.split('').map(char => ({
      phoneme: char,
      score: Math.round(Math.random() * 30 + 70)
    }))
  }));
}

// Thêm error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Something broke on the server!');
});

// Thêm 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).send(`Not Found: ${req.url}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`Test route: http://localhost:${PORT}/test-route`);
  console.log(`Pronunciation test: http://localhost:${PORT}/pronunciation`);
}); 