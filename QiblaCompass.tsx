import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Navigation, MapPin, Sparkles, RefreshCw, Smartphone } from 'lucide-react';

const QIBLA_BEARING_ABUJA = 68; // 68 degrees East-North-East from Abuja, Nigeria

const QiblaCompass: React.FC = () => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [manualAngle, setManualAngle] = useState<number>(0);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);
  const [useDeviceSensor, setUseDeviceSensor] = useState<boolean>(true);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS, alpha for Android
      let heading = (e as any).webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : null);
      if (heading !== null && heading !== undefined) {
        setDeviceHeading(Math.round(heading));
        setHasCompassSupport(true);
      }
    };

    if (window.DeviceOrientationEvent && useDeviceSensor) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [useDeviceSensor]);

  const effectiveHeading = hasCompassSupport && useDeviceSensor ? deviceHeading : manualAngle;
  // Calculate relative angle to Qibla:
  const qiblaRelativeAngle = (QIBLA_BEARING_ABUJA - effectiveHeading + 360) % 360;

  return (
    <div className="bg-gradient-to-br from-[#181b22] to-[#121419] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl text-zinc-100 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-1">
            <Sparkles size={14} /> Solat Direction Guide
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Compass size={22} className="text-zinc-300" /> Interactive Qibla Compass
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Accurate Kaaba alignment from Sunnyvale Homes Estate, Abuja.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121419] px-3.5 py-1.5 rounded-2xl border border-zinc-750 text-xs">
          <MapPin size={14} className="text-zinc-400" />
          <span>Qibla Bearing: <strong className="text-zinc-200">68° ENE</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual Compass Dial */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#121419] rounded-3xl border border-zinc-800 relative">
          {/* Compass Circle */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-zinc-700 flex items-center justify-center bg-gradient-to-b from-[#181b22] to-[#0f1115] shadow-inner">
            {/* North Indicator */}
            <div className="absolute top-2 text-red-400 font-extrabold text-xs">N</div>
            <div className="absolute bottom-2 text-zinc-400 font-bold text-xs">S</div>
            <div className="absolute right-2 text-zinc-400 font-bold text-xs">E</div>
            <div className="absolute left-2 text-zinc-400 font-bold text-xs">W</div>

            {/* Qibla Marker at 68° */}
            <div 
              className="absolute w-full h-full flex justify-center items-start pt-1 pointer-events-none"
              style={{ transform: `rotate(${QIBLA_BEARING_ABUJA}deg)` }}
            >
              <div className="bg-zinc-200 text-zinc-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg border border-white">
                KAABA 🕋
              </div>
            </div>

            {/* Rotating Needle */}
            <motion.div 
              className="w-full h-full absolute flex items-center justify-center pointer-events-none"
              animate={{ rotate: qiblaRelativeAngle }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            >
              {/* Compass Needle */}
              <div className="relative w-2 h-44 flex flex-col items-center justify-between">
                {/* Pointer tip to Kaaba */}
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[36px] border-b-zinc-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                {/* Center Pivot Point */}
                <div className="w-5 h-5 rounded-full bg-zinc-300 border-2 border-zinc-950 shadow-md"></div>
                {/* South tip */}
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[30px] border-t-zinc-600"></div>
              </div>
            </motion.div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">
              Relative Qibla Offset
            </span>
            <span className="text-xl font-extrabold text-white font-mono">
              {Math.round(qiblaRelativeAngle)}°
            </span>
          </div>
        </div>

        {/* Info & Sensor Calibration Controls */}
        <div className="space-y-4 text-xs">
          <div className="bg-[#121419] p-4 rounded-2xl border border-zinc-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <MapPin size={16} className="text-zinc-300" /> Geography & Distance
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              From Sunnyvale Homes (Abuja, Nigeria 9.07° N, 7.48° E) to the Sacred Mosque in Mecca, Saudi Arabia (21.42° N, 39.82° E), the exact Qibla direction is <strong className="text-zinc-100">68° from True North</strong> (East-North-East).
            </p>
            <div className="pt-2 text-[11px] text-zinc-400 font-mono flex justify-between border-t border-zinc-800">
              <span>Distance to Mecca:</span>
              <strong className="text-white">~4,130 km</strong>
            </div>
          </div>

          {/* Interactive Calibration Slider */}
          <div className="bg-[#121419] p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Smartphone size={15} className="text-zinc-300" /> Manual Phone Heading Test
              </span>
              <span className="text-zinc-300 font-mono">{effectiveHeading}°</span>
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
              className="w-full accent-zinc-300 cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>0° (North)</span>
              <span>90° (East)</span>
              <span>180° (South)</span>
              <span>270° (West)</span>
            </div>

            {hasCompassSupport && (
              <button
                type="button"
                onClick={() => setUseDeviceSensor(true)}
                className="w-full py-1.5 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                Use Live Phone Compass Hardware
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QiblaCompass;
