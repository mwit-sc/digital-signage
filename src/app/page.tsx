"use client";

import { useEffect, useState, useMemo } from "react";
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

// Helper Functions
function calculatePM25(aqi: number): number | null {
  for (const range of aqiBreakpoints) {
    if (aqi >= range.aqiLow && aqi <= range.aqiHigh) {
      return ((aqi - range.aqiLow) / (range.aqiHigh - range.aqiLow)) * 
             (range.pm25High - range.pm25Low) + range.pm25Low;
    }
  }
  return null;
}

// Get appropriate AQI info based on value
function getAQIInfo(aqi: number) {
  if (aqi <= 0) return { 
    bgColor: "bg-gray-500",
    textColor: "text-white",
    level: "กำลังโหลด",
    message: "กรุณารอสักครู่",
    emoji: "😐"
  };
  
  if (aqi <= 50) return {
    bgColor: "bg-green-500",
    textColor: "text-white",
    level: "ดี",
    message: "คุณภาพอากาศดี เพลิดเพลินกับกิจกรรมกลางแจ้งได้",
    emoji: "😊"
  };
  
  if (aqi <= 100) return {
    bgColor: "bg-yellow-500",
    textColor: "text-black",
    level: "ปานกลาง",
    message: "คุณภาพอากาศยอมรับได้ แต่อาจส่งผลกระทบต่อกลุ่มเสี่ยง",
    emoji: "🙂"
  };
  
  if (aqi <= 150) return {
    bgColor: "bg-orange-500",
    textColor: "text-white",
    level: "ไม่ดีสำหรับกลุ่มเสี่ยง",
    message: "กลุ่มเสี่ยงอาจได้รับผลกระทบต่อสุขภาพ",
    emoji: "😕"
  };
  
  if (aqi <= 200) return {
    bgColor: "bg-red-500",
    textColor: "text-white",
    level: "ไม่ดีต่อสุขภาพ",
    message: "ทุกคนอาจได้รับผลกระทบต่อสุขภาพ ควรลดกิจกรรมกลางแจ้ง",
    emoji: "😷"
  };
  
  if (aqi <= 300) return {
    bgColor: "bg-purple-500",
    textColor: "text-white",
    level: "อันตราย",
    message: "ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้ง",
    emoji: "🤢"
  };
  
  return {
    bgColor: "bg-purple-900",
    textColor: "text-white",
    level: "อันตรายมาก",
    message: "ทุกคนควรงดกิจกรรมกลางแจ้งทั้งหมด",
    emoji: "☠️"
  };
}

// Format wind direction angle to cardinal direction in Thai
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

// Format wind speed from m/s to km/h
function formatWindSpeed(speed: number): number {
  if (isNaN(speed) || speed < 0) return 0;
  return Math.round(speed * 3.6 * 10) / 10;
}

// Component for current date and time with automatic updates
function CurrentDateTime() {
  const [dateTime, setDateTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
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
    <div className="text-right">
      <div className="text-3xl text-white drop-shadow-lg">{formattedDate}</div>
      <div className="text-3xl text-white drop-shadow-lg mt-1">{formattedTime} น.</div>
    </div>
  );
}

