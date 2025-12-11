"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Wind, Droplets, Gauge, Compass, MapPin } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";

// Types for API response
interface Pollution {
  ts: string;
  aqius: number;
  mainus: string;
  aqicn: number;
  maincn: string;
}

interface Weather {
  ts: string;
  tp: number;
  pr: number;
  hu: number;
  ws: number;
  wd: number;
  ic: string;
}

interface Current {
  pollution: Pollution;
  weather: Weather;
}

interface Location {
  type: string;
  coordinates: number[];
}

interface AirQualityData {
  city: string;
  state: string;
  country: string;
  location: Location;
  current: Current;
}

interface ApiResponse {
  status: "success" | "error";
  data: AirQualityData;
  lastFetch?: Date;
  cached?: boolean;
  stale?: boolean;
}

type AQIBreakpoint = {
  aqiLow: number;
  aqiHigh: number;
  pm25Low: number;
  pm25High: number;
};

const aqiBreakpoints: AQIBreakpoint[] = [
  { aqiLow: 0, aqiHigh: 50, pm25Low: 0.0, pm25High: 12.0 },
  { aqiLow: 51, aqiHigh: 100, pm25Low: 12.1, pm25High: 35.4 },
  { aqiLow: 101, aqiHigh: 150, pm25Low: 35.5, pm25High: 55.4 },
  { aqiLow: 151, aqiHigh: 200, pm25Low: 55.5, pm25High: 150.4 },
  { aqiLow: 201, aqiHigh: 300, pm25Low: 150.5, pm25High: 250.4 },
  { aqiLow: 301, aqiHigh: 400, pm25Low: 250.5, pm25High: 350.4 },
  { aqiLow: 401, aqiHigh: 500, pm25Low: 350.5, pm25High: 500.4 }
];

// Enhanced helper functions
function calculatePM25(aqi: number): number | null {
  for (const range of aqiBreakpoints) {
    if (aqi >= range.aqiLow && aqi <= range.aqiHigh) {
      return ((aqi - range.aqiLow) / (range.aqiHigh - range.aqiLow)) * 
             (range.pm25High - range.pm25Low) + range.pm25Low;
    }
  }
  return null;
}

function getAQIInfo(aqi: number) {
  if (aqi <= 0) return { 
    bgGradient: "from-gray-500 to-gray-600",
    textColor: "text-white",
    level: "กำลังโหลด",
    message: "กรุณารอสักครู่",
    emoji: "⏳",
    glowColor: "shadow-gray-500/50"
  };
  
  if (aqi <= 50) return {
    bgGradient: "from-green-400 to-green-600",
    textColor: "text-white",
    level: "ดี",
    message: "คุณภาพอากาศดี เพลิดเพลินกับกิจกรรมกลางแจ้งได้",
    emoji: "😊",
    glowColor: "shadow-green-500/50"
  };
  
  if (aqi <= 100) return {
    bgGradient: "from-yellow-400 to-yellow-500",
    textColor: "text-black",
    level: "ปานกลาง",
    message: "คุณภาพอากาศยอมรับได้ แต่อาจส่งผลกระทบต่อกลุ่มเสี่ยง",
    emoji: "🙂",
    glowColor: "shadow-yellow-500/50"
  };
  
  if (aqi <= 150) return {
    bgGradient: "from-orange-400 to-orange-600",
    textColor: "text-white",
    level: "ไม่ดีสำหรับกลุ่มเสี่ยง",
    message: "กลุ่มเสี่ยงอาจได้รับผลกระทบต่อสุขภาพ",
    emoji: "😕",
    glowColor: "shadow-orange-500/50"
  };
  
  if (aqi <= 200) return {
    bgGradient: "from-red-500 to-red-600",
    textColor: "text-white",
    level: "ไม่ดีต่อสุขภาพ",
    message: "ทุกคนอาจได้รับผลกระทบต่อสุขภาพ ควรลดกิจกรรมกลางแจ้ง",
    emoji: "😷",
    glowColor: "shadow-red-500/50"
  };
  
  if (aqi <= 300) return {
    bgGradient: "from-purple-500 to-purple-700",
    textColor: "text-white",
    level: "อันตราย",
    message: "ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้ง",
    emoji: "🤢",
    glowColor: "shadow-purple-500/50"
  };
  
  return {
    bgGradient: "from-purple-800 to-purple-900",
    textColor: "text-white",
    level: "อันตรายมาก",
    message: "ทุกคนควรงดกิจกรรมกลางแจ้งทั้งหมด",
    emoji: "☠️",
    glowColor: "shadow-purple-700/50"
  };
}

