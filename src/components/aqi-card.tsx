"use client";

import React from "react";

import { useAirQuality } from "./air-quality-client";
import { calculatePM25, getAQIInfo } from "@/lib/utils";

export function AQICard() {
  const { data: apiData } = useAirQuality();

  const {
    current: { pollution },
  } = apiData.data;

  const aqi = pollution.aqius;
  const pm25 = calculatePM25(aqi);
  const aqiInfo = getAQIInfo(aqi);

  return (
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
  );
}