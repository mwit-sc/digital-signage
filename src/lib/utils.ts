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

export function calculatePM25(aqi: number): number | null {
  for (const range of aqiBreakpoints) {
    if (aqi >= range.aqiLow && aqi <= range.aqiHigh) {
      return ((aqi - range.aqiLow) / (range.aqiHigh - range.aqiLow)) *
             (range.pm25High - range.pm25Low) + range.pm25Low;
    }
  }
  return null;
}

export function getAQIInfo(aqi: number) {
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

export function angleToCardinal(angle: number): string {
  const directions = [
    "เหนือ", "ตะวันออกเฉียงเหนือ", "ตะวันออก", "ตะวันออกเฉียงใต้",
    "ใต้", "ตะวันตกเฉียงใต้", "ตะวันตก", "ตะวันตกเฉียงเหนือ"
  ];

  angle = (angle % 360 + 360) % 360;
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

export function formatWindSpeed(speed: number): number {
  if (isNaN(speed) || speed < 0) return 0;
  return Math.round(speed * 3.6 * 10) / 10;
}