// Fallback data if API is not available
const dummyData: ApiResponse = {
  status: "success",
  data: {
    city: "กำลังโหลด",
    state: "กำลังโหลด",
    country: "Thailand",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    current: {
      pollution: {
        ts: "-",
        aqius: 0,
        mainus: "-",
        aqicn: 0,
        maincn: "-",
      },
      weather: {
        ts: "-",
        tp: 0,
        pr: 0,
        hu: 0,
        ws: 0,
        wd: 0,
        ic: "-",
      },
    },
  },
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data with SWR for caching and revalidation
  const { data: fetchedData, error } = useSWR<ApiResponse>(
    "/api/air-quality",
    async (url: string) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch air quality data:", error);
        return null;
      }
    },
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false, // Don't revalidate on tab focus
      onSuccess: () => {
        setIsLoading(false);
      },
      dedupingInterval: 30 * 60 * 1000, // Dedupe requests within 30 minutes
    }
  );

  // Use dummy data while loading or if there's an error
  const apiData = (fetchedData?.status === "success" && !error) ? fetchedData : dummyData;

  const {
    city,
    state,
    current: { pollution, weather },
  } = apiData.data;

  const aqi = pollution.aqius;
  const lastUpdated = apiData.lastFetch ? new Date(apiData.lastFetch) : new Date();
  const pm25 = calculatePM25(aqi);
  
  // Format temperature for display with sensible defaults
  const temperature = useMemo(() => {
    const temp = typeof weather.tp === 'number' && !isNaN(weather.tp) ? weather.tp : 0;
    return temp < -50 || temp > 60 ? 25 : Math.round(temp * 10) / 10;
  }, [weather.tp]);
  
  // Format other weather data
  const feelsLike = Math.round((temperature - 2) * 10) / 10;
  const windSpeedKmh = formatWindSpeed(weather.ws);
  const windDirection = !isNaN(weather.wd) ? weather.wd : 0;
  const windCardinal = angleToCardinal(windDirection);
  const humidity = !isNaN(weather.hu) && weather.hu > 0 ? weather.hu : 50;
  const pressure = !isNaN(weather.pr) && weather.pr > 0 ? weather.pr : 1013;
  
  // Get AQI info based on current air quality
  const aqiInfo = getAQIInfo(aqi);
  
  // Format location display
  const locationDisplay = useMemo(() => {
    if (city === "กำลังโหลด" || !city) return "กำลังโหลดข้อมูล";
    if (state === "กำลังโหลด" || !state) return city;
    return `${city}, ${state}`;
  }, [city, state]);
  
  return (
    <div className="w-screen h-screen overflow-hidden transition-opacity duration-500" 
      style={{ opacity: isLoading ? 0.7 : 1 }}>
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/sky.webp" 
          alt="Sky Background"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      
      {/* Background Overlay for better readability */}
      <div className="fixed inset-0 bg-black/10 z-0"></div>
      
      {/* Header bar */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            รายงานคุณภาพอากาศ
          </h1>
          <p className="text-2xl text-white drop-shadow-lg mt-1">
            Air Quality Report • MWIT
          </p>
        </div>
        <CurrentDateTime />
      </header>
      
      {/* Main content area */}
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full max-w-7xl flex p-8 gap-8 z-10">
          {/* Left card - AQI */}
          <div className={`w-1/2 ${aqiInfo.bgColor} rounded-3xl shadow-2xl overflow-hidden relative`}>
            
            {/* AQI Content */}
            <div className="p-10 flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xl font-medium text-white/80">คุณภาพอากาศ</div>
                  <div className="text-2xl font-bold text-white">US AQI</div>
                </div>
                <Image
                  src="/face/yellow.svg"
                  alt="Air Quality Icon"
                  width={100}
                  height={100}
                  className="w-24 h-24"
                />
              </div>
              
              <div className="flex flex-col items-center justify-center flex-grow py-10">
                <div className={`text-9xl font-black ${aqiInfo.textColor}`}>
                  {aqi}
                </div>
                <div className={`text-5xl font-bold ${aqiInfo.textColor} mt-6`}>
                  {aqiInfo.level}
                </div>
                <div className={`text-3xl ${aqiInfo.textColor} mt-4 text-center max-w-md`}>
                  {aqiInfo.message}
                </div>
              </div>
              
              <div className="mt-4">
                <div className={`${aqiInfo.textColor} text-xl font-medium border-t border-white/20 pt-4`}>
                  PM 2.5: ~{pm25?.toFixed(1)} µg/m³
                </div>
              </div>
            </div>
          </div>
          
          {/* Right card - Weather */}
          <div className="w-1/2 bg-blue-500 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xl font-medium text-white/80">สภาพอากาศ</div>
                  <div className="text-2xl font-bold text-white">{locationDisplay}</div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-white mr-2" />
                  <div className="text-xl text-white">
                    Salaya
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center flex-grow py-6">
                <div className="text-9xl font-black text-white">
                  {temperature}°C
                </div>
                <div className="text-2xl text-white/90 mt-4">
                  รู้สึกเหมือน {feelsLike}°C
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/20 rounded-xl p-4 text-white">
                  <div className="flex items-center mb-1">
                    <Droplets className="w-5 h-5 mr-2" />
                    <span className="text-lg">ความชื้น</span>
                  </div>
                  <div className="text-3xl font-bold">{humidity}%</div>
                </div>
                
                <div className="bg-white/20 rounded-xl p-4 text-white">
                  <div className="flex items-center mb-1">
                    <Wind className="w-5 h-5 mr-2" />
                    <span className="text-lg">ความเร็วลม</span>
                  </div>
                  <div className="text-3xl font-bold">{windSpeedKmh} กม./ชม.</div>
                </div>
                
                <div className="bg-white/20 rounded-xl p-4 text-white">
                  <div className="flex items-center mb-1">
                    <Gauge className="w-5 h-5 mr-2" />
                    <span className="text-lg">ความดัน</span>
                  </div>
                  <div className="text-3xl font-bold">{pressure} hPa</div>
                </div>
                
                <div className="bg-white/20 rounded-xl p-4 text-white">
                  <div className="flex items-center mb-1">
                    <Compass className="w-5 h-5 mr-2" />
                    <span className="text-lg">ทิศทางลม</span>
                  </div>
                  <div className="text-3xl font-bold">{windDirection}° <span className="text-lg">({windCardinal})</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm text-white p-4 flex justify-between items-center z-20">
        <div className="flex items-center">
          <Image 
            src="/sc.png" 
            alt="SC Logo" 
            width={50} 
            height={50} 
            className="h-12 w-auto mr-4"
            priority={true}
          />
          <div className="text-sm">
            <p>ขับเคลื่อนโดยคณะกรรมการสภานักเรียนรุ่นที่ 33</p>
            <p>Developed by Student Committee</p>
          </div>
        </div>
        
        <div className="text-right text-sm">
          <div>
            อัพเดทล่าสุด: {lastUpdated.toLocaleDateString("th-TH")} - {lastUpdated.toLocaleTimeString("th-TH", {hour: '2-digit', minute:'2-digit', hour12: false})} น.
          </div>
          {apiData.cached && <span className="text-yellow-200">(แคชข้อมูล)</span>}
        </div>
      </footer>
      
      {/* QR Code */}
      <div className="absolute bottom-24 right-8 bg-white p-2 rounded-md shadow-lg z-20">
        <Image
          src="/air-quality-qr.png"
          alt="QR Code"
          width={100}
          height={100}
          className="w-24 h-24"
          priority={true}
        />
      </div>
    </div>
  );
}