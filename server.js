const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Static assets with caching (1 day for CSS/JS/images, 1 hour for HTML)
app.use(express.static('static', {
    maxAge: '1d',
    setHeaders: function(res, path) {
        // HTML files should have shorter cache or no-cache for fresh content
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
        // CSS and JS files - longer cache with immutable hint
        else if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
        // Images and fonts - longest cache
        else if (path.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
        }
    }
}));

const API_URL = 'https://api.airvisual.com/v2/city';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map();

function getApiKey() {
    return process.env.IQAIR_KEY;
}

function isCacheValid() {
    const cached = cache.get('air-quality');
    if (!cached) return false;

    return (Date.now() - cached.timestamp) < CACHE_DURATION_MS;
}

function getCachedData() {
    return cache.get('air-quality');
}

function saveCacheData(data) {
    const cacheData = {
        data: data,
        timestamp: Date.now(),
        cached: false,
        lastFetch: new Date().toISOString(),
        // Preserve location_note if it exists
        location_note: data.data ? data.data.location_note : undefined
    };

    cache.set('air-quality', cacheData);
}

async function fetchAirQualityData() {
    const apiKey = getApiKey();

    if (!apiKey) {
        return {
            error: 'Missing IQAIR_KEY environment variable',
            status: 500
        };
    }

    // Try Salaya first
    const salayaUrl = new URL(API_URL);
    salayaUrl.searchParams.append('city', 'Salaya');
    salayaUrl.searchParams.append('state', 'Nakhon-pathom');
    salayaUrl.searchParams.append('country', 'Thailand');
    salayaUrl.searchParams.append('key', apiKey);

    try {
        const response = await fetch(salayaUrl.toString(), {
            headers: {
                'Cache-Control': 'no-store'
            },
            timeout: 30000
        });

        if (!response.ok) {
            throw new Error('Salaya request failed');
        }

        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(`Salaya API error: ${data.data?.message || 'Unknown error'}`);
        }

        return data;
    } catch (salayaError) {
        console.log('Salaya request failed, falling back to Nakhon Pathom:', salayaError.message);

        // Fall back to Nakhon Pathom city
        const nakhonPathomUrl = new URL(API_URL);
        nakhonPathomUrl.searchParams.append('city', 'Nakhon-pathom');
        nakhonPathomUrl.searchParams.append('state', 'Nakhon-pathom');
        nakhonPathomUrl.searchParams.append('country', 'Thailand');
        nakhonPathomUrl.searchParams.append('key', apiKey);

        try {
            const fallbackResponse = await fetch(nakhonPathomUrl.toString(), {
                headers: {
                    'Cache-Control': 'no-store'
                },
                timeout: 30000
            });

            if (!fallbackResponse.ok) {
                return {
                    error: 'Failed to fetch air quality data from both Salaya and Nakhon Pathom',
                    status: 500
                };
            }

            const fallbackData = await fallbackResponse.json();

            if (fallbackData.status !== 'success') {
                return {
                    error: `API returned error for both locations: ${fallbackData.data?.message || 'Unknown error'}`,
                    status: 400
                };
            }

            // Add a note that this is fallback data
            if (fallbackData.data) {
                fallbackData.data.location_note = 'Using Nakhon Pathom data (Salaya unavailable)';
            }

            return fallbackData;
        } catch (error) {
            return {
                error: 'Failed to fetch air quality data from both Salaya and Nakhon Pathom',
                status: 500
            };
        }
    }
}

