# Digital Signage

A modern digital signage application displaying real-time air quality and weather information, built with Express.js backend and vanilla JavaScript frontend.

## Features

- **Real-time Data**: Live air quality and weather information from IQAir API
- **Express.js Backend**: Modern Node.js server with API endpoints and caching
- **Static Frontend**: Optimized HTML, CSS (Tailwind), and vanilla JavaScript
- **Air Quality Data**: Real-time air quality information from IQAir API
- **Weather Information**: Current weather conditions
- **Thai Language Support**: Full Thai language interface
- **Responsive Design**: Optimized for 4K displays and digital signage

## Setup Instructions

### 1. Requirements

- Node.js 14+ and npm/bun
- Internet connection for API calls

### 2. Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mwit-sc/digital-signage.git
   cd digital-signage
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or using bun
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Add your IQAir API key**:
   ```
   IQAIR_KEY=your_actual_api_key_here
   PORT=3000  # Optional, defaults to 3000
   ```

5. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### 3. Getting an API Key

1. Visit [IQAir API](https://www.iqair.com/air-pollution-data-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to the `.env` file

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## File Structure

```
.
├── server.js              # Express.js server
├── package.json          # Node.js dependencies
├── .env.example          # Environment variables template
├── static/               # Static frontend files
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Custom CSS styles
│   ├── script.js        # Frontend JavaScript
│   └── assets/          # Static assets
│       ├── face/        # AQI emoji assets
│       │   ├── green.svg
│       │   ├── yellow.svg
│       │   ├── orange.svg
│       │   ├── red.svg
│       │   └── purple.svg
│       ├── sky.webp     # Background image
│       ├── sc.png       # Logo
│       └── air-quality-qr.png # QR code
└── api/                  # API cache directory (auto-created)
    └── cache/           # Cached API responses
```

## API Endpoints

### GET /api/air-quality
Returns air quality and weather data with caching.

**Response**:
```json
{
  "status": "success",
  "data": {
    "city": "Salaya",
    "state": "Nakhon Pathom",
    "current": {
      "pollution": {
        "aqius": 85,
        "mainus": "p2"
      },
      "weather": {
        "tp": 28,
        "hu": 65,
        "ws": 3.2,
        "wd": 180,
        "pr": 1013
      }
    }
  },
  "cached": false,
  "lastFetch": "2024-01-01T12:00:00+07:00"
}
```

### GET /api/time
Returns current server time in ISO format.

**Response**:
```
2024-01-01T12:00:00+07:00
```

## Browser Compatibility

### Supported Features
- ✅ Chrome 49+
- ✅ Firefox 44+
- ✅ Safari 9+
- ✅ Edge 12+
- ✅ Internet Explorer 11

### Compatibility Techniques Used
- ES5 JavaScript syntax
- XMLHttpRequest instead of fetch()
- Tailwind CSS v2 (better browser support)
- Flexbox with vendor prefixes
- CSS Grid with fallbacks
- No modern CSS features (CSS Variables have fallbacks)

### Polyfills Included
- JSON parsing/stringify (built-in support in target browsers)
- Date methods (built-in support)
- Basic DOM manipulation (built-in support)

## Deployment Options

### 1. VPS/Dedicated Server
Install Node.js and run the application using PM2 or systemd.

### 2. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Using PM2
```bash
npm install -g pm2
pm2 start server.js --name digital-signage
pm2 save
pm2 startup
```

### 4. Cloud Platforms
- **Vercel**: Supports Node.js applications
- **Railway**: One-click deployment for Node.js
- **DigitalOcean App Platform**: Supports Node.js
- **AWS EC2/Elastic Beanstalk**: Full control
- **Google Cloud Run**: Serverless Node.js deployment
- **Heroku**: Simple Node.js deployment

## Configuration

### Environment Variables
```bash
# Required
IQAIR_KEY=your_api_key_here

# Optional
PORT=3000                  # Server port (defaults to 3000)
CACHE_DURATION=1800        # Cache duration in seconds (30 minutes)
```

### Cache Configuration
The application uses file-based caching in `/api/cache/`. This directory is automatically created on first run.

### Location Configuration
To change the monitored location, edit `server.js`:
```javascript
const params = new URLSearchParams({
    city: 'Your-City',
    state: 'Your-State',
    country: 'Your-Country',
    key: apiKey
});
```

## Troubleshooting

### Common Issues

1. **"Missing IQAIR_KEY" error**:
   - Ensure `.env` file exists in project root
   - Check API key is correctly set
   - Restart the server after changing `.env`

2. **"Failed to fetch" error**:
   - Check internet connection
   - Verify API key is valid and not expired
   - Check API rate limits

3. **Port already in use**:
   - Change the PORT in `.env` file
   - Or stop the process using the port

4. **Blank page**:
   - Check browser console for JavaScript errors
   - Verify server is running on correct port
   - Check Node.js console for server errors

5. **API rate limit errors**:
   - Free IQAir tier limited to 10,000 calls/month
   - Increase CACHE_DURATION to reduce API calls
   - Consider upgrading API plan for production use

### Development Mode
Use nodemon for auto-restart on file changes:
```bash
npm run dev
```

## Performance Optimization

### Caching Strategy
- API responses cached for 30 minutes
- Static assets cached for 1 month
- HTML not cached (always fresh)

### Image Optimization
- Use WebP format for background image
- Optimize PNG files for icons
- Consider using SVG for scalable graphics

### Network Optimization
- Enable gzip compression
- Minimize HTTP requests
- Use CDN for external resources

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## Technologies Used

- **Backend**: Express.js, Node.js
- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **APIs**: IQAir API for air quality data
- **Build**: Babel for JavaScript compatibility

## License


