"use client";

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

// Dummy data for now
const dummyData: ApiResponse = {
  status: "success",
  data: {
    city: "Salaya",
    state: "Nakhon Pathom",
    country: "Thailand",
    location: {
      type: "Point",
      coordinates: [100.32622308, 13.79059242],
    },
    current: {
      pollution: {
        ts: "2025-02-12T12:00:00.000Z",
        aqius: 129,
        mainus: "p2",
        aqicn: 65,
        maincn: "p2",
      },
      weather: {
        ts: "2025-02-12T12:00:00.000Z",
        tp: 32,
        pr: 1009,
        hu: 37,
        ws: 3.63,
        wd: 186,
        ic: "04n",
      },
    },
  },
};

export default function Home() {
  const [data, setData] = useState<ApiResponse>(dummyData);
  const {
    city,
    state,
    country,
    location,
    current: { pollution, weather },
  } = data.data;
  const aqi = pollution.aqius;
  const lastUpdated = new Date(pollution.ts);
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
    aqiBgGradient = "bg-gradient-to-r from-red-400 to-red-600";
  }

  // Update current time (for the header clock)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      <div className="w-full max-w-screen-4k aspect-video relative">
        <div className="absolute inset-0 bg-transparent"></div>
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-top">
          <div className="flex items-center">
            <h1 className="text-6xl font-extrabold text-white drop-shadow-lg leading-[15px]">
              <p className="">รายงานคุณภาพอากาศ</p><br />
              <p className="text-4xl mt-2">Air Quality Report</p>
            </h1>
          </div>
            <div className="text-4xl text-white drop-shadow-lg ">
            {currentTime.toLocaleTimeString()}
            </div>
        </header>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 space-y-12">
          <div
            className={`${aqiBgGradient} bg-opacity-70 rounded-xl p-10 flex items-center shadow-2xl`}
          >
            <img src="/face/red.svg" alt="Air Quality Icon" className="w-96" />
            <div>
              <div className="text-9xl font-extrabold text-white drop-shadow-lg">
                {aqi} <small className="text-5xl">µg/m³</small>
              </div>
              <div className="mt-4 text-4xl font-bold text-white drop-shadow-lg">
                {zone}
              </div>
              <div className="mt-8 text-2xl text-white drop-shadow-lg text-center max-w-3xl">
                {recommendation}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 w-full max-w-6xl">
            <div className="bg-black/40 rounded-xl p-8 flex flex-col items-center shadow-xl">
              <div className="flex items-center mb-4">
              <img src="/sun.svg" alt="" className="w-20" />
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                  Weather
                </h2>
              </div>
              <p className="text-3xl text-white drop-shadow-lg">
                Temperature: {weather.tp}°C
              </p>
              <p className="text-3xl text-white drop-shadow-lg">
                Humidity: {weather.hu}%
              </p>
              <p className="text-3xl text-white drop-shadow-lg">
                Pressure: {weather.pr} hPa
              </p>
              <p className="text-3xl text-white drop-shadow-lg">
                Wind Speed: {weather.ws} m/s
              </p>
            </div>
            <div className="bg-black/40 rounded-xl p-8 flex flex-col items-center shadow-xl">
              <div className="flex items-center mb-4">
              <img src="/location.svg" alt="" className="rotate-[211deg] h-20" />
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                  Location
                </h2>
              </div>
              <p className="text-3xl text-white drop-shadow-lg">
                {city}, {state}
              </p>
              <p className="text-3xl text-white drop-shadow-lg">{country}</p>
              <p className="text-3xl text-white drop-shadow-lg">
                Coordinates: {location.coordinates.join(", ")}
              </p>
            </div>
          </div>
        </div>
        <footer className="absolute bottom-0 left-0 right-0 pb-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-white text-2xl drop-shadow-lg ml-10">
          <img src="/sc.png" alt="SC Logo" className="h-20" />
          <div className="h-10 w-[2px] bg-black"></div>
            <div className="text-left">
              <p>ขับเคลื่อนโดยคณะกรรมการสภานักเรียน</p>
              <p>Develop by Student Committee</p>
            </div>
          </div>
          <p className="text-white text-2xl drop-shadow-lg mr-10">
            Last update: {lastUpdated.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            {lastUpdated.toLocaleTimeString("en-GB", {
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
