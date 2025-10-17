import { useEffect, useMemo, useRef, useState } from 'react';

type ShuffleDirection = 'left' | 'right';
type AnimationMode = 'random' | 'evenodd';

type Easer = (t: number) => number;

export interface ShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: ShuffleDirection;
  duration?: number; // seconds
  maxDelay?: number; // seconds
  ease?: Easer;
  threshold?: number;
  rootMargin?: string;
  tag?: any;
  textAlign?: React.CSSProperties['textAlign'];
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: AnimationMode;
  loop?: boolean;
  loopDelay?: number; // seconds
  stagger?: number; // seconds
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
}

const easeOutCubic: Easer = (t) => 1 - Math.pow(1 - t, 3);

export default function Shuffle({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  maxDelay = 0,
  ease = easeOutCubic,
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'left',
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = 'evenodd',
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = '',
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
}: ShuffleProps) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const playingRef = useRef(false);
  const teardownRef = useRef<(() => void) | null>(null);
  const hoverHandlerRef = useRef<((e: Event) => void) | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (!respectReducedMotion) return false;
    if (typeof window === 'undefined' || typeof matchMedia === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [respectReducedMotion]);

  // Build DOM structure similar to shadcn: wrap each char in a strip we can translate
  const build = () => {
    const el = hostRef.current;
    if (!el) return { strips: [] as HTMLElement[], cleanup: () => {} };

    // Reset contents
    const original = text;
    el.textContent = '';

    // Create containers per character
    const container = document.createElement('span');
    container.className = 'inline-block align-baseline';
    el.appendChild(container);

    const chars: string[] = original.split('');
    const strips: HTMLElement[] = [];

    // We need widths; create temp measuring spans
    const measurer = document.createElement('span');
    measurer.style.visibility = 'hidden';
    measurer.style.whiteSpace = 'pre';
    el.appendChild(measurer);

    const rolls = Math.max(1, Math.floor(shuffleTimes));
    const randChar = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || '';

    for (let idx = 0; idx < chars.length; idx++) {
      const ch = chars[idx];
      // Preserve spaces
      if (ch === ' ') {
        const space = document.createElement('span');
        space.textContent = ' ';
        container.appendChild(space);
        continue;
      }

      // measure width
      measurer.textContent = ch;
      const w = measurer.getBoundingClientRect().width || 0;

      const wrap = document.createElement('span');
      wrap.className = 'inline-block overflow-hidden align-baseline text-left';
      Object.assign(wrap.style, { width: w + 'px' });
      const inner = document.createElement('span');
      inner.className = 'inline-block whitespace-nowrap will-change-transform origin-left transform-gpu';
      if (colorFrom) (inner.style as any).color = colorFrom;

      // Build strip sequence: first a copy, then N rolls, then the real char
      const firstCopy = document.createElement('span');
      firstCopy.className = 'inline-block text-left';
      firstCopy.textContent = ch;
      Object.assign(firstCopy.style, { width: w + 'px' });
      inner.appendChild(firstCopy);

      for (let k = 0; k < rolls; k++) {
        const c = document.createElement('span');
        c.className = 'inline-block text-left';
        c.textContent = scrambleCharset ? randChar(scrambleCharset) : ch;
        Object.assign(c.style, { width: w + 'px' });
        inner.appendChild(c);
      }

      const real = document.createElement('span');
      real.className = 'inline-block text-left';
      real.textContent = ch;
      Object.assign(real.style, { width: w + 'px' });
      inner.appendChild(real);

      // Direction setup
      const steps = rolls + 1; // number of moves between copies and real
      let startX = 0;
      let finalX = -steps * w;
      if (shuffleDirection === 'right') {
        // Rotate children so real comes first for rightward slide
        const firstChild = inner.firstElementChild;
        const lastChild = inner.lastElementChild;
        if (lastChild) inner.insertBefore(lastChild, inner.firstChild);
        if (firstChild) inner.appendChild(firstChild);
        startX = -steps * w;
        finalX = 0;
      }

      inner.setAttribute('data-start-x', String(startX));
      inner.setAttribute('data-final-x', String(finalX));
      (inner.style as any).transform = `translate3d(${startX}px,0,0)`;

      wrap.appendChild(inner);
      container.appendChild(wrap);
      strips.push(inner);
    }

    measurer.remove();

    const cleanup = () => {
      el.textContent = original;
    };

    return { strips, cleanup };
  };

  const randomizeScrambles = (strips: HTMLElement[]) => {
    if (!scrambleCharset) return;
    for (const strip of strips) {
      const kids = Array.from(strip.children) as HTMLElement[];
      for (let i = 1; i < kids.length - 1; i++) {
        kids[i].textContent = scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));
      }
    }
  };

  const play = (strips: HTMLElement[]) => {
    if (!strips.length) return () => {};
    playingRef.current = true;

    const startTimes: number[] = new Array(strips.length).fill(0);
    const totalDurations: number[] = new Array(strips.length).fill(duration);
    const start = performance.now();

    const getStartDelay = (i: number): number => {
      if (animationMode === 'evenodd') {
        const isOdd = i % 2 === 1;
        const oddIndex = Math.floor(i / 2);
        const evenIndex = Math.floor((i + 1) / 2);
        const base = isOdd ? oddIndex * stagger : evenIndex * stagger * 0.7;
        return Math.min(base + Math.random() * maxDelay, base + maxDelay);
      }
      return Math.random() * maxDelay;
    };

    for (let i = 0; i < strips.length; i++) {
      startTimes[i] = getStartDelay(i) * 1000; // ms
      totalDurations[i] = duration * 1000;
      // Reset transform and color
      const startX = parseFloat(strips[i].getAttribute('data-start-x') || '0');
      (strips[i].style as any).transform = `translate3d(${startX}px,0,0)`;
      if (colorFrom) (strips[i].style as any).color = colorFrom;
    }

    let rafId = 0;

    const frame = () => {
      const now = performance.now();
      let allDone = true;
      for (let i = 0; i < strips.length; i++) {
        const strip = strips[i];
        const local = now - start - startTimes[i];
        const t = Math.max(0, Math.min(1, local / totalDurations[i]));
        if (t < 1) allDone = false;
        const eased = ease(t);
        const sx = parseFloat(strip.getAttribute('data-start-x') || '0');
        const fx = parseFloat(strip.getAttribute('data-final-x') || '0');
        const x = sx + (fx - sx) * eased;
        (strip.style as any).transform = `translate3d(${x}px,0,0)`;
        if (colorFrom && colorTo) (strip.style as any).color = t >= 1 ? colorTo : colorFrom;
      }

      if (!allDone) {
        rafId = requestAnimationFrame(frame);
      } else {
        playingRef.current = false;
        onShuffleComplete?.();
        if (loop) {
          window.setTimeout(() => {
            // Reset to start and randomize scrambles, then play again
            for (const s of strips) {
              const sx = parseFloat(s.getAttribute('data-start-x') || '0');
              (s.style as any).transform = `translate3d(${sx}px,0,0)`;
            }
            randomizeScrambles(strips);
            play(strips);
          }, Math.max(0, loopDelay) * 1000);
        } else if (colorTo) {
          for (const s of strips) (s.style as any).color = colorTo;
        }
      }
    };

    rafId = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(rafId);
  };

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    if (prefersReducedMotion || !text) {
      el.textContent = text;
      setReady(true);
      return;
    }

    const run = () => {
      // Teardown previous
      if (teardownRef.current) {
        teardownRef.current();
        teardownRef.current = null;
      }

      const { strips, cleanup } = build();
      randomizeScrambles(strips);
      const cancel = play(strips);

      const teardown = () => {
        cancel();
        cleanup();
      };
      teardownRef.current = teardown;
      setReady(true);
    };

    // IntersectionObserver similar to ScrollTrigger
    const startPct = 1 - Math.min(1, Math.max(0, threshold));
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin,
      threshold: [startPct],
    };
    let triggered = false;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!triggered || !triggerOnce) {
            triggered = true;
            run();
          }
        }
      }
    }, options);
    io.observe(el);

    // Hover replay
    const armHover = () => {
      if (!triggerOnHover) return;
      if (hoverHandlerRef.current) el.removeEventListener('mouseenter', hoverHandlerRef.current);
      const handler = () => {
        if (playingRef.current) return;
        run();
      };
      hoverHandlerRef.current = handler;
      el.addEventListener('mouseenter', handler);
    };
    armHover();

    return () => {
      io.disconnect();
      if (hoverHandlerRef.current) el.removeEventListener('mouseenter', hoverHandlerRef.current);
      if (teardownRef.current) teardownRef.current();
      teardownRef.current = null;
      setReady(false);
    };
  }, [text, shuffleDirection, duration, maxDelay, ease, threshold, rootMargin, shuffleTimes, animationMode, loop, loopDelay, stagger, scrambleCharset, colorFrom, colorTo, triggerOnce, prefersReducedMotion, triggerOnHover]);

  const Tag = (tag || 'p') as any;
  const classes = `${ready ? 'visible' : 'invisible'} ${className}`.trim();
  const mergedStyle: React.CSSProperties = { textAlign, ...style };

  return (
    <Tag ref={hostRef as any} className={classes} style={mergedStyle}>
      {text}
    </Tag>
  );
}


