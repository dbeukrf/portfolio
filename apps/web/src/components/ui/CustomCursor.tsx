import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lineColor, setLineColor] = useState('#000000');

  // Function to get background color at a point
  const getBackgroundColorAtPoint = (x: number, y: number): string => {
    const element = document.elementFromPoint(x, y);
    if (!element) return '#000000';

    let currentElement: Element | null = element;
    let bgColor = 'rgba(0, 0, 0, 0)';

    // Traverse up the DOM tree to find a non-transparent background
    while (currentElement && bgColor === 'rgba(0, 0, 0, 0)') {
      const computedStyle = window.getComputedStyle(currentElement);
      bgColor = computedStyle.backgroundColor;
      
      // If still transparent, check parent
      if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
        currentElement = currentElement.parentElement;
      } else {
        break;
      }
    }

    return bgColor;
  };

  // Function to calculate luminance and determine if background is light or dark
  const getLuminance = (color: string): number => {
    // Parse RGB from rgba or rgb string
    const match = color.match(/\d+/g);
    if (!match || match.length < 3) return 0;

    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Get background color at mouse position
      const bgColor = getBackgroundColorAtPoint(e.clientX, e.clientY);
      const luminance = getLuminance(bgColor);

      // Use white for dark backgrounds, black for light backgrounds
      // Threshold of 0.5 for luminance (0 = black, 1 = white)
      setLineColor(luminance > 0.5 ? '#000000' : '#FFFFFF');
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Horizontal line */}
      <div
        className="fixed top-0 left-0 w-full pointer-events-none z-[9999]"
        style={{
          height: '1.1px',
          backgroundColor: lineColor,
          transform: `translateY(${mousePosition.y}px)`,
        }}
      />
      
      {/* Vertical line */}
      <div
        className="fixed top-0 left-0 h-full pointer-events-none z-[9999]"
        style={{
          width: '1.1px',
          backgroundColor: lineColor,
          transform: `translateX(${mousePosition.x}px)`,
        }}
      />
      
      {/* Rainbow square at intersection */}
      <div
        className="fixed pointer-events-none z-[10000]"
        style={{
          width: '5.5px',
          height: '5.5px',
          backgroundColor: 'hsl(0, 100%, 50%)',
          border: '1px solid #000000',
          left: `${mousePosition.x - 2}px`,
          top: `${mousePosition.y - 2}px`,
          animation: 'rainbow 3s linear infinite',
        }}
      />
      
      <style>{`
        @keyframes rainbow {
          0% { background-color: hsl(0, 100%, 50%); }
          14% { background-color: hsl(30, 100%, 50%); }
          28% { background-color: hsl(60, 100%, 50%); }
          42% { background-color: hsl(120, 100%, 50%); }
          57% { background-color: hsl(180, 100%, 50%); }
          71% { background-color: hsl(240, 100%, 50%); }
          85% { background-color: hsl(270, 100%, 50%); }
          100% { background-color: hsl(0, 100%, 50%); }
        }
      `}</style>
    </>
  );
}

