"use client";

import React, { useMemo } from "react";
import { Wind, Droplets, Gauge, Compass } from "lucide-react";

// Helper function to convert wind direction angle to cardinal direction
function angleToCardinal(angle: number): string {
  const directions = [
    "เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้",
    "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ"
  ];

  // Normalize angle to 0-360
  angle = (angle % 360 + 360) % 360;
  
  // Divide the compass into 8 sectors (45° each)
  const index = Math.round(angle / 45) % 8;
  
  return directions[index];
}

// Format wind speed from m/s to km/h with proper rounding
function formatWindSpeed(speed: number): number {
  if (isNaN(speed) || speed < 0) return 0;
  // Convert from m/s to km/h and round to 1 decimal place
  return Math.round(speed * 3.6 * 10) / 10;
}

export default function WeatherCard({
  city,
  state,
  temperature,
  humidity,
  windSpeed,
  pressure,
  windDirection,
}: Readonly<{
  city: string;
  state: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  windDirection: number;
}>
) {
  // Calculate formatted values once with useMemo
  const formattedTemperature = useMemo(() => {
    const temp = typeof temperature === 'number' && !isNaN(temperature) ? temperature : 0;
    return temp < -50 || temp > 60 ? 25 : Math.round(temp * 10) / 10;
  }, [temperature]);

  const formattedFeelsLike = useMemo(() => {
    return Math.round((formattedTemperature - 2) * 10) / 10;
  }, [formattedTemperature]);

  const formattedWindSpeed = useMemo(() => formatWindSpeed(windSpeed), [windSpeed]);
  
  const formattedWindDirection = useMemo(() => {
    return {
      angle: !isNaN(windDirection) ? windDirection : 0,
      cardinal: angleToCardinal(!isNaN(windDirection) ? windDirection : 0)
    };
  }, [windDirection]);

  const formattedHumidity = useMemo(() => {
    return !isNaN(humidity) && humidity > 0 ? humidity : 50;
  }, [humidity]);

  const formattedPressure = useMemo(() => {
    return !isNaN(pressure) && pressure > 0 ? pressure : 1013;
  }, [pressure]);

  const locationDisplay = useMemo(() => {
    if (city === "-" || !city) return "กำลังโหลดข้อมูล";
    if (state === "-" || !state) return city;
    return `${city}, ${state}`;
  }, [city, state]);

  return (
    <div className="w-max max-w-6xl backdrop-blur-md bg-gradient-to-br from-blue-500/80 to-blue-300/90 rounded-3xl p-10 text-white shadow-2xl transition-transform duration-500 ease-in-out hover:shadow-blue-400/20">
      <div className="flex flex-row gap-12 w-full justify-around">
        {/* Left side - Main temperature and location info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{locationDisplay}</h2>
            </div>
            <div className="text-9xl font-bold tracking-tighter">{formattedTemperature}°C</div>
            <div className="text-3xl text-gray-200 font-normal">รู้สึกเหมือน {formattedFeelsLike}°C</div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-l border-white/30 h-auto"></div>
        
        {/* Right side - Weather conditions */}
        <div className="flex-row flex gap-10">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <Droplets className="w-7 h-7 text-blue-200" />
                <span className="text-gray-100 text-2xl">ความชื้น</span>
              </div>
              <div className="text-4xl">{formattedHumidity}%</div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <Wind className="w-7 h-7 text-gray-100" />
                <span className="text-gray-100 text-2xl">ความเร็วลม</span>
              </div>
              <div className="text-4xl">{formattedWindSpeed} กม./ชม.</div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <Gauge className="w-7 h-7 text-gray-100" />
                <span className="text-gray-100 text-2xl">ความดัน</span>
              </div>
              <div className="text-4xl">{formattedPressure} hPa</div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <Compass className="w-7 h-7 text-gray-100" />
                <span className="text-gray-100 text-2xl">ทิศทางลม</span>
              </div>
              <div className="text-4xl">{formattedWindDirection.angle}° ({formattedWindDirection.cardinal})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}