"use client";

import WeatherCard from "@/components/weather-card";
import Image from "next/image";
import useSWR from "swr";

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

function calculatePM25(aqi: number): number | null {
  for (const range of aqiBreakpoints) {
    if (aqi >= range.aqiLow && aqi <= range.aqiHigh) {
      return ((aqi - range.aqiLow) / (range.aqiHigh - range.aqiLow)) * 
             (range.pm25High - range.pm25Low) + range.pm25Low;
    }
  }
  return null; // AQI out of range
}

// Dummy data with "-" placeholders
const dummyData: ApiResponse = {
  status: "success",
  data: {
    city: "-",
    state: "-",
    country: "-",
    location: {
      type: "Point",
      coordinates: [0, 0], // or [NaN, NaN] if you prefer
    },
    current: {
      pollution: {
        ts: "-",   // fallback time
        aqius: 0,  // numeric fallback for logic
        mainus: "-",
        aqicn: 0,
        maincn: "-",
      },
      weather: {
        ts: "-",
        tp: 0,    // numeric fallback for logic
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
  const { data: fetchedData } = useSWR<ApiResponse>(
    "/api/air-quality",
    async (url: string) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  const apiData = fetchedData?.status === "success" ? fetchedData : dummyData;

  const {
    city,
    state,
    current: { pollution, weather },
  } = apiData.data;

  const aqi = pollution.aqius;
  const lastUpdated = new Date(pollution.ts);

  // Calculate PM2.5 from AQI
  const pm25 = calculatePM25(aqi);

  // Determine AQI zone, recommendation, and background gradient
  let zone = "";
  let recommendation = "";
  let aqiBgGradient = "";

  if (aqi <= 50) {
    zone = "ปลอดภัย";
    recommendation = "คุณภาพอากาศดีเยี่ยม เพลิดเพลินกับกิจกรรมกลางแจ้งของคุณได้เลย";
    aqiBgGradient = "bg-gradient-to-r from-green-400/80 to-green-600/80";
  } else if (aqi <= 100) {
    zone = "ปานกลาง";
    recommendation =
      "คุณภาพอากาศอยู่ในเกณฑ์ยอมรับได้ แต่อาจมีมลพิษที่ส่งผลกระทบต่อผู้ที่ไวต่อมลพิษ";
    aqiBgGradient = "bg-gradient-to-r from-yellow-400/90 to-yellow-600/80";
  } else if (aqi <= 150) {
    zone = "ไม่ดีสำหรับกลุ่มเสี่ยง";
    recommendation =
      "ผู้ที่อยู่ในกลุ่มเสี่ยงอาจได้รับผลกระทบต่อสุขภาพ ส่วนประชาชนทั่วไปมีโอกาสได้รับผลกระทบน้อย";
    aqiBgGradient = "bg-gradient-to-r from-orange-400/80 to-orange-600/80";
  } else if (aqi <= 200) {
    zone = "ไม่ดีต่อสุขภาพ";
    recommendation =
      "ทุกคนอาจได้รับผลกระทบต่อสุขภาพ และกลุ่มเสี่ยงอาจมีอาการรุนแรงขึ้น ควรลดกิจกรรมกลางแจ้ง";
    aqiBgGradient = "bg-gradient-to-r from-red-500/80 to-red-600/80";
  } else {
    zone = "อันตรายมาก";
    recommendation =
      "แจ้งเตือนสุขภาพ: ทุกคนอาจได้รับผลกระทบที่รุนแรง หลีกเลี่ยงกิจกรรมกลางแจ้งหากเป็นไปได้";
    aqiBgGradient = "bg-gradient-to-r from-purple-500/80 to-purple-700/80";
  }  
  

  // // Current time (for the header clock)
  // const [currentTime, setCurrentTime] = useState(new Date());
  // useEffect(() => {
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-screen h-screen relative">
        <div className="absolute inset-0 bg-transparent"></div>
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
              รายงานคุณภาพอากาศ
            </h1>
            <p className="text-3xl text-white drop-shadow-lg mt-2">
              Air Quality Report
            </p>
          </div>
          <div
            className="text-3xl text-white drop-shadow-lg text-right"
            suppressHydrationWarning
          >
            อยู่ระหว่างการทดสอบระบบ<br></br>
            Under Development
          </div>
        </header>
        <div className="absolute mx-auto w-full h-full my-auto inset-0 flex flex-col items-center justify-center p-12 space-y-12">
         <WeatherCard
            city={city}
            state={state}
            temperature={weather.tp}
            humidity={weather.hu}
            windSpeed={weather.ws}
            pressure={weather.pr}
            windDirection={weather.wd}
          />
          <div
            className={`${aqiBgGradient} backdrop-blur-md bg-opacity-70 rounded-xl p-8 flex items-center shadow-2xl max-w-6xl w-full`}
          >
            <Image
              src="/face/red.svg"
              alt="Air Quality Icon"
              className="w-48 h-auto mr-6 drop-shadow-lg"
              width={192}
              height={192}
            />
            <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg">
              <Image
                src="/air-quality-qr.png" // Replace with the actual QR code image path
                alt="QR Code"
                width={120}
                height={120}
                className="w-26 h-26"
              />
            </div>
            <div className="flex-1">
              <div className="text-8xl font-extrabold text-white drop-shadow-lg">
                {aqi <= 0 ? "-" : aqi}
                <small className="text-4xl ml-2 align-super">
                  AQI
                </small>
              </div>
              <div className="text-3xl font-bold text-white drop-shadow-lg">
                {aqi <= 0 ? "" : `PM 2.5 : ~ ${pm25?.toFixed(1)} µg/m³`} <small className="text-sm font-lg">{"( จากการคำนวณย้อนกลับ )"}</small>
              </div>
              <div className="w-full h-1 bg-white/30 my-4 mb-6"></div>
              <div className="mt-2 text-4xl font-bold text-white drop-shadow-lg">
                {aqi <= 0 ? "-" : zone}
              </div>
              <div className="mt-3 text-3xl text-white drop-shadow-lg max-w-3xl leading-snug">
                {aqi <= 0 ? "-" : recommendation}
              </div>
            </div>
          </div>
          {/* <div className="bg-gradient-to-br from-blue-500 to-blue-300 bg-opacity-90 w-max max-w-3xl rounded-3xl p-8 flex-row flex text-white shadow-xl">
            <div className="flex-col">
              <div className="flex items-center justify-start w-1/3">
                <p className="text-9xl font-extrabold">
                  {weather.tp <= 0 ? "-" : weather.tp}°
                </p>
              </div>
              <div className="flex-1">
                <h2 className="text-4xl font-bold">{city === "-" ? "-" : city}, {state === "-" ? "-" : state}</h2>
                <p className="text-xl mt-1">{country === "-" ? "-" : country}</p>
              </div>
            </div>
            <div className="border border-white/30 mx-10" />
            <div className=" pt-4 flex-col space-y-2 text-center">
              <div>
                <Image
                  src="/humidity.svg"
                  alt="Humidity Icon"
                  className="mx-auto w-8 h-8 mb-2"
                  width={32}
                  height={32}
                />
                <p className="text-lg">Humidity</p>
                <p className="text-lg font-semibold">
                  {weather.hu <= 0 ? "-" : weather.hu}%
                </p>
              </div>
              <div>
                <Image
                  src="/pressure.svg"
                  alt="Pressure Icon"
                  className="mx-auto w-8 h-8 mb-2"
                  width={32}
                  height={32}
                />
                <p className="text-lg">Pressure</p>
                <p className="text-lg font-semibold">
                  {weather.pr <= 0 ? "-" : weather.pr} hPa
                </p>
              </div>
              <div>
                <Image
                  src="/wind.svg"
                  alt="Wind Icon"
                  className="mx-auto w-8 h-8 mb-2"
                  width={32}
                  height={32}
                />
                <p className="text-lg">Wind</p>
                <p className="text-lg font-semibold">
                  {weather.ws <= 0 ? "-" : weather.ws} m/s
                </p>
              </div>
            </div>
          
          </div> */}
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 pb-4 flex justify-between items-center">
          {/* Left side: logo + text */}
          <div className="flex items-center space-x-4 text-white text-2xl drop-shadow-lg ml-10">
            <Image src="/sc.png" alt="SC Logo" className="h-20" width={80} height={80} />
            {/* Divider */}
            <div className="h-10 w-[2px] bg-white opacity-60"></div>
            <div className="text-left leading-tight">
              <p>ขับเคลื่อนโดยคณะกรรมการสภานักเรียนรุ่นที่ 33</p>
              <p>Developed by Student Committee</p>
            </div>
          </div>
          {/* Right side: last update */}
          <p className="text-white text-2xl drop-shadow-lg mr-10">
            อัพเดทล่าสุด:{" "}
            {pollution.ts === "-"
              ? "-"
              : lastUpdated.toLocaleDateString("en-GB", {

                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Bangkok",
                }) +
                " - " +
                lastUpdated.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Asia/Bangkok",
                })}
          </p>
        </footer>
      </div>
    </div>
  );
}
