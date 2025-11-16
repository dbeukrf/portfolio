import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TRACKS, type TrackId } from '../data/tracks';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaPlay, FaRandom, FaUserPlus } from 'react-icons/fa';
import { FaMapMarkerAlt, FaBriefcase, FaLanguage, FaCode, FaCircle, FaBars, FaTimes } from 'react-icons/fa';
import Shuffle from '../components/ui/Shuffle';
import { api } from '../services/api';
import { fetchWeatherApi } from 'openmeteo';
import PlayerBar from '../components/player/PlayerBar';
import { useAudioStore } from '../stores/audioStore';
import TrackPage, { RAINBOW_COLORS } from '../components/tracks/TrackPage';
import ProjectCarousel, { type Project } from '../components/projects/ProjectCarousel';
import SkillsForceLayout, { type Skill } from '../components/skills/SkillsForceLayout';
import './AlbumView.css';

interface WeatherData {
  time: Date;
  temperatureC: number;
  apparentTemperatureC: number;
  isDay: number;
  rainMm: number;
  cloudCoverPct?: number;
  weatherCode?: number;
  windSpeed10m?: number;
  source: string;
}

interface DailyWeatherData {
  time: Date[];
  temperatureMaxC: number[];
  temperatureMinC: number[];
  precipitationSumMm?: number[];
}

interface GeoResponse {
  city?: string;
  country_name?: string;
  latitude: number;
  longitude: number;
}

const clamp = (value: number, min?: number, max?: number): number => {
  const minVal = min === undefined ? 0 : min;
  const maxVal = max === undefined ? 1 : max;
  return Math.max(minVal, Math.min(maxVal, value));
};

/**
 * Returns unique content for each track based on its ID
 */
