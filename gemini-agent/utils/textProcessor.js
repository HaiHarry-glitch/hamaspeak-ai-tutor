/**
 * Xử lý văn bản đầu vào và kết quả cho Gemini Collocation Agent
 */

/**
 * Vệ sinh và chuẩn bị văn bản đầu vào
 */
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Loại bỏ ký tự đặc biệt có thể gây lỗi nhưng giữ dấu câu
  let sanitized = text.trim();
  
  // Loại bỏ nhiều dòng trống liên tiếp
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  return sanitized;
};

/**
 * Định dạng kết quả collocations từ Gemini API
 */
const formatCollocations = (rawText) => {
  if (!rawText) return [];
  
  // Tách các dòng
  const lines = rawText.split('\n');
  
  // Biểu thức chính quy nhận dạng nhiều loại dấu đầu dòng
  // Bao gồm: dấu bullet cơ bản, dấu bullet Unicode, số, chữ cái
  const bulletRegex = /^[\s]*([•\-*\+◦→⁃⦿⦾⦿⟡⚫⚪✓✔✗✘☑☒☐☑✅❌♦♣♠♥⭐★☆]|\d+\.|\w+\)|\w+\.)/;
  
  // Kiểm tra xem có dòng nào có dấu bullet không
  let hasFoundBullet = false;
  
  let collocations = lines
    .map(line => line.trim())
    .filter(line => {
      // Kiểm tra nếu dòng có dấu bullet
      if (bulletRegex.test(line)) {
        hasFoundBullet = true;
        return true;
      }
      return false;
    })
    .map(line => {
      // Loại bỏ dấu bullet, số, chữ cái và khoảng trắng đầu dòng
      return line.replace(bulletRegex, '').trim();
    })
    .filter(item => item.length > 0);
  
  // Nếu không tìm thấy dòng nào có dấu bullet, thử xác định mỗi dòng là một collocation
  if (!hasFoundBullet && lines.length > 0) {
    collocations = lines
      .map(line => line.trim())
      .filter(line => 
        line.length > 0 && 
        !line.match(/^(collocations|danh sách|examples|ví dụ|from the text|từ đoạn văn)/i)
      );
  }
  
  // Loại bỏ các mục trùng lặp
  return [...new Set(collocations)];
};

/**
 * Phát hiện ngôn ngữ của văn bản (đơn giản)
 */
const detectLanguage = (text) => {
  if (!text) return 'en';
  
  // Kiểm tra nếu có các ký tự tiếng Việt đặc trưng
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  
  if (vietnameseChars.test(text)) {
    return 'vi';
  }
  
  return 'en';
};

module.exports = {
  sanitizeInput,
  formatCollocations,
  detectLanguage
}; 