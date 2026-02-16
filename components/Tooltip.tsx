import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  width?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, width = 'w-64' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {isVisible && (
        <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 ${width} p-3 bg-background-secondary border border-surface rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-xs text-text-secondary z-[9999] text-center animate-in fade-in zoom-in-95 duration-200 pointer-events-none leading-relaxed`}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-background-secondary"></div>
        </div>
      )}
    </div>
  );
};