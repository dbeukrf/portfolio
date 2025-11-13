import { type ReactNode, useEffect, useMemo, useState } from 'react';

const RAINBOW_COLORS = [
  '#FF3B30', // red
  '#FF9500', // orange
  '#FFCC00', // yellow
  '#34C759', // green
  '#007AFF', // blue
  '#5856D6', // indigo
  '#AF52DE', // violet
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
   * Optional subtitle or additional header information
   */
  subtitle?: string;
  
  /**
   * Optional track number to display
   */
  trackNumber?: number | string;
  
  /**
   * Optional ARIA label for the track page (defaults to title-based label)
   */
  ariaLabel?: string;
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
 *   subtitle="Track subtitle"
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
  subtitle,
  trackNumber,
  ariaLabel,
}: TrackPageProps) {
  // Generate accessible label
  const pageLabel = ariaLabel || (trackNumber ? `Track ${trackNumber}: ${title}` : title);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const segmentSize = 120;

    let animationFrameId: number | null = null;

    const updateHighlightFromScroll = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const newIndex =
        Math.floor(scrollY / segmentSize) % RAINBOW_COLORS.length;

      setHighlightIndex((prev) => (prev === newIndex ? prev : newIndex));
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        updateHighlightFromScroll();
        animationFrameId = null;
      });
    };

    updateHighlightFromScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const highlightColor = useMemo(
    () => RAINBOW_COLORS[highlightIndex],
    [highlightIndex],
  );
  const highlightGradient = useMemo(
    () =>
      `linear-gradient(to right, ${highlightColor} 0%, ${highlightColor} 65%, rgba(0,0,0,0) 100%)`,
    [highlightColor],
  );
  
  return (
    <article
      className={`w-full min-h-screen bg-background-dark text-text-primary ${className}`}
      aria-label={pageLabel}
      role="article"
    >
      {/* Track Header */}
      <header
        className={`
          w-full
          px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
          py-8 sm:py-12 md:py-16 lg:py-20
          border-b border-border
          ${headerClassName}
        `}
        role="banner"
        aria-labelledby="track-title"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-end text-right gap-4">
          {/* Track Number (if provided) */}
          {trackNumber !== undefined && (
            <div
              className="text-sm sm:text-base md:text-lg text-text-secondary"
              aria-label={`Track number ${trackNumber}`}
            >
              <span className="sr-only">Track number: </span>
              {trackNumber}
            </div>
          )}
          
          {/* Track Title */}
          <div className="relative w-full overflow-visible flex justify-end">
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
                  const titleHeight = titleRect.height;
          
                  el.style.left = `${offsetLeft}px`;
                  el.style.height = `${titleHeight}px`;
                  el.style.top = `${(containerRect.height - titleHeight) / 2}px`;
                }
              }}
              className="absolute z-0 rounded-md border"
              style={{
                right: 'calc(100% - 100vw)', // extend to the right edge of the screen
                background: highlightGradient,
                borderColor: highlightColor, // border matches the rainbow color
                transition: 'background 350ms ease',
                pointerEvents: 'none',
              }}
            />
            <h1
              id="track-title"
              className="
                relative
                z-10
                inline-block
                text-right
                text-xl sm:text-2xl md:text-3xl lg:text-4xl
                font-semibold sm:font-bold
                leading-tight
                px-3 sm:px-4 md:px-6
                py-3 sm:py-3
                text-text-primary
                whitespace-nowrap
              "
             
            >
              {trackNumber}{title}
            </h1>
          </div>
          
          {/* Subtitle (if provided) */}
          {subtitle && (
            <p
              className="
                text-base sm:text-lg md:text-xl lg:text-2xl
                text-text-secondary
                font-medium
                leading-relaxed
              "
              style={{
                maxWidth: '42rem',
              }}
              aria-label={`Track subtitle: ${subtitle}`}
            >
              {subtitle}
            </p>
          )}
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
              text-text-primary
              [&>p]:text-base sm:[&>p]:text-lg md:[&>p]:text-xl
              [&>p]:leading-relaxed
              [&>p]:mb-4 sm:[&>p]:mb-6
              [&>h2]:text-2xl sm:[&>h2]:text-3xl md:[&>h2]:text-4xl
              [&>h2]:font-bold
              [&>h2]:mt-8 sm:[&>h2]:mt-10 md:[&>h2]:mt-12
              [&>h2]:mb-4 sm:[&>h2]:mb-6
              [&>h2]:text-text-primary
              [&>h3]:text-xl sm:[&>h3]:text-2xl md:[&>h3]:text-3xl
              [&>h3]:font-semibold
              [&>h3]:mt-6 sm:[&>h3]:mt-8
              [&>h3]:mb-3 sm:[&>h3]:mb-4
              [&>h3]:text-text-primary
              [&>ul]:list-disc
              [&>ul]:pl-6 sm:[&>ul]:pl-8
              [&>ul]:mb-4 sm:[&>ul]:mb-6
              [&>ol]:list-decimal
              [&>ol]:pl-6 sm:[&>ol]:pl-8
              [&>ol]:mb-4 sm:[&>ol]:mb-6
              [&>li]:mb-2
              [&>li]:text-text-primary
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
              [&>code]:text-text-primary
              [&>code]:font-mono
              [&>pre]:bg-background-light
              [&>pre]:p-4 sm:[&>pre]:p-6
              [&>pre]:rounded-lg
              [&>pre]:overflow-x-auto
              [&>pre]:my-4 sm:[&>pre]:my-6
              [&>pre]:text-text-primary
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

