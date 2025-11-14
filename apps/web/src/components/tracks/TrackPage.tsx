import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

export const RAINBOW_COLORS = [
  // '#FF3B30', // red
  // '#FF9500', // orange
  // '#FFCC00', // yellow
  // '#34C759', // green
  // '#007AFF', // blue
  // '#5856D6', // indigo
  // '#AF52DE', // violet
  '#DC136C', // dogwood rose
  '#22577A', // lapis lazuli
  '#57CC99', // emerald
  '#3F2E56', // english violet
  '#F2542D', //cinnabar
  '#0D21A1', // zaffre 
  '#D81E5B', // raspberry
  '#F6E528', // aureolin
] as const;

function getReadableTextColor(hexColor: string): string {
  const sanitized = hexColor.replace('#', '');

  if (sanitized.length !== 6) {
    return '#0b0b0b';
  }

  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;

  const [rLinear, gLinear, bLinear] = [r, g, b].map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4),
  );

  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

  return luminance > 0.55 ? '#0b0b0b' : '#F8F8F8';
}

/**
 * Darkens a hex color by reducing its brightness/value
 * @param hexColor - Hex color string (e.g., '#FF3B30')
 * @param amount - Amount to darken (0-1, where 0.3 = 30% darker)
 * @returns Darkened hex color string
 */
