import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Compass, Navigation, MapPin, Sparkles, RefreshCw, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Kaaba Coordinates in Mecca
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Default Sunnyvale Homes Estate, Abuja Coordinates
const DEFAULT_LAT = 9.0064;
const DEFAULT_LNG = 7.4239;

// Calculate Qibla forward azimuth bearing from coordinates
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180.0;
  const lambdaK = (KAABA_LNG * Math.PI) / 180.0;
  const phi = (lat * Math.PI) / 180.0;
  const lambda = (lng * Math.PI) / 180.0;

  const deltaLambda = lambdaK - lambda;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

  let qibla = (Math.atan2(y, x) * 180.0) / Math.PI;
  return (qibla + 360.0) % 360.0;
}

// Calculate Great-Circle distance to Mecca in kilometers
export function calculateDistanceToMecca(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180.0;
  const dLon = ((KAABA_LNG - lng) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180.0) *
      Math.cos((KAABA_LAT * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface QiblaCompassProps {
  compact?: boolean;
}

const QiblaCompass: React.FC<QiblaCompassProps> = ({ compact = false }) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [manualAngle, setManualAngle] = useState<number>(0);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);
  const [useDeviceSensor, setUseDeviceSensor] = useState<boolean>(true);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  
  // Geolocation state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG
  });
  const [locationName, setLocationName] = useState<string>('Sunnyvale Estate, Abuja');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationDetected, setLocationDetected] = useState<boolean>(false);

  // Computed Qibla values based on user's active location
  const qiblaBearing = Math.round(calculateQiblaBearing(userCoords.lat, userCoords.lng));
  const distanceToMecca = calculateDistanceToMecca(userCoords.lat, userCoords.lng);

  // Effective device heading
  const effectiveHeading = hasCompassSupport && useDeviceSensor ? deviceHeading : manualAngle;
  
  // Relative angle to turn towards Kaaba (0° means facing exactly towards Kaaba)
  const qiblaRelativeAngle = (qiblaBearing - effectiveHeading + 360) % 360;
  const isAligned = Math.abs(qiblaRelativeAngle) <= 4 || Math.abs(qiblaRelativeAngle - 360) <= 4;

  // 1. Request GPS Geolocation
  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.info('Geolocation is not supported by your browser. Using Sunnyvale Estate as default.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationDetected(true);
        setIsLocating(false);
        setLocationName(`${latitude.toFixed(2)}° N, ${longitude.toFixed(2)}° E (GPS Verified)`);
        toast.success('Your exact GPS coordinates detected for Qibla calculation!');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        toast.info('Location access unavailable or denied. Showing Qibla for Sunnyvale Estate, Abuja.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Run initial location detection
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  // 2. Setup Device Orientation Listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS Safari uses webkitCompassHeading (0 = North, clockwise)
      let heading: number | null = null;

      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Android / W3C orientation: alpha is counter-clockwise rotation around Z
        heading = 360 - e.alpha;
      }

      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(Math.round(heading));
        setHasCompassSupport(true);
      }
    };

    if (window.DeviceOrientationEvent && useDeviceSensor) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      // Also try deviceorientationabsolute for Android chrome which provides true north
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation);
    };
  }, [useDeviceSensor]);

  // Request iOS 13+ sensor permissions
  const requestOrientationPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionRequested(true);
          setUseDeviceSensor(true);
          toast.success('Compass sensor access granted!');
        } else {
          toast.error('Compass sensor permission denied.');
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
      }
    } else {
      setUseDeviceSensor(true);
      toast.info('Live device compass enabled.');
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#181b22] to-[#121419] rounded-2xl sm:rounded-3xl ${compact ? 'p-4 sm:p-5' : 'p-4 sm:p-6 md:p-8'} border border-zinc-800 shadow-2xl text-zinc-100 relative overflow-hidden w-full max-w-4xl mx-auto`}>
      {/* Background Subtle Islamic Geometry */}
      <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none"></div>

      {/* Centered Header */}
      <div className="text-center mb-6 pb-4 border-b border-zinc-800/80 relative z-10">
        <div className="inline-flex items-center justify-center gap-2 text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-1.5 flex-wrap">
          <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#e08a6e]" /> Real-Time Direction Finder</span>
          {isAligned && (
            <span className="inline-flex items-center gap-1 bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
              <CheckCircle size={10} /> FACING KAABA
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-2">
          <Compass size={26} className="text-[#e08a6e]" />
          <span>Active Qibla Compass</span>
        </h2>

        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          Calculates your exact geographic coordinates and rotates live to point towards the Holy Kaaba in Mecca.
        </p>

        {/* Location & Bearing Controls - Centered */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
          <button
            type="button"
            onClick={detectUserLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-[#251814] hover:bg-[#321f1a] text-[#f5a287] border border-[#e08a6e]/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Update via GPS"
          >
            <RefreshCw size={13} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : (locationDetected ? 'GPS Active' : 'Detect My Location')}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#121419] px-3.5 py-1.5 rounded-xl border border-zinc-750 text-xs">
            <MapPin size={13} className="text-[#e08a6e]" />
            <span className="font-mono text-zinc-200">
              Qibla Azimuth: <strong className="text-[#f5a287]">{qiblaBearing}°</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Compass Dial and Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
        
        {/* Animated Compass Dial */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-3 sm:p-6 bg-[#121419]/90 rounded-2xl sm:rounded-3xl border border-zinc-800 relative w-full overflow-hidden">
          
          {/* Alignment status alert banner */}
          <div className="w-full mb-4 text-center">
            {isAligned ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 py-1.5 px-3 rounded-full text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/30">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>Alhamdulillah! You are facing the Qibla (Mecca)</span>
              </div>
            ) : (
              <div className="bg-[#251814] border border-[#e08a6e]/40 py-1.5 px-3 rounded-full text-[#fbdcd3] text-xs flex items-center justify-center gap-1.5">
                <Navigation size={13} className="text-[#f5a287] rotate-45" />
                <span>Turn phone until the golden needle points straight UP</span>
              </div>
            )}
          </div>

          {/* Compass Outer Ring with Degree Markings */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full border-4 border-zinc-700/80 flex items-center justify-center bg-gradient-to-b from-[#1c1f26] via-[#14161c] to-[#0d0f13] shadow-2xl">
            
            {/* Cardinal Markers */}
            <div className="absolute top-2.5 text-red-400 font-black text-xs tracking-wider">N</div>
            <div className="absolute bottom-2.5 text-zinc-400 font-bold text-xs">S</div>
            <div className="absolute right-2.5 text-zinc-400 font-bold text-xs">E</div>
            <div className="absolute left-2.5 text-zinc-400 font-bold text-xs">W</div>

            {/* Subtle Degree Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-full flex justify-center items-start pt-1 pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-0.5 ${deg % 90 === 0 ? 'h-2 bg-zinc-400' : 'h-1 bg-zinc-600'}`}></div>
              </div>
            ))}

            {/* Permanent Kaaba Direction Badge on the dial ring */}
            <div 
              className="absolute w-full h-full flex justify-center items-start pt-0.5 pointer-events-none transition-transform duration-500"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="bg-[#e08a6e] text-zinc-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-white tracking-widest uppercase flex items-center gap-0.5">
                🕋 Kaaba {qiblaBearing}°
              </div>
            </div>

            {/* Animated Needle pointing towards Kaaba */}
            <motion.div 
              className="w-full h-full absolute flex items-center justify-center pointer-events-none"
              animate={{ rotate: qiblaRelativeAngle }}
              transition={{ type: 'spring', damping: 18, stiffness: 100 }}
            >
              {/* Needle Body */}
              <div className="relative w-2 h-44 sm:h-48 md:h-52 flex flex-col items-center justify-between">
                
                {/* Pointer tip to Kaaba (Golden Amber) */}
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[40px] border-b-[#e08a6e] drop-shadow-[0_0_12px_rgba(224,138,110,0.8)]"></div>
                  <div className="text-[8px] font-black text-[#f5a287] -mt-3 bg-zinc-950/80 px-1 rounded uppercase tracking-tighter">
                    QIBLA
                  </div>
                </div>

                {/* Center Pivot Point */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f5a287] to-[#c86d51] border-2 border-zinc-950 shadow-xl flex items-center justify-center text-[10px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-950"></div>
                </div>

                {/* Opposite South Tip (Dark Silver) */}
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[30px] border-t-zinc-600"></div>
              </div>
            </motion.div>
          </div>

          {/* Dial readout metrics */}
          <div className="mt-5 flex items-center justify-between w-full max-w-xs px-2 text-center">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Qibla</span>
              <span className="text-base sm:text-lg font-extrabold text-[#f5a287] font-mono">{qiblaBearing}°</span>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Heading</span>
              <span className="text-base sm:text-lg font-extrabold text-zinc-200 font-mono">{effectiveHeading}°</span>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">To Turn</span>
              <span className={`text-base sm:text-lg font-extrabold font-mono ${isAligned ? 'text-emerald-400' : 'text-white'}`}>
                {Math.round(qiblaRelativeAngle)}°
              </span>
            </div>
          </div>
        </div>

        {/* Location Information & Device Calibration Controls */}
        <div className="lg:col-span-6 space-y-4 text-xs">
          
          {/* Location details card */}
          <div className="bg-[#121419] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <MapPin size={16} className="text-[#e08a6e]" /> Verified Geographic Coordinates
              </h3>
              <span className="text-[10px] bg-[#251814] text-[#f5a287] px-2 py-0.5 rounded-full border border-[#e08a6e]/30 font-semibold">
                Live Geodesic
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed text-xs">
              Position: <strong className="text-white">{locationName}</strong>
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
              <div className="bg-[#181b22] p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Direct Distance to Kaaba:</span>
                <strong className="text-white text-sm font-mono">{distanceToMecca.toLocaleString()} km</strong>
              </div>
              <div className="bg-[#181b22] p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block">Great Circle Bearing:</span>
                <strong className="text-[#f5a287] text-sm font-mono">{qiblaBearing}° True North</strong>
              </div>
            </div>
          </div>

          {/* Sensor / Manual Heading Calibration */}
          <div className="bg-[#121419] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                <Smartphone size={16} className="text-[#e08a6e]" /> Compass Sensor & Manual Rotation
              </span>
              <span className="text-[#f5a287] font-mono font-bold">{effectiveHeading}° Heading</span>
            </div>

            {/* iOS Safari sensor permission trigger if needed */}
            {typeof DeviceOrientationEvent !== 'undefined' &&
              typeof (DeviceOrientationEvent as any).requestPermission === 'function' &&
              !permissionRequested && (
                <button
                  type="button"
                  onClick={requestOrientationPermission}
                  className="w-full py-2.5 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Enable iPhone/iPad Compass Hardware Sensor
                </button>
            )}

            {/* Manual Heading Slider for Desktop or non-sensor devices */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Simulate Phone Rotation (Desktop Test):</span>
                <span className="text-white font-mono">{manualAngle}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="359" 
                value={manualAngle} 
                onChange={(e) => {
                  setManualAngle(Number(e.target.value));
                  setUseDeviceSensor(false);
                }}
                className="w-full accent-[#e08a6e] cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0° N</span>
                <span>90° E</span>
                <span>180° S</span>
                <span>270° W</span>
              </div>
            </div>

            {/* Switch back to live sensor button */}
            {hasCompassSupport && !useDeviceSensor && (
              <button
                type="button"
                onClick={() => setUseDeviceSensor(true)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
              >
                Use Live Phone Gyroscope / Compass Sensor
              </button>
            )}
          </div>

          {/* Quick Sunnah prayer instruction tip */}
          <div className="p-3 bg-[#1e1714] border border-[#e08a6e]/30 rounded-2xl flex items-start gap-2.5 text-[11px] text-[#fbdcd3]">
            <Sparkles size={15} className="text-[#e08a6e] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Facing the Qiblah (Istiqlal al-Qiblah) is a mandatory condition (shart) for the validity of the five daily prayers for those who are able.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QiblaCompass;