function angleToCardinal(angle: number): string {
  const directions = [
    "เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้",
    "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ"
  ];

  angle = (angle % 360 + 360) % 360;
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

function formatWindSpeed(speed: number): number {
  if (isNaN(speed) || speed < 0) return 0;
  return Math.round(speed * 3.6 * 10) / 10;
}

// Enhanced real-time clock with NTP-like accuracy
function useRealtimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);

  const syncTime = useCallback(async () => {
    try {
      const start = Date.now();
      const response = await fetch('/api/time', { cache: 'no-store' });
      const end = Date.now();
      
      if (response.ok) {
        const serverTime = new Date(await response.text());
        const networkDelay = (end - start) / 2;
        const serverTimestamp = serverTime.getTime() + networkDelay;
        const localTimestamp = Date.now();
        setTimeOffset(serverTimestamp - localTimestamp);
      }
    } catch (error) {
      console.warn('Failed to sync time with server:', error);
    }
  }, []);

  useEffect(() => {
    syncTime();
    const syncInterval = setInterval(syncTime, 5 * 60 * 1000);
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date(Date.now() + timeOffset));
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(clockInterval);
    };
  }, [syncTime, timeOffset]);

  return currentTime;
}

// Beautiful DateTime component optimized for 4K viewing distance
function CurrentDateTime() {
  const dateTime = useRealtimeClock();
  
  const formattedDate = dateTime.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = dateTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit', 
    hour12: false
  });
  
  return (
    <div className="text-right" suppressHydrationWarning>
      <div className="text-3xl font-semibold text-white drop-shadow-xl opacity-95">
        {formattedDate}
      </div>
      <div className="text-4xl font-bold text-white drop-shadow-xl mt-1">
        {formattedTime} น.
      </div>
    </div>
  );
}

// Enhanced fallback data
const dummyData: ApiResponse = {
  status: "success",
  data: {
    city: "Salaya",
    state: "Nakhon Pathom",
    country: "Thailand",
    location: {
      type: "Point",
      coordinates: [100.3, 13.8],
    },
    current: {
      pollution: {
        ts: new Date().toISOString(),
        aqius: 85,
        mainus: "p2",
        aqicn: 85,
        maincn: "p2",
      },
      weather: {
        ts: new Date().toISOString(),
        tp: 28,
        pr: 1013,
        hu: 65,
        ws: 3.2,
        wd: 180,
        ic: "01d",
      },
    },
  },
};

