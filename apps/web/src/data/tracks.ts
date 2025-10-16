export type TrackId = 'education' | 'workExperience' | 'projects' | 'skillsLanguages' | 'hobbies' | 'aiDj';

export interface Track {
  id: TrackId;
  number: number;
  title: string;
  audioUrl: string;
  duration: number; // in seconds
  mood: string; // e.g., "Foundation & Learning", "Professional Growth"
  backgroundColor?: string; // Optional custom background color
}

export const TRACKS: Track[] = [
  {
    id: 'education',
    number: 1,
    title: 'Education',
    audioUrl: '/audio/track-1-university.mp3',
    duration: 180,
    mood: 'foundation',
  },
  {
    id: 'workExperience',
    number: 2,
    title: 'Work Experience',
    audioUrl: '/audio/track-2-work.mp3',
    duration: 240,
    mood: 'professional',
  },
  {
    id: 'projects',
    number: 3,
    title: 'Projects',
    audioUrl: '/audio/track-3-projects.mp3',
    duration: 300,
    mood: 'creative',
  },
  {
    id: 'skillsLanguages',
    number: 4,
    title: 'Skills & Languages',
    audioUrl: '/audio/track-4-skills.mp3',
    duration: 200,
    mood: 'technical',
  },
  {
    id: 'hobbies',
    number: 5,
    title: 'Hobbies',
    audioUrl: '/audio/track-5-hobbies.mp3',
    duration: 160,
    mood: 'personal',
  },{
    id: 'aiDj',
    number: 6,
    title: 'AI DJ',
    audioUrl: '/audio/track-6-dj.mp3',
    duration: 160,
    mood: 'personal',
  }
];
