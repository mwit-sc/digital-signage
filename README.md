# Digital Signage

[![DigitalOcean](https://img.shields.io/badge/Deployed%20on-DigitalOcean-0080FF?logo=digitalocean)](https://www.digitalocean.com)
[![PM2](https://img.shields.io/badge/Managed%20by-PM2-2B037A?logo=pm2)](https://pm2.keymetrics.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A digital signage application displaying real-time air quality and weather information for MWIT, powered by IQAir and Open-Meteo APIs.

## Features

- **Real-time Data** - Live air quality (AQI) from IQAir and weather from Open-Meteo
- **Thai Language Support** - Full Thai language interface
- **4K Optimized** - Designed for large digital signage displays
- **Smart Caching** - 30-minute cache to reduce API calls
- **Legacy Browser Support** - Compatible with older browsers (IE11+)

## Tech Stack

- Express.js
- Vanilla JavaScript
- Tailwind CSS
- IQAir API
- Open-Meteo API

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/air-quality` | Returns air quality and weather data |
| `GET /api/time` | Returns current server time |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IQAIR_KEY` | Yes | Your IQAir API key |
| `PORT` | No | Server port (default: 3000) |

## License

[MIT](./LICENSE)
