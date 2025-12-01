
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10", showText = true, textSize = "text-xl" }) => {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Geometric Octagon Background - Islamic Motif */}
        <path
          d="M32 2L53.21 10.79L62 32L53.21 53.21L32 62L10.79 53.21L2 32L10.79 10.79L32 2Z"
          className="text-primary-100"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M32 8L48.97 15.03L56 32L48.97 48.97L32 56L15.03 48.97L8 32L15.03 15.03L32 8Z"
          className="text-primary-200"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Dome Silhouette */}
        <path
          d="M32 18C40.8 18 46 25 46 36V46H18V36C18 25 23.2 18 32 18Z"
          className="text-primary-600"
          fill="currentColor"
        />
        
        {/* Dome Detail Line */}
        <path d="M32 18V24" className="text-white" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M25 46H39" className="text-white" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

        {/* Crescent/Finial Top */}
        <circle cx="32" cy="14" r="2.5" className="text-primary-700" fill="currentColor" />
      </svg>
      
      {showText && (
        <div className={`font-bold text-primary-900 ${textSize} leading-tight`}>
          Pondok<span className="font-light text-primary-600">Manager</span>
        </div>
      )}
    </div>
  );
};
