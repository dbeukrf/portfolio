import { useNavigate } from 'react-router-dom';
import { TRACKS } from '../data/tracks';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaPlay, FaRandom, FaUserPlus } from 'react-icons/fa';
import UnicornScene from 'unicornstudio-react';
import Shuffle from '../components/ui/Shuffle';

export default function AlbumView() {
  const navigate = useNavigate();



  return (
    <div className="min-h-screen bg-background-dark">
      {/* Hero Section with Album Artwork */}
      <div className="relative w-screen bg-gradient-to-b from-[#1f2937] to-[#6b7280] flex flex-col md:flex-row items-start md:items-end gap-8 px-6 md:px-12 py-12 overflow-hidden">

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
          className="w-52 h-52 object-cover shadow-2xl rounded relative z-10"
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




      {/* Action Buttons above Track List */}
<div className="bg-[#0f0f0f] flex items-center gap-4 px-6 md:px-12 mt-1">
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



      {/* Track List Section */}
      <div className="bg-[#0f0f0f] py-16 lg:py-12 w-screen">
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
                  onClick={() => navigate(`/track/${track.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/track/${track.id}`);
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
    </div>
  );
}

