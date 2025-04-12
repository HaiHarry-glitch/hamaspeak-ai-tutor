
import React from 'react';
import { useStudy } from '@/contexts/StudyContext';

const StudyProgress = () => {
  const { currentStep } = useStudy();
  
  const inputSteps = [
    { id: 1, name: 'Nghe cụm từ' },
    { id: 2, name: 'Flashcard' },
    { id: 3, name: 'Luyện phát âm' },
    { id: 4, name: 'Nói từ nghĩa' }
  ];

  const outputSteps = [
    { id: 5, name: 'Điền vào chỗ trống' },
    { id: 6, name: 'Nghe hiểu' },
    { id: 7, name: 'Nói đoạn văn' },
    { id: 8, name: 'Nói hoàn chỉnh' }
  ];

  const allSteps = [...inputSteps, ...outputSteps];

  return (
    <div className="mb-10">
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`bg-hamaspeak-blue/20 text-hamaspeak-blue text-xs font-semibold py-1 px-3 rounded-full ${currentStep <= 4 ? 'animate-pulse' : ''}`}>
            Input
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`bg-hamaspeak-purple/20 text-hamaspeak-purple text-xs font-semibold py-1 px-3 rounded-full ${currentStep > 4 ? 'animate-pulse' : ''}`}>
            Output
          </span>
        </div>
      </div>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute h-1 top-4 left-0 right-0 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep / allSteps.length) * 100)}%` }}
          ></div>
        </div>
        
        {/* Steps */}
        <div className="flex justify-between items-center relative z-10">
          {allSteps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step.id 
                    ? step.id <= 4 
                      ? 'bg-hamaspeak-blue text-white' 
                      : 'bg-hamaspeak-purple text-white' 
                    : 'bg-gray-200'
                } ${currentStep === step.id ? 'scale-110 shadow-lg' : ''}`}
              >
                {step.id}
              </div>
              <span className="text-xs mt-2 text-center max-w-20 leading-tight">
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyProgress;
