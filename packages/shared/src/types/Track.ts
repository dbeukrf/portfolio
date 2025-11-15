export type TrackId = 'about' | 'education' | 'workExperience' | 'projects' | 'skillsLanguages' | 'hobbies' | 'aiDj';

export interface Track {
  id: TrackId;
  number: number;
  title: string;
  artist: string;
  audioUrl: string;
  duration: number; // in seconds
  backgroundColor?: string; // Optional custom background color
}

export const TRACKS: Track[] = [
  {
    id: 'about',
    number: 1,
    title: 'About',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-1-about.mp3',
    duration: 120,
  },
  {
    id: 'education',
    number: 2,
    title: 'Education',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-2-university.mp3',
    duration: 180,
  },
  {
    id: 'workExperience',
    number: 3,
    title: 'Work Experience',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-3-work.mp3',
    duration: 240,
  },
  {
    id: 'projects',
    number: 4,
    title: 'Projects',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-4-projects.mp3',
    duration: 300,
  },
  {
    id: 'skillsLanguages',
    number: 5,
    title: 'Skills & Languages',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-5-skills.mp3',
    duration: 200,
  },
  {
    id: 'hobbies',
    number: 6,
    title: 'Hobbies',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-6-hobbies.mp3',
    duration: 160,
  },
  {
    id: 'aiDj',
    number: 7,
    title: 'AI DJ',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-7-dj.mp3',
    duration: 161,
  }
];
