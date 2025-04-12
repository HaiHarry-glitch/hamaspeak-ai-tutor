
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const TextInput = () => {
  const { currentText, setCurrentText, analyzeUserText, isAnalyzing } = useStudy();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentText.trim()) {
      setError('Vui lòng nhập nội dung tiếng Anh để học');
      return;
    }

    try {
      await analyzeUserText(currentText);
    } catch (err) {
      setError('Có lỗi xảy ra khi phân tích văn bản. Vui lòng thử lại.');
    }
  };

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bắt đầu học nói tiếng Anh</h2>
        <p className="text-gray-600">
          Nhập đoạn văn tiếng Anh bạn muốn luyện tập. Chúng tôi sẽ phân tích và 
          chia nhỏ thành các cụm từ để bạn luyện tập theo phương pháp 8 bước.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Nhập đoạn văn tiếng Anh bạn muốn luyện tập..."
          rows={6}
          className="w-full mb-4 resize-none"
        />
        
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="glass-button px-6 py-2"
            disabled={isAnalyzing || !currentText.trim()}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Đang phân tích...
              </>
            ) : (
              'Phân tích & Bắt đầu học'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TextInput;
