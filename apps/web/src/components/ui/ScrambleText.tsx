import { useEffect, useMemo, useRef, useState } from 'react';

type ScrambleTextProps = {
  text: string;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  characters?: string;
  as?: any;
  onDone?: () => void;
  triggerOnHover?: boolean;
  hoverDelayMs?: number;
  hoverDurationMs?: number;
};

const DEFAULT_CHARSET = '0123456789!@#$%^&*()_+-={}[];:,.<>/?';

export default function ScrambleText({
  text,
  className,
  delayMs = 0,
  durationMs = 900,
  characters = DEFAULT_CHARSET,
  as = 'span',
  onDone,
  triggerOnHover = true,
  hoverDelayMs = 0,
  hoverDurationMs,
}: ScrambleTextProps) {
  const Tag = as as any;
  const [display, setDisplay] = useState<string>(text);
  const startedRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof matchMedia === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const cancelTimers = () => {
    if (delayTimerRef.current) {
      window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const runAnimation = (opts?: { delay?: number; duration?: number }) => {
    const effectiveDelay = opts?.delay ?? delayMs;
    const effectiveDuration = opts?.duration ?? durationMs;

    cancelTimers();

    if (prefersReducedMotion || !text) {
      setDisplay(text);
      onDone?.();
      return;
    }

    let startTime = 0;
    const length = text.length;
    const targetChars = text.split('');

    const scramble = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, effectiveDuration === 0 ? 1 : elapsed / effectiveDuration);
      const revealBoundary = Math.floor(progress * length);

      // Build pool of remaining (non-space) characters from the unrevealed tail
      const remainingChars: string[] = [];
      for (let i = revealBoundary; i < length; i++) {
        const ch = targetChars[i];
        if (ch !== ' ') remainingChars.push(ch);
      }

      // Shuffle remaining characters (Fisher-Yates)
      for (let i = remainingChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = remainingChars[i];
        remainingChars[i] = remainingChars[j];
        remainingChars[j] = tmp;
      }

      const out: string[] = new Array(length);
      let poolIndex = 0;
      for (let i = 0; i < length; i++) {
        if (i < revealBoundary) {
          out[i] = targetChars[i];
        } else if (targetChars[i] === ' ') {
          out[i] = ' ';
        } else {
          out[i] = remainingChars[poolIndex] ?? targetChars[i];
          poolIndex++;
        }
      }

      setDisplay(out.join(''));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(scramble);
      } else {
        setDisplay(text);
        onDone?.();
      }
    };

    const start = () => {
      startedRef.current = true;
      startTime = performance.now();
      rafRef.current = requestAnimationFrame(scramble);
    };

    if (effectiveDelay && effectiveDelay > 0) {
      delayTimerRef.current = window.setTimeout(start, effectiveDelay);
    } else {
      start();
    }
  };

  useEffect(() => {
    setDisplay(text);
    startedRef.current = false;
    runAnimation();
    return () => cancelTimers();
  }, [text, characters, durationMs, delayMs, onDone, prefersReducedMotion]);

  const handleHoverTrigger = () => {
    if (!triggerOnHover) return;
    if (prefersReducedMotion) return;
    runAnimation({ delay: hoverDelayMs, duration: hoverDurationMs ?? durationMs });
  };

  return (
    <Tag
      className={className}
      aria-label={text}
      aria-live="polite"
      onMouseEnter={handleHoverTrigger}
      onFocus={handleHoverTrigger}
      tabIndex={triggerOnHover ? 0 : undefined}
    >
      {display}
    </Tag>
  );
}