export default function Home() {
  const [, setIsLoading] = useState(true);
  
  // Enhanced SWR with aggressive refresh for real-time updates
  const { data: fetchedData, error, mutate } = useSWR<ApiResponse>(
    "/api/air-quality",
    async (url: string) => {
      try {
        const response = await fetch(url, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch air quality data:", error);
        throw error;
      }
    },
    {
      refreshInterval: 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30 * 1000,
      errorRetryInterval: 30 * 1000,
      errorRetryCount: 3,
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
      }
    }
  );

  useEffect(() => {
    const forceRefresh = setInterval(() => {
      mutate();
    }, 5 * 60 * 1000);

    return () => clearInterval(forceRefresh);
  }, [mutate]);

  // Validate and use fetched data
  const apiData = useMemo(() => {
    if (fetchedData?.status === "success" && !error) {
      const weather = fetchedData.data.current.weather;
      if (weather.tp < -10 || weather.tp > 50 || isNaN(weather.tp)) {
        return {
          ...fetchedData,
          data: {
            ...fetchedData.data,
            current: {
              ...fetchedData.data.current,
              weather: {
                ...weather,
                tp: dummyData.data.current.weather.tp
              }
            }
          }
        };
      }
      return fetchedData;
    }
    return dummyData;
  }, [fetchedData, error]);

  const {
    city,
    state,
    current: { pollution, weather },
  } = apiData.data;

  const aqi = pollution.aqius;
  const lastUpdated = apiData.lastFetch ? new Date(apiData.lastFetch) : new Date();
  const pm25 = calculatePM25(aqi);
  
  // Enhanced data validation
  const temperature = useMemo(() => {
    const temp = typeof weather.tp === 'number' && !isNaN(weather.tp) ? weather.tp : 28;
    return temp < -10 || temp > 50 ? 28 : Math.round(temp * 10) / 10;
  }, [weather.tp]);
  
  const windSpeedKmh = formatWindSpeed(weather.ws);
  const windDirection = !isNaN(weather.wd) ? weather.wd : 0;
  const windCardinal = angleToCardinal(windDirection);
  const humidity = !isNaN(weather.hu) && weather.hu > 0 && weather.hu <= 100 ? weather.hu : 65;
  const pressure = !isNaN(weather.pr) && weather.pr > 900 && weather.pr < 1100 ? weather.pr : 1013;
  const feelsLike = Math.round((temperature + (humidity > 70 ? 2 : -1)) * 10) / 10;
  const aqiInfo = getAQIInfo(aqi);
  
  const locationDisplay = useMemo(() => {
    if (!city || city === "กำลังโหลด") return "กำลังโหลดข้อมูล";
    if (!state || state === "กำลังโหลด") return city;
    return `${city}, ${state}`;
  }, [city, state]);
  
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      
      {/* Beautiful gradient background with sky overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/sky.webp" 
          alt="Sky Background"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/20"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Elegant header with perfect spacing for 4K */}
      <header className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start z-20">
        <div>
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl leading-tight">
            รายงานคุณภาพอากาศ
          </h1>
          <p className="text-2xl font-medium text-white/90 drop-shadow-lg mt-2">
            Air Quality Report • MWIT
          </p>
        </div>
        <CurrentDateTime />
      </header>
      
      {/* Main content - optimized layout for 4K 55" viewing */}
      <div className="w-full h-full flex justify-center items-center pt-32 pb-40">
        <div className="w-full max-w-7xl flex p-8 space-x-12 z-10">
          
          {/* AQI Card - Beautiful yet highly visible */}
          <div className={`w-1/2 bg-gradient-to-br ${aqiInfo.bgGradient} rounded-3xl shadow-2xl ${aqiInfo.glowColor} overflow-hidden relative`}>
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-black/10"></div>
            </div>
            
            <div className="p-10 flex flex-col h-full justify-between relative z-10">
              
              {/* Header section */}
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-xl font-bold tracking-wide ${aqiInfo.textColor}/90`}>คุณภาพอากาศ</div>
                  <div className={`text-3xl font-black ${aqiInfo.textColor}`}>US AQI</div>
                </div>
                <div className="text-6xl filter drop-shadow-lg">{aqiInfo.emoji}</div>
              </div>
              
              {/* Main AQI display - perfectly sized for distance viewing */}
              <div className="flex flex-col items-center justify-center flex-grow py-8">
                <div className={`text-[10rem] font-black leading-none ${aqiInfo.textColor} drop-shadow-2xl tracking-tight`}>
                  {aqi}
                </div>
                <div className={`text-4xl font-bold ${aqiInfo.textColor} mt-4 text-center tracking-wide`}>
                  {aqiInfo.level}
                </div>
                <div className={`text-xl font-semibold ${aqiInfo.textColor} mt-4 text-center max-w-md leading-relaxed opacity-95`}>
                  {aqiInfo.message}
                </div>
              </div>
              
              {/* Footer info */}
              <div className="border-t border-white/30 pt-6 space-y-2">
                <div className={`${aqiInfo.textColor} text-2xl font-bold`}>
                  PM 2.5: ~{pm25?.toFixed(1)} µg/m³
                </div>
              </div>
            </div>
          </div>
          
          {/* Weather Card - Clean and beautiful */}
          <div className="w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl shadow-2xl shadow-blue-500/30 overflow-hidden relative">
            
            {/* Elegant background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/30 via-transparent to-black/10"></div>
            </div>
            
            <div className="p-10 flex flex-col h-full justify-between relative z-10">
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xl font-bold text-white/90 tracking-wide">สภาพอากาศ</div>
                  <div className="text-3xl font-black text-white">{locationDisplay}</div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-white mr-2" />
                  <div className="text-xl font-semibold text-white">
                    Salaya
                  </div>
                </div>
              </div>
              
              {/* Temperature display */}
              <div className="flex flex-col items-center justify-center flex-grow py-6">
                <div className="text-[8rem] font-black text-white leading-none drop-shadow-2xl tracking-tight">
                  {temperature}°C
                </div>
                <div className="text-2xl font-semibold text-white/95 mt-4">
                  รู้สึกเหมือน {feelsLike}°C
                </div>
              </div>
              
              {/* Weather details grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white border border-white/20">
                  <div className="flex items-center mb-2">
                    <Droplets className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">ความชื้น</span>
                  </div>
                  <div className="text-3xl font-bold">{humidity}%</div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white border border-white/20">
                  <div className="flex items-center mb-2">
                    <Wind className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">ความเร็วลม</span>
                  </div>
                  <div className="text-3xl font-bold">{windSpeedKmh} กม./ชม.</div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white border border-white/20">
                  <div className="flex items-center mb-2">
                    <Gauge className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">ความดัน</span>
                  </div>
                  <div className="text-3xl font-bold">{pressure} hPa</div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white border border-white/20">
                  <div className="flex items-center mb-2">
                    <Compass className="w-5 h-5 mr-2" />
                    <span className="text-lg font-semibold">ทิศทางลม</span>
                  </div>
                  <div className="text-2xl font-bold">{windDirection}°</div>
                  <div className="text-lg font-medium opacity-90">({windCardinal})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Beautiful footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md text-white p-6 flex justify-between items-center z-20 border-t border-white/20">
        <div className="flex items-center">
          <Image 
            src="/sc.png" 
            alt="SC Logo" 
            width={50} 
            height={50} 
            className="h-12 w-auto mr-4"
            priority={true}
          />
          <div className="text-base">
            <p className="font-semibold">ขับเคลื่อนโดยคณะกรรมการสภานักเรียนรุ่นที่ 33</p>
            <p className="font-normal opacity-90">Developed by 33ᵗʰ Student Committee</p>
          </div>
        </div>
        
        <div className="text-right text-base">
          <div className="font-semibold">
            อัพเดทล่าสุด: {lastUpdated.toLocaleDateString("th-TH")} - {lastUpdated.toLocaleTimeString("th-TH", {hour: '2-digit', minute:'2-digit', hour12: false})} น.
          </div>
          <div className="flex items-center justify-end mt-1 space-x-4">
            {apiData.cached && <span className="text-yellow-300 font-medium">(แคชข้อมูล)</span>}
          </div>
        </div>
      </footer>
      
      {/* Elegant QR Code */}
      <div className="absolute bottom-28 right-8 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl z-20 border border-white/30">
        <Image
          src="/air-quality-qr.png"
          alt="QR Code"
          width={100}
          height={100}
          className="w-28 h-28"
          priority={true}
        />
      </div>
    </div>
  );
}