import React from 'react';

interface UFLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const UFLogo: React.FC<UFLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 180" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 rounded-md shadow-md border border-white/20"
      >
        <rect width="200" height="180" fill="#000000"/>
        <text 
          x="100" 
          y="84" 
          textAnchor="middle" 
          fontFamily="'JetBrains Mono', monospace" 
          fontWeight="900" 
          fontSize="76" 
          fill="#FFFFFF" 
          letterSpacing="4"
        >
          UF
        </text>
        <rect x="36" y="108" width="128" height="28" fill="#FFFFFF"/>
      </svg>
    </div>
  );
};
