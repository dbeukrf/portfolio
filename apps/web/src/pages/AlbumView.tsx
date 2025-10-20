import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../data/tracks';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaPlay, FaRandom, FaUserPlus } from 'react-icons/fa';
import UnicornScene from 'unicornstudio-react';
import Shuffle from '../components/ui/Shuffle';

export default function AlbumView() {
  // Slide navigation state: null means landing view
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [animateSlides, setAnimateSlides] = useState(true);
  const [slidesAreaHeight, setSlidesAreaHeight] = useState<number>(0);
  const [revealProgress, setRevealProgress] = useState<number>(0); // 0..1 progressive content reveal per slide
  const isOnSlides = currentIndex !== null;

  // Refs
  const heroRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const wheelLockRef = useRef<boolean>(false);
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeCooldownRef = useRef<boolean>(false);
  const announceRef = useRef<HTMLDivElement | null>(null);

  // Compute slides viewport height beneath hero + progress bar
  useEffect(() => {
    const compute = () => {
      const heroH = heroRef.current?.offsetHeight ?? 0;
      const progressH = progressRef.current?.offsetHeight ?? 0;
      const vh = window.innerHeight;
      setSlidesAreaHeight(Math.max(0, vh - heroH - progressH));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Wheel scroll to navigate slides
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return;

      const direction = e.deltaY > 0 ? 1 : -1;

      // From landing: single scroll down enters first track
      if (currentIndex === null) {
        if (direction > 0) {
          setAnimateSlides(true);
          setRevealProgress(0);
          setCurrentIndex(0);
        }
        return;
      }

      // When on slides, adjust progressive reveal first
      const revealSpeed = 0.0016; // tune sensitivity
      const nextProgress = Math.max(0, Math.min(1, revealProgress + e.deltaY * revealSpeed));

      // If we hit bounds, consider slide transitions
      if (direction > 0) {
        if (nextProgress >= 1 - 1e-3) {
          if (wheelLockRef.current) return;
          wheelLockRef.current = true;
          setAnimateSlides(true);
          setRevealProgress(0);
          setCurrentIndex(prev => {
            if (prev === null) return 0;
            return Math.min(TRACKS.length - 1, prev + 1);
          });
          window.setTimeout(() => { wheelLockRef.current = false; }, 450);
        } else {
          setRevealProgress(nextProgress);
        }
      } else {
        if (nextProgress <= 1e-3) {
          if (wheelLockRef.current) return;
          wheelLockRef.current = true;
          setAnimateSlides(true);
          setRevealProgress(1);
          setCurrentIndex(prev => {
            if (prev === null) return null;
            if (prev === 0) {
              // first track -> back to landing
              setRevealProgress(0);
              return null;
            }
            return Math.max(0, prev - 1);
          });
          window.setTimeout(() => { wheelLockRef.current = false; }, 450);
        } else {
          setRevealProgress(nextProgress);
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel as any);
  }, [currentIndex, revealProgress]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setAnimateSlides(false); // instant for key arrows per spec of arrows (fast navigation)
        setCurrentIndex(prev => {
          if (prev === null) return 0; // landing to first track
          return Math.min(TRACKS.length - 1, prev + 1);
        });
        setRevealProgress(0);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setAnimateSlides(false);
        setCurrentIndex(prev => {
          if (prev === null) return null; // already at landing
          if (prev === 0) return null; // first track back to landing
          return Math.max(0, prev - 1);
        });
        setRevealProgress(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex]);

  // Touch swipe navigation for mobile
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      lastTouchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (swipeCooldownRef.current) return;
      const start = lastTouchRef.current;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const dt = Date.now() - start.time;
      // Horizontal swipe threshold
      if (dt < 600 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        swipeCooldownRef.current = true;
        setAnimateSlides(true);
        if (dx < 0) {
          // swipe left -> next
          setCurrentIndex(prev => {
            if (prev === null) return 0; // landing to first track
            return Math.min(TRACKS.length - 1, prev + 1);
          });
          setRevealProgress(0);
        } else {
          // swipe right -> prev
          setCurrentIndex(prev => {
            if (prev === null) return null; // already at landing
            if (prev === 0) return null; // first track back to landing
            return Math.max(0, prev - 1);
          });
          setRevealProgress(0);
        }
        window.setTimeout(() => { swipeCooldownRef.current = false; }, 500);
      }
      lastTouchRef.current = null;
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart as any);
      window.removeEventListener('touchend', onTouchEnd as any);
    };
  }, []);

  // Accessibility live announcement on slide change
  useEffect(() => {
    if (currentIndex === null) return;
    const track = TRACKS[currentIndex];
    if (announceRef.current) {
      announceRef.current.textContent = `Track ${track.number} of ${TRACKS.length} — ${track.title}`;
    }
  }, [currentIndex]);

  // Prefetch: lightly touch next/prev media when idle
  useEffect(() => {
    if (typeof (window as any).requestIdleCallback !== 'function') return;
    if (currentIndex === null) return;
    const ric = (window as any).requestIdleCallback as (cb: () => void) => void;
    ric(() => {
      const preload = (index: number) => {
        const t = TRACKS[index];
        if (!t) return;
        // Example: prefetch audio or images if available
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'audio';
        link.href = t.audioUrl;
        document.head.appendChild(link);
      };
      if (currentIndex + 1 < TRACKS.length) preload(currentIndex + 1);
      if (currentIndex - 1 >= 0) preload(currentIndex - 1);
    });
  }, [currentIndex]);

  const jumpToSlide = (index: number, smooth: boolean) => {
    setAnimateSlides(smooth);
    setCurrentIndex(index);
    setRevealProgress(0);
  };

  const returnHome = () => {
    setCurrentIndex(null);
    setAnimateSlides(true);
    setRevealProgress(0);
  };

  // Hide body scrollbar while this view is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Hero Section with Album Artwork */}
      <div ref={heroRef} className="relative w-screen bg-gradient-to-b from-[#1f2937] to-[#6b7280] flex flex-col md:flex-row items-start md:items-end gap-8 px-6 md:px-12 py-12 overflow-hidden">

        {/* Unicorn Studio Background */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <UnicornScene
            projectId="fHeYPizB1tOZJngcOsES"
            width="100%"
            height="100%"

          />
        </div>

        {/* Album cover image */}
        <img
          src="/images/album-cover.jpg"
          alt="Album cover"
          className="w-52 h-52 object-cover shadow-2xl rounded relative z-10 cursor-pointer"
          onClick={returnHome}
        />

        {/* Album title and description */}
        <div className="text-left flex-1 relative z-10">
          <Shuffle
            tag="p"
            className="text-sm font-semibold text-white/70 mb-2"
            text="Album"
            duration={0.35}
            animationMode="evenodd"
            triggerOnHover
            triggerOnce
            threshold={0.1}
            rootMargin="-100px"
            textAlign="left"
          />
          <Shuffle
            tag="h1"
            className="text-6xl font-extrabold text-white mb-4 flex items-center justify-between"
            text="City, Country - Weather"
            duration={0.5}
            animationMode="evenodd"
            triggerOnHover
            triggerOnce
            threshold={0.1}
            rootMargin="-100px"
            textAlign="left"
          />
          <Shuffle
            tag="p"
            className="text-white/80 mb-4"
            text="Diego Beuk • 2025 • 6 songs, 11 min"
            duration={0.4}
            animationMode="random"
            triggerOnHover
            triggerOnce
            threshold={0.1}
            rootMargin="-100px"
            textAlign="left"
          />

          {/* Contact info*/}
          <div className="flex flex-col md:absolute md:right-12 md:top-[63%] md:transform md:-translate-y-1/2 md:items-end gap-4 text-white text-sm">
            {/* Mobile: horizontal row */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
              {/* Email and Phone */}
              <div className="flex flex-col md:text-right space-y-1 md:space-y-1">
                <Shuffle tag="span" className="" text="beuk.diego@gmail.com" duration={0.35} triggerOnHover triggerOnce textAlign="right" />
                <Shuffle tag="span" className="" text="+61 448 092 338" duration={0.35} triggerOnHover triggerOnce textAlign="right" />
              </div>

              {/* LinkedIn and GitHub icons */}
              <div className="flex space-x-3.5">
                <a
                  href="https://www.linkedin.com/in/diego-beuk-8a9100288/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  aria-label="Diego Beuk LinkedIn profile"
                >
                  <FaLinkedin size={25} color="white" />
                </a>
                <a
                  href="https://github.com/dbeukrf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  aria-label="Diego Beuk Github profile"
                >
                  <FaGithub size={25} color="white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator just below hero */}
      <div ref={progressRef} className="w-full bg-[#0f0f0f] px-6 md:px-12">
        <div className="h-1 w-full bg-white/10 rounded overflow-hidden">
          <div
            className="h-full bg-white/70 transition-[width] duration-300"
            style={{ width: isOnSlides && currentIndex !== null ? `${((currentIndex + 1) / TRACKS.length) * 100}%` : '0%' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Action Buttons above Track List */}
      <div className="bg-[#0f0f0f] flex items-center gap-4 px-6 md:px-12 py-4">
        {/* Play Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
            <FaPlay size={20} />
          </button>
          {/* Tooltip */}
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Play
          </span>
        </div>

        {/* Shuffle Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
            <FaRandom size={20} />
          </button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Shuffle
          </span>
        </div>

        {/* Invite Collaborator Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
            <FaUserPlus size={20} />
          </button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Invite Collaborator
          </span>
        </div>
      </div>



      {/* Track List Section (shown only on landing) */}
      {!isOnSlides && (
        <div className="bg-[#0f0f0f] py-8 lg:py-6 w-screen">
          <div className="px-6 md:px-12 max-w-[1600px] mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 text-white/70 text-sm font-semibold border-b border-white/20 pb-3 mb-4 px-4">
            <div className="col-span-1 text-middle">#</div>
            <div className="col-span-6 text-middle">Title</div>
            <div className="col-span-3 text-middle">Artist</div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
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
          <div className="space-y-4">
            {TRACKS.map((track) => {
              const isAIDJ = track.id === 'aiDj';
              const totalSeconds = track.duration || 0;
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = String(totalSeconds % 60).padStart(2, '0');
              const formattedDuration = `${minutes}:${seconds}`;

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 items-center text-white hover:bg-white/5 rounded-lg px-4 py-3 transition-colors cursor-pointer`}
                  onClick={() => jumpToSlide(track.number - 1, true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      jumpToSlide(track.number - 1, true);
                    }
                  }}
                >
                  {/* Track Number */}
                  <div className="col-span-1 text-white/80">{track.number}</div>

                  {/* AI DJ Track Layout */}
                  {isAIDJ ? (
                    <div className="col-span-11 flex justify-center items-end gap-2">
                      <img
                        src={'/images/ai-dj.jpg'}
                        alt="AI DJ"
                        className="w-10 h-10 object-cover rounded mr-5"
                      />
                      <h3 className="text-lg font-semibold text-center">{track.title}</h3>
                    </div>
                  ) : (
                    <>
                      {/* Title */}
                      <div className="col-span-6 text-white font-semibold">
                        {track.title}
                      </div>

                      {/* Artist */}
                      <div className="col-span-3 text-white/70">
                        {track.artist || 'Diego Beuk'}
                      </div>

                      {/* Duration */}
                      <div className="col-span-2 text-right text-white/70">
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
      )}

      {/* Slides Area (shown only when in slides mode) */}
      {isOnSlides && (
        <div
          className="w-screen bg-[#0f0f0f] overflow-hidden relative"
          style={{ height: `${slidesAreaHeight}px` }}
        >
          {/* Accessibility live region */}
          <div ref={announceRef} aria-live="polite" className="sr-only" />

          {/* Arrows for fast navigation (instant, no smooth) */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => jumpToSlide(Math.max(0, (currentIndex ?? 0) - 1), false)}
            aria-label="Previous track"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => jumpToSlide(Math.min(TRACKS.length - 1, (currentIndex ?? 0) + 1), false)}
            aria-label="Next track"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>

          {/* Consistent diagonal background */}
          <div 
            className="absolute inset-0 will-change-transform"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
              transform: `translate3d(${(currentIndex ?? 0) * -8}px, ${(currentIndex ?? 0) * 12}px, 0)`,
              transition: animateSlides ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
              pointerEvents: 'none'
            }}
          />
          
          {/* Slides wrapper */}
          <div
            className="h-full will-change-transform"
            style={{
              transform: `translate3d(${-(currentIndex ?? 0) * 100}vw, 0, 0)`,
              transition: animateSlides ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
            }}
          >
            <div className="flex h-full">
              {TRACKS.map((track, idx) => {
                const accent = track.backgroundColor || `hsl(${(idx * 47) % 360} 70% 20%)`;
                return (
                  <section
                    key={track.id}
                    className="shrink-0 w-screen h-full relative overflow-hidden"
                    aria-label={`Track ${track.number} of ${TRACKS.length} — ${track.title}`}
                  >
                    {/* Vinyl-like layered background */}
                    <div
                      className="absolute inset-0 will-change-transform"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 70%)`,
                        transform: `translate3d(${idx * -3}px, ${idx * 5}px, 0) rotate(${idx * 2}deg)`,
                        transition: animateSlides ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                      }}
                    />
                    <div
                      className="absolute inset-0 will-change-transform"
                      style={{
                        background: `conic-gradient(from ${idx * 30}deg, rgba(255,255,255,0.1) 0deg, transparent 60deg, rgba(255,255,255,0.05) 120deg, transparent 180deg, rgba(255,255,255,0.1) 240deg, transparent 300deg, rgba(255,255,255,0.05) 360deg)`,
                        transform: `translate3d(${idx * -2}px, ${idx * 3}px, 0) rotate(${idx * -1}deg)`,
                        transition: animateSlides ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                        pointerEvents: 'none'
                      }}
                    />
                    {/* Vinyl center hole effect */}
                    <div
                      className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/20 border-2 border-white/10"
                      style={{
                        transform: `translate3d(${idx * -1}px, ${idx * 2}px, 0) translate(-50%, -50%)`,
                        transition: animateSlides ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                      }}
                    />
                    <div className="relative z-10 h-full flex items-center justify-center p-8">
                      <div className="max-w-3xl text-center text-white">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{track.number}. {track.title}</h2>
                        <p className="text-white/80 mb-6">{track.artist}</p>
                        {/* Progressive reveal content */}
                        <div
                          className="mx-auto overflow-hidden transition-all duration-300"
                          style={{
                            maxHeight: Math.max(0, (slidesAreaHeight - 140) * (idx === (currentIndex ?? -1) ? revealProgress : (idx < (currentIndex ?? -1) ? 1 : 0))) + 'px',
                            opacity: idx === (currentIndex ?? -1) ? (0.3 + 0.7 * revealProgress) : (idx < (currentIndex ?? -1) ? 1 : 0)
                          }}
                          aria-hidden={idx !== (currentIndex ?? -1)}
                        >
                          <div className="space-y-4 text-left text-white/90">
                            <p>Placeholder content for {track.title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec.</p>
                            <p>Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi.</p>
                            <p>Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis.</p>
                            <p>Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.</p>
                            <p>Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus.</p>
                          </div>
                        </div>
                        <audio preload="none" controls className="mx-auto mt-6">
                          <source src={track.audioUrl} />
                        </audio>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

