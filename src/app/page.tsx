"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";

// Type definitions for the API response
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

// Simple fetcher for useSWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // Fetch data with SWR (refresh every 15 minutes = 900,000 ms)
  const { data: fetchedData } = useSWR<ApiResponse>(
    "/api/air-quality",
    fetcher,
    { refreshInterval: 15 * 60 * 1000 }
  );

  // If there's an error or the API hasn't returned data yet, use dummy data
  const apiData = fetchedData?.status === "success" ? fetchedData : dummyData;

  // Destructure data
  const {
    city,
    state,
    country,
    location,
    current: { pollution, weather },
  } = apiData.data;

  const aqi = pollution.aqius;
  const lastUpdated = new Date(pollution.ts);

  // Determine AQI zone, styling, recommendation
  let zone = "";
  let recommendation = "";
  let aqiBgGradient = "";

  if (aqi <= 50) {
    zone = "Safe";
    recommendation = "Air quality is excellent. Enjoy your outdoor activities!";
    aqiBgGradient = "bg-gradient-to-r from-green-400 to-green-600";
  } else if (aqi <= 100) {
    zone = "Moderate";
    recommendation =
      "Air quality is acceptable. Sensitive groups should take caution.";
    aqiBgGradient = "bg-gradient-to-r from-yellow-400 to-yellow-600";
  } else {
    zone = "Danger";
    recommendation =
      "Air quality is unhealthy. Limit outdoor activities and consider wearing a mask.";
    aqiBgGradient = "bg-gradient-to-r from-red-500 to-red-600";
  }

  // Current time (for the header clock)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Aspect ratio container for signage */}
      <div className="w-screen h-screen relative">
        {/* Transparent overlay to show background behind */}
        <div className="absolute inset-0 bg-[url('/sky.webp')] bg-cover bg-center"></div>

        {/* Header */}
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
            className="text-4xl text-white drop-shadow-lg"
            suppressHydrationWarning
          >
            {currentTime.toLocaleTimeString()}
          </div>
        </header>

        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 space-y-12">
          {/* AQI Card */}
          <div
            className={`${aqiBgGradient} bg-opacity-70 rounded-xl p-8 flex items-center shadow-2xl max-w-5xl w-full`}
          >
            <img
              src="/face/red.svg"
              alt="Air Quality Icon"
              className="w-48 h-auto mr-6 drop-shadow-lg"
            />
            <div>
              <div className="text-8xl font-extrabold text-white drop-shadow-lg">
                {aqi <= 0 ? "-" : aqi}
                <small className="text-4xl ml-2 align-super">µg/m³</small>
              </div>
              <div className="mt-2 text-4xl font-bold text-white drop-shadow-lg">
                {aqi <= 0 ? "-" : zone}
              </div>
              <div className="mt-6 text-2xl text-white drop-shadow-lg max-w-3xl leading-snug">
                {aqi <= 0 ? "-" : recommendation}
              </div>
            </div>
          </div>

          {/* Weather Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-300 bg-opacity-90 w-full max-w-6xl rounded-3xl p-8 flex flex-col text-white shadow-xl">
            {/* Top Section: City/State & Big Temperature */}
            <div className="flex">
              <div className="flex-1">
                <h2 className="text-4xl font-bold">{city === "-" ? "-" : city}, {state === "-" ? "-" : state}</h2>
                <p className="text-xl mt-1">{country === "-" ? "-" : country}</p>
              </div>
              {/* Weather Icon or Big Temperature */}
              <div className="flex items-center justify-end w-1/3">
                <p className="text-6xl font-extrabold">
                  {weather.tp <= 0 ? "-" : weather.tp}°
                </p>
              </div>
            </div>

            {/* Divider & Weather Details */}
            <div className="mt-6 border-t border-white/30 pt-4 grid grid-cols-3 gap-4 text-center">
              {/* Humidity */}
              <div>
                <img
                  src="/humidity.svg"
                  alt="Humidity Icon"
                  className="mx-auto w-8 h-8 mb-2"
                />
                <p className="text-lg">Humidity</p>
                <p className="text-lg font-semibold">
                  {weather.hu <= 0 ? "-" : weather.hu}%
                </p>
              </div>
              {/* Pressure */}
              <div>
                <img
                  src="/pressure.svg"
                  alt="Pressure Icon"
                  className="mx-auto w-8 h-8 mb-2"
                />
                <p className="text-lg">Pressure</p>
                <p className="text-lg font-semibold">
                  {weather.pr <= 0 ? "-" : weather.pr} hPa
                </p>
              </div>
              {/* Wind Speed */}
              <div>
                <img
                  src="/wind.svg"
                  alt="Wind Icon"
                  className="mx-auto w-8 h-8 mb-2"
                />
                <p className="text-lg">Wind</p>
                <p className="text-lg font-semibold">
                  {weather.ws <= 0 ? "-" : weather.ws} m/s
                </p>
              </div>
            </div>

            {/* Coordinates (optional) */}
            <div className="mt-4 text-lg">
              <p>
                Coordinates:{" "}
                {location.coordinates.every((val) => val === 0)
                  ? "-"
                  : location.coordinates.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 pb-4 flex justify-between items-center">
          {/* Left side: logo + text */}
          <div className="flex items-center space-x-4 text-white text-2xl drop-shadow-lg ml-10">
            <img src="/sc.png" alt="SC Logo" className="h-20" />
            {/* Divider */}
            <div className="h-10 w-[2px] bg-white opacity-60"></div>
            <div className="text-left leading-tight">
              <p>ขับเคลื่อนโดยคณะกรรมการสภานักเรียน</p>
              <p>Developed by Student Committee</p>
            </div>
          </div>
          {/* Right side: last update */}
          <p className="text-white text-2xl drop-shadow-lg mr-10">
            Last update:{" "}
            {pollution.ts === "-"
              ? "-"
              : lastUpdated.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }) +
                " " +
                lastUpdated.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
          </p>
        </footer>
      </div>
    </div>
  );
}
