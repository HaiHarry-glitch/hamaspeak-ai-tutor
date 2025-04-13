
import React from 'react';

const MethodDiagram: React.FC = () => {
  return (
    <div className="relative">
      <img 
        src="/lovable-uploads/476d0dc7-9eab-42c1-992f-6370251537a2.png" 
        alt="Phương pháp Hamaspeak" 
        className="w-full h-auto rounded-xl shadow-lg"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
      <div className="absolute bottom-4 left-4 right-4 text-center text-white text-shadow">
        <p className="font-bold">Sơ đồ minh họa phương pháp học nói tiếng Anh Hamaspeak</p>
      </div>
    </div>
  );
};

export default MethodDiagram;
