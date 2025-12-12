# Digital Signage - Static Version

This is a static HTML+CSS+JavaScript version of the Digital Signage application, compatible with older browsers (Chrome 49+) and using PHP for the backend API.

## Features

- **Browser Compatibility**: Works on Chrome 49+ and other older browsers
- **Static Frontend**: Pure HTML, CSS (Tailwind), and vanilla JavaScript
- **PHP Backend**: Simple PHP scripts for API endpoints
- **Air Quality Data**: Real-time air quality information from IQAir API
- **Weather Information**: Current weather conditions
- **Thai Language Support**: Full Thai language interface
- **Responsive Design**: Optimized for 4K displays and digital signage

## Setup Instructions

### 1. Web Server Requirements

- PHP 5.4 or higher
- Apache/Nginx with mod_rewrite enabled
- Internet connection for API calls

### 2. Installation

1. **Copy files to web server**:
   ```bash
   cp -r static/* /var/www/html/
   ```

2. **Set up environment variables**:
   ```bash
   cd /var/www/html/api
   cp .env.example .env
   nano .env
   ```

3. **Add your IQAir API key**:
   ```
   IQAIR_KEY=your_actual_api_key_here
   ```

4. **Set proper permissions**:
   ```bash
   chmod 755 api/
   chmod 644 api/*.php
   chmod 666 api/.env
   mkdir -p api/cache
   chmod 777 api/cache
   ```

### 3. Getting an API Key

1. Visit [IQAir API](https://www.iqair.com/air-pollution-data-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to the `.env` file

### 4. Apache Configuration

Ensure your Apache configuration allows:
- `.htaccess` files (`AllowOverride All`)
- `mod_rewrite` module enabled
- `mod_expires` module enabled (optional, for caching)
- `mod_deflate` module enabled (optional, for compression)

## File Structure

```
static/
├── index.html              # Main HTML file
├── styles.css             # Custom CSS for browser compatibility
├── script.js              # Vanilla JavaScript application
├── .htaccess             # Apache configuration
├── api/                   # Backend API endpoints
│   ├── air-quality.php   # Air quality data endpoint
│   ├── time.php          # Server time endpoint
│   ├── .env.example      # Environment variables template
│   └── cache/            # Cache directory (auto-created)
├── sky.webp              # Background image
├── sc.png                # Logo
├── air-quality-qr.png    # QR code
└── face/                 # AQI emoji assets
    ├── green.svg
    ├── yellow.svg
    ├── orange.svg
    ├── red.svg
    └── purple.svg
```

## API Endpoints

### GET /api/air-quality.php
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

### GET /api/time.php
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

### 1. Shared Hosting
Most shared hosting providers support PHP. Simply upload the files and configure the environment variables.

### 2. VPS/Dedicated Server
Install Apache/Nginx and PHP, then deploy the files.

### 3. Docker
```dockerfile
FROM php:7.4-apache
COPY static/ /var/www/html/
RUN a2enmod rewrite
RUN a2enmod expires
RUN a2enmod deflate
RUN a2enmod headers
```

### 4. Cloud Platforms
- **Vercel**: Not recommended (Node.js focus)
- **Netlify**: Use with Netlify Functions (requires conversion)
- **DigitalOcean App Platform**: Supports PHP
- **AWS EC2**: Full control, supports PHP
- **Google Cloud Platform**: Supports PHP

## Configuration

### Environment Variables
```bash
# Required
IQAIR_KEY=your_api_key_here

# Optional (with defaults)
CACHE_DURATION=1800        # Cache duration in seconds (30 minutes)
TIMEZONE=Asia/Bangkok      # Server timezone
```

### Cache Configuration
The application uses file-based caching in `/api/cache/`. Ensure this directory is writable by the web server.

### Location Configuration
To change the monitored location, edit `air-quality.php`:
```php
$url = API_URL . '?' . http_build_query(array(
    'city' => 'Your-City',
    'state' => 'Your-State',
    'country' => 'Your-Country',
    'key' => $api_key
));
```

## Troubleshooting

### Common Issues

1. **"Missing IQAIR_KEY" error**:
   - Ensure `.env` file exists in `/api/` directory
   - Check API key is correctly set
   - Verify file permissions

2. **"Failed to fetch" error**:
   - Check internet connection
   - Verify API key is valid and not expired
   - Check API rate limits

3. **Cache directory errors**:
   - Ensure `api/cache/` directory exists
   - Check directory permissions (should be writable)

4. **Blank page**:
   - Check browser console for JavaScript errors
   - Verify all assets are loading correctly
   - Check Apache error logs

5. **Tailwind CSS not loading**:
   - Verify CDN connection
   - Check `.htaccess` configuration
   - Try different CDN URL if needed

### Debug Mode
Add this to your `.env` file for debugging:
```
DEBUG=true
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

## Security Considerations

- Environment variables are protected by `.htaccess`
- API responses include CORS headers
- Cache directory is protected from direct access
- XSS and clickjacking protection enabled

