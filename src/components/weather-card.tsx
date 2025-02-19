"use client";

import { Wind, Droplets, Gauge, Compass } from "lucide-react";

function angleToDirection(angle: number): string {
    const directions = [
        "North", "North-Northeast", "Northeast", "East-Northeast",
        "East", "East-Southeast", "Southeast", "South-Southeast",
        "South", "South-Southwest", "Southwest", "West-Southwest",
        "West", "West-Northwest", "Northwest", "North-Northwest"
    ];

    // Normalize angle to 0 - 360
    angle = (angle % 360 + 360) % 360;

    // There are 16 directions, each covering 22.5 degrees (360/16)
    const index = Math.round(angle / 22.5) % 16;

    return directions[index];
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
    return (
        <div className="w-max max-w-4xl backdrop-blur-md bg-gradient-to-br from-blue-500/80 to-blue-300/90 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex flex-row gap-8 w-full justify-around">
                {/* Left side - Main temperature and sun info */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{city === "-" ? "-" : city}, {state === "-" ? "-" : state}</h2>
                        </div>
                        <div className="text-8xl font-bold">{temperature}°C</div>
                        <div className="text-3xl text-gray-200 font-regular">รู้สึกเหมือน {temperature - 2}°C</div>
                    </div>
                    
                    {/* <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Sunrise className="w-6 h-6" />
                            <div>
                                <div className="text-sm text-gray-300">Sunrise</div>
                                <div>06:37 AM</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Sunset className="w-6 h-6" />
                            <div>
                                <div className="text-sm text-gray-300">Sunset</div>
                                <div>20:37 AM</div>
                            </div>
                        </div>
                    </div> */}
                </div>
                {/* Right side - Weather conditions */}
                <div className="border border-white/30"></div>
                <div className="space-x-9 gap-8 flex-row flex">
                    {/* <div className="my-auto ml-3 mx-auto">
                        <div className="flex items-center justify-center mb-4">
                            <Sun className="w-24 h-24 text-yellow-400 animate-pulse" />
                        </div>
                        <div className="text-center text-2xl mb-6">Sunny</div>
                    </div> */}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Droplets className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300 text-xl">ความชื้น</span>
                            </div>
                            <div className="text-3xl">{humidity}%</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Wind className="w-5 h-5 text-gray-300" />
                                <span className="text-gray-300 text-xl">ความเร็วลม</span>
                            </div>
                            <div className="text-3xl">{windSpeed} กม./ชม.</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Gauge className="w-5 h-5 text-gray-300" />
                                <span className="text-gray-300 text-xl">ความดัน</span>
                            </div>
                            <div className="text-3xl">{pressure}hPa</div>
                        </div>
                        
                        <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Compass className="w-5 h-5 text-gray-200" />
                                <span className="text-gray-300 text-xl">ทิศทางลม</span>
                            </div>
                            <div className="text-3xl">{windDirection}° {`(${angleToDirection(windDirection)})`}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}