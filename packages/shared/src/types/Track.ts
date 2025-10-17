export type TrackId = 'education' | 'workExperience' | 'projects' | 'skillsLanguages' | 'hobbies' | 'aiDj';

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
    id: 'education',
    number: 1,
    title: 'Education',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-1-university.mp3',
    duration: 180,
  },
  {
    id: 'workExperience',
    number: 2,
    title: 'Work Experience',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-2-work.mp3',
    duration: 240,
  },
  {
    id: 'projects',
    number: 3,
    title: 'Projects',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-3-projects.mp3',
    duration: 300,
  },
  {
    id: 'skillsLanguages',
    number: 4,
    title: 'Skills & Languages',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-4-skills.mp3',
    duration: 200,
  },
  {
    id: 'hobbies',
    number: 5,
    title: 'Hobbies',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-5-hobbies.mp3',
    duration: 160,
  },{
    id: 'aiDj',
    number: 6,
    title: 'AI DJ',
    artist: 'Diego Beuk',
    audioUrl: '/audio/track-6-dj.mp3',
    duration: 161,
  }
];
