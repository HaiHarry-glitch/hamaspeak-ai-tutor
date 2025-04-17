/**
 * Utility functions for collocation extraction
 */
import axios from 'axios';

/**
 * Sanitize and prepare input text
 */
export const sanitizeInput = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove special characters that may cause errors but keep punctuation
  let sanitized = text.trim();
  
  // Remove multiple consecutive empty lines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  return sanitized;
};

/**
 * Format collocations results from Gemini API
 */
export const formatCollocations = (rawText: string): string[] => {
  if (!rawText) return [];
  
  // Split into lines
  const lines = rawText.split('\n');
  
  // Regular expression to recognize various bullet point formats
  // Including: basic bullets, Unicode bullets, numbers, letters
  const bulletRegex = /^[\s]*([•\-*\+◦→⁃⦿⦾⦿⟡⚫⚪✓✔✗✘☑☒☐☑✅❌♦♣♠♥⭐★☆]|\d+\.|\w+\)|\w+\.)/;
  
  // Check if any line has a bullet point
  let hasFoundBullet = false;
  
  let collocations = lines
    .map(line => line.trim())
    .filter(line => {
      // Check if line has a bullet point
      if (bulletRegex.test(line)) {
        hasFoundBullet = true;
        return true;
      }
      return false;
    })
    .map(line => {
      // Remove bullet point, number, letter and leading whitespace
      return line.replace(bulletRegex, '').trim();
    })
    .filter(item => item.length > 0);
  
  // If no bullet points found, try to identify each line as a collocation
  if (!hasFoundBullet && lines.length > 0) {
    collocations = lines
      .map(line => line.trim())
      .filter(line => 
        line.length > 0 && 
        !line.match(/^(collocations|danh sách|examples|ví dụ|from the text|từ đoạn văn)/i)
      );
  }
  
  // Remove duplicates
  return [...new Set(collocations)];
};

/**
 * Detect language of text (simple implementation)
 */
export const detectLanguage = (text: string): 'en' | 'vi' => {
  if (!text) return 'en';
  
  // Check if text contains Vietnamese characters
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  
  if (vietnameseChars.test(text)) {
    return 'vi';
  }
  
  return 'en';
};

/**
 * Create intelligent prompt based on text type and language
 */
export const createPrompt = (text: string, options: { language?: 'en' | 'vi' } = {}): string => {
  const language = options.language || detectLanguage(text);
  
  const promptMap = {
    vi: `Hãy trích xuất tất cả các collocation (cụm từ thường đi với nhau) từ đoạn văn sau đây và liệt kê dưới dạng danh sách có dấu chấm đầu dòng, không thêm bất kỳ giải thích nào:\n\n${text}`,
    en: `Extract all collocations (words that commonly go together) from the following text and list them with bullet points, without adding any explanations:\n\n${text}`
  };
  
  return promptMap[language];
};

export interface CollocationResult {
  collocations: string[];
  count: number;
}

/**
 * Extract collocations using Gemini API
 */
export const extractCollocations = async (text: string, options: { language?: 'en' | 'vi' } = {}): Promise<CollocationResult> => {
  try {
    // Sanitize input
    const sanitizedText = sanitizeInput(text);
    if (!sanitizedText) {
      throw new Error('Invalid input text');
    }
    
    // Create appropriate prompt
    const prompt = createPrompt(sanitizedText, options);
    
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }
    
    // Prepare request URL and data
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const requestData = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    
    // Call Gemini API
    const response = await axios({
      method: 'post',
      url: requestUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: requestData,
      timeout: 20000 // 20 seconds timeout
    });
    
    // Check response structure
    if (!response.data || 
        !response.data.candidates || 
        !response.data.candidates[0] ||
        !response.data.candidates[0].content || 
        !response.data.candidates[0].content.parts || 
        !response.data.candidates[0].content.parts[0].text) {
      throw new Error('Invalid response from Gemini API');
    }
    
    // Extract and format result
    const rawResult = response.data.candidates[0].content.parts[0].text;
    const formattedResult = formatCollocations(rawResult);
    
    return {
      collocations: formattedResult,
      count: formattedResult.length
    };
    
  } catch (error) {
    console.error('Error extracting collocations:', error);
    throw new Error(`Failed to extract collocations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 