function darkenColor(hexColor: string, amount: number = 0.3): string {
  const sanitized = hexColor.replace('#', '');
  
  if (sanitized.length !== 6) {
    return hexColor;
  }
  
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  
  // Reduce each channel by the amount (multiply by (1 - amount))
  const newR = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
  const newG = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
  const newB = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Converts a hex color to rgba format with specified opacity
 * @param hexColor - Hex color string (e.g., '#FF3B30')
 * @param opacity - Opacity value (0-1, where 0.5 = 50% opacity)
 * @returns RGBA color string
 */
function hexToRgba(hexColor: string, opacity: number = 1): string {
  const sanitized = hexColor.replace('#', '');
  
  if (sanitized.length !== 6) {
    return `rgba(0, 0, 0, ${opacity})`;
  }
  
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export interface TrackPageProps {
  /**
   * The title of the track to display in the header
   */
  title: string;
  
  /**
   * The main content to display in the content area.
   * Can be a string, ReactNode, or any valid React content.
   */
  content: ReactNode;
  
  /**
   * Optional custom styling classes to apply to the root container
   */
  className?: string;
  
  /**
   * Optional custom styling classes to apply to the header
   */
  headerClassName?: string;
  
  /**
   * Optional custom styling classes to apply to the content area
   */
  contentClassName?: string;
  
  /**
   * Optional track number to display
   */
  trackNumber?: number | string;
  
  /**
   * Optional ARIA label for the track page (defaults to title-based label)
   */
  ariaLabel?: string;
  
  /**
   * Optional gradient color index (0-6) to synchronize color changes across all track pages
   */
  gradientColorIndex?: number;
}

/**
 * TrackPage Component
 * 
 * A responsive, accessible component for displaying track content with a header and content area.
 * 
 * Features:
 * - Fully responsive across all screen sizes
 * - Semantic HTML structure
 * - Built-in accessibility features (ARIA labels, roles, landmarks)
 * - Customizable styling via props
 * 
 * @example
 * ```tsx
 * <TrackPage
 *   title="My Track"
 *   content={<p>Track content here</p>}
 *   trackNumber={1}
 * />
 * ```
 */
export default function TrackPage({
  title,
  content,
  className = '',
  headerClassName = '',
  contentClassName = '',
  trackNumber,
  ariaLabel,
  gradientColorIndex = 0,
}: TrackPageProps) {
  // Generate accessible label
  const pageLabel = ariaLabel || (trackNumber ? `Track ${trackNumber}: ${title}` : title);
  const articleRef = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Use the provided gradient color index, ensuring it's within valid range
  const safeIndex = Math.max(0, Math.min(RAINBOW_COLORS.length - 1, Math.floor(gradientColorIndex) || 0));
  
  // Base gradient color (scroll-based, doesn't change on hover)
  const baseGradientColor = RAINBOW_COLORS[safeIndex];
  
  // Toggle filter overlay on/off when hovering
  useEffect(() => {
    if (!isHovered) {
      setIsFilterVisible(false);
      return;
    }

    // Rapidly toggle filter overlay on/off
    const filterInterval = setInterval(() => {
      setIsFilterVisible((prev) => !prev);
    }, 50); // Toggle every 50ms

    return () => {
      clearInterval(filterInterval);
    };
  }, [isHovered]);
  
  // When hovered: title text color matches the base gradient background color
  const titleColor = useMemo(
    () => isHovered ? baseGradientColor : undefined,
    [isHovered, baseGradientColor],
  );
  
  // When hovered: gradient background is darkened by 0.6 brightness
  const gradientColor = useMemo(
    () => isHovered ? darkenColor(baseGradientColor, 0.6) : baseGradientColor,
    [isHovered, baseGradientColor],
  );
  
  const highlightGradient = useMemo(
    () => {
      return `linear-gradient(to right, ${gradientColor} 0%, ${gradientColor} 65%, rgba(0,0,0,0) 100%)`;
    },
    [gradientColor],
  );
  
  const borderColor = gradientColor;
  
  return (
    <article
      ref={articleRef}
      className={`w-full min-h-screen bg-[#0F172A] text-text-primary m-0 p-0 block ${className}`}
      aria-label={pageLabel}
      role="article"
      style={{ 
        display: 'block', 
        margin: 0, 
        padding: 0,
        width: '100%',
        minHeight: '100vh',
        height: '100%'
      }}
    >
      {/* Track Header */}
      <header
        className={`
          w-full
          px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
          flex items-center
          ${headerClassName}
        `}
        role="banner"
        aria-labelledby="track-title"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-end text-right gap-4 w-full">          
          {/* Track Title */}
          <div 
            className="relative inline-block cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
              {/* Gradient background banner */}
            <div
              aria-hidden="true"
              ref={(el) => {
                if (!el) return;
                const container = el.parentElement;
                const titleEl = container?.querySelector('#track-title');
                if (container && titleEl) {
                  const containerRect = container.getBoundingClientRect();
                  const titleRect = titleEl.getBoundingClientRect();
          
                  // Align the gradient with the title's position and height
                  const offsetLeft = titleRect.left - containerRect.left;
                  const offsetTop = titleRect.top - containerRect.top;
                  const titleHeight = titleRect.height;
          
                  el.style.left = `${offsetLeft}px`;
                  el.style.height = `${titleHeight}px`;
                  el.style.top = `${offsetTop}px`;
                }
              }}
              className="absolute inset-0 z-0 rounded-sm border pointer-events-none"
              style={{
                right: 'calc(100% - 100vw)', // extend to the right edge of the screen
                background: highlightGradient,
                borderColor: borderColor,
                transition: 'background 200ms ease, border-color 200ms ease',
              }}
            />
            {/* Filter overlay that toggles on/off when hovering */}
            {isHovered && titleColor && (
              <div
                aria-hidden="true"
                ref={(el) => {
                  if (!el) return;
                  const container = el.parentElement;
                  const titleEl = container?.querySelector('#track-title');
                  if (container && titleEl) {
                    const containerRect = container.getBoundingClientRect();
                    const titleRect = titleEl.getBoundingClientRect();
            
                    // Align the filter overlay with the gradient's position and height (same as gradient)
                    const offsetLeft = titleRect.left - containerRect.left;
                    const offsetTop = titleRect.top - containerRect.top;
                    const titleHeight = titleRect.height;
            
                    el.style.left = `${offsetLeft}px`;
                    el.style.height = `${titleHeight}px`;
                    el.style.top = `${offsetTop}px`;
                  }
                }}
                className="absolute z-20 rounded-md pointer-events-none"
                style={{
                  right: 'calc(100% - 100vw)', // extend to the right edge of the screen (same as gradient)
                  backgroundColor: isFilterVisible ? hexToRgba(titleColor, 0.5) : 'transparent', // 50% opacity for see-through effect
                  transition: 'background-color 150ms ease',
                }}
              />
            )}
            <h1
              id="track-title"
              className="
                relative
                z-10
                inline-block
                text-right
                text-base sm:text-lg md:text-xl lg:text-2xl
                font-semibold sm:font-bold
                leading-tight
                px-2 sm:px-3 md:px-4
                py-1.5 sm:py-2
                text-black
                whitespace-nowrap
                transition-colors duration-150 ease-in-out
                flex items-center
              "
              style={titleColor ? { color: titleColor } : { color: '#000000' }}
            >
              {String(trackNumber).padStart(2, '0')} {title}
            </h1>
          </div>
        </div>
      </header>

      {/* Track Content Area */}
      <main
        className={`
          w-full
          px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
          py-8 sm:py-12 md:py-16 lg:py-20
          ${contentClassName}
        `}
        role="main"
        aria-label={`Content for ${title}`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Content wrapper with proper semantic structure */}
          <div
            className={`
              max-w-none
              text-black
              [&>p]:text-base sm:[&>p]:text-lg md:[&>p]:text-xl
              [&>p]:leading-relaxed
              [&>p]:mb-4 sm:[&>p]:mb-6
              [&>p]:text-black
              [&>h2]:text-2xl sm:[&>h2]:text-3xl md:[&>h2]:text-4xl
              [&>h2]:font-bold
              [&>h2]:mt-8 sm:[&>h2]:mt-10 md:[&>h2]:mt-12
              [&>h2]:mb-4 sm:[&>h2]:mb-6
              [&>h2]:text-black
              [&>h3]:text-xl sm:[&>h3]:text-2xl md:[&>h3]:text-3xl
              [&>h3]:font-semibold
              [&>h3]:mt-6 sm:[&>h3]:mt-8
              [&>h3]:mb-3 sm:[&>h3]:mb-4
              [&>h3]:text-black
              [&>ul]:list-disc
              [&>ul]:pl-6 sm:[&>ul]:pl-8
              [&>ul]:mb-4 sm:[&>ul]:mb-6
              [&>ol]:list-decimal
              [&>ol]:pl-6 sm:[&>ol]:pl-8
              [&>ol]:mb-4 sm:[&>ol]:mb-6
              [&>li]:mb-2
              [&>li]:text-black
              [&>a]:text-primary-500
              [&>a]:hover:text-primary-400
              [&>a]:underline
              [&>a]:transition-colors
              [&>a]:focus:outline-none
              [&>a]:focus:ring-2
              [&>a]:focus:ring-primary-500
              [&>a]:focus:ring-offset-2
              [&>a]:focus:ring-offset-background-dark
              [&>a]:rounded
              [&>img]:rounded-lg
              [&>img]:my-4 sm:[&>img]:my-6
              [&>img]:w-full
              [&>img]:h-auto
              [&>blockquote]:border-l-4
              [&>blockquote]:border-primary-500
              [&>blockquote]:pl-4 sm:[&>blockquote]:pl-6
              [&>blockquote]:italic
              [&>blockquote]:my-4 sm:[&>blockquote]:my-6
              [&>blockquote]:text-text-secondary
              [&>code]:bg-background-light
              [&>code]:px-1 sm:[&>code]:px-2
              [&>code]:py-0.5
              [&>code]:rounded
              [&>code]:text-sm sm:[&>code]:text-base
              [&>code]:text-black
              [&>code]:font-mono
              [&>pre]:bg-background-light
              [&>pre]:p-4 sm:[&>pre]:p-6
              [&>pre]:rounded-lg
              [&>pre]:overflow-x-auto
              [&>pre]:my-4 sm:[&>pre]:my-6
              [&>pre]:text-black
              [&>pre>code]:bg-transparent
              [&>pre>code]:p-0
            `}
          >
            {typeof content === 'string' ? (
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                aria-label={`Track content for ${title}`}
              />
            ) : (
              <div aria-label={`Track content for ${title}`}>
                {content}
              </div>
            )}
          </div>
        </div>
      </main>
    </article>
  );
}

