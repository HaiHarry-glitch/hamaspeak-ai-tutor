
import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
  animate?: boolean;
  interactive?: boolean;
}

const HamaspeakLogo = ({ className = "", showText = true, size = 40, animate = true, interactive = false }: LogoProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (animate) {
      const interval = setInterval(() => {
        setSparklePosition({
          x: Math.random() * 20 - 10,
          y: Math.random() * 20 - 10
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animate]);
  
  return (
    <div 
      className={`flex items-center gap-2 ${className} ${interactive ? 'cursor-pointer transform transition-all duration-300 hover:scale-105' : ''}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <div 
        className={`relative rounded-full p-1 bg-gradient-to-r from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal
          ${animate ? 'animate-pulse-glow shadow-lg shadow-hamaspeak-purple/20' : ''}`}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
          {animate && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 dark:to-gray-700/30 animate-spin-slow"></div>
              <div className={`absolute inset-0 bg-gradient-radial from-hamaspeak-blue/10 to-transparent scale-0 
                ${isHovered ? 'scale-100 animate-pulse' : ''} transition-all duration-300`}></div>
            </>
          )}
          <span 
            className={`font-bold text-hamaspeak-purple relative z-10 ${animate ? 'animate-bounce-subtle' : ''}`} 
            style={{ fontSize: size * 0.5 }}
          >
            H
          </span>
        </div>
        
        {animate && (
          <div 
            className="absolute -right-1 -top-1 text-yellow-400 animate-ping-slow"
            style={{ 
              transform: `translate(${sparklePosition.x}px, ${sparklePosition.y}px)`,
              transition: 'transform 1s ease-out'
            }}
          >
            ✨
          </div>
        )}
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
              textShadow: animate ? '0 1px 3px rgba(59, 130, 246, 0.2)' : 'none',
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
              textShadow: animate ? '0 1px 3px rgba(139, 92, 246, 0.2)' : 'none',
            }}
          >
            speak
          </span>
          
          {animate && (
            <>
              <span className="absolute -top-1 -right-3 text-xs text-hamaspeak-teal animate-bounce">✨</span>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-hamaspeak-blue/0 via-hamaspeak-purple/50 to-hamaspeak-teal/0 animate-pulse-glow"></div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HamaspeakLogo;
