# Epic 3: Audio System & Player Controls

**Epic Goal:** Integrate music playback capabilities with Diego's original songs, audio controls, and real-time audio-reactive visualizations that create an immersive experience.

## Story 3.1: Implement Audio Player with Playback Controls

**As a** visitor,  
**I want** to control music playback (play, pause, volume, mute),  
**so that** I can manage my audio experience according to my preferences.

**Acceptance Criteria:**
1. Audio player component loads and plays MP3 files
2. Play/Pause button toggles audio playback
3. Volume slider controls audio volume (0-100%)
4. Mute button toggles audio on/off
5. Audio controls are always accessible (persistent player bar)
6. Current playback time and total duration are displayed
7. Seek bar allows jumping to specific time in track
8. Audio controls are keyboard accessible
9. Mobile controls are touch-optimized

## Story 3.2: Set Up Music Files and Track Audio Association

**As a** developer,  
**I want** each track to have its own associated music file,  
**so that** different music plays when visiting different sections of the portfolio.

**Acceptance Criteria:**
1. Audio files prepared and optimized for web delivery (see prerequisite task below)
2. Audio files stored in appropriate directory (public/audio or cloud storage)
3. Each track (University, Work, Projects, Skills, Hobbies) has a designated music file
4. Music automatically loads when navigating to a track
5. Music crossfades or transitions smoothly between tracks (optional enhancement)
6. Loading states display while audio files load
7. Error handling for failed audio loads

**Prerequisite Task - Audio File Preparation:**
Before implementing this story, prepare audio files:
- [ ] Create or select 5 original music tracks (one per portfolio section)
- [ ] Each track should be 2-4 minutes in length
- [ ] Compress to MP3 format at 128-192kbps for optimal web delivery
- [ ] Normalize volume levels across all tracks for consistency
- [ ] Name files clearly: `track-1-university.mp3`, `track-2-work.mp3`, etc.
- [ ] Test playback in browser to ensure quality
- [ ] Total audio file size should be < 15MB combined

## Story 3.3: Implement Web Audio API Integration

**As a** developer,  
**I want** to use Web Audio API for audio analysis,  
**so that** I can create data-driven visualizations that respond to the music.

**Acceptance Criteria:**
1. Web Audio API context is created and managed
2. Audio source is connected to analyser node
3. Frequency data is extracted in real-time
4. Time domain data is available for waveform visualization
5. Audio analysis doesn't impact playback quality
6. Browser compatibility is handled gracefully
7. Audio context is properly cleaned up when unmounting

## Story 3.4: Create Basic Audio Visualizations

**As a** visitor,  
**I want** to see dynamic visualizations that respond to the music,  
**so that** the experience feels alive and immersive.

**Acceptance Criteria:**
1. Canvas element renders visualization in real-time
2. Visualization reacts to audio frequency data
3. Visualization maintains at least 30 FPS
4. Visual style matches track aesthetic
5. Visualization is responsive to different screen sizes
6. Visualization pauses when audio is paused
7. Multiple visualization styles can be selected or randomized (bars, waveform, particles)
8. Visualizations are performant and don't cause UI lag

## Story 3.5: Implement Audio State Management

**As a** developer,  
**I want** centralized audio state management,  
**so that** audio persists correctly across navigation and components can react to audio state.

**Acceptance Criteria:**
1. Audio state (playing, paused, current time, volume) is globally accessible
2. Audio continues playing when navigating between tracks (if desired)
3. Audio state persists across page refreshes (saved to localStorage)
4. Multiple components can read and control audio state
5. Audio state updates trigger appropriate UI updates
6. No memory leaks or duplicate audio instances
7. Audio automatically stops/cleans up on page unload

---
