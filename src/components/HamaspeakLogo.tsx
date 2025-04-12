
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

const HamaspeakLogo = ({ className = "", showText = true, size = 40 }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative rounded-full p-1 bg-gradient-to-r from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
          <span className="font-bold text-hamaspeak-purple" style={{ fontSize: size * 0.5 }}>
            H
          </span>
        </div>
      </div>
      
      {showText && (
        <div className="text-xl font-bold flex">
          <span className="text-hamaspeak-blue">Hama</span>
          <span className="text-hamaspeak-purple">speak</span>
        </div>
      )}
    </div>
  );
};

export default HamaspeakLogo;