const getTrackContent = (trackId: TrackId): ReactNode => {
  const contentStyle = { fontFamily: "'Ubuntu', sans-serif" };

  switch (trackId) {
    case 'about':
      return (
        <div style={{...contentStyle, textAlign: 'left'}}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            {/* Album Image */}
            <div style={{ flexShrink: 0 }}>
              <img
                src="/images/album-cover1.jpg"
                alt="Diego Beuk"
                draggable={false}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              />
            </div>

            {/* Text Content - Vertically centered with image */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              flex: 1,
              height: '200px'
            }}>
              {/* Available to work with pulse rings icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Static inner circle */}
                  <FaCircle 
                    style={{ 
                      position: 'absolute',
                      color: '#10b981',
                      fontSize: '10px',
                      zIndex: 3
                    }} 
                  />
                  {/* Pulsing outer ring 1 */}
                  <FaCircle 
                    className="pulse-ring-outer"
                    style={{ 
                      position: 'absolute',
                      color: '#10b981',
                      fontSize: '10px',
                      opacity: 0.6,
                      zIndex: 2
                    }} 
                  />
                  {/* Pulsing outer ring 2 */}
                  <FaCircle 
                    className="pulse-ring-outer-delayed"
                    style={{ 
                      position: 'absolute',
                      color: '#10b981',
                      fontSize: '10px',
                      opacity: 0.4,
                      zIndex: 1
                    }} 
                  />
                </div>
                <Shuffle
                  tag="span"
                  style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 500, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}
                  text="Available to work"
                  duration={0.35}
                  animationMode="evenodd"
                  triggerOnHover
                  triggerOnce={false}
                  threshold={0}
                  rootMargin="0px"
                />
              </div>

              {/* Name */}
              <Shuffle
                tag="h2"
                style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'normal' }}
                text="Hi, I'm Diego!"
                duration={0.4}
                animationMode="evenodd"
                triggerOnHover
                triggerOnce={false}
                threshold={0}
                rootMargin="0px"
              />

              {/* Title */}
              <Shuffle
                tag="p"
                style={{ margin: '0', fontSize: '1.125rem', color: '#4b5563' }}
                text="Full Stack AI Developer"
                duration={0.4}
                animationMode="evenodd"
                triggerOnHover
                triggerOnce={false}
                threshold={0}
                rootMargin="0px"
              />

              {/* Social Icons */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '1rem'
              }}>
                <a
                  href="https://www.linkedin.com/in/diego-beuk-8a9100288/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#000',
                    transition: 'opacity 0.2s',
                    textDecoration: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  onFocus={(e) => e.currentTarget.style.outline = 'none'}
                  aria-label="Diego Beuk LinkedIn profile"
                >
                  <FaLinkedin size={24} />
                </a>
                <a
                  href="https://github.com/dbeukrf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#000',
                    transition: 'opacity 0.2s',
                    textDecoration: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  onFocus={(e) => e.currentTarget.style.outline = 'none'}
                  aria-label="Diego Beuk Github profile"
                >
                  <FaGithub size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info Lines Below Image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaMapMarkerAlt style={{ color: '#6b7280', fontSize: '1.125rem' }} />
              <span style={{ fontSize: '1rem' }}>Melbourne, Australia</span>
            </div>

            {/* Work Experience */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaBriefcase style={{ color: '#6b7280', fontSize: '1.125rem' }} />
              <span style={{ fontSize: '1rem' }}>1 year</span>
            </div>

            {/* Languages */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaLanguage style={{ color: '#6b7280', fontSize: '1.125rem' }} />
              <span style={{ fontSize: '1rem' }}>English, Spanish, Portuguese, French</span>
            </div>

            {/* Key Skills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaCode style={{ color: '#6b7280', fontSize: '1.125rem' }} />
              <span style={{ fontSize: '1rem' }}>Python, FastAPI, React/TypeScript, LangChain, RAG Systems, AI Agents, SQL/NoSQL</span>
            </div>
          </div>
        </div>
      );

    case 'education':
      return (
        <div style={{ ...contentStyle, textAlign: 'left', width: '100%' }} className="education-track-content education-track-content-wrapper">
          {/* === Monash University === */}
          <section className="education-section" style={{ borderBottom: '1px solid #A4A4A4' }}>
            <div className="education-container">
              
              {/* LEFT — Institution Image */}
              <div className="education-image-container" style={{ flexShrink: 0 }}>
                <img 
                  src="/images/education/monash.svg" 
                  alt="Monash University" 
                  draggable={false}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '4px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }} 
                />
                {/* Major and Minor below image - desktop only */}
                <div className="education-major-info-desktop" style={{ paddingTop: '2.3rem' }}>
                  <p className="education-major-p" style={{ marginTop: '0', marginBottom: 0, paddingLeft: '1.2rem' }}>
                    <strong>Major:</strong> Software Development<br/>
                    <strong>Minor:</strong> Cybersecurity<br/>
                    <strong>GPA:</strong> 3.81/4.0
                  </p>
                </div>
              </div>
      
              {/* RIGHT — Text Content */}
              <div className="education-content">
                {/* Title row with location on the right */}
                <div className="education-degree-title" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <h3 className="education-h3">Bachelor of Information Technology</h3>
                </div>
      
                {/* Degree row */}
                <div className="education-degree-date" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <p className="education-p"><strong>September 2025</strong></p>
                </div>
      
                {/* Major and Minor - separate for mobile ordering */}
                <div className="education-major-info" style={{ paddingLeft: '1.2rem' }}>
                  <p className="education-major-p" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
                    <strong>Major:</strong> Software Development<br/>
                    <strong>Minor:</strong> Cybersecurity<br/>
                    <strong>GPA:</strong> 3.81/4.0
                  </p>
                </div>
      
                {/* Body content */}
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.8rem', listStyle: 'none' }}>      
                  {/* Relevant Coursework */}
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    <strong className="education-strong">Relevant Coursework:</strong>
                    <ul className="education-ul-nested" style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', marginBottom: '0.3rem', listStyleType: 'circle' }}>
                      <li>Algorithms & Programming | Software Engineering & Architecture</li>
                      <li>Systems Development | Mobile & Web App Development</li>
                      <li>Databases & Advanced Database Design | Cybersecurity & Software Security</li>
                      <li>Computer Systems & Networks | IT Project Management</li>
                    </ul>
                  </li>
      
                  {/* Honours & Awards */}
                  <li className="education-li">
                    <strong className="education-strong">Honours & Awards:</strong>
                    <ul className="education-ul-nested" style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', marginBottom: '0.3rem', listStyleType: 'circle' }}>
                      <li>Top Student University Commendation (Semester 1, 2024)</li>
                      <li>Industry-Based Learning Placement Scholarship</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* === Yonsei University === */}
          <section className="education-section">
            <div className="education-container">
              
              {/* LEFT — Institution Image */}
              <div className="education-image-container" style={{ flexShrink: 0 }}>
                <img 
                  src="/images/education/yonsei.png" 
                  alt="Yonsei University" 
                  draggable={false}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '4px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }} 
                />
                {/* GPA below image - desktop only */}
                <div className="education-major-info-desktop" style={{ paddingTop: '2.3rem' }}>
                  <p className="education-major-p" style={{ marginTop: '0', marginBottom: 0, paddingLeft: '1.2rem' }}>
                    <strong>GPA:</strong> 4.08/4.3
                  </p>
                </div>
              </div>
      
              {/* RIGHT — Text Content */}
              <div className="education-content">
                {/* Title row with location on the right */}
                <div className="education-degree-title" style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 className="education-h3">College of Computing, Study Abroad</h3>
                </div>
      
                {/* Degree row */}
                <div className="education-degree-date" style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <p className="education-p"><strong>Fall Semester 2024</strong></p>
                </div>
      
                {/* Body content */}
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.8rem', listStyle: 'none' }}>
                  {/* Scholarship Award */}
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    <strong className="education-strong">Scholarship Award:</strong>
                    <ul className="education-ul-nested" style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', marginBottom: '0.3rem', listStyleType: 'circle' }}>
                      <li>Destination Australia Cheung Kong Exchange Program</li>
                    </ul>
                  </li>
      
                  {/* Activities & Societies */}
                  <li className="education-li">
                    <strong className="education-strong">Activities & Societies:</strong>
                    <ul className="education-ul-nested" style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', marginBottom: '0.3rem', listStyleType: 'circle' }}>
                      <li>Mentors Club</li>
                      <li>Yonsei English Society (YES)</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      );

    case 'workExperience':
      return (
        <div style={{ ...contentStyle, textAlign: 'left', width: '100%' }} className="education-track-content work-track-content">
          {/* === Coles Group === */}
          <section className="education-section" style={{ borderBottom: '1px solid #A4A4A4' }}>
            <div className="education-container">
              
              {/* LEFT — Company Image */}
              <div className="education-image-container" style={{ flexShrink: 0 }}>
                <img 
                  src="/images/work/colesgroup.png" 
                  alt="Coles Group" 
                  draggable={false}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '4px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }} 
                />
                {/* Location and Date row below image - desktop only */}
                <div className="education-major-info-desktop" style={{ paddingTop: '1.7rem' }}>
                  <p className="education-p" style={{ margin: 0, marginBottom: '0.3rem', textAlign: 'left', paddingLeft: '1.2rem' }}><strong>Melbourne, Australia</strong></p>
                  <p className="education-p" style={{ margin: 0, textAlign: 'left', paddingLeft: '1.2rem' }}><strong>January - June 2025</strong></p>
                </div>
              </div>
      
              {/* RIGHT — Text Content */}
              <div className="education-content" style={{ width: '100%' }}>
                {/* Title row with role */}
                <div className="education-degree-title" style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 className="education-h3">IT Infrastructure Project Management Intern</h3>
                </div>
      
                {/* Location and Date - mobile only */}
                <div className="rmit-location-mobile rmit-location-mobile-first" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                  <p className="education-p" style={{ margin: 0, marginBottom: '0.3rem', textAlign: 'left', paddingLeft: '1.2rem' }}><strong>Melbourne, Australia</strong></p>
                  <p className="education-p" style={{ margin: 0, textAlign: 'left', paddingLeft: '1.2rem' }}><strong>January 2025 - June 2025</strong></p>
                </div>
      
                {/* Body content */}
                <ul className="work-body-content" style={{ paddingLeft: '1.2rem', listStyle: 'disc', width: '100%' }}>      
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Led data analysis for the Lifecycle Cost Management Project, assessing over 12,000 devices to inform multi-year financial strategies for four business units.
                  </li>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Developed a dynamic Python-based cost estimation model for IT hardware procurement across the Ocado CFC portfolio, improving forecasting accuracy and reducing manual tracking effort for +200 purchase orders.
                  </li>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Streamlined Agile workflows using Confluence and Jira, while delivering IT governance and technical reports to senior leadership, strengthening project compliance and alignment with organisational objectives.
                  </li>
                </ul>
                <p className="education-li" style={{ paddingLeft: '1.2rem', paddingBottom: '2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  <strong className="education-strong">Technologies:</strong> <span className="education-li">Python, Excel, Jira, Confluence, SharePoint</span>
                </p>
              </div>
            </div>
          </section>

          {/* === RMIT University (Research Assistant) === */}
          <section className="education-section">
            <div className="education-container">
              
              {/* LEFT — Company Image */}
              <div className="education-image-container" style={{ flexShrink: 0 }}>
                <img 
                  src="/images/work/rmit.svg" 
                  alt="RMIT University" 
                  draggable={false}
                  style={{ 
                    width: '80%', 
                    height: 'auto', 
                    borderRadius: '4px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }} 
                />
                {/* Location and Date row below image for first position */}
                <div className="education-major-info-desktop" style={{ paddingTop: '1.4rem' }}>
                  <p className="education-p" style={{ margin: 0, marginBottom: '0.3rem', textAlign: 'left', paddingLeft: '1.2rem' }}><strong>Melbourne, Australia</strong></p>
                  <p className="education-p" style={{ margin: 0, textAlign: 'left', paddingLeft: '1.2rem' }}><strong>July - September 2024</strong></p>
                </div>
                {/* Location and Date row below image for second position */}
                <div className="education-major-info-desktop" style={{ paddingTop: '16.5rem' }}>
                  <p className="education-p" style={{ margin: 0, marginBottom: '0.3rem', textAlign: 'left', paddingLeft: '1.2rem' }}><strong>Melbourne, Australia</strong></p>
                  <p className="education-p" style={{ margin: 0, textAlign: 'left', paddingLeft: '1.2rem' }}><strong>September - November 2023</strong></p>
                </div>
              </div>
      
              {/* RIGHT — Text Content */}
              <div className="education-content" style={{ width: '100%' }}>
                {/* Title row with role */}
                <div className="education-degree-title" style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 className="education-h3">Research Assistant</h3>
                </div>
      
                {/* Location and Date for first position - mobile only */}
                <div className="rmit-location-mobile rmit-location-mobile-first" style={{ paddingTop: '0.8rem' }}>
                  <p className="education-p" style={{ margin: 0, marginBottom: '0.3rem', textAlign: 'left', paddingLeft: '1.2rem' }}><strong>Melbourne, Australia</strong></p>
                  <p className="education-p" style={{ margin: 0, textAlign: 'left', paddingLeft: '1.2rem' }}><strong>July - September 2024</strong></p>
                </div>
      
                {/* Body content for first position */}
                <ul className="work-body-content" style={{ paddingLeft: '1.2rem', paddingTop: '1rem', listStyle: 'disc', width: '100%' }}>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Conducted a systematic literature review on indoor localisation, evaluating multi-sensor fusion methods (barometric pressure, Wi-Fi, and GPS) for real-world deployment.
                  </li>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Built an Android application prototype to determine user floor levels via multi-sensor integration.
                  </li>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Executed experiments integrating real-time weather station data for sensor calibration, enhancing global scalability and robustness of altitude-based floor estimation.
                  </li>
                </ul>
                <p className="education-li" style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <strong className="education-strong">Technologies:</strong> <span className="education-li">Android Studio, Java, Figma, Wi-Fi/GPS sensor APIs</span>
                </p>

                {/* Location and Date for second position - mobile only */}
                <div className="rmit-location-mobile rmit-location-mobile-second" style={{ paddingTop: '2rem' }}>
                  <p className="education-p" style={{ margin: 0, marginBottom: '0.3rem', textAlign: 'left', paddingLeft: '1.2rem' }}><strong>Melbourne, Australia</strong></p>
                  <p className="education-p" style={{ margin: 0, textAlign: 'left', paddingLeft: '1.2rem' }}><strong>September - November 2023</strong></p>
                </div>

                {/* Body content for second position */}
                <ul className="work-body-content work-body-content-second" style={{ paddingLeft: '1.2rem', listStyle: 'disc', width: '100%' }}>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Designed and developed an AR wayfinding app, integrating live geospatial, visual, and graph-based data for seamless indoor-outdoor localisation.
                  </li>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Implemented a dynamic routing system using Google Street View, Geospatial API, and Neo4j for an immersive real-time graph-based navigation and immersive 3D visualisation solution.
                  </li>
                  <li className="education-li" style={{ marginBottom: '0.5rem' }}>
                    Collaborated with Google and The GPT Group stakeholders, leading user requirement gathering, usability testing, and presenting findings to refine the system.
                  </li>
                </ul>
                <p className="education-li" style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  <strong className="education-strong">Technologies:</strong> <span className="education-li">Android Studio, Java, Unity, Cesium 3D Tiles, Neo4j, Google APIs</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    case 'projects':
      const projects: Project[] = [
        {
          id: 'project-1',
          title: 'Terminal-style AI Agent Career Chatbot',
          description: "Built a terminal-style web interface featuring an AI-powered career assistant used to intelligently answer career-related questions about an individual's background, experience, and skills.",
          image: '/images/project/chatbot-assistant.png',
          githubUrl: 'https://github.com/dbeukrf/diego-chatbot',
          technologies: [
            '/images/project/react-typescript.png',
            '/images/project/python.png',
            '/images/project/fast-api.png',
            '/images/project/langchain.svg',
            '/images/project/chromadb.png',
          ],
        },
        {
          id: 'project-2',
          title: 'ChatGPT-like LLM from Scratch',
          description: "A LLM similar to the GPT-2 model built from scratch in PyTorch, based on Sebastian Raschka's \"Build a Large Language Model (From Scratch)\"",
          image: '/images/project/llm-from-scratch.png',
          githubUrl: 'https://github.com/dbeukrf/diego-llm',
          technologies: [
            '/images/project/python.png',
            '/images/project/pytorch.png',
            '/images/project/numpy.png',
          ],
        },
        {
          id: 'project-3',
          title: 'Multi-Sensor Indoor Floor Detection App',
          description: 'Developed an Android application prototype that determines user\'s floor levels by combining barometric pressure, Wi-Fi signals, GPS, and real-time weather-station data, enhancing both accuracy and global scalability.',
          image: '/images/project/indoor-wayfinding.png',
          githubUrl: 'https://github.com/dbeukrf/IndoorLocalization',
          technologies: [
            '/images/project/android-studio.png',
            '/images/project/java.svg',
          ],
        },
        {
          id: 'project-4',
          title: 'AR-Based Wayfinding App with Gamification',
          description: 'Developed a prototype AR navigation system integrating Geospatial Anchors, Google Street View data, and Neo4j graph-based pathfinding to enable seamless indoor-outdoor navigation.',
          image: '/images/project/ar-wayfinding.png',
          githubUrl: 'https://github.com/dbeukrf/AR-Wayfinding',
          technologies: [
            '/images/project/android-studio.png',
            '/images/project/java.svg',
            '/images/project/neo4j.png',
            '/images/project/unity.svg',
            '/images/project/cesium-3d.avif',
          ],
        },
      ];

      return (
        <div style={{
          ...contentStyle, 
          textAlign: 'left', 
          marginTop: '-2rem',
          marginBottom: 0
        }}>
          <ProjectCarousel projects={projects} />
        </div>
      );

    case 'skillsLanguages':
      // Define skills data organized by categories
      const skillsData: Skill[] = [
        // --- AI & Machine Learning ---
        { id: 'langchain', name: 'LangChain', category: 'ai/ml' },
        { id: 'agno', name: 'Agno', category: 'ai/ml' },
        { id: 'google-adk', name: 'Google ADK', category: 'ai/ml' },
        { id: 'n8n', name: 'n8n', category: 'ai/ml' }, // workflow automation
        { id: 'fastgpt', name: 'FastGPT', category: 'ai/ml' },
        { id: 'vertex-ai', name: 'GCP Vertex AI', category: 'ai/ml' },
        { id: 'ai-agents', name: 'AI Agents', category: 'ai/ml' },
        { id: 'rag', name: 'RAG Workflows', category: 'ai/ml' },
        { id: 'chroma-db', name: 'Chroma DB', category: 'ai/ml' },
        { id: 'pytorch', name: 'PyTorch', category: 'ai/ml' },
        { id: 'numpy', name: 'NumPy', category: 'ai/ml' },
        
        // --- Cloud & DevOps ---
        { id: 'gcp', name: 'GCP', category: 'cloud-devops' },
        { id: 'firebase', name: 'Firebase', category: 'cloud-devops' },
        { id: 'aws', name: 'AWS', category: 'cloud-devops' },
        { id: 'docker', name: 'Docker', category: 'cloud-devops' },
        { id: 'git', name: 'Git', category: 'cloud-devops' },
        { id: 'ubuntu', name: 'Ubuntu/Linux', category: 'cloud-devops' },
        
        // --- Languages ---
        { id: 'python', name: 'Python', category: 'languages' },
        { id: 'java', name: 'Java', category: 'languages' },
        { id: 'javascript', name: 'JavaScript', category: 'languages' },
        { id: 'typescript', name: 'TypeScript', category: 'languages' },
        { id: 'sql', name: 'SQL', category: 'languages' },
        { id: 'php', name: 'PHP', category: 'languages' },
        { id: 'html', name: 'HTML', category: 'languages' },
        { id: 'css', name: 'CSS', category: 'languages' },


        // --- Frameworks & Tools ---
        { id: 'fastapi', name: 'FastAPI', category: 'frameworks' },
        { id: 'react', name: 'React', category: 'frameworks' },
        { id: 'android-studio', name: 'Android Studio', category: 'frameworks' },
        { id: 'bmad', name: 'BMAD', category: 'frameworks' },

        // Databases
        { id: 'postgresql', name: 'PostgreSQL', category: 'frameworks' },
        { id: 'mongodb', name: 'MongoDB', category: 'frameworks' },
        { id: 'neo4j', name: 'Neo4j', category: 'frameworks' },

        // Engineering Skills
        { id: 'full-stack', name: 'Full-Stack Development', category: 'frameworks' },
        { id: 'system-architecture', name: 'System Architecture Design', category: 'frameworks' },
        { id: 'test-automation', name: 'Test Automations', category: 'frameworks' },
        
        // --- Management & Delivery ---
        { id: 'agile-scrum', name: 'Agile/Scrum', category: 'management' },
        { id: 'project-coordination', name: 'Project Coordination', category: 'management' },
        { id: 'stakeholder-communication', name: 'Stakeholder Communication', category: 'management' },
        { id: 'it-governance', name: 'IT Governance', category: 'management' },
        { id: 'data-analysis', name: 'Data Analysis', category: 'management' },
      ];

      return (
        <div style={{...contentStyle, textAlign: 'left', width: '100%', height: '100%'}}>
          {/* Skills Force Layout */}
          <div 
            className="w-full bg-transparent mb-8 mt-12 sm:mt-10 min-h-[400px] sm:min-h-[400px]"
            style={{ 
              height: 'auto',
            }}
          >
            <SkillsForceLayout skills={skillsData} width={1400} height={900} />
          </div>
        </div>
      );

    case 'aiDj':
      return (
        <div style={{...contentStyle, textAlign: 'center'}} className="!text-center">
          <p style={{ paddingTop: '6rem', marginBottom: '3rem', textAlign: 'center' }} className="!text-center">
            The AI DJ is an interactive experience that allows you to explore my portfolio in a conversational way,
            diving deeper into any aspect that interests you.
          </p>
          <p style={{ textAlign: 'center' }} className="!text-center">
            Continue scrolling to discover the terminal-style chatbot.
          </p>
        </div>
      );

    default:
      return (
        <div style={{...contentStyle, textAlign: 'left'}}>
          <p>Content for this track is coming soon.</p>
        </div>
      );
  }
};

export default function AlbumView() {
  // Audio store
  const { setCurrentTrack, play, pause, toggleShuffle, isShuffled, currentTrackId } = useAudioStore();
  
  // Scrolling state
  const [heroHeight, setHeroHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [clipPathReveal, setClipPathReveal] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [manualRevealProgress, setManualRevealProgress] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  const [playerBarVisible, setPlayerBarVisible] = useState(false);
  const [gradientColorIndex, setGradientColorIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Location state
  const [locationText, setLocationText] = useState('Melbourne, Australia');
  const [weatherCurrent, setWeatherCurrent] = useState<WeatherData | null>(null);
  const [, setWeatherDaily] = useState<DailyWeatherData | null>(null);
  
  const mapToWeatherIcon = (w: WeatherData) => {
    const code = w.weatherCode !== undefined ? w.weatherCode : -1;
    const rain = w.rainMm !== undefined ? w.rainMm : 0;
    const cloud = w.cloudCoverPct !== undefined ? w.cloudCoverPct : 0;
    const isDay = (w.isDay !== undefined ? w.isDay : 1) === 1;
    const wind = w.windSpeed10m !== undefined ? w.windSpeed10m : 0;
    const isExtreme = wind >= 50 || rain >= 20;
    const dayNight = isDay ? 'day' : 'night';
    
    if (code === 0) { return { iconName: isDay ? 'clear-day' : 'clear-night', label: isDay ? 'Clear' : 'Clear night' }; }
    if (code === 1) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Mostly clear' }; }
    if (code === 2) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Partly cloudy' }; }
    if (code === 3) { return { iconName: isDay ? 'overcast-day' : 'overcast-night', label: 'Overcast' }; }
    if (code === 45 || code === 48) { return { iconName: isDay ? 'fog-day' : 'fog-night', label: 'Fog' }; }
    
    if (code === 51 || code === 53 || code === 55) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-drizzle`, label: 'Extreme drizzle' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-drizzle`, label: 'Overcast drizzle' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-drizzle`, label: 'Drizzle' }; }
      return { iconName: 'drizzle', label: 'Drizzle' };
    }
    
    if (code === 56 || code === 57) { return { iconName: 'sleet', label: 'Freezing drizzle' }; }
    
    if (code === 61 || code === 63 || code === 65) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-rain`, label: 'Extreme rain' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Overcast rain' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Rain' }; }
      return { iconName: 'rain', label: 'Rain' };
    }
    
    if (code === 66 || code === 67) { return { iconName: 'sleet', label: 'Freezing rain' }; }
    
    if (code === 71 || code === 73 || code === 75 || code === 77) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-snow`, label: 'Extreme snow' }; }
      if (wind >= 40) { return { iconName: 'wind-snow', label: 'Blowing snow' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-snow`, label: 'Overcast snow' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-snow`, label: 'Snow' }; }
      return { iconName: 'snow', label: 'Snow' };
    }
    
    if (code === 80 || code === 81 || code === 82) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-rain`, label: 'Extreme rain showers' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Overcast rain showers' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Rain showers' }; }
      return { iconName: 'rain', label: 'Rain showers' };
    }
    
    if (code === 85 || code === 86) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-snow`, label: 'Extreme snow showers' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-snow`, label: 'Overcast snow showers' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-snow`, label: 'Snow showers' }; }
      return { iconName: 'snow', label: 'Snow showers' };
    }
    
    if (code === 95 || code === 96 || code === 99) {
      const hasRain = rain > 0.1;
      const hasSnow = cloud >= 60 && rain < 0.1;
      
      if (isExtreme) {
        if (hasSnow) { return { iconName: `thunderstorms-${dayNight}-extreme-snow`, label: 'Extreme thunderstorms with snow' }; }
        if (hasRain) { return { iconName: `thunderstorms-${dayNight}-extreme-rain`, label: 'Extreme thunderstorms with rain' }; }
        return { iconName: `thunderstorms-${dayNight}-extreme`, label: 'Extreme thunderstorms' };
      }
      
      if (cloud >= 85) {
        if (hasSnow) { return { iconName: `thunderstorms-${dayNight}-overcast-snow`, label: 'Thunderstorms with snow' }; }
        if (hasRain) { return { iconName: `thunderstorms-${dayNight}-overcast-rain`, label: 'Thunderstorms with rain' }; }
        return { iconName: `thunderstorms-${dayNight}-overcast`, label: 'Thunderstorms' };
      }
      
      if (hasSnow) { return { iconName: `thunderstorms-${dayNight}-snow`, label: 'Thunderstorms with snow' }; }
      if (hasRain) { return { iconName: `thunderstorms-${dayNight}-rain`, label: 'Thunderstorms with rain' }; }
      return { iconName: `thunderstorms-${dayNight}`, label: 'Thunderstorms' };
    }
    
    if (code === 96 || code === 99) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-hail`, label: 'Extreme hail' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-hail`, label: 'Overcast hail' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-hail`, label: 'Hail' }; }
      return { iconName: 'hail', label: 'Hail' };
    }
    
    if (rain >= 20) { return { iconName: isDay ? 'extreme-day-rain' : 'extreme-night-rain', label: 'Extreme rain' }; }
    if (rain >= 10) {
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Heavy rain' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Heavy rain' }; }
      return { iconName: 'rain', label: 'Heavy rain' };
    }
    if (rain >= 2.5) {
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Moderate rain' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Moderate rain' }; }
      return { iconName: 'rain', label: 'Moderate rain' };
    }
    if (rain > 0) {
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Light rain' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Light rain' }; }
      return { iconName: 'rain', label: 'Light rain' };
    }
    
    if (wind >= 50) { return { iconName: 'wind', label: 'Very windy' }; }
    if (wind >= 35 && cloud >= 60) { return { iconName: 'wind-snow', label: 'Windy with snow' }; }
    if (wind >= 35) { return { iconName: 'wind', label: 'Windy' }; }
    
    if (cloud >= 85) { return { iconName: isDay ? 'overcast-day' : 'overcast-night', label: 'Overcast' }; }
    if (cloud >= 65) { return { iconName: isDay ? 'overcast-day' : 'overcast-night', label: 'Mostly cloudy' }; }
    if (cloud >= 35) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Partly cloudy' }; }
    if (cloud >= 15) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Mostly clear' }; }
    
    return { iconName: isDay ? 'clear-day' : 'clear-night', label: isDay ? 'Clear' : 'Clear night' };
  };
  
  const renderWeatherIcon = () => {
    if (!weatherCurrent) return null;
    const { iconName, label } = mapToWeatherIcon(weatherCurrent);
    const iconUrl = `/weathericons/${iconName}.svg`;
    return (
      <div
        className={`ml-0.5 sm:ml-1 md:ml-2 inline-flex items-center transition-opacity duration-1500 ${weatherCurrent ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!weatherCurrent}
      >
        <img
          src={iconUrl}
          alt={`${label} weather icon`}
          className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] md:w-[28px] md:h-[28px] lg:w-[32px] lg:h-[32px] xl:w-[36px] xl:h-[36px] -translate-y-[1.5px] sm:-translate-y-[2px] md:-translate-y-[3px]"
          loading="lazy"
        />
      </div>
    );
  };

  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const maxScrollTopRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const prevScrollProgressRef = useRef(0);
  const prevRevealRef = useRef(0);
  const maxRevealReachedRef = useRef(0);
  const trackSectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackTitleRefs = useRef<(HTMLElement | null)[]>([]);

  // Compute hero height
  useEffect(() => {
    const compute = () => {
      const heroH = heroRef.current ? heroRef.current.offsetHeight : 0;
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

  // Periodically refresh weather
  useEffect(() => {
    let isCancelled = false;
    const enableGeolocation = import.meta.env.VITE_ENABLE_GEOLOCATION !== 'false';
    const DEFAULT_LOCATION = 'Melbourne, Australia';
    const MELBOURNE = { lat: -37.8136, lon: 144.9631 };
    const url = "https://api.open-meteo.com/v1/forecast";

    const refresh = async () => {
      try {
        let latitude: number | null = null;
        let longitude: number | null = null;
        let locationStr = DEFAULT_LOCATION;

        if (enableGeolocation) {
          try {
            const geoResponse = await api.get<GeoResponse>('/geo');
            const { city, country_name, latitude: lat, longitude: lon } = geoResponse.data;
            latitude = lat;
            longitude = lon;
            if (city && country_name) locationStr = `${city}, ${country_name}`;
            else if (city) locationStr = city;
            else if (country_name) locationStr = country_name;
          } catch {
            // Ignore
          }
        }

        if (latitude === null || longitude === null) {
          latitude = MELBOURNE.lat;
          longitude = MELBOURNE.lon;
          if (!locationStr) locationStr = DEFAULT_LOCATION;
        }

        const params = {
          latitude,
          longitude,
          current: ["temperature_2m", "apparent_temperature", "is_day", "rain", "cloud_cover", "weather_code", "wind_speed_10m"],
          timezone: "auto",
        };
        const responses = await fetchWeatherApi(url, params);
        if (!responses || responses.length === 0) return;
        const resp = responses[0];
        const utcOffsetSeconds = resp.utcOffsetSeconds ? resp.utcOffsetSeconds() : 0;
        const currentBlock = resp.current ? resp.current() : null;
        if (!currentBlock) return;

        const temperature_2m = currentBlock.variables(0);
        const apparent_temperature = currentBlock.variables(1);
        const is_day = currentBlock.variables(2);
        const rain = currentBlock.variables(3);
        const cloud_cover = currentBlock.variables(4);
        const weather_code = currentBlock.variables(5);
        const wind_speed_10m = currentBlock.variables(6);

        if (temperature_2m && is_day && !isCancelled) {
          const updated = {
            time: new Date((Number(currentBlock.time()) + utcOffsetSeconds) * 1000),
            temperatureC: temperature_2m.value(),
            apparentTemperatureC: apparent_temperature ? apparent_temperature.value() : temperature_2m.value(),
            isDay: is_day.value(),
            rainMm: rain ? rain.value() : 0,
            cloudCoverPct: cloud_cover ? cloud_cover.value() : undefined,
            weatherCode: weather_code ? weather_code.value() : undefined,
            windSpeed10m: wind_speed_10m ? wind_speed_10m.value() : undefined,
            source: 'current',
          };
          setWeatherCurrent(prev => {
            if (!prev) return updated;
            const hasChanged =
              prev.isDay !== updated.isDay ||
              prev.weatherCode !== updated.weatherCode ||
              Math.round(prev.temperatureC) !== Math.round(updated.temperatureC) ||
              Math.round((prev.cloudCoverPct !== undefined ? prev.cloudCoverPct : -1)) !== Math.round((updated.cloudCoverPct !== undefined ? updated.cloudCoverPct : -1)) ||
              Math.round((prev.rainMm !== undefined ? prev.rainMm : 0) * 10) !== Math.round((updated.rainMm !== undefined ? updated.rainMm : 0) * 10) ||
              Math.round((prev.windSpeed10m !== undefined ? prev.windSpeed10m : 0)) !== Math.round((updated.windSpeed10m !== undefined ? updated.windSpeed10m : 0));
            return hasChanged ? updated : prev;
          });

          setLocationText((prevText) => {
            const temp = Math.round(updated.temperatureC);
            // const rainStatus = updated.rainMm > 0 ? `, ${Math.round(updated.rainMm)}mm rain` : '';
            // const currentText = `${temp}°C ${rainStatus}`;
            const currentText = `${temp}°C`;
            const parts = prevText.split(' - ');
            if (parts.length >= 2) {
              return `${parts[0]} - ${currentText}`;
            }
            return `${locationStr} - ${currentText}`;
          });
        }
      } catch {
        // Swallow
      }
    };

    const initial = setTimeout(refresh, 15000);
    const interval = setInterval(refresh, 600000);
    return () => {
      isCancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  // Compute controls height
  useEffect(() => {
    const compute = () => {
      const controlsH = controlsRef.current ? controlsRef.current.offsetHeight : 0;
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

  // Fetch visitor location and weather
  useEffect(() => {
    const enableGeolocation = import.meta.env.VITE_ENABLE_GEOLOCATION !== 'false';
    const DEFAULT_LOCATION = 'Melbourne, Australia';
    const MELBOURNE = { lat: -37.8136, lon: 144.9631 };
    
    const fetchWeather = async (latitude: number, longitude: number, locationStr: string) => {
      try {
        const url = "https://api.open-meteo.com/v1/forecast";
        const primaryParams = {
          latitude,
          longitude,
          current: ["temperature_2m", "apparent_temperature", "is_day", "rain", "cloud_cover", "weather_code", "wind_speed_10m"],
          daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
          timezone: "auto",
        };
        const primaryResponses = await fetchWeatherApi(url, primaryParams);
        if (!primaryResponses || primaryResponses.length === 0) throw new Error('No weather response received');
        const primary = primaryResponses[0];
        if (!primary) throw new Error('Invalid weather response');
        const utcOffsetSeconds = primary.utcOffsetSeconds ? primary.utcOffsetSeconds() : 0;
        let currentBlock = primary.current ? primary.current() : null;
        let dailyBlock = primary.daily ? primary.daily() : null;
        
        let finalCurrent = null;
        
        if (currentBlock) {
          const temperature_2m = currentBlock.variables(0);
          const apparent_temperature = currentBlock.variables(1);
          const is_day = currentBlock.variables(2);
          const rain = currentBlock.variables(3);
          const cloud_cover = currentBlock.variables(4);
          const weather_code = currentBlock.variables(5);
          const wind_speed_10m = currentBlock.variables(6);
          if (temperature_2m && is_day) {
            finalCurrent = {
              time: new Date((Number(currentBlock.time()) + utcOffsetSeconds) * 1000),
              temperatureC: temperature_2m.value(),
              apparentTemperatureC: apparent_temperature ? apparent_temperature.value() : temperature_2m.value(),
              isDay: is_day.value(),
              rainMm: rain ? rain.value() : 0,
              cloudCoverPct: cloud_cover ? cloud_cover.value() : undefined,
              weatherCode: weather_code ? weather_code.value() : undefined,
              windSpeed10m: wind_speed_10m ? wind_speed_10m.value() : undefined,
              source: 'current',
            };
          }
        }
        
        if (!finalCurrent) {
          const fallbackParams = {
            latitude,
            longitude,
            hourly: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
            past_days: 10,
            timezone: "auto",
          };
          const fbResponses = await fetchWeatherApi(url, fallbackParams);
          if (fbResponses && fbResponses.length > 0 && fbResponses[0]) {
            const fb = fbResponses[0];
            const fbUtcOffset = fb.utcOffsetSeconds ? fb.utcOffsetSeconds() : 0;
            const hourly = fb.hourly ? fb.hourly() : null;
            if (hourly) {
              const timesRaw = hourly.time ? hourly.time() : null;
              const timesArr = timesRaw ? Array.from(timesRaw as unknown as ArrayLike<number>).map((t) => Number(t)) : [];
              const tempVar = hourly.variables(0);
              const tempValuesRaw = tempVar && tempVar.valuesArray ? tempVar.valuesArray() : null;
              const tempValues = tempValuesRaw ? Array.from(tempValuesRaw as unknown as ArrayLike<number>).map((v) => Number(v)) : [];
              const lastIndex = timesArr.length > 0 ? timesArr.length - 1 : -1;
              if (lastIndex >= 0) {
                const lastTime = timesArr[lastIndex];
                const lastTemp = tempValues[lastIndex];
                if (typeof lastTemp === 'number' && !Number.isNaN(lastTemp)) {
                  finalCurrent = {
                    time: new Date((Number(lastTime) + fbUtcOffset) * 1000),
                    temperatureC: lastTemp,
                    apparentTemperatureC: lastTemp,
                    isDay: 1,
                    rainMm: 0,
                    source: 'latest-hourly',
                  };
                }
              }
            }
          }
        }
        
        let finalDaily = null;
        if (dailyBlock) {
          const timeArrRaw = dailyBlock.time();
          const tmax = dailyBlock.variables(0);
          const tmin = dailyBlock.variables(1);
          const psum = dailyBlock.variables(2);
          const timeNums = timeArrRaw ? Array.from(timeArrRaw as unknown as ArrayLike<number>).map((t) => Number(t)) : [];
          const times = timeNums.map((t) => new Date((Number(t) + utcOffsetSeconds) * 1000));
          const maxRaw = tmax && tmax.valuesArray ? tmax.valuesArray() : null;
          const minRaw = tmin && tmin.valuesArray ? tmin.valuesArray() : null;
          const pRaw = psum && psum.valuesArray ? psum.valuesArray() : null;
          const maxArr = maxRaw ? Array.from(maxRaw as ArrayLike<number>).map((v) => Number(v)) : [];
          const minArr = minRaw ? Array.from(minRaw as ArrayLike<number>).map((v) => Number(v)) : [];
          const pArr = pRaw ? Array.from(pRaw as ArrayLike<number>).map((v) => Number(v)) : undefined;
          if (times.length && maxArr.length && minArr.length) {
            finalDaily = {
              time: times,
              temperatureMaxC: maxArr,
              temperatureMinC: minArr,
              precipitationSumMm: pArr,
            };
          }
        }
        
        if (finalCurrent) setWeatherCurrent(finalCurrent);
        if (finalDaily) setWeatherDaily(finalDaily);
        
        if (finalCurrent) {
          const temp = Math.round(finalCurrent.temperatureC);
          const rainStatus = finalCurrent.rainMm > 0 ? `, ${Math.round(finalCurrent.rainMm)}mm rain` : '';
          const currentText = `${temp}°C ${rainStatus}`;
          let dailyText = '';
          if (finalDaily && finalDaily.temperatureMaxC.length > 0 && finalDaily.temperatureMinC.length > 0) {
            const hi = Math.round(finalDaily.temperatureMaxC[0]);
            const lo = Math.round(finalDaily.temperatureMinC[0]);
            dailyText = ` • H/L ${hi}/${lo}°C`;
          }
          const full = `${currentText}${dailyText}`;
          if (locationStr) setLocationText(`${locationStr} - ${full}`); else setLocationText(full);
        } else if (locationStr) {
          setLocationText(locationStr);
        }
      } catch (weatherError) {
        console.error('Failed to fetch weather:', weatherError);
        if (locationStr) {
          setLocationText(locationStr);
        }
      }
    };
    
    if (!enableGeolocation) {
      fetchWeather(MELBOURNE.lat, MELBOURNE.lon, DEFAULT_LOCATION);
      return;
    }
    
    const fetchLocationAndWeather = async () => {
      try {
        const geoResponse = await api.get<GeoResponse>('/geo');
        const { city, country_name, latitude, longitude } = geoResponse.data;
        
        let locationStr = '';
        if (city && country_name) {
          locationStr = `${city}, ${country_name}`;
        } else if (city) {
          locationStr = city;
        } else if (country_name) {
          locationStr = country_name;
        }
        
        if (latitude !== null && longitude !== null) {
          await fetchWeather(latitude, longitude, locationStr);
        } else {
          const defaultLocation = locationStr || DEFAULT_LOCATION;
          await fetchWeather(MELBOURNE.lat, MELBOURNE.lon, defaultLocation);
        }
      } catch (error) {
        console.error('Failed to fetch location:', error);
        await fetchWeather(MELBOURNE.lat, MELBOURNE.lon, DEFAULT_LOCATION);
      }
    };
    
    fetchWeather(MELBOURNE.lat, MELBOURNE.lon, DEFAULT_LOCATION).finally(() => {
      fetchLocationAndWeather();
    });
  }, []);

  // Handle wheel events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current) return;
      
      const vh = window.innerHeight;
      const revealDistance = vh * 1.5;
      const scrollTop = scrollContainerRef.current.scrollTop;
      
      if (scrollTop < revealDistance) {
        if (manualRevealProgress < 1 && e.deltaY > 0) {
          e.preventDefault();
          
          setManualRevealProgress((prev) => {
            const delta = e.deltaY;
            const newProgress = Math.max(0, Math.min(1, prev + delta / revealDistance));
            
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
        else if (manualRevealProgress > 0 && e.deltaY < 0) {
          e.preventDefault();
          
          setManualRevealProgress((prev) => {
            const delta = Math.abs(e.deltaY);
            const newProgress = Math.max(0, Math.min(1, prev - delta / revealDistance));
            
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
  }, [manualRevealProgress, viewportHeight]);

  // Capture track title refs
  useEffect(() => {
    const updateTitleRefs = () => {
      TRACKS.forEach((_, index) => {
        const titleElement = document.querySelector(`[data-track-index="${index}"] #track-title`) as HTMLElement | null;
        if (titleElement) {
          trackTitleRefs.current[index] = titleElement;
        }
      });
    };
    
    updateTitleRefs();
    const timeoutId = setTimeout(updateTitleRefs, 100);
    
    if (contentVisible) {
      const visibleTimeoutId = setTimeout(updateTitleRefs, 200);
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(visibleTimeoutId);
      };
    }
    
    return () => clearTimeout(timeoutId);
  }, [contentVisible]);

  // Handle scroll for parallax effect
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const scrollTop = scrollContainerRef.current.scrollTop;
      const vh = window.innerHeight;
      const revealDistance = vh * 1.5;
      const prevScrollTop = prevScrollTopRef.current;
      const isScrollingUp = scrollTop < prevScrollTop;
      
      if (scrollTop > maxScrollTopRef.current) {
        maxScrollTopRef.current = scrollTop;
      }
      
      let reveal;
      
      const contentScrollMax = scrollContainerRef.current ? scrollContainerRef.current.scrollHeight : 0;
      const maxContentScroll = contentScrollMax - vh - revealDistance;
      const shrinkDistance = Math.min(maxContentScroll * 0.1, revealDistance * 0.3);
      
      if (scrollTop < revealDistance) {
        const scrollBasedReveal = Math.max(0, Math.min(1, scrollTop / revealDistance));
        
        if (isScrollingUp) {
          const scrollBack = revealDistance - scrollTop;
          let calculatedReveal;
          
          if (scrollBack >= 0 && scrollBack <= shrinkDistance && shrinkDistance > 0) {
            calculatedReveal = Math.max(0, Math.min(1, 1 - (scrollBack / shrinkDistance)));
          } else if (scrollBack > shrinkDistance) {
            calculatedReveal = 0;
          } else {
            calculatedReveal = 1;
          }
          
          reveal = Math.min(calculatedReveal, maxRevealReachedRef.current);
          setManualRevealProgress(reveal);
        } else {
          if (manualRevealProgress > scrollBasedReveal) {
            reveal = manualRevealProgress;
          } else {
            reveal = scrollBasedReveal;
            setManualRevealProgress(scrollBasedReveal);
          }
        }
      } else {
        const contentScroll = scrollTop - revealDistance;
        const currentScrollProgress = maxContentScroll > 0 
          ? Math.max(0, Math.min(1, contentScroll / maxContentScroll)) 
          : 0;
        
        const isOnFirstTrack = currentScrollProgress < 0.1;
        
        if (isScrollingUp && isOnFirstTrack) {
          const scrollBack = revealDistance - scrollTop;
          let calculatedReveal;
          
          if (scrollBack >= 0 && scrollBack <= shrinkDistance && shrinkDistance > 0) {
            calculatedReveal = Math.max(0, Math.min(1, 1 - (scrollBack / shrinkDistance)));
          } else if (scrollBack > shrinkDistance) {
            calculatedReveal = 0;
          } else {
            calculatedReveal = 1;
          }
          
          reveal = Math.min(calculatedReveal, maxRevealReachedRef.current);
        } else if (isOnFirstTrack) {
          reveal = 1;
        } else {
          reveal = 1;
        }
      }
      
      prevScrollTopRef.current = scrollTop;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          setClipPathReveal(reveal);
          
          prevRevealRef.current = reveal;
          
          if (reveal > maxRevealReachedRef.current) {
            maxRevealReachedRef.current = reveal;
          }
          
          if (scrollTop === 0) {
            maxRevealReachedRef.current = 0;
          }
          
          if (reveal >= 1 && scrollTop >= revealDistance) {
            setContentVisible(true);
            
            const contentScroll = scrollTop - revealDistance;
            const contentScrollMax = scrollContainerRef.current ? scrollContainerRef.current.scrollHeight : 0;
            const maxContentScroll = contentScrollMax - vh - revealDistance;
            
            const newScrollProgress = maxContentScroll > 0 
              ? Math.max(0, Math.min(1, contentScroll / maxContentScroll)) 
              : 0;
            
            setScrollProgress(newScrollProgress);
            prevScrollProgressRef.current = newScrollProgress;
          } else {
            setContentVisible(false);
            setScrollProgress(reveal);
            prevScrollProgressRef.current = reveal;
          }

          const segmentSize = 27;
          const newGradientColorIndex = Math.floor(scrollTop / segmentSize) % RAINBOW_COLORS.length;
          setGradientColorIndex(newGradientColorIndex);

          const viewportY = viewportHeight || vh;
          if (viewportY > 0 && trackSectionRefs.current.length) {
            const rects = trackSectionRefs.current.map((section) =>
              section ? section.getBoundingClientRect() : null
            );
            const viewportCenter = viewportY / 2;

            let activeIndex = -1;
            rects.forEach((rect, index) => {
              if (!rect) return;
              if (rect.top <= viewportCenter && rect.bottom >= viewportCenter && activeIndex === -1) {
                activeIndex = index;
              }
            });

            if (activeIndex === -1) {
              let closestDistance = Number.POSITIVE_INFINITY;
              rects.forEach((rect, index) => {
                if (!rect) return;
                const trackCenter = rect.top + rect.height / 2;
                const distance = Math.abs(trackCenter - viewportCenter);
                if (distance < closestDistance) {
                  closestDistance = distance;
                  activeIndex = index;
                }
              });
            }

            const activeRect = activeIndex >= 0 ? rects[activeIndex] : null;
            if (activeRect) {
              const progress = clamp((viewportCenter - activeRect.top) / activeRect.height, 0, 1);

              if (activeIndex >= 0) {
                setCurrentTrackIndex((prev) =>
                  prev !== activeIndex ? activeIndex : prev
                );
              }

              setCurrentTrackProgress((prev) =>
                Math.abs(prev - progress) > 0.01 ? clamp(progress, 0, 1) : prev
              );
            } else {
              setCurrentTrackProgress(0);
            }
          }
          
          rafId = null;
        });
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [manualRevealProgress, viewportHeight]);

  // Hide body scrollbar
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const handleAlbumImageClick = () => {
    setPlayerBarVisible(false);
    pause();
    setCurrentTrack(null);
  };

  const scrollToTrack = (trackIndex: number) => {
    if (!scrollContainerRef.current) return;
    
    const track = TRACKS[trackIndex];
    if (!track) return;
    
    const vh = viewportHeight || window.innerHeight;
    const revealDistance = vh * 1.5;
    
    setCurrentTrackProgress(0);
    setCurrentTrackIndex(trackIndex);
    
    const titleElement = trackTitleRefs.current[trackIndex];
    
    if (titleElement && scrollContainerRef.current) {
      const titleRect = titleElement.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const currentScrollTop = scrollContainerRef.current.scrollTop;
      const titleTopRelativeToContainer = titleRect.top - containerRect.top + currentScrollTop;
      const stickyOffset = heroHeight + controlsHeight;
      const offsetFromTop = stickyOffset + 20;
      const targetScrollPosition = titleTopRelativeToContainer - offsetFromTop;
      const finalScrollPosition = Math.max(revealDistance, targetScrollPosition);
      
      const currentScroll = scrollContainerRef.current.scrollTop;
      if (currentScroll < revealDistance) {
        scrollContainerRef.current.scrollTo({ top: revealDistance, behavior: 'smooth' });
        
        setTimeout(() => {
          if (scrollContainerRef.current && titleElement) {
            const newTitleRect = titleElement.getBoundingClientRect();
            const newContainerRect = scrollContainerRef.current.getBoundingClientRect();
            const newScrollTop = scrollContainerRef.current.scrollTop;
            const newTitleTopRelativeToContainer = newTitleRect.top - newContainerRect.top + newScrollTop;
            const newTargetScrollPosition = Math.max(revealDistance, newTitleTopRelativeToContainer - offsetFromTop);
            scrollContainerRef.current.scrollTo({ top: newTargetScrollPosition, behavior: 'smooth' });
          }
        }, 500);
      } else {
        scrollContainerRef.current.scrollTo({ top: finalScrollPosition, behavior: 'smooth' });
      }
    } else {
      const offset = trackIndex === 0 ? vh * 0.25 : 0;
      const trackScrollPosition = revealDistance + (trackIndex * vh) + offset;
      
      const currentScrollTop = scrollContainerRef.current.scrollTop;
      if (currentScrollTop < revealDistance) {
        scrollContainerRef.current.scrollTo({ top: revealDistance, behavior: 'smooth' });
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: trackScrollPosition, behavior: 'smooth' });
          }
        }, 500);
      } else {
        scrollContainerRef.current.scrollTo({ top: trackScrollPosition, behavior: 'smooth' });
      }
    }
  };

  const scrollToAlbumView = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackTitleClick = (trackId: string) => {
    const trackIndex = TRACKS.findIndex(t => t.id === trackId);
    if (trackIndex >= 0) {
      scrollToTrack(trackIndex);
    }
  };

  const totalSections = TRACKS.length + 1;

  return (
    <div 
      ref={scrollContainerRef}
      className="h-screen w-screen overflow-y-scroll overflow-x-hidden bg-[#0c0c0c]"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      <div ref={heroRef} className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#1f2937] to-[#0c0c0c] flex flex-row items-center gap-1 sm:gap-2 md:gap-2.5 lg:gap-3 px-1.5 sm:px-2.5 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5 overflow-hidden max-h-[35vh] md:max-h-[25vh]">
        <img
          src="/images/album-cover1.jpg"
          alt="Album cover"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover shadow-2xl rounded relative z-10 cursor-pointer flex-shrink-0"
          onClick={handleAlbumImageClick}
        />

        <div className="text-left flex-1 relative z-10 min-w-0 flex flex-col justify-center overflow-visible max-w-[60%] sm:max-w-none">
          <div className="min-w-0">
            <Shuffle
              tag="p"
              className="text-[clamp(7px,2.2vw,9px)] sm:text-[clamp(8px,2.5vw,10px)] md:text-[10px] lg:text-xs font-semibold text-white/70 mb-0.5 sm:mb-0.5 md:mb-1 md:whitespace-nowrap"
              text="Album"
              duration={0.35}
              animationMode="evenodd"
              triggerOnHover
              triggerOnce={false}
              threshold={0}
              rootMargin="0px"
              textAlign="left"
            />
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 min-w-0">
              <Shuffle
                tag="h1"
                className="text-[clamp(9px,3vw,11px)] sm:text-[clamp(10px,3.2vw,12px)] md:text-sm lg:text-base xl:text-lg font-extrabold text-white mb-0.5 sm:mb-0.5 md:mb-1 leading-tight break-words md:truncate md:whitespace-nowrap"
                text={locationText}
                duration={0.5}
                animationMode="evenodd"
                triggerOnHover
                triggerOnce={false}
                threshold={0}
                rootMargin="0px"
                textAlign="left"
              />
              {weatherCurrent ? renderWeatherIcon() : null}
            </div>
          </div>
          
          <Shuffle
            tag="p"
            className="text-white/90 mb-0 text-[clamp(7px,2.8vw,9px)] sm:text-[clamp(8px,3vw,10px)] md:text-[10px] lg:text-xs break-words md:truncate md:whitespace-nowrap leading-snug"
            text="Diego Beuk • 2025 • 6 songs, 12 min"
            duration={0.4}
            animationMode="random"
            triggerOnHover
            triggerOnce
            threshold={0}
            rootMargin="0px"
            textAlign="left"
          />
        </div>

        <div className="flex flex-col items-end justify-center gap-0.5 sm:gap-0.5 md:gap-1 text-white text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs sm:flex-shrink-0 relative z-10 max-w-[40%] sm:max-w-none">
          <div className="flex flex-col items-end space-y-0 sm:space-y-0 md:space-y-0.5">
            <Shuffle tag="span" className="text-[8px] sm:text-[9px] md:text-[10px] truncate max-w-full" text="beuk.diego@gmail.com" duration={0.35} triggerOnHover triggerOnce threshold={0} rootMargin="0px" textAlign="right" />
            <Shuffle tag="span" className="text-[8px] sm:text-[9px] md:text-[10px] truncate max-w-full" text="+61 448 092 338" duration={0.35} triggerOnHover triggerOnce threshold={0} rootMargin="0px" textAlign="right" />
          </div>

          <div className="flex space-x-1 sm:space-x-1.5 md:space-x-2 lg:space-x-2.5">
            <a
              href="https://www.linkedin.com/in/diego-beuk-8a9100288/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors focus:outline-none rounded flex-shrink-0"
              style={{
                transition: 'opacity 0.2s',
                textDecoration: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              onFocus={(e) => e.currentTarget.style.outline = 'none'}
              aria-label="Diego Beuk LinkedIn profile"
            >
              <FaLinkedin className="w-3 h-3 sm:w-[14px] sm:h-[14px] md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" color="white" />
            </a>
            <a
              href="https://github.com/dbeukrf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors focus:outline-none rounded flex-shrink-0"
              style={{
                transition: 'opacity 0.2s',
                textDecoration: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              onFocus={(e) => e.currentTarget.style.outline = 'none'}
              aria-label="Diego Beuk Github profile"
            >
              <FaGithub className="w-3 h-3 sm:w-[14px] sm:h-[14px] md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" color="white" />
            </a>
          </div>
        </div>
      </div>

      <div ref={controlsRef} className="sticky z-40 w-full bg-transparent" style={{ top: `${heroHeight}px` }}>
        <div className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-6 py-2.5 md:py-4">
          <div className="relative group">
            <button 
              onClick={() => {
                if (isShuffled) {
                  const randomTrack = TRACKS[Math.floor(Math.random() * TRACKS.length)];
                  setCurrentTrack(randomTrack.id);
                } else {
                  if (!currentTrackId) {
                    setCurrentTrack(TRACKS[0].id);
                  }
                }
                play();
                setPlayerBarVisible(true);
              }}
              className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors focus:outline-none"
            >
              <FaPlay size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Play
            </span>
          </div>

          <div className="relative group">
            <button 
              onClick={() => {
                toggleShuffle();
              }}
              className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 hover:bg-white/20 transition-colors focus:outline-none ${
                isShuffled ? 'bg-white/20 text-[#FFCD70]' : 'text-white'
              }`}
            >
              <FaRandom size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Shuffle
            </span>
          </div>

          <div className="relative group">
            <button className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">
              <FaUserPlus size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Invite Collaborator
            </span>
          </div>
        </div>
      </div>

      <div 
        className="sticky z-40 bg-transparent w-full overflow-hidden"
        style={{ 
          top: `${heroHeight + controlsHeight}px`,
          height: `calc(100vh - ${heroHeight + controlsHeight}px)`,
          maxHeight: `calc(100vh - ${heroHeight + controlsHeight}px)`
        }}
      >
        <div 
          className="h-full flex flex-col px-3 md:px-6 max-w-[1600px] mx-auto overflow-y-auto"
          style={{
            paddingTop: '0.125rem',
            paddingBottom: '0.125rem'
          }}
        >
          <div className="grid grid-cols-12 text-white/70 text-[10px] md:text-xs font-semibold border-b border-white/20 pb-0.5 md:pb-1 mb-0.5 md:mb-1 px-1.5 md:px-3 flex-shrink-0">
            <div className="col-span-1 text-middle">#</div>
            <div className="col-span-6 text-middle">Title</div>
            <div className="col-span-3 text-middle hidden sm:block">Artist</div>
            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-0.5 mr-4 md:mr-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-2.5 h-2.5 md:w-3 md:h-3"
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

          <div className="space-y-0.5 md:space-y-1 flex-1 min-h-0">
            {TRACKS.map((track, index) => {
              const isAIDJ = track.id === 'aiDj';
              const totalSeconds = track.duration || 0;
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = String(totalSeconds % 60).padStart(2, '0');
              const formattedDuration = `${minutes}:${seconds}`;

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 items-center text-white hover:bg-[#6b7280]/15 rounded-lg px-1.5 md:px-3 py-0.5 md:py-1 transition-colors cursor-pointer focus:outline-none focus-visible:outline-none`}
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
                  <div className="col-span-1 text-white/80 text-xs md:text-sm">{track.number}</div>

                  {isAIDJ ? (
                    <div className="col-span-11 flex justify-center items-center gap-3.5">
                      <img
                        src={'/images/bars-scale-middle.svg'}
                        alt="AI DJ"
                        className="w-3.5 h-3.5 md:w-4 md:h-4 object-cover rounded flex-shrink-0"
                      />
                      <h3 className="text-xs md:text-sm font-semibold text-center m-0 leading-none">- {track.title}</h3>                    
                    </div>
                  ) : (
                    <>
                      <div className="col-span-6 sm:col-span-6 text-white font-semibold text-xs md:text-sm truncate">
                        {track.title}
                      </div>

                      <div className="col-span-3 text-white/70 text-[10px] md:text-xs hidden sm:block truncate">
                        {track.artist || 'Diego Beuk'}
                      </div>

                      <div className="col-span-3 sm:col-span-2 flex items-center justify-end text-white/70 text-[10px] md:text-xs mr-2 md:mr-3">
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

      <div className="relative w-full">
        <div
          className="fixed inset-0"
          style={{
            top: 0,
            bottom: 0,
            clipPath: `inset(${50 - Math.max(0, Math.min(1, clipPathReveal)) * 50}% 0% ${50 - Math.max(0, Math.min(1, clipPathReveal)) * 50}% 0%)`,
            transition: 'clip-path 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'clip-path',
            zIndex: 50,
            backgroundColor: '#F5F5F5',
            pointerEvents: contentVisible ? 'auto' : 'none'
          }}
        />

        <div 
          className="relative z-[60]"
          style={{
            minHeight: `${totalSections * 100}vh`,
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible 
              ? `translate3d(0, ${(viewportHeight || window.innerHeight) - (scrollProgress * (viewportHeight || window.innerHeight) * 1.5)}px, 0)` 
              : `translate3d(0, ${viewportHeight || window.innerHeight}px, 0)`,
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: contentVisible ? 'transform, opacity' : 'opacity',
            backgroundColor: 'transparent',
            margin: 0,
            padding: 0,
            fontSize: 0
          }}
        >
          {TRACKS.map((track, index) => (
            <div 
              key={track.id}
              data-track-index={index}
              ref={(el) => {
                trackSectionRefs.current[index] = el;
              }}
              className="w-full m-0 p-0"
              style={{ 
                backgroundColor: '#F5F5F5', 
                margin: 0, 
                padding: 0,
                minHeight: '100vh',
                display: 'block',
                fontSize: '16px'
              }}
            >
              <TrackPage
                title={track.title}
                trackNumber={track.number}
                gradientColorIndex={gradientColorIndex}
                content={getTrackContent(track.id)}
                className="w-full h-full min-h-screen bg-[#F5F5F5]"
                headerClassName="bg-[#F5F5F5]"
                contentClassName="bg-[#F5F5F5]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar table / Mobile hamburger menu */}
      <div
        className={`fixed top-4 left-4 z-[80] transition-all duration-500 ease-out ${
          contentVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        {/* Hamburger icon - mobile only */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-white bg-black/50 rounded-md hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Toggle track menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <FaTimes className="w-5 h-5" />
          ) : (
            <FaBars className="w-5 h-5" />
          )}
        </button>

        {/* Progress bar table - desktop always visible, mobile only when menu is open */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block absolute top-12 md:top-0 left-0 md:left-0 bg-black/90 md:bg-transparent rounded-md md:rounded-none p-2 md:p-0 shadow-lg md:shadow-none`}>
          <div className="grid gap-1">
            {TRACKS.map((track, index) => {
              const isActive = index === currentTrackIndex;
              const label = `${String(track.number).padStart(2, '0')} ${track.title}`;
              const width = isActive ? `${Math.round(clamp(currentTrackProgress, 0, 1) * 100)}%` : '0%';

              return (
                <button
                  key={track.id}
                  onClick={() => {
                    scrollToTrack(index);
                    setIsMobileMenuOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToTrack(index);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`relative min-w-[140px] px-2 py-1 text-left text-white text-[10px] font-semibold rounded-md overflow-hidden transition-transform duration-300 focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 ${
                    isActive ? 'shadow-lg scale-[1.02]' : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="relative z-10 drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]">{label}</span>
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
                      style={{ width, opacity: isActive ? 1 : 0, backgroundColor: '#A4A4A4' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <PlayerBar 
        isVisible={playerBarVisible} 
        contentVisible={contentVisible} 
        clipPathReveal={clipPathReveal}
        onAlbumImageClick={scrollToAlbumView}
        onTrackTitleClick={handleTrackTitleClick}
      />
    </div>
  );
}