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

  // For a live dashboard, consider fetching data periodically:
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await fetch('/api/air-quality');
  //     const result = await res.json();
  //     if (result.status === 'success') setData(result);
  //   };
  //   fetchData();
  //   const interval = setInterval(fetchData, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  // Destructure API data
  const {
    city,
    state,
    country,
    location,
    current: { pollution, weather },
  } = data.data;
  const aqi = pollution.aqius;
  const lastUpdated = new Date(pollution.ts);

  // Determine AQI zone, recommendation, and background gradient
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
      {/* Container locked to 16:9 ratio */}
      <div className="w-full max-w-screen-4k aspect-video relative">
        {/* Transparent background so the layout image shows */}
        <div className="absolute inset-0 bg-transparent"></div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
          <div className="flex items-center">
            {/* Uncomment below to add your logo */}
            {/* <img src="/logo.png" alt="Logo" className="h-20 mr-4" /> */}
            <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">
              Air Quality Dashboard
            </h1>
          </div>
          <div className="text-4xl text-white drop-shadow-lg">
            {currentTime.toLocaleTimeString()}
          </div>
        </header>

        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 space-y-12">
          {/* AQI Card */}
          <div
            className={`${aqiBgGradient} bg-opacity-70 rounded-xl p-10 flex flex-col items-center shadow-2xl`}
          >
            {/* Icon for AQI (e.g., a clock/gauge icon) */}
            <svg
              className="w-24 h-24 text-white mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
            <div className="text-9xl font-extrabold text-white drop-shadow-lg">
              {aqi}
            </div>
            <div className="mt-4 text-4xl font-bold text-white drop-shadow-lg">
              {zone}
            </div>
            <div className="mt-8 text-2xl text-white drop-shadow-lg text-center max-w-3xl">
              {recommendation}
            </div>
          </div>

          {/* Additional Data Cards */}
          <div className="grid grid-cols-2 gap-12 w-full max-w-6xl">
            {/* Weather Card */}
            <div className="bg-white/30 rounded-xl p-8 flex flex-col items-center shadow-xl">
              <div className="flex items-center mb-4">
                {/* Weather Icon */}
                <svg
                  className="w-16 h-16 text-yellow-300 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.22a1 1 0 011.415 0l.707.707a1 1 0 01-1.414 1.414l-.708-.707a1 1 0 010-1.414zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zm-2.22 5.78a1 1 0 010 1.415l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-2.22a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 9a1 1 0 110 2H3a1 1 0 110-2h1zm2.22-5.78a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0z" />
                  <path d="M10 5a5 5 0 100 10A5 5 0 0010 5z" />
                </svg>
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
            {/* Location Card */}
            <div className="bg-white/30 rounded-xl p-8 flex flex-col items-center shadow-xl">
              <div className="flex items-center mb-4">
                {/* Location Icon */}
                <svg
                  className="w-16 h-16 text-blue-300 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 019.9 0c2.73 2.73 2.73 7.17 0 9.9l-4.95 4.95a.5.5 0 01-.7 0l-4.95-4.95c-2.73-2.73-2.73-7.17 0-9.9zM10 7a3 3 0 100 6 3 3 0 000-6z"
                    clipRule="evenodd"
                  />
                </svg>
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

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 text-center p-8">
          <p className="text-2xl text-white drop-shadow-lg">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </footer>
      </div>
    </div>
  );
}
