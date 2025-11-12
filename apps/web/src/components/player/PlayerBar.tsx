import { useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRedo, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useAudioStore } from '../../stores/audioStore';
import { TRACKS } from '../../data/tracks';

interface PlayerBarProps {
  isVisible: boolean;
  contentVisible: boolean;
  clipPathReveal?: number;
}

export default function PlayerBar({ isVisible, contentVisible, clipPathReveal: _clipPathReveal = 0 }: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrackId,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    isShuffled,
    isLooping,
    isMuted,
    setCurrentTrack,
    play,
    pause,
    togglePlayPause,
    setVolume,
    setCurrentTime,
    setDuration,
    setLoading,
    setError,
    toggleShuffle,
    toggleLoop,
    toggleMute,
  } = useAudioStore();

  const currentTrack = currentTrackId ? TRACKS.find(t => t.id === currentTrackId) : null;
  const currentIndex = currentTrackId ? TRACKS.findIndex(t => t.id === currentTrackId) : -1;

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle previous track
  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prevTrack = TRACKS[currentIndex - 1];
    setCurrentTrack(prevTrack.id);
    play();
  }, [currentIndex, setCurrentTrack, play]);

  // Handle next track
  const handleNext = useCallback(() => {
    if (isShuffled) {
      // Get random track that's not the current one
      const availableTracks = TRACKS.filter(t => t.id !== currentTrackId);
      if (availableTracks.length === 0) return;
      const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      setCurrentTrack(randomTrack.id);
    } else {
      if (currentIndex >= TRACKS.length - 1) {
        // Loop back to first track
        setCurrentTrack(TRACKS[0].id);
      } else {
        const nextTrack = TRACKS[currentIndex + 1];
        setCurrentTrack(nextTrack.id);
      }
    }
    play();
  }, [isShuffled, currentTrackId, currentIndex, setCurrentTrack, play]);

  // Handle audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleError = () => {
      setError('Failed to load audio');
      setLoading(false);
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooping, setCurrentTime, setDuration, setLoading, setError, handleNext]);

  // Sync audio element with store state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        setError('Failed to play audio');
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, pause, setError]);

  // Load track when currentTrackId changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    setLoading(true);
    audio.src = currentTrack.audioUrl;
    audio.load();
  }, [currentTrackId, currentTrack, setLoading]);

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Don't render if no track is selected
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayVolume = isMuted ? 0 : volume;
  
  // Player bar visibility logic:
  // - Show in album view when play is clicked (isVisible = true, contentVisible = false, clipPathReveal < 1)
  // - During reveal phase, keep player bar visible but behind parallax background (z-50)
  // - Parallax background overlaps the player bar during reveal (clipPathReveal increasing)
  // - Fade in on track views after parallax background reveals (isVisible = true, contentVisible = true)
  // - On track views, player bar is z-[100] to be above parallax (z-50) and track content (z-60)
  
  // Player bar should always be visible when isVisible is true
  // During reveal phase, it stays visible but is behind parallax (z-40 < z-50)
  // On track views, it fades in and is on top (z-[100] > z-50)
  const shouldShow = isVisible;
  const isOnTrackView = contentVisible;
  
  // Determine opacity: fade in when reaching track view, otherwise stay visible
  // During reveal phase, keep it visible (parallax will cover it visually)
  // When track view appears, fade in to full opacity
  // Only show on track view if isVisible is true
  const opacity = isOnTrackView && shouldShow ? 100 : (shouldShow ? 100 : 0);
  const zIndex = isOnTrackView && shouldShow ? 100 : (shouldShow ? 40 : 100);
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-white/10 px-2 md:px-4 py-1.5 md:py-2 transition-all duration-500 pointer-events-auto`}
      style={{
        opacity: opacity / 100,
        zIndex: zIndex,
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer" onClick={handleSeek}>
        <div
          className="h-full bg-[#1db954] transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main player content */}
      <div className="grid grid-cols-3 items-center h-[70px] md:h-[90px]">
        {/* Left: Album image, track title, and author */}
        <div className="flex items-center gap-5 min-w-0 justify-start">
          <img
            src="/images/album-cover.jpg"
            alt="Album cover"
            className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-cover rounded flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="text-white text-xs md:text-sm font-medium truncate">{currentTrack.title}</div>
            <div className="text-white/70 text-[10px] md:text-xs truncate">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Center: Controls and progress */}
        <div className="flex flex-col items-center gap-1.5 md:gap-2 justify-self-center w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[900px]">
          {/* Control buttons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Shuffle */}
            <div className="relative group">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 md:p-2 text-white/70 hover:text-white transition-colors focus:outline-none ${
                  isShuffled ? 'text-[#1db954]' : ''
                }`}
                aria-label="Shuffle"
              >
                <FaRandom className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Shuffle
              </span>
            </div>

            {/* Previous */}
            <div className="relative group">
              <button
                onClick={handlePrevious}
                disabled={currentIndex <= 0}
                className="p-1.5 md:p-2 text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                aria-label="Previous track"
              >
                <FaStepBackward className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Previous track
              </span>
            </div>

            {/* Play/Pause */}
            <div className="relative group">
              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="p-1.5 md:p-2 bg-white text-black rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 md:w-10 md:h-10 flex items-center justify-center focus:outline-none"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <FaPause className="w-3 h-3 md:w-3.5 md:h-3.5" />
                ) : (
                  <FaPlay className="w-3 h-3 md:w-3.5 md:h-3.5 ml-0.5" />
                )}
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </div>

            {/* Next */}
            <div className="relative group">
              <button
                onClick={handleNext}
                className="p-1.5 md:p-2 text-white/70 hover:text-white transition-colors focus:outline-none"
                aria-label="Next track"
              >
                <FaStepForward className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Next track
              </span>
            </div>

            {/* Loop */}
            <div className="relative group">
              <button
                onClick={toggleLoop}
                className={`p-1.5 md:p-2 text-white/70 hover:text-white transition-colors focus:outline-none ${
                  isLooping ? 'text-[#1db954]' : ''
                }`}
                aria-label="Repeat"
              >
                <FaRedo className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              {/* Tooltip */}
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isLooping ? 'Repeat one' : 'Repeat'}
              </span>
            </div>
          </div>

          {/* Progress bar with time */}
          <div className="flex items-center gap-1.5 md:gap-2 w-full">
            <span className="text-white/70 text-[10px] md:text-xs min-w-[35px] md:min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-0.5 md:h-1 bg-white/20 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full transition-all group-hover:bg-[#1db954]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-white/70 text-[10px] md:text-xs min-w-[35px] md:min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume control */}
        <div className="flex items-center gap-1.5 md:gap-2 justify-end">
          <div className="relative group">
            <button
              onClick={toggleMute}
              className="p-1.5 md:p-2 text-white/70 hover:text-white transition-colors focus:outline-none"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <FaVolumeMute className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <FaVolumeUp className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </button>
            {/* Tooltip */}
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={displayVolume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              // If volume is set above 0, unmute
              if (newVolume > 0 && isMuted) {
                toggleMute();
              }
            }}
            className="w-16 md:w-20 lg:w-24 h-0.5 md:h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
            style={{
              background: `linear-gradient(to right, white 0%, white ${displayVolume * 100}%, rgba(255,255,255,0.2) ${displayVolume * 100}%, rgba(255,255,255,0.2) 100%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