// Air quality endpoint
app.get('/api/air-quality', async (req, res) => {
    try {
        // Check if we have valid cached data
        if (isCacheValid()) {
            const cachedData = getCachedData();
            if (cachedData) {
                cachedData.cached = true;
                const cacheAgeMinutes = Math.floor((Date.now() - cachedData.timestamp) / (1000 * 60));
                cachedData.cacheAge = `${cacheAgeMinutes} minutes`;

                // Ensure location_note is preserved in the response
                if (cachedData.location_note && cachedData.data && cachedData.data.data) {
                    cachedData.data.data.location_note = cachedData.location_note;
                }

                return res.json(cachedData);
            }
        }

        // Cache is expired or doesn't exist, fetch fresh data
        const apiResponse = await fetchAirQualityData();

        if (apiResponse.error) {
            // API call failed, try to return stale cache if available
            const staleCache = getCachedData();
            if (staleCache) {
                staleCache.cached = true;
                staleCache.stale = true;
                staleCache.apiError = apiResponse.error;

                // Ensure location_note is preserved in stale cache
                if (staleCache.location_note && staleCache.data && staleCache.data.data) {
                    staleCache.data.data.location_note = staleCache.location_note;
                }

                return res.json(staleCache);
            }

            // No cache available, return error
            return res.status(apiResponse.status || 500).json(apiResponse);
        }

        // Save fresh data to cache
        saveCacheData(apiResponse);

        // Return fresh data
        const responseData = {
            status: apiResponse.status,
            data: apiResponse.data,
            cached: false,
            lastFetch: new Date().toISOString()
        };

        // Preserve location_note if it exists
        if (apiResponse.data && apiResponse.data.location_note) {
            responseData.location_note = apiResponse.data.location_note;
            // Also ensure it's in the nested data structure for frontend
            if (responseData.data && responseData.data.data) {
                responseData.data.data.location_note = apiResponse.data.location_note;
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('Air Quality API Error:', error.message);

        // Try to return stale cache if available
        const staleCache = getCachedData();
        if (staleCache) {
            staleCache.cached = true;
            staleCache.stale = true;
            staleCache.error = error.message;

            // Ensure location_note is preserved in stale cache
            if (staleCache.location_note && staleCache.data && staleCache.data.data) {
                staleCache.data.data.location_note = staleCache.location_note;
            }

            return res.json(staleCache);
        }

        // No cache available, return error
        res.status(500).json({
            error: 'An error occurred while fetching air quality data'
        });
    }
});

// Open-Meteo Weather endpoint
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const WEATHER_CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const weatherCache = new Map();

// Salaya, Nakhon Pathom coordinates
const LOCATION = {
    latitude: 13.796,
    longitude: 100.326,
    name: 'Salaya',
    state: 'Nakhon Pathom'
};

async function fetchWeatherData() {
    const url = new URL(OPEN_METEO_URL);
    url.searchParams.append('latitude', LOCATION.latitude);
    url.searchParams.append('longitude', LOCATION.longitude);
    url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m');
    url.searchParams.append('hourly', 'precipitation_probability,precipitation');
    url.searchParams.append('daily', 'temperature_2m_min,temperature_2m_max');
    url.searchParams.append('timezone', 'Asia/Bangkok');
    url.searchParams.append('forecast_days', '1');

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Cache-Control': 'no-store' },
            timeout: 15000
        });

        if (!response.ok) {
            return { error: 'Failed to fetch weather data', status: 500 };
        }

        const data = await response.json();
        return {
            status: 'success',
            location: LOCATION,
            current: {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                precipitation: data.current.precipitation,
                weatherCode: data.current.weather_code,
                windSpeed: data.current.wind_speed_10m,
                windDirection: data.current.wind_direction_10m
            },
            daily: {
                tempMin: data.daily.temperature_2m_min[0],
                tempMax: data.daily.temperature_2m_max[0]
            },
            hourly: {
                precipitation: data.hourly.precipitation.slice(0, 6),
                precipitationProbability: data.hourly.precipitation_probability.slice(0, 6),
                time: data.hourly.time.slice(0, 6)
            }
        };
    } catch (error) {
        return { error: 'Failed to fetch weather data: ' + error.message, status: 500 };
    }
}

app.get('/api/weather', async (req, res) => {
    try {
        // Check cache
        const cached = weatherCache.get('weather');
        if (cached && (Date.now() - cached.timestamp) < WEATHER_CACHE_DURATION_MS) {
            return res.json({ ...cached.data, cached: true, lastFetch: cached.lastFetch });
        }

        // Fetch fresh data
        const weatherData = await fetchWeatherData();

        if (weatherData.error) {
            // Return stale cache if available
            if (cached) {
                return res.json({ ...cached.data, cached: true, stale: true, lastFetch: cached.lastFetch });
            }
            return res.status(weatherData.status || 500).json(weatherData);
        }

        // Save to cache
        weatherCache.set('weather', {
            data: weatherData,
            timestamp: Date.now(),
            lastFetch: new Date().toISOString()
        });

        res.json({ ...weatherData, cached: false, lastFetch: new Date().toISOString() });

    } catch (error) {
        console.error('Weather API Error:', error.message);
        const cached = weatherCache.get('weather');
        if (cached) {
            return res.json({ ...cached.data, cached: true, stale: true, error: error.message });
        }
        res.status(500).json({ error: 'An error occurred while fetching weather data' });
    }
});

// Time endpoint
app.get('/api/time', (req, res) => {
    try {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Content-Type': 'text/plain'
        });

        // Get current server time in Asia/Bangkok timezone
        const serverTime = new Date().toLocaleString('sv-SE', {
            timeZone: 'Asia/Bangkok'
        });

        // Convert to ISO format
        const isoTime = new Date(serverTime + '+07:00').toISOString();

        res.send(isoTime);
    } catch (error) {
        console.error('Time API Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});