// Digital Signage JavaScript - Compatible with Chrome 49
// Using ES5 syntax for maximum compatibility

(function() {
    'use strict';

    // AQI breakpoints for PM2.5 calculation
    var aqiBreakpoints = [
        { aqiLow: 0, aqiHigh: 50, pm25Low: 0.0, pm25High: 12.0 },
        { aqiLow: 51, aqiHigh: 100, pm25Low: 12.1, pm25High: 35.4 },
        { aqiLow: 101, aqiHigh: 150, pm25Low: 35.5, pm25High: 55.4 },
        { aqiLow: 151, aqiHigh: 200, pm25Low: 55.5, pm25High: 150.4 },
        { aqiLow: 201, aqiHigh: 300, pm25Low: 150.5, pm25High: 250.4 },
        { aqiLow: 301, aqiHigh: 400, pm25Low: 250.5, pm25High: 350.4 },
        { aqiLow: 401, aqiHigh: 500, pm25Low: 350.5, pm25High: 500.4 }
    ];

    // State variables
    var timeOffset = 0;
    var isLoading = true;
    var lastFetchTime = null;

    // Helper function for calculating PM2.5 from AQI
    function calculatePM25(aqi) {
        for (var i = 0; i < aqiBreakpoints.length; i++) {
            var range = aqiBreakpoints[i];
            if (aqi >= range.aqiLow && aqi <= range.aqiHigh) {
                return ((aqi - range.aqiLow) / (range.aqiHigh - range.aqiLow)) *
                       (range.pm25High - range.pm25Low) + range.pm25Low;
            }
        }
        return null;
    }

    // Get AQI information for styling and display
    function getAQIInfo(aqi) {
        if (aqi <= 0) return {
            bgClass: 'aqi-loading',
            textColor: 'text-white',
            level: 'กำลังโหลด',
            message: 'กรุณารอสักครู่',
            emoji: '⏳'
        };

        if (aqi <= 50) return {
            bgClass: 'aqi-good',
            textColor: 'text-white',
            level: 'ดี',
            message: 'คุณภาพอากาศดี เพลิดเพลินกับกิจกรรมกลางแจ้งได้',
            emoji: '😊'
        };

        if (aqi <= 100) return {
            bgClass: 'aqi-moderate',
            textColor: 'text-black',
            level: 'ปานกลาง',
            message: 'คุณภาพอากาศยอมรับได้ แต่อาจส่งผลกระทบต่อกลุ่มเสี่ยง',
            emoji: '🙂'
        };

        if (aqi <= 150) return {
            bgClass: 'aqi-unhealthy-sensitive',
            textColor: 'text-white',
            level: 'ไม่ดีสำหรับกลุ่มเสี่ยง',
            message: 'กลุ่มเสี่ยงอาจได้รับผลกระทบต่อสุขภาพ',
            emoji: '😕'
        };

        if (aqi <= 200) return {
            bgClass: 'aqi-unhealthy',
            textColor: 'text-white',
            level: 'ไม่ดีต่อสุขภาพ',
            message: 'ทุกคนอาจได้รับผลกระทบต่อสุขภาพ ควรลดกิจกรรมกลางแจ้ง',
            emoji: '😷'
        };

        if (aqi <= 300) return {
            bgClass: 'aqi-very-unhealthy',
            textColor: 'text-white',
            level: 'อันตราย',
            message: 'ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้ง',
            emoji: '🤢'
        };

        return {
            bgClass: 'aqi-hazardous',
            textColor: 'text-white',
            level: 'อันตรายมาก',
            message: 'ทุกคนควรงดกิจกรรมกลางแจ้งทั้งหมด',
            emoji: '☠️'
        };
    }

    // Convert wind angle to cardinal direction
    function angleToCardinal(angle) {
        var directions = [
            'เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้',
            'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'
        ];

        angle = (angle % 360 + 360) % 360;
        var index = Math.round(angle / 45) % 8;
        return directions[index];
    }

    // Format wind speed from m/s to km/h
    function formatWindSpeed(speed) {
        if (isNaN(speed) || speed < 0) return 0;
        return Math.round(speed * 3.6 * 10) / 10;
    }

    // Update AQI card with new data
    function updateAQICard(data) {
        var aqiCard = document.getElementById('aqi-card');
        var aqiValue = document.getElementById('aqi-value');
        var aqiLevel = document.getElementById('aqi-level');
        var aqiMessage = document.getElementById('aqi-message');
        var aqiEmoji = document.getElementById('aqi-emoji');
        var pm25Info = document.getElementById('pm25-info');

        if (!data || !data.current || !data.current.pollution) {
            return;
        }

        var aqi = data.current.pollution.aqius || 0;
        var aqiInfo = getAQIInfo(aqi);
        var pm25 = calculatePM25(aqi);

        // Update AQI card styling
        aqiCard.className = 'w-1/2 bg-gradient-to-br rounded-3xl shadow-2xl overflow-hidden relative aqi-card ' + aqiInfo.bgClass;

        // Update values
        aqiValue.textContent = aqi;
        aqiLevel.textContent = aqiInfo.level;
        aqiMessage.textContent = aqiInfo.message;
        aqiEmoji.textContent = aqiInfo.emoji;

        if (pm25 !== null) {
            pm25Info.textContent = 'PM 2.5: ~' + pm25.toFixed(1) + ' µg/m³';
        }

        // Update text colors if needed for moderate AQI
        var textElements = aqiCard.querySelectorAll('.text-white, .text-black');
        for (var i = 0; i < textElements.length; i++) {
            textElements[i].className = textElements[i].className.replace(/text-(?:white|black)/, aqiInfo.textColor);
        }
    }

    // Update weather card with new data
    function updateWeatherCard(data) {
        var weatherLocation = document.getElementById('weather-location');
        var temperatureValue = document.getElementById('temperature-value');
        var feelsLike = document.getElementById('feels-like');
        var humidityValue = document.getElementById('humidity-value');
        var windSpeedValue = document.getElementById('wind-speed-value');
        var pressureValue = document.getElementById('pressure-value');
        var windDirectionValue = document.getElementById('wind-direction-value');
        var windCardinalValue = document.getElementById('wind-cardinal-value');

        if (!data || !data.current || !data.current.weather) {
            return;
        }

        var weather = data.current.weather;
        var city = data.city || 'กำลังโหลด';
        var state = data.state || '';

        // Validate and format temperature
        var temperature = 28; // default value
        if (typeof weather.tp === 'number' && !isNaN(weather.tp)) {
            temperature = weather.tp;
        }

        // Apply reasonable temperature bounds
        if (temperature < -10 || temperature > 50) {
            temperature = 28;
        } else {
            temperature = Math.round(temperature * 10) / 10;
        }

        // Calculate feels like temperature
        var humidity = 65; // default value
        if (!isNaN(weather.hu) && weather.hu > 0 && weather.hu <= 100) {
            humidity = weather.hu;
        }

        var tempAdjustment = humidity > 70 ? 2 : -1;
        var feelsLikeTemp = Math.round((temperature + tempAdjustment) * 10) / 10;

        // Format other values
        var windSpeedKmh = formatWindSpeed(weather.ws);

        var windDirection = 0; // default value
        if (!isNaN(weather.wd)) {
            windDirection = weather.wd;
        }
        var windCardinal = angleToCardinal(windDirection);

        var pressure = 1013; // default value (standard atmospheric pressure)
        if (!isNaN(weather.pr) && weather.pr > 900 && weather.pr < 1100) {
            pressure = weather.pr;
        }

        // Update location display
        var locationDisplay;
        if (city === 'กำลังโหลด') {
            locationDisplay = 'กำลังโหลดข้อมูล';
        } else if (!state || state === 'กำลังโหลด') {
            locationDisplay = city;
        } else {
            locationDisplay = city + ', ' + state;
        }

        // Update DOM elements
        weatherLocation.textContent = locationDisplay;
        temperatureValue.textContent = temperature + '°C';
        feelsLike.textContent = 'รู้สึกเหมือน ' + feelsLikeTemp + '°C';
        humidityValue.textContent = humidity + '%';
        windSpeedValue.textContent = windSpeedKmh + ' กม./ชม.';
        pressureValue.textContent = pressure + ' hPa';
        windDirectionValue.textContent = windDirection + '°';
        windCardinalValue.textContent = '(' + windCardinal + ')';
    }

    // Update footer with last updated time
    function updateFooter(data) {
        var lastUpdated = document.getElementById('last-updated');
        var cacheIndicator = document.getElementById('cache-indicator');

        var updateTime = data && data.lastFetch ? new Date(data.lastFetch) : new Date();

        var formattedDate = updateTime.toLocaleDateString('th-TH');
        var formattedTime = updateTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        lastUpdated.textContent = 'อัพเดทล่าสุด: ' + formattedDate + ' - ' + formattedTime + ' น.';

        // Show cache indicator if data is cached
        if (data && data.cached) {
            cacheIndicator.classList.remove('hidden');
        } else {
            cacheIndicator.classList.add('hidden');
        }
    }

    // Fetch air quality data
    function fetchAirQualityData() {
        // Using XMLHttpRequest for Chrome 49 compatibility
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/air-quality', true);
        xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        xhr.setRequestHeader('Pragma', 'no-cache');

        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.data && data.data.data) {
                        updateAQICard(data.data.data);
                        updateWeatherCard(data.data.data);
                        updateFooter(data);
                        isLoading = false;
                    } else {
                        console.error('API returned error:', data.error || 'Unknown error');
                        console.error('Full response:', data);
                        loadFallbackData();
                    }
                } else {
                    console.error('HTTP error:', xhr.status);
                    loadFallbackData();
                }
            } catch (e) {
                console.error('Failed to parse response:', e);
                loadFallbackData();
            }
        };

        xhr.onerror = function() {
            console.error('Network error');
            loadFallbackData();
        };

        xhr.send();
    }

    // Dummy data
    function loadFallbackData() {
        var dummyData = {
            status: 'success',
            data: {
                city: 'Salaya',
                state: 'Nakhon Pathom',
                country: 'Thailand',
                location: {
                    type: 'Point',
                    coordinates: [100.3, 13.8]
                },
                current: {
                    pollution: {
                        ts: new Date().toISOString(),
                        aqius: 85,
                        mainus: 'p2',
                        aqicn: 85,
                        maincn: 'p2'
                    },
                    weather: {
                        ts: new Date().toISOString(),
                        tp: 28,
                        pr: 1013,
                        hu: 65,
                        ws: 3.2,
                        wd: 180,
                        ic: '01d'
                    }
                }
            },
            cached: false,
            lastFetch: new Date()
        };

        updateAQICard(dummyData.data);
        updateWeatherCard(dummyData.data);
        updateFooter(dummyData);
        isLoading = false;
    }

    // Sync time with server
    function syncTime() {
        var xhr = new XMLHttpRequest();
        var start = Date.now();

        xhr.open('GET', 'api/time', true);
        xhr.setRequestHeader('Cache-Control', 'no-store');

        xhr.onload = function() {
            var end = Date.now();
            if (xhr.status === 200) {
                try {
                    var serverTime = new Date(xhr.responseText);
                    var networkDelay = (end - start) / 2;
                    var serverTimestamp = serverTime.getTime() + networkDelay;
                    var localTimestamp = Date.now();
                    timeOffset = serverTimestamp - localTimestamp;
                } catch (e) {
                    console.warn('Failed to parse server time:', e);
                }
            }
        };

        xhr.onerror = function() {
            console.warn('Failed to sync time with server');
        };

        xhr.send();
    }

    // Update current date and time display
    function updateDateTime() {
        var dateDisplay = document.getElementById('date-display');
        var timeDisplay = document.getElementById('time-display');

        var currentTime = new Date(Date.now() + timeOffset);

        var formattedDate = currentTime.toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        var formattedTime = currentTime.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        dateDisplay.textContent = formattedDate;
        timeDisplay.textContent = formattedTime + ' น.';
    }

    // Initialize the application
    function init() {
        //console.log('Initializing ...');

        // Initial time sync
        syncTime();

        // Initial data fetch
        fetchAirQualityData();

        // Set up intervals
        setInterval(updateDateTime, 1000); // Update time every second
        setInterval(syncTime, 5 * 60 * 1000); // Sync time every 5 minutes
        setInterval(fetchAirQualityData, 60 * 1000); // Fetch data every minute

        // Force refresh every 5 minutes
        setInterval(function() {
            fetchAirQualityData();
        }, 5 * 60 * 1000);

        // console.log('initialized successfully');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page visibility changes to refresh data when page becomes visible
    if (typeof document.hidden !== 'undefined') {
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                fetchAirQualityData();
            }
        });
    }

})();
