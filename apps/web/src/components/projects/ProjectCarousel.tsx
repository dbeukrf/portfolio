import { useState, useRef, useEffect } from 'react';

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  githubUrl?: string;
  technologies?: string[];
}

interface ProjectCarouselProps {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Ensure we have at least 4 projects by duplicating if needed
  const displayProjects = projects.length >= 4 
    ? projects 
    : [...projects, ...projects, ...projects, ...projects].slice(0, 4);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayProjects.length) % displayProjects.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
  };

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setOffsetX(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setOffsetX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 80;
    const currentOffset = offsetX; // Store before resetting
    const shouldChange = Math.abs(currentOffset) > threshold;
    
    if (shouldChange) {
      // Reset offset and dragging state first
      setOffsetX(0);
      setIsDragging(false);
      
      // Then change index - this will trigger the snap animation
      if (currentOffset > 0) {
        setCurrentIndex((prev) => (prev - 1 + displayProjects.length) % displayProjects.length);
      } else {
        setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
      }
    } else {
      // Just reset if threshold not met
      setIsDragging(false);
      setOffsetX(0);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
      const handleGlobalMouseUp = () => handleDragEnd();
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startX]);

  // Calculate the transform for each card
  const getCardTransform = (index: number) => {
    // Calculate relative position from current index
    let relativeIndex = index - currentIndex;
    
    // Handle wrapping for continuous carousel
    if (relativeIndex > displayProjects.length / 2) {
      relativeIndex -= displayProjects.length;
    } else if (relativeIndex < -displayProjects.length / 2) {
      relativeIndex += displayProjects.length;
    }

    // Base offset: center card is at 0, each card is 520px apart (larger gap for bigger cards)
    const baseOffset = relativeIndex * 520;
    
    // Apply drag offset to all cards for smooth dragging
    // Only apply drag offset when actively dragging
    const dragOffset = isDragging ? offsetX : 0;
    
    const totalOffset = baseOffset + dragOffset;

    // Calculate scale and opacity for peek effect
    // Show center card + 2 cards on each side faintly visible (4 projects total visible)
    const distance = Math.abs(relativeIndex);
    let scale = 1;
    let opacity = 1;
    
    if (distance === 0) {
      // Center card - fully visible
      scale = 1;
      opacity = 1;
    } else if (distance === 1) {
      // Immediate previous and next cards - faintly visible (peek effect)
      scale = 0.75;
      opacity = 0.3;
    } else if (distance === 2) {
      // Cards further out - very faint
      scale = 0.65;
      opacity = 0.15;
    } else {
      // Cards too far - hidden
      scale = 0.6;
      opacity = 0;
    }

    // Calculate z-index (center card on top)
    const zIndex = displayProjects.length - distance;

    return {
      transform: `translateX(${totalOffset}px) scale(${scale})`,
      transformOrigin: 'center center',
      opacity,
      zIndex,
    };
  };

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        padding: '0 0 1rem 0',
        overflow: 'hidden',
        minHeight: '800px',
      }}
    >
      <div
        ref={carouselRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '800px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayProjects.map((project, index) => {
          const { transform, opacity, zIndex } = getCardTransform(index);
          
          return (
            <div
              key={`${project.id}-${index}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '480px',
                height: '750px',
                marginLeft: '-240px',
                marginTop: '-375px',
                transform,
                opacity,
                zIndex,
                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
                pointerEvents: index === currentIndex ? 'auto' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                borderRadius: '12px',
                overflow: 'visible',
              }}
            >
              <h3
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  margin: '1.25rem 1.25rem 0.75rem',
                  color: '#000000',
                }}
              >
                {project.title}
              </h3>
              
              <div
                style={{
                  width: '100%',
                  maxHeight: '520px',
                  minHeight: '250px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  margin: '0.75rem 0 0.5rem 0',
                }}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '520px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
              
              <p
                style={{
                  margin: '0.5rem 1.25rem 0.75rem',
                  fontSize: '1rem',
                  color: '#374151',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {project.description}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#000000',
                      textDecoration: 'none',
                      fontWeight: 700,
                      marginTop: '0.25rem',
                      transition: 'opacity 0.2s, text-decoration 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    <span>Learn more</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ display: 'inline-block' }}
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}
              </p>

              {project.technologies && project.technologies.length > 0 && (
                <div
                  style={{
                    margin: '0.75rem 1.25rem 0.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  {project.technologies.map((tech, i) => (
                    <img
                      key={i}
                      src={tech}
                      alt={`Technology ${i + 1}`}
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        objectFit: 'contain',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Dots indicator inside card */}
              {displayProjects.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '1.5rem',
                    marginBottom: '1rem',
                    justifyContent: 'center',
                  }}
                >
                  {displayProjects.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => setCurrentIndex(dotIndex)}
                      style={{
                        width: dotIndex === currentIndex ? '32px' : '12px',
                        height: '10px',
                        borderRadius: '4px',
                        border: 'none',
                        background: dotIndex === currentIndex ? '#A4A4A4' : '#d1d5db',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        padding: 0,
                        outline: 'none',
                      }}
                      onFocus={(e) => e.currentTarget.style.outline = 'none'}
                      onBlur={(e) => e.currentTarget.style.outline = 'none'}
                      aria-label={`Go to project ${dotIndex + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {displayProjects.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              zIndex: 100,
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            aria-label="Previous project"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ color: '#374151' }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              zIndex: 100,
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
            aria-label="Next project"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ color: '#374151' }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

    </div>
  );
}
