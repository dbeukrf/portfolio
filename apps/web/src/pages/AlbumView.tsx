import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../data/tracks';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { FaPlay, FaRandom, FaUserPlus } from 'react-icons/fa';
import Shuffle from '../components/ui/Shuffle';
import { api } from '../services/api';
import { fetchWeatherApi } from 'openmeteo';
import PlayerBar from '../components/player/PlayerBar';
import { useAudioStore } from '../stores/audioStore';
import TrackPage, { RAINBOW_COLORS } from '../components/tracks/TrackPage';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export default function AlbumView() {
  // Audio store
  const { setCurrentTrack, play, pause, toggleShuffle, isShuffled, currentTrackId } = useAudioStore();
  
  // Scrolling state
  const [heroHeight, setHeroHeight] = useState<number>(0);
  const [controlsHeight, setControlsHeight] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0); // 0..1 overall scroll progress
  const [clipPathReveal, setClipPathReveal] = useState<number>(0); // Reveal value for clipPath (0..1)
  const [contentVisible, setContentVisible] = useState<boolean>(false); // Track content visibility
  const [viewportHeight, setViewportHeight] = useState<number>(0); // Viewport height for calculations
  const [manualRevealProgress, setManualRevealProgress] = useState<number>(0); // Manual reveal progress during reveal phase
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [currentTrackProgress, setCurrentTrackProgress] = useState<number>(0);
  const [playerBarVisible, setPlayerBarVisible] = useState<boolean>(false); // Player bar visibility
  const [gradientColorIndex, setGradientColorIndex] = useState<number>(0); // Gradient color index for track titles
  
  // Location state
  const [locationText, setLocationText] = useState<string>('Melbourne, Australia');
  const [weatherCurrent, setWeatherCurrent] = useState<{
    time: Date;
    temperatureC: number;
    apparentTemperatureC: number;
    isDay: number;
    rainMm: number;
    cloudCoverPct?: number;
    weatherCode?: number;
    windSpeed10m?: number;
    source: 'current' | 'latest-hourly';
  } | null>(null);
  const [weatherDaily, setWeatherDaily] = useState<{
    time: Date[];
    temperatureMaxC: number[];
    temperatureMinC: number[];
    precipitationSumMm?: number[];
  } | null>(null);
  
  const mapToWeatherIcon = (w: {
    weatherCode?: number;
    rainMm?: number;
    cloudCoverPct?: number;
    isDay?: number;
    windSpeed10m?: number;
  }): { iconName: string; label: string } => {
    const code = w.weatherCode ?? -1;
    const rain = w.rainMm ?? 0;
    const cloud = w.cloudCoverPct ?? 0;
    const isDay = (w.isDay ?? 1) === 1;
    const wind = w.windSpeed10m ?? 0;
    const isExtreme = wind >= 50 || rain >= 20;
    const dayNight = isDay ? 'day' : 'night';
    
    // WMO code mapping (https://open-meteo.com/en/docs#weathervariables)
    
    // Clear sky
    if (code === 0) { return { iconName: isDay ? 'clear-day' : 'clear-night', label: isDay ? 'Clear' : 'Clear night' }; }
    
    // Mostly clear
    if (code === 1) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Mostly clear' }; }
    
    // Partly cloudy
    if (code === 2) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Partly cloudy' }; }
    
    // Overcast
    if (code === 3) { return { iconName: isDay ? 'overcast-day' : 'overcast-night', label: 'Overcast' }; }
    
    // Fog
    if (code === 45 || code === 48) { return { iconName: isDay ? 'fog-day' : 'fog-night', label: 'Fog' }; }
    
    // Drizzle
    if (code === 51 || code === 53 || code === 55) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-drizzle`, label: 'Extreme drizzle' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-drizzle`, label: 'Overcast drizzle' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-drizzle`, label: 'Drizzle' }; }
      return { iconName: 'drizzle', label: 'Drizzle' };
    }
    
    // Freezing drizzle
    if (code === 56 || code === 57) { return { iconName: 'sleet', label: 'Freezing drizzle' }; }
    
    // Rain
    if (code === 61 || code === 63 || code === 65) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-rain`, label: 'Extreme rain' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Overcast rain' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Rain' }; }
      return { iconName: 'rain', label: 'Rain' };
    }
    
    // Freezing rain
    if (code === 66 || code === 67) { return { iconName: 'sleet', label: 'Freezing rain' }; }
    
    // Snow
    if (code === 71 || code === 73 || code === 75 || code === 77) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-snow`, label: 'Extreme snow' }; }
      if (wind >= 40) { return { iconName: 'wind-snow', label: 'Blowing snow' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-snow`, label: 'Overcast snow' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-snow`, label: 'Snow' }; }
      return { iconName: 'snow', label: 'Snow' };
    }
    
    // Rain showers
    if (code === 80 || code === 81 || code === 82) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-rain`, label: 'Extreme rain showers' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-rain`, label: 'Overcast rain showers' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-rain`, label: 'Rain showers' }; }
      return { iconName: 'rain', label: 'Rain showers' };
    }
    
    // Snow showers
    if (code === 85 || code === 86) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-snow`, label: 'Extreme snow showers' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-snow`, label: 'Overcast snow showers' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-snow`, label: 'Snow showers' }; }
      return { iconName: 'snow', label: 'Snow showers' };
    }
    
    // Thunderstorms
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
    
    // Hail
    if (code === 96 || code === 99) {
      if (isExtreme) { return { iconName: `extreme-${dayNight}-hail`, label: 'Extreme hail' }; }
      if (cloud >= 85) { return { iconName: `overcast-${dayNight}-hail`, label: 'Overcast hail' }; }
      if (cloud >= 35) { return { iconName: `partly-cloudy-${dayNight}-hail`, label: 'Hail' }; }
      return { iconName: 'hail', label: 'Hail' };
    }
    
    // Heuristics when code is missing or invalid
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
    
    // Windy conditions
    if (wind >= 50) { return { iconName: 'wind', label: 'Very windy' }; }
    if (wind >= 35 && cloud >= 60) { return { iconName: 'wind-snow', label: 'Windy with snow' }; }
    if (wind >= 35) { return { iconName: 'wind', label: 'Windy' }; }
    
    // Cloud cover based conditions
    if (cloud >= 85) { return { iconName: isDay ? 'overcast-day' : 'overcast-night', label: 'Overcast' }; }
    if (cloud >= 65) { return { iconName: isDay ? 'overcast-day' : 'overcast-night', label: 'Mostly cloudy' }; }
    if (cloud >= 35) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Partly cloudy' }; }
    if (cloud >= 15) { return { iconName: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Mostly clear' }; }
    
    // Default: clear
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
  const heroRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const announceRef = useRef<HTMLDivElement | null>(null);
  const maxScrollTopRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const prevScrollProgressRef = useRef<number>(0);
  const prevRevealRef = useRef<number>(0); // Track previous reveal value to prevent expansion when scrolling up
  const maxRevealReachedRef = useRef<number>(0); // Track maximum reveal reached to ensure scrolling up only shrinks
  const trackSectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackTitleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  // Compute hero height
  useEffect(() => {
    const compute = () => {
      const heroH = heroRef.current?.offsetHeight ?? 0;
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

  // Periodically refresh weather so the icon updates on weather/time (day/night) changes
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
            const geoResponse = await api.get<{ 
              city: string | null; 
              country_name: string | null;
              latitude: number | null;
              longitude: number | null;
            }>('/geo');
            const { city, country_name, latitude: lat, longitude: lon } = geoResponse.data;
            latitude = lat;
            longitude = lon;
            if (city && country_name) locationStr = `${city}, ${country_name}`;
            else if (city) locationStr = city;
            else if (country_name) locationStr = country_name;
          } catch {
            // Ignore geo refresh errors; fall back to default below
          }
        }

        if (latitude === null || longitude === null) {
          latitude = MELBOURNE.lat;
          longitude = MELBOURNE.lon;
          if (!locationStr) locationStr = DEFAULT_LOCATION;
        }

        // Fetch only "current" block to keep refresh light
        const params: any = {
          latitude,
          longitude,
          current: ["temperature_2m", "apparent_temperature", "is_day", "rain", "cloud_cover", "weather_code", "wind_speed_10m"],
          timezone: "auto",
        };
        const responses = await fetchWeatherApi(url, params);
        if (!responses || responses.length === 0) return;
        const resp = responses[0];
        const utcOffsetSeconds = resp.utcOffsetSeconds?.() ?? 0;
        const currentBlock = resp.current?.();
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
            apparentTemperatureC: apparent_temperature?.value() ?? temperature_2m.value(),
            isDay: is_day.value(),
            rainMm: rain?.value() ?? 0,
            cloudCoverPct: cloud_cover?.value(),
            weatherCode: weather_code?.value(),
            windSpeed10m: wind_speed_10m?.value(),
            source: 'current' as const,
          };
          setWeatherCurrent(prev => {
            // Avoid unnecessary state updates if nothing changed
            const hasChanged =
              !prev ||
              prev.isDay !== updated.isDay ||
              prev.weatherCode !== updated.weatherCode ||
              Math.round(prev.temperatureC) !== Math.round(updated.temperatureC) ||
              Math.round((prev.cloudCoverPct ?? -1)) !== Math.round((updated.cloudCoverPct ?? -1)) ||
              Math.round((prev.rainMm ?? 0) * 10) !== Math.round((updated.rainMm ?? 0) * 10) ||
              Math.round((prev.windSpeed10m ?? 0)) !== Math.round((updated.windSpeed10m ?? 0));
            return hasChanged ? updated : prev;
          });

          // Optionally keep the header text roughly in sync without re-fetching daily
          setLocationText((prevText) => {
            const temp = Math.round(updated.temperatureC);
            const rainStatus = updated.rainMm > 0 ? `, ${Math.round(updated.rainMm)}mm rain` : '';
            const currentText = `${temp}°C ${rainStatus}`;
            // Try to replace the trailing weather part if present
            const parts = prevText.split(' - ');
            if (parts.length >= 2) {
              return `${parts[0]} - ${currentText}`;
            }
            // If no location prefix, attach default location
            return `${locationStr} - ${currentText}`;
          });
        }
      } catch {
        // Swallow refresh errors silently to avoid noisy logs on intervals
      }
    };

    // Initial quick refresh shortly after mount, then every 10 minutes
    const initial = setTimeout(refresh, 15_000);
    const interval = setInterval(refresh, 600_000);
    return () => {
      isCancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  // Compute controls height (progress + buttons)
  useEffect(() => {
    const compute = () => {
      const controlsH = controlsRef.current?.offsetHeight ?? 0;
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

  // Fetch visitor location and weather (only if enabled via environment variable)
  useEffect(() => {
    // Check if geolocation is enabled via environment variable
    // Defaults to 'true' if not set (backward compatible)
    const enableGeolocation = import.meta.env.VITE_ENABLE_GEOLOCATION !== 'false';
    const DEFAULT_LOCATION = 'Melbourne, Australia';
    const MELBOURNE = { lat: -37.8136, lon: 144.9631 };
    
    const fetchWeather = async (latitude: number, longitude: number, locationStr: string) => {
      try {
        const url = "https://api.open-meteo.com/v1/forecast";
        // First try: get current + daily
        const primaryParams: any = {
          latitude,
          longitude,
          current: ["temperature_2m", "apparent_temperature", "is_day", "rain", "cloud_cover", "weather_code", "wind_speed_10m"],
          daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
          timezone: "auto",
        };
        if (import.meta.env.DEV) console.log('Fetching weather (primary):', latitude, longitude, primaryParams);
        const primaryResponses = await fetchWeatherApi(url, primaryParams);
        if (!primaryResponses || primaryResponses.length === 0) throw new Error('No weather response received');
        const primary = primaryResponses[0];
        if (!primary) throw new Error('Invalid weather response');
        const utcOffsetSeconds = primary.utcOffsetSeconds?.() ?? 0;
        let currentBlock = primary.current?.();
        let dailyBlock = primary.daily?.();
        
        // Fallback: if current missing, try latest hourly (including last 10 days)
        let finalCurrent: {
          time: Date;
          temperatureC: number;
          apparentTemperatureC: number;
          isDay: number;
          rainMm: number;
          cloudCoverPct?: number;
          weatherCode?: number;
          windSpeed10m?: number;
          source: 'current' | 'latest-hourly';
        } | null = null;
        
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
              apparentTemperatureC: apparent_temperature?.value() ?? temperature_2m.value(),
              isDay: is_day.value(),
              rainMm: rain?.value() ?? 0,
              cloudCoverPct: cloud_cover?.value(),
              weatherCode: weather_code?.value(),
              windSpeed10m: wind_speed_10m?.value(),
              source: 'current',
            };
          }
        }
        
        if (!finalCurrent) {
          const fallbackParams: any = {
            latitude,
            longitude,
            hourly: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
            past_days: 10,
            timezone: "auto",
          };
          if (import.meta.env.DEV) console.log('Fetching weather (fallback hourly):', fallbackParams);
          const fbResponses = await fetchWeatherApi(url, fallbackParams);
          if (fbResponses && fbResponses.length > 0 && fbResponses[0]) {
            const fb = fbResponses[0];
            const fbUtcOffset = fb.utcOffsetSeconds?.() ?? 0;
            const hourly = fb.hourly?.();
            if (hourly) {
            const timesRaw = hourly.time?.();
            const timesArr: number[] = timesRaw ? Array.from(timesRaw as any).map((t: any) => Number(t)) : [];
            const tempVar = hourly.variables(0);
            const tempValuesRaw = tempVar?.valuesArray?.();
            const tempValues: number[] = tempValuesRaw ? Array.from(tempValuesRaw as any).map((v: any) => Number(v)) : [];
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
        
        // Prepare daily
        let finalDaily: {
          time: Date[];
          temperatureMaxC: number[];
          temperatureMinC: number[];
          precipitationSumMm?: number[];
        } | null = null;
        if (dailyBlock) {
          const timeArrRaw = dailyBlock.time(); // usually epoch seconds array (typed)
          const tmax = dailyBlock.variables(0);
          const tmin = dailyBlock.variables(1);
          const psum = dailyBlock.variables(2);
          const timeNums: number[] = timeArrRaw ? Array.from(timeArrRaw as any).map((t: any) => Number(t)) : [];
          const times: Date[] = timeNums.map((t: number) => new Date((Number(t) + utcOffsetSeconds) * 1000));
          const maxRaw = tmax?.valuesArray?.();
          const minRaw = tmin?.valuesArray?.();
          const pRaw = psum?.valuesArray?.();
          const maxArr: number[] = maxRaw ? Array.from(maxRaw as any).map((v: any) => Number(v)) : [];
          const minArr: number[] = minRaw ? Array.from(minRaw as any).map((v: any) => Number(v)) : [];
          const pArr: number[] | undefined = pRaw ? Array.from(pRaw as any).map((v: any) => Number(v)) : undefined;
          if (times.length && maxArr.length && minArr.length) {
            finalDaily = {
              time: times,
              temperatureMaxC: maxArr,
              temperatureMinC: minArr,
              precipitationSumMm: pArr,
            };
          }
        }
        
        // Save to state for UI usage
        if (finalCurrent) setWeatherCurrent(finalCurrent);
        if (finalDaily) setWeatherDaily(finalDaily);
        
        // Compose header text (current + optional daily first day)
        if (finalCurrent) {
          const temp = Math.round(finalCurrent.temperatureC);
          // const timeOfDay = finalCurrent.isDay === 1 ? 'Day' : 'Night';
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
        // If weather fetch fails, just use location
        if (locationStr) {
          setLocationText(locationStr);
        }
      }
    };
    
    if (!enableGeolocation) {
      // Geolocation is disabled, use default location (Melbourne, Australia)
      fetchWeather(MELBOURNE.lat, MELBOURNE.lon, DEFAULT_LOCATION);
      return;
    }
    
    const fetchLocationAndWeather = async () => {
      try {
        // Fetch geolocation data
        const geoResponse = await api.get<{ 
          city: string | null; 
          country_name: string | null;
          latitude: number | null;
          longitude: number | null;
        }>('/geo');
        
        const { city, country_name, latitude, longitude } = geoResponse.data;
        
        // Build location string
        let locationStr = '';
        if (city && country_name) {
          locationStr = `${city}, ${country_name}`;
        } else if (city) {
          locationStr = city;
        } else if (country_name) {
          locationStr = country_name;
        }
        
        // Fetch weather data if we have coordinates
        if (latitude !== null && longitude !== null) {
          await fetchWeather(latitude, longitude, locationStr);
        } else {
          // No coordinates, fallback to default Melbourne weather
          const defaultLocation = locationStr || DEFAULT_LOCATION;
          await fetchWeather(MELBOURNE.lat, MELBOURNE.lon, defaultLocation);
        }
      } catch (error) {
        console.error('Failed to fetch location:', error);
        // Fallback to default Melbourne on error
        await fetchWeather(MELBOURNE.lat, MELBOURNE.lon, DEFAULT_LOCATION);
      }
    };
    
    // Fast-first paint: fetch default Melbourne immediately, then refine with geolocation
    fetchWeather(MELBOURNE.lat, MELBOURNE.lon, DEFAULT_LOCATION).finally(() => {
      fetchLocationAndWeather();
    });
  }, []);

  // Handle wheel events to control parallax reveal during reveal phase
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!scrollContainerRef.current) return;
      
      const vh = window.innerHeight;
      const revealDistance = vh * 1.5;
      const scrollTop = scrollContainerRef.current.scrollTop;
      
      // During reveal phase, control reveal manually for both directions
      if (scrollTop < revealDistance) {
        // Scrolling down: expand reveal
        if (manualRevealProgress < 1 && e.deltaY > 0) {
          e.preventDefault();
          
          setManualRevealProgress((prev) => {
            const delta = e.deltaY;
            const newProgress = Math.max(0, Math.min(1, prev + delta / revealDistance));
            
            // Once reveal completes, allow normal scrolling by setting scroll position
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
        // Scrolling up: shrink reveal
        else if (manualRevealProgress > 0 && e.deltaY < 0) {
          e.preventDefault();
          
          setManualRevealProgress((prev) => {
            const delta = Math.abs(e.deltaY);
            const newProgress = Math.max(0, Math.min(1, prev - delta / revealDistance));
            
            // Sync scroll position with reveal progress when shrinking
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

  // Capture track title refs after TrackPage components render
  useEffect(() => {
    const updateTitleRefs = () => {
      TRACKS.forEach((_, index) => {
        const titleElement = document.querySelector(`[data-track-index="${index}"] #track-title`) as HTMLHeadingElement | null;
        if (titleElement) {
          trackTitleRefs.current[index] = titleElement;
        }
      });
    };
    
    // Initial update
    updateTitleRefs();
    
    // Update after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updateTitleRefs, 100);
    
    // Also update when content becomes visible
    if (contentVisible) {
      const visibleTimeoutId = setTimeout(updateTitleRefs, 200);
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(visibleTimeoutId);
      };
    }
    
    return () => clearTimeout(timeoutId);
  }, [contentVisible]);

  // Handle scroll to create parallax effect
  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const scrollTop = scrollContainerRef.current.scrollTop;
      const vh = window.innerHeight;
      const revealDistance = vh * 1.5;
      const prevScrollTop = prevScrollTopRef.current;
      const isScrollingUp = scrollTop < prevScrollTop;
      
      // Track maximum scroll position reached
      if (scrollTop > maxScrollTopRef.current) {
        maxScrollTopRef.current = scrollTop;
      }
      
      // Calculate reveal: expands from center when scrolling down, shrinks when scrolling up (in specific conditions)
      let reveal: number;
      
      // Calculate shrink distance for first track (used for smooth transition)
      const contentScrollMax = scrollContainerRef.current?.scrollHeight ?? 0;
      const maxContentScroll = contentScrollMax - vh - revealDistance;
      const shrinkDistance = Math.min(maxContentScroll * 0.1, revealDistance * 0.3); // Shrink over first 10% of content or 30% of reveal distance
      
      if (scrollTop < revealDistance) {
        // During reveal phase (album header and track list view)
        const scrollBasedReveal = Math.max(0, Math.min(1, scrollTop / revealDistance));
        
        if (isScrollingUp) {
          // Scrolling up: continue shrinking from first track
          // Use the same shrinkDistance mapping for smooth transition
          // Map scrollTop from [revealDistance - shrinkDistance, revealDistance] to reveal [0, 1]
          // When scrollTop = revealDistance, reveal = 1 (matches first track boundary)
          // When scrollTop = revealDistance - shrinkDistance, reveal = 0 (fully shrunk)
          const scrollBack = revealDistance - scrollTop; // Distance from revealDistance going up
          let calculatedReveal: number;
          
          if (scrollBack >= 0 && scrollBack <= shrinkDistance && shrinkDistance > 0) {
            // Smoothly map from [0, shrinkDistance] to [1, 0] for reveal
            // When scrollBack = 0 (at revealDistance): reveal = 1
            // When scrollBack = shrinkDistance: reveal = 0
            calculatedReveal = Math.max(0, Math.min(1, 1 - (scrollBack / shrinkDistance)));
          } else if (scrollBack > shrinkDistance) {
            // Beyond shrink distance going up: fully shrunk
            calculatedReveal = 0;
          } else {
            // At or past revealDistance: fully expanded
            calculatedReveal = 1;
          }
          
          // Ensure reveal never increases when scrolling up (only shrinks)
          reveal = Math.min(calculatedReveal, maxRevealReachedRef.current);
          setManualRevealProgress(reveal);
        } else {
          // Scrolling down: reveal increases from 0 to 1
          // Use manual progress when it's ahead of scroll-based reveal (wheel-controlled)
          if (manualRevealProgress > scrollBasedReveal) {
            reveal = manualRevealProgress;
          } else {
            reveal = scrollBasedReveal;
            setManualRevealProgress(scrollBasedReveal);
          }
        }
      } else {
        // Past reveal distance: check if we're on first track
        const contentScroll = scrollTop - revealDistance;
        const currentScrollProgress = maxContentScroll > 0 
          ? Math.max(0, Math.min(1, contentScroll / maxContentScroll)) 
          : 0;
        
        // Check if we're on first track (scrollProgress is 0 or very small)
        const isOnFirstTrack = currentScrollProgress < 0.1;
        
        if (isScrollingUp && isOnFirstTrack) {
          // Scrolling up on first track: at top of first track (scrollTop = revealDistance), background is fully expanded (reveal = 1)
          // As user scrolls up from revealDistance, background shrinks
          // Map scrollTop from [revealDistance - shrinkDistance, revealDistance] to reveal [0, 1]
          // When scrollTop = revealDistance, reveal = 1 (fully expanded - at top of first track)
          // When scrollTop = revealDistance - shrinkDistance, reveal = 0 (fully shrunk)
          const scrollBack = revealDistance - scrollTop; // Distance from revealDistance going up
          let calculatedReveal: number;
          
          if (scrollBack >= 0 && scrollBack <= shrinkDistance && shrinkDistance > 0) {
            // Smoothly map from [0, shrinkDistance] to [1, 0] for reveal
            // When scrollBack = 0 (at revealDistance): reveal = 1
            // When scrollBack = shrinkDistance: reveal = 0
            // As scrollBack increases (scrolling up), reveal decreases
            calculatedReveal = Math.max(0, Math.min(1, 1 - (scrollBack / shrinkDistance)));
          } else if (scrollBack > shrinkDistance) {
            // Beyond shrink distance going up: fully shrunk
            calculatedReveal = 0;
          } else {
            // At or past revealDistance: fully expanded (at top of first track)
            calculatedReveal = 1;
          }
          
          // Ensure reveal never increases when scrolling up (only shrinks)
          reveal = Math.min(calculatedReveal, maxRevealReachedRef.current);
        } else if (isOnFirstTrack) {
          // Scrolling down on first track: keep reveal at 1 (fully expanded)
          reveal = 1;
        } else {
          // Not on first track: keep reveal at 1 (fully expanded)
          reveal = 1;
        }
      }
      
      // Update previous scroll position
      prevScrollTopRef.current = scrollTop;
      
      // Throttle updates using requestAnimationFrame for smoother animation
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          // Update clipPath reveal - expands from center when scrolling down, shrinks when scrolling up
          setClipPathReveal(reveal);
          
          // Store reveal value for next frame to prevent expansion when scrolling up
          prevRevealRef.current = reveal;
          
          // Track maximum reveal reached (always update when reveal increases)
          // This ensures scrolling up can only shrink from the maximum reached
          if (reveal > maxRevealReachedRef.current) {
            maxRevealReachedRef.current = reveal;
          }
          
          // Reset max reveal when we reach the top (scrollTop = 0) to allow fresh expansion
          if (scrollTop === 0) {
            maxRevealReachedRef.current = 0;
          }
          
          // Phase 2: Content becomes visible after reveal completes
          if (reveal >= 1 && scrollTop >= revealDistance) {
            setContentVisible(true);
            
            // Calculate scroll progress for content (starts after reveal phase)
            const contentScroll = scrollTop - revealDistance;
            const contentScrollMax = scrollContainerRef.current?.scrollHeight ?? 0;
            const maxContentScroll = contentScrollMax - vh - revealDistance;
            
            // Simple linear scroll progress calculation - works for both directions
            const newScrollProgress = maxContentScroll > 0 
              ? Math.max(0, Math.min(1, contentScroll / maxContentScroll)) 
              : 0;
            
            setScrollProgress(newScrollProgress);
            prevScrollProgressRef.current = newScrollProgress;
          } else {
            setContentVisible(false);
            // Use reveal progress during reveal phase
            setScrollProgress(reveal);
            prevScrollProgressRef.current = reveal;
          }

          // Calculate gradient color index based on scroll position (3x faster color changes)
          const segmentSize = 27; // Smaller segment size = faster color changes (80/3 ≈ 27)
          const newGradientColorIndex = Math.floor(scrollTop / segmentSize) % RAINBOW_COLORS.length;
          setGradientColorIndex(newGradientColorIndex);

          // Track-specific progress + active track calculation
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
              const progress = clamp((viewportCenter - activeRect.top) / activeRect.height);

              if (activeIndex >= 0) {
                setCurrentTrackIndex((prev) =>
                  prev !== activeIndex ? activeIndex : prev
                );
              }

              setCurrentTrackProgress((prev) =>
                Math.abs(prev - progress) > 0.01 ? clamp(progress) : prev
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
      handleScroll(); // Initial call
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll as any);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [manualRevealProgress, viewportHeight]);

  // Hide body scrollbar while this view is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const handleAlbumImageClick = () => {
    setPlayerBarVisible(false);
    pause(); // Stop audio playback
    setCurrentTrack(null); // Clear current track so player bar doesn't render
  };

  const scrollToTrack = (trackIndex: number) => {
    if (!scrollContainerRef.current) return;
    
    const track = TRACKS[trackIndex];
    if (!track) return;
    
    // Don't set track in audio store when clicking from track list
    // Only action buttons should open the player bar
    
    const vh = viewportHeight || window.innerHeight;
    const revealDistance = vh * 1.5;
    
    // Reset progress to 0
    setCurrentTrackProgress(0);
    setCurrentTrackIndex(trackIndex);
    
    // Find the track title element and scroll to its exact position
    const titleElement = trackTitleRefs.current[trackIndex];
    
    if (titleElement && scrollContainerRef.current) {
      // Use getBoundingClientRect to get the current visual position of the title
      // This accounts for any transforms applied to parent elements
      const titleRect = titleElement.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      
      // Calculate the current scroll position
      const currentScrollTop = scrollContainerRef.current.scrollTop;
      
      // Calculate where the title currently is relative to the container's top
      // titleRect.top is relative to viewport, containerRect.top is also relative to viewport
      // So titleRect.top - containerRect.top gives us the position relative to container
      const titleTopRelativeToContainer = titleRect.top - containerRect.top + currentScrollTop;
      
      // Add a small offset to position the title near the top of the viewport
      // Account for sticky headers (hero + controls)
      const stickyOffset = heroHeight + controlsHeight;
      const offsetFromTop = stickyOffset + 20; // Small additional offset
      const targetScrollPosition = titleTopRelativeToContainer - offsetFromTop;
      
      // Ensure we don't scroll before the reveal distance
      const finalScrollPosition = Math.max(revealDistance, targetScrollPosition);
      
      // First, ensure reveal is complete if we're not past revealDistance
      const currentScroll = scrollContainerRef.current.scrollTop;
      if (currentScroll < revealDistance) {
        // Complete the reveal first, then scroll to track title
        scrollContainerRef.current.scrollTo({ top: revealDistance, behavior: 'smooth' });
        
        // Wait for reveal to complete, then scroll to track title
        // We need to recalculate the position after the reveal completes
        setTimeout(() => {
          if (scrollContainerRef.current && titleElement) {
            // Recalculate position after reveal
            const newTitleRect = titleElement.getBoundingClientRect();
            const newContainerRect = scrollContainerRef.current.getBoundingClientRect();
            const newScrollTop = scrollContainerRef.current.scrollTop;
            const newTitleTopRelativeToContainer = newTitleRect.top - newContainerRect.top + newScrollTop;
            const newTargetScrollPosition = Math.max(revealDistance, newTitleTopRelativeToContainer - offsetFromTop);
            scrollContainerRef.current.scrollTo({ top: newTargetScrollPosition, behavior: 'smooth' });
          }
        }, 500); // Adjust timing based on reveal animation
      } else {
        // Already past reveal, just scroll to track title
        scrollContainerRef.current.scrollTo({ top: finalScrollPosition, behavior: 'smooth' });
      }
    } else {
      // Fallback: if title element not found, use the old calculation method
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

  return (
    <div 
      ref={scrollContainerRef}
      className="h-screen w-screen overflow-y-scroll overflow-x-hidden bg-[#0f0f0f]"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Accessibility live region */}
      <div ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Hero Section with Album Artwork - Fixed at top */}
      <div ref={heroRef} className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#1f2937] to-[#6b7280] flex flex-row items-center gap-1 sm:gap-2 md:gap-2.5 lg:gap-3 px-1.5 sm:px-2.5 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5 overflow-hidden max-h-[35vh] md:max-h-[25vh]">

        {/* Album cover image */}
        <img
          src="/images/album-cover.jpg"
          alt="Album cover"
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover shadow-2xl rounded relative z-10 cursor-pointer flex-shrink-0"
          onClick={handleAlbumImageClick}
        />

        {/* Album title and description */}
        <div className="text-left flex-1 relative z-10 min-w-0 flex flex-col justify-center overflow-visible max-w-[60%] sm:max-w-none">
          {/* Title section - only as wide as content */}
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
          
          {/* Description */}
          <Shuffle
            tag="p"
            className="text-white/90 mb-0 text-[clamp(7px,2.8vw,9px)] sm:text-[clamp(8px,3vw,10px)] md:text-[10px] lg:text-xs break-words md:truncate md:whitespace-nowrap leading-snug"
            text="Diego Beuk • 2025 • 6 songs, 11 min"
            duration={0.4}
            animationMode="random"
            triggerOnHover
            triggerOnce
            threshold={0}
            rootMargin="0px"
            textAlign="left"
          />
        </div>

        {/* Contact info - Right side */}
        <div className="flex flex-col items-end justify-center gap-0.5 sm:gap-0.5 md:gap-1 text-white text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs sm:flex-shrink-0 relative z-10 max-w-[40%] sm:max-w-none">
          {/* Email and Phone */}
          <div className="flex flex-col items-end space-y-0 sm:space-y-0 md:space-y-0.5">
            <Shuffle tag="span" className="text-[8px] sm:text-[9px] md:text-[10px] truncate max-w-full" text="beuk.diego@gmail.com" duration={0.35} triggerOnHover triggerOnce threshold={0} rootMargin="0px" textAlign="right" />
            <Shuffle tag="span" className="text-[8px] sm:text-[9px] md:text-[10px] truncate max-w-full" text="+61 448 092 338" duration={0.35} triggerOnHover triggerOnce threshold={0} rootMargin="0px" textAlign="right" />
          </div>

          {/* LinkedIn and GitHub icons - Below text */}
          <div className="flex space-x-1 sm:space-x-1.5 md:space-x-2 lg:space-x-2.5">
            <a
              href="https://www.linkedin.com/in/diego-beuk-8a9100288/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded flex-shrink-0"
              aria-label="Diego Beuk LinkedIn profile"
            >
              <FaLinkedin className="w-3 h-3 sm:w-[14px] sm:h-[14px] md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" color="white" />
            </a>
            <a
              href="https://github.com/dbeukrf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded flex-shrink-0"
              aria-label="Diego Beuk Github profile"
            >
              <FaGithub className="w-3 h-3 sm:w-[14px] sm:h-[14px] md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" color="white" />
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons - Combined for mobile */}
      <div ref={controlsRef} className="sticky z-40 w-full bg-transparent" style={{ top: `${heroHeight}px` }}>
        {/* Action Buttons above Track List */}
        <div className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-6 py-2.5 md:py-4">
          {/* Play Button */}
          <div className="relative group">
            <button 
              onClick={() => {
                // If shuffle is enabled, select a random track
                if (isShuffled) {
                  const randomTrack = TRACKS[Math.floor(Math.random() * TRACKS.length)];
                  setCurrentTrack(randomTrack.id);
                } else {
                  // If no track is selected or shuffle is off, select first track
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
            {/* Tooltip */}
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Play
            </span>
          </div>

          {/* Shuffle Button */}
          <div className="relative group">
            <button 
              onClick={() => {
                toggleShuffle();
                // Shuffle button only toggles shuffle mode, doesn't play
              }}
              className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 hover:bg-white/20 transition-colors focus:outline-none ${
                isShuffled ? 'bg-white/20 text-[#ff6b35]' : 'text-white'
              }`}
            >
              <FaRandom size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Shuffle
            </span>
          </div>

          {/* Invite Collaborator Button */}
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

      {/* Track List Section */}
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
          {/* Table Header */}
          <div className="grid grid-cols-12 text-white/70 text-[10px] md:text-xs font-semibold border-b border-white/20 pb-0.5 md:pb-1 mb-0.5 md:mb-1 px-1.5 md:px-3 flex-shrink-0">
            <div className="col-span-1 text-middle">#</div>
            <div className="col-span-6 text-middle">Title</div>
            <div className="col-span-3 text-middle hidden sm:block">Artist</div>
            <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-0.5">
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

          {/* Track List */}
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
                  className={`grid grid-cols-12 items-center text-white hover:bg-white/5 rounded-lg px-1.5 md:px-3 py-0.5 md:py-1 transition-colors cursor-pointer focus:outline-none focus-visible:outline-none`}
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
                  {/* Track Number */}
                  <div className="col-span-1 text-white/80 text-xs md:text-sm">{track.number}</div>

                  {/* AI DJ Track Layout */}
                  {isAIDJ ? (
                    <div className="col-span-11 flex justify-center items-end gap-1.5">
                      <img
                        src={'/images/ai-dj.jpg'}
                        alt="AI DJ"
                        className="w-6 h-6 md:w-8 md:h-8 object-cover rounded mr-1.5 md:mr-3"
                      />
                      <h3 className="text-xs md:text-sm font-semibold text-center">{track.title}</h3>
                    </div>
                  ) : (
                    <>
                      {/* Title */}
                      <div className="col-span-6 sm:col-span-6 text-white font-semibold text-xs md:text-sm truncate">
                        {track.title}
                      </div>

                      {/* Artist */}
                      <div className="col-span-3 text-white/70 text-[10px] md:text-xs hidden sm:block truncate">
                        {track.artist || 'Diego Beuk'}
                      </div>

                      {/* Duration */}
                      <div className="col-span-3 sm:col-span-2 text-right text-white/70 text-[10px] md:text-xs">
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




      {/* Parallax Scrolling Content Area */}
      <div className="relative w-full">
        {/* Parallax Background - Expands equally up and down from center */}
        <div
          className="fixed inset-0"
          style={{
            top: 0,
            bottom: 0,
            clipPath: `inset(${50 - Math.max(0, Math.min(1, clipPathReveal)) * 50}% 0% ${50 - Math.max(0, Math.min(1, clipPathReveal)) * 50}% 0%)`, // Expand equally up and down from center, can reverse
            transition: 'clip-path 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'clip-path',
            zIndex: 50,
            backgroundColor: '#0F172A',
            pointerEvents: contentVisible ? 'auto' : 'none'
          }}
        />


        

        {/* Track Content - appears after reveal and scrolls up */}
        <div 
          className="relative z-[60] min-h-[400vh]"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible 
              ? `translate3d(0, ${(viewportHeight || window.innerHeight) - (scrollProgress * (viewportHeight || window.innerHeight) * 1.5)}px, 0)` 
              : `translate3d(0, ${viewportHeight || window.innerHeight}px, 0)`, // Start below viewport, scroll up as user scrolls
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: contentVisible ? 'transform, opacity' : 'opacity',
            backgroundColor: '#0F172A',
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
                backgroundColor: '#0F172A', 
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
                content={
                  <div style={{ fontFamily: "'Ubuntu', sans-serif" }}>
                    <p>
                      Content for {track.title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec.
                    </p>
                    <p>
                      Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi.
                    </p>
                    <p>
                      Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis.
                    </p>
                    <p>
                      Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat.
                    </p>
                    <p>
                      Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus.
                    </p>
                  </div>
                }
                className="w-full h-full min-h-screen bg-[#0F172A]"
                headerClassName="bg-[#0F172A]"
                contentClassName="bg-[#0F172A]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Track Progress Grid */}
      <div
        className={`fixed top-4 left-4 z-[80] transition-all duration-500 ease-out ${
          contentVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        <div className="grid gap-1">
          {TRACKS.map((track, index) => {
            const isActive = index === currentTrackIndex;
            const label = `${String(track.number).padStart(2, '0')} ${track.title}`;
            const width = isActive ? `${Math.round(clamp(currentTrackProgress) * 100)}%` : '0%';

            return (
              <button
                key={track.id}
                onClick={() => scrollToTrack(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToTrack(index);
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
                    className="absolute inset-y-0 left-0 bg-orange-500 transition-all duration-300 ease-out"
                    style={{ width, opacity: isActive ? 1 : 0 }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Player Bar */}
      {/* Show player bar when play was clicked, and fade in when on track views */}
      {/* Pass clipPathReveal to help determine when parallax is covering the player bar */}
      <PlayerBar isVisible={playerBarVisible} contentVisible={contentVisible} clipPathReveal={clipPathReveal} />
    </div>
  );
}