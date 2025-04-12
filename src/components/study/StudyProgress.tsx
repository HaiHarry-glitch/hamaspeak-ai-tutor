
import React from 'react';
import { useStudy } from '@/contexts/StudyContext';

const StudyProgress = () => {
  const { currentStep } = useStudy();
  
  const steps = [
    { id: 1, name: 'Luyện nghe' },
    { id: 2, name: 'Luyện nói từng câu' },
    { id: 3, name: 'Điền vào chỗ trống' },
    { id: 4, name: 'Nói hoàn chỉnh' }
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step.id ? 'bg-hamaspeak-purple text-white' : 'bg-gray-200'
              }`}>
                {step.id}
              </div>
              <span className="text-xs mt-2 text-center">{step.name}</span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`h-1 flex-1 ${
                currentStep > step.id ? 'bg-hamaspeak-purple' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StudyProgress;
