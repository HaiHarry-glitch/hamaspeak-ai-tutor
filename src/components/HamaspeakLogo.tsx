
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
  animate?: boolean;
}

const HamaspeakLogo = ({ className = "", showText = true, size = 40, animate = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`relative rounded-full p-1 bg-gradient-to-r from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal
          ${animate ? 'animate-pulse-glow' : ''}`}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center overflow-hidden">
          {animate && (
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 animate-spin-slow"></div>
          )}
          <span 
            className={`font-bold text-hamaspeak-purple relative ${animate ? 'animate-bounce-subtle' : ''}`} 
            style={{ fontSize: size * 0.5 }}
          >
            H
          </span>
        </div>
      </div>
      
      {showText && (
        <div className="text-xl font-bold flex relative">
          <span 
            className={`text-hamaspeak-blue ${animate ? 'animate-shimmer' : ''}`}
            style={{
              backgroundImage: animate ? 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)' : '',
              backgroundSize: animate ? '200% auto' : '',
              WebkitBackgroundClip: animate ? 'text' : '',
              WebkitTextFillColor: animate ? 'transparent' : '',
            }}
          >
            Hama
          </span>
          <span 
            className={`text-hamaspeak-purple ${animate ? 'animate-shimmer delay-500' : ''}`}
            style={{
              backgroundImage: animate ? 'linear-gradient(90deg, #8B5CF6 0%, #14B8A6 50%, #8B5CF6 100%)' : '',
              backgroundSize: animate ? '200% auto' : '',
              WebkitBackgroundClip: animate ? 'text' : '',
              WebkitTextFillColor: animate ? 'transparent' : '',
            }}
          >
            speak
          </span>
          
          {animate && (
            <span className="absolute -top-1 -right-3 text-xs text-hamaspeak-teal animate-bounce">✨</span>
          )}
        </div>
      )}
    </div>
  );
};

export default HamaspeakLogo;
