import React, { useEffect } from 'react';

/**
 * SplashScreen Component
 * 
 * Usage:
 * import SplashScreen from '@/components/SplashScreen';
 * 
 * // In your component:
 * <SplashScreen />
 * 
 * // Or with custom className:
 * <SplashScreen className="custom-class" />
 */

interface SplashScreenProps {
  className?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ className = '' }) => {
  useEffect(() => {
    // Add the pulse animation CSS to the document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`w-full h-screen flex items-center justify-center overflow-hidden bg-white ${className}`}
      style={{ borderRadius: '8px' }}
    >
      <img
        src="/electron-vite.animate.svg"
        alt="Logo"
        className="w-[100px] h-[100px]"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
    </div>
  );
};

export default SplashScreen; 