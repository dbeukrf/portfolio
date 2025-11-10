import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../data/tracks';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaPlay, FaRandom, FaUserPlus } from 'react-icons/fa';
import Shuffle from '../components/ui/Shuffle';

export default function AlbumView() {
  // Scrolling state
  const [heroHeight, setHeroHeight] = useState<number>(0);
  const [controlsHeight, setControlsHeight] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0); // 0..1 overall scroll progress
  const [clipPathReveal, setClipPathReveal] = useState<number>(0); // Reveal value for clipPath (0..1)
  const [contentVisible, setContentVisible] = useState<boolean>(false); // Track content visibility
  const [viewportHeight, setViewportHeight] = useState<number>(0); // Viewport height for calculations
  const [manualRevealProgress, setManualRevealProgress] = useState<number>(0); // Manual reveal progress during reveal phase

  // Refs
  const heroRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const announceRef = useRef<HTMLDivElement | null>(null);
  const maxScrollTopRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const prevScrollProgressRef = useRef<number>(0);
  const prevRevealRef = useRef<number>(0); // Track previous reveal value to prevent expansion when scrolling up
  const maxRevealReachedRef = useRef<number>(0); // Track maximum reveal reached to ensure scrolling up only shrinks

  // Compute hero height
  useEffect(() => {
    const compute = () => {
      const heroH = heroRef.current?.offsetHeight ?? 0;
      setHeroHeight(heroH);
    };
    
    const timeoutId = setTimeout(compute, 0);
    window.addEventListener('resize', compute);
    
    const observer = new ResizeObserver(compute);
    const checkAndObserve = () => {
      if (heroRef.current) {
        observer.observe(heroRef.current);
      } else {
        requestAnimationFrame(checkAndObserve);
      }
    };
    checkAndObserve();
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', compute);
      observer.disconnect();
    };
  }, []);

  // Compute controls height (progress + buttons)
  useEffect(() => {
    const compute = () => {
      const controlsH = controlsRef.current?.offsetHeight ?? 0;
      setControlsHeight(controlsH);
    };
    
    const timeoutId = setTimeout(compute, 0);
    window.addEventListener('resize', compute);
    
    const observer = new ResizeObserver(compute);
    const checkAndObserve = () => {
      if (controlsRef.current) {
        observer.observe(controlsRef.current);
      } else {
        requestAnimationFrame(checkAndObserve);
      }
    };
    checkAndObserve();
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', compute);
      observer.disconnect();
    };
  }, []);

  // Update viewport height
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  // Handle wheel events to control parallax reveal during reveal phase
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current) return;
      
      const vh = window.innerHeight;
      const revealDistance = vh * 1.5;
      const scrollTop = scrollContainerRef.current.scrollTop;
      
      // During reveal phase, control reveal manually for both directions
      if (scrollTop < revealDistance) {
        // Scrolling down: expand reveal
        if (manualRevealProgress < 1 && e.deltaY > 0) {
          e.preventDefault();
          
          setManualRevealProgress((prev) => {
            const delta = e.deltaY;
            const newProgress = Math.max(0, Math.min(1, prev + delta / revealDistance));
            
            // Once reveal completes, allow normal scrolling by setting scroll position
            if (newProgress >= 1 && scrollTop < revealDistance) {
              setTimeout(() => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTop = revealDistance;
                }
              }, 0);
            }
            
            return newProgress;
          });
        }
        // Scrolling up: shrink reveal
        else if (manualRevealProgress > 0 && e.deltaY < 0) {
          e.preventDefault();
          
          setManualRevealProgress((prev) => {
            const delta = Math.abs(e.deltaY);
            const newProgress = Math.max(0, Math.min(1, prev - delta / revealDistance));
            
            // Sync scroll position with reveal progress when shrinking
            if (scrollContainerRef.current) {
              const targetScrollTop = newProgress * revealDistance;
              scrollContainerRef.current.scrollTop = targetScrollTop;
            }
            
            return newProgress;
          });
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [manualRevealProgress]);

  // Handle scroll to create parallax effect
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const scrollTop = scrollContainerRef.current.scrollTop;
      const vh = window.innerHeight;
      const revealDistance = vh * 1.5;
      const prevScrollTop = prevScrollTopRef.current;
      const isScrollingUp = scrollTop < prevScrollTop;
      
      // Track maximum scroll position reached
      if (scrollTop > maxScrollTopRef.current) {
        maxScrollTopRef.current = scrollTop;
      }
      
      // Calculate reveal: expands from center when scrolling down, shrinks when scrolling up (in specific conditions)
      let reveal: number;
      
      // Calculate shrink distance for first track (used for smooth transition)
      const contentScrollMax = scrollContainerRef.current?.scrollHeight ?? 0;
      const maxContentScroll = contentScrollMax - vh - revealDistance;
      const shrinkDistance = Math.min(maxContentScroll * 0.1, revealDistance * 0.3); // Shrink over first 10% of content or 30% of reveal distance
      
      if (scrollTop < revealDistance) {
        // During reveal phase (album header and track list view)
        const scrollBasedReveal = Math.max(0, Math.min(1, scrollTop / revealDistance));
        
        if (isScrollingUp) {
          // Scrolling up: continue shrinking from first track
          // Use the same shrinkDistance mapping for smooth transition
          // Map scrollTop from [revealDistance - shrinkDistance, revealDistance] to reveal [0, 1]
          // When scrollTop = revealDistance, reveal = 1 (matches first track boundary)
          // When scrollTop = revealDistance - shrinkDistance, reveal = 0 (fully shrunk)
          const scrollBack = revealDistance - scrollTop; // Distance from revealDistance going up
          let calculatedReveal: number;
          
          if (scrollBack >= 0 && scrollBack <= shrinkDistance && shrinkDistance > 0) {
            // Smoothly map from [0, shrinkDistance] to [1, 0] for reveal
            // When scrollBack = 0 (at revealDistance): reveal = 1
            // When scrollBack = shrinkDistance: reveal = 0
            calculatedReveal = Math.max(0, Math.min(1, 1 - (scrollBack / shrinkDistance)));
          } else if (scrollBack > shrinkDistance) {
            // Beyond shrink distance going up: fully shrunk
            calculatedReveal = 0;
          } else {
            // At or past revealDistance: fully expanded
            calculatedReveal = 1;
          }
          
          // Ensure reveal never increases when scrolling up (only shrinks)
          reveal = Math.min(calculatedReveal, maxRevealReachedRef.current);
          setManualRevealProgress(reveal);
        } else {
          // Scrolling down: reveal increases from 0 to 1
          // Use manual progress when it's ahead of scroll-based reveal (wheel-controlled)
          if (manualRevealProgress > scrollBasedReveal) {
            reveal = manualRevealProgress;
          } else {
            reveal = scrollBasedReveal;
            setManualRevealProgress(scrollBasedReveal);
          }
        }
      } else {
        // Past reveal distance: check if we're on first track
        const contentScroll = scrollTop - revealDistance;
        const currentScrollProgress = maxContentScroll > 0 
          ? Math.max(0, Math.min(1, contentScroll / maxContentScroll)) 
          : 0;
        
        // Check if we're on first track (scrollProgress is 0 or very small)
        const isOnFirstTrack = currentScrollProgress < 0.1;
        
        if (isScrollingUp && isOnFirstTrack) {
          // Scrolling up on first track: at top of first track (scrollTop = revealDistance), background is fully expanded (reveal = 1)
          // As user scrolls up from revealDistance, background shrinks
          // Map scrollTop from [revealDistance - shrinkDistance, revealDistance] to reveal [0, 1]
          // When scrollTop = revealDistance, reveal = 1 (fully expanded - at top of first track)
          // When scrollTop = revealDistance - shrinkDistance, reveal = 0 (fully shrunk)
          const scrollBack = revealDistance - scrollTop; // Distance from revealDistance going up
          let calculatedReveal: number;
          
          if (scrollBack >= 0 && scrollBack <= shrinkDistance && shrinkDistance > 0) {
            // Smoothly map from [0, shrinkDistance] to [1, 0] for reveal
            // When scrollBack = 0 (at revealDistance): reveal = 1
            // When scrollBack = shrinkDistance: reveal = 0
            // As scrollBack increases (scrolling up), reveal decreases
            calculatedReveal = Math.max(0, Math.min(1, 1 - (scrollBack / shrinkDistance)));
          } else if (scrollBack > shrinkDistance) {
            // Beyond shrink distance going up: fully shrunk
            calculatedReveal = 0;
          } else {
            // At or past revealDistance: fully expanded (at top of first track)
            calculatedReveal = 1;
          }
          
          // Ensure reveal never increases when scrolling up (only shrinks)
          reveal = Math.min(calculatedReveal, maxRevealReachedRef.current);
        } else if (isOnFirstTrack) {
          // Scrolling down on first track: keep reveal at 1 (fully expanded)
          reveal = 1;
        } else {
          // Not on first track: keep reveal at 1 (fully expanded)
          reveal = 1;
        }
      }
      
      // Update previous scroll position
      prevScrollTopRef.current = scrollTop;
      
      // Throttle updates using requestAnimationFrame for smoother animation
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          // Update clipPath reveal - expands from center when scrolling down, shrinks when scrolling up
          setClipPathReveal(reveal);
          
          // Store reveal value for next frame to prevent expansion when scrolling up
          prevRevealRef.current = reveal;
          
          // Track maximum reveal reached (always update when reveal increases)
          // This ensures scrolling up can only shrink from the maximum reached
          if (reveal > maxRevealReachedRef.current) {
            maxRevealReachedRef.current = reveal;
          }
          
          // Reset max reveal when we reach the top (scrollTop = 0) to allow fresh expansion
          if (scrollTop === 0) {
            maxRevealReachedRef.current = 0;
          }
          
          // Phase 2: Content becomes visible after reveal completes
          if (reveal >= 1 && scrollTop >= revealDistance) {
            setContentVisible(true);
            
            // Calculate scroll progress for content (starts after reveal phase)
            const contentScroll = scrollTop - revealDistance;
            const contentScrollMax = scrollContainerRef.current?.scrollHeight ?? 0;
            const maxContentScroll = contentScrollMax - vh - revealDistance;
            
            // Simple linear scroll progress calculation - works for both directions
            const newScrollProgress = maxContentScroll > 0 
              ? Math.max(0, Math.min(1, contentScroll / maxContentScroll)) 
              : 0;
            
            setScrollProgress(newScrollProgress);
            prevScrollProgressRef.current = newScrollProgress;
          } else {
            setContentVisible(false);
            // Use reveal progress during reveal phase
            setScrollProgress(reveal);
            prevScrollProgressRef.current = reveal;
          }
          
          rafId = null;
        });
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll as any);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [manualRevealProgress]);

  // Hide body scrollbar while this view is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setManualRevealProgress(0);
    }
  };

  const scrollToTrack = (trackIndex: number) => {
    if (!scrollContainerRef.current) return;
    
    const vh = viewportHeight || window.innerHeight;
    const revealDistance = vh * 1.5;
    
    // Calculate scroll position for the track
    // Each track is min-h-screen, so we need to scroll to revealDistance + (trackIndex * vh)
    // For the first track (Education), add an offset so it appears lower in the viewport
    const offset = trackIndex === 0 ? vh * 0.25 : 0; // First track appears 25% lower
    const trackScrollPosition = revealDistance + (trackIndex * vh) + offset;
    
    // First, ensure reveal is complete if we're not past revealDistance
    const currentScrollTop = scrollContainerRef.current.scrollTop;
    if (currentScrollTop < revealDistance) {
      // Complete the reveal first, then scroll to track
      scrollContainerRef.current.scrollTo({ top: revealDistance, behavior: 'smooth' });
      
      // Wait for reveal to complete, then scroll to track
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: trackScrollPosition, behavior: 'smooth' });
        }
      }, 500); // Adjust timing based on reveal animation
    } else {
      // Already past reveal, just scroll to track
      scrollContainerRef.current.scrollTo({ top: trackScrollPosition, behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="h-screen w-screen overflow-y-scroll overflow-x-hidden bg-[#0f0f0f]"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Accessibility live region */}
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Hero Section with Album Artwork - Fixed at top */}
      <div ref={heroRef} className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#1f2937] to-[#6b7280] flex flex-row items-center gap-2 md:gap-6 px-4 md:px-8 py-2 md:py-4" style={{ maxHeight: '30vh' }}>

        {/* Album cover image */}
        <img
          src="/images/album-cover.jpg"
          alt="Album cover"
          className="w-16 h-16 md:w-32 md:h-32 object-cover shadow-2xl rounded relative z-10 cursor-pointer flex-shrink-0"
          onClick={scrollToTop}
        />

        {/* Album title and description */}
        <div className="text-left flex-1 relative z-10 min-w-0 flex flex-col justify-center overflow-visible">
          {/* Title section - only as wide as content */}
          <div className="min-w-0">
            <Shuffle
              tag="p"
              className="text-xs md:text-sm font-semibold text-white/70 mb-0.5 md:mb-2"
              text="Album"
              duration={0.35}
              animationMode="evenodd"
              triggerOnHover
              triggerOnce={false}
              threshold={0}
              rootMargin="0px"
              textAlign="left"
            />
            <Shuffle
              tag="h1"
              className="text-sm md:text-3xl font-extrabold text-white mb-0.5 md:mb-2 leading-tight truncate"
              text="City, Country - Weather"
              duration={0.5}
              animationMode="evenodd"
              triggerOnHover
              triggerOnce={false}
              threshold={0}
              rootMargin="0px"
              textAlign="left"
            />
          </div>
          
          {/* Description */}
          <Shuffle
            tag="p"
            className="text-white/80 mb-0 md:mb-0 text-xs md:text-sm truncate"
            text="Diego Beuk • 2025 • 6 songs, 11 min"
            duration={0.4}
            animationMode="random"
            triggerOnHover
            triggerOnce
            threshold={0}
            rootMargin="0px"
            textAlign="left"
          />
        </div>

        {/* Contact info - Right side */}
        <div className="flex flex-col items-end justify-center gap-1 md:gap-2 text-white text-xs md:text-sm flex-shrink-0 relative z-10">
          {/* Email and Phone */}
          <div className="flex flex-col items-end space-y-0 md:space-y-1">
            <Shuffle tag="span" className="text-xs md:text-xs truncate" text="beuk.diego@gmail.com" duration={0.35} triggerOnHover triggerOnce threshold={0} rootMargin="0px" textAlign="right" />
            <Shuffle tag="span" className="text-xs md:text-xs" text="+61 448 092 338" duration={0.35} triggerOnHover triggerOnce threshold={0} rootMargin="0px" textAlign="right" />
          </div>

          {/* LinkedIn and GitHub icons - Below text */}
          <div className="flex space-x-2 md:space-x-3.5">
            <a
              href="https://www.linkedin.com/in/diego-beuk-8a9100288/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded flex-shrink-0"
              aria-label="Diego Beuk LinkedIn profile"
            >
              <FaLinkedin size={14} className="md:w-[25px] md:h-[25px]" color="white" />
            </a>
            <a
              href="https://github.com/dbeukrf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded flex-shrink-0"
              aria-label="Diego Beuk Github profile"
            >
              <FaGithub size={14} className="md:w-[25px] md:h-[25px]" color="white" />
            </a>
          </div>
        </div>
      </div>

      {/* Progress indicator and Action Buttons - Combined for mobile */}
      <div ref={controlsRef} className="sticky z-40 w-full bg-transparent" style={{ top: `${heroHeight}px` }}>
        {/* Action Buttons above Track List */}
        <div className="flex items-center gap-2 md:gap-4 px-4 md:px-8 py-4 md:py-6">
          {/* Play Button */}
          <div className="relative group">
            <button className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
              <FaPlay size={14} className="md:w-4 md:h-4" />
            </button>
            {/* Tooltip */}
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Play
            </span>
          </div>

          {/* Shuffle Button */}
          <div className="relative group">
            <button className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
              <FaRandom size={14} className="md:w-4 md:h-4" />
            </button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Shuffle
            </span>
          </div>

          {/* Invite Collaborator Button */}
          <div className="relative group">
            <button className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
              <FaUserPlus size={14} className="md:w-4 md:h-4" />
            </button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Invite Collaborator
            </span>
          </div>
        </div>
      </div>

      {/* Track List Section */}
      <div 
        className="sticky z-40 bg-transparent w-full overflow-hidden"
        style={{ 
          top: `${heroHeight + controlsHeight}px`,
          height: `calc(100vh - ${heroHeight + controlsHeight}px)`,
          maxHeight: `calc(100vh - ${heroHeight + controlsHeight}px)`
        }}
      >
        <div 
          className="h-full flex flex-col px-4 md:px-8 max-w-[1600px] mx-auto overflow-y-auto"
          style={{
            paddingTop: '0.25rem',
            paddingBottom: '0.25rem'
          }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 text-white/70 text-xs md:text-sm font-semibold border-b border-white/20 pb-1 md:pb-2 mb-1 md:mb-2 px-2 md:px-4 flex-shrink-0">
            <div className="col-span-1 text-middle">#</div>
            <div className="col-span-6 text-middle">Title</div>
            <div className="col-span-3 text-middle hidden sm:block">Artist</div>
            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 md:w-4 md:h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-1 md:space-y-2 flex-1 min-h-0">
            {TRACKS.map((track, index) => {
              const isAIDJ = track.id === 'aiDj';
              const totalSeconds = track.duration || 0;
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = String(totalSeconds % 60).padStart(2, '0');
              const formattedDuration = `${minutes}:${seconds}`;

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 items-center text-white hover:bg-white/5 rounded-lg px-2 md:px-4 py-1 md:py-2 transition-colors cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToTrack(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToTrack(index);
                    }
                  }}
                >
                  {/* Track Number */}
                  <div className="col-span-1 text-white/80 text-sm md:text-base">{track.number}</div>

                  {/* AI DJ Track Layout */}
                  {isAIDJ ? (
                    <div className="col-span-11 flex justify-center items-end gap-2">
                      <img
                        src={'/images/ai-dj.jpg'}
                        alt="AI DJ"
                        className="w-8 h-8 md:w-10 md:h-10 object-cover rounded mr-2 md:mr-5"
                      />
                      <h3 className="text-sm md:text-lg font-semibold text-center">{track.title}</h3>
                    </div>
                  ) : (
                    <>
                      {/* Title */}
                      <div className="col-span-6 sm:col-span-6 text-white font-semibold text-sm md:text-base truncate">
                        {track.title}
                      </div>

                      {/* Artist */}
                      <div className="col-span-3 text-white/70 text-xs md:text-sm hidden sm:block truncate">
                        {track.artist || 'Diego Beuk'}
                      </div>

                      {/* Duration */}
                      <div className="col-span-3 sm:col-span-2 text-right text-white/70 text-xs md:text-sm">
                        {formattedDuration}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Parallax Scrolling Content Area */}
      <div className="relative w-full">
        {/* Parallax Background - Expands equally up and down from center */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            top: 0,
            bottom: 0,
            clipPath: `inset(${50 - Math.max(0, Math.min(1, clipPathReveal)) * 50}% 0% ${50 - Math.max(0, Math.min(1, clipPathReveal)) * 50}% 0%)`, // Expand equally up and down from center, can reverse
            transition: 'clip-path 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'clip-path',
            zIndex: 50,
            backgroundColor: '#191B20'
          }}
        />

        {/* Track Content - appears after reveal and scrolls up */}
        <div 
          className="relative z-[60] min-h-[400vh]"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible 
              ? `translate3d(0, ${(viewportHeight || window.innerHeight) - (scrollProgress * (viewportHeight || window.innerHeight) * 1.5)}px, 0)` 
              : `translate3d(0, ${viewportHeight || window.innerHeight}px, 0)`, // Start below viewport, scroll up as user scrolls
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: contentVisible ? 'transform, opacity' : 'opacity'
          }}
        >
          {TRACKS.map((track) => (
            <div 
              key={track.id} 
              className="min-h-screen flex items-center justify-center px-8 py-24"
              style={{ backgroundColor: '#191B20' }}
            >
              <div className="max-w-4xl mx-auto text-center text-white space-y-8">
                {/* Track Title */}
                <div>
                  <h2 className="text-4xl md:text-6xl font-extrabold mb-4">
                    {track.number}. {track.title}
                  </h2>
                  <p className="text-xl text-white/80 mb-12">{track.artist}</p>
                </div>
                
                {/* Track Content */}
                <div className="text-left space-y-6 text-white/90" style={{ fontFamily: "'Ubuntu', sans-serif" }}>
                  <p className="text-lg leading-relaxed">
                    Content for {track.title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus.
                  </p>
                </div>

                {/* Audio player */}
                <div className="mt-12">
                  <audio preload="none" controls className="mx-auto">
                    <source src={track.audioUrl} />
                  </audio>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}