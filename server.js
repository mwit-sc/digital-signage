const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('static'));

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
        lastFetch: new Date().toISOString()
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

    const url = new URL(API_URL);
    url.searchParams.append('city', 'Salaya');
    url.searchParams.append('state', 'Nakhon-pathom');
    url.searchParams.append('country', 'Thailand');
    url.searchParams.append('key', apiKey);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Cache-Control': 'no-store'
            },
            timeout: 30000
        });

        if (!response.ok) {
            return {
                error: 'Failed to fetch air quality data from API',
                status: 500
            };
        }

        const data = await response.json();

        if (data.status !== 'success') {
            return {
                error: `API returned error: ${data.data?.message || 'Unknown error'}`,
                status: 400
            };
        }

        return data;
    } catch (error) {
        return {
            error: 'Failed to fetch air quality data from API',
            status: 500
        };
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

        res.json(responseData);

    } catch (error) {
        console.error('Air Quality API Error:', error.message);

        // Try to return stale cache if available
        const staleCache = getCachedData();
        if (staleCache) {
            staleCache.cached = true;
            staleCache.stale = true;
            staleCache.error = error.message;

            return res.json(staleCache);
        }

        // No cache available, return error
        res.status(500).json({
            error: 'An error occurred while fetching air quality data'
        });
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