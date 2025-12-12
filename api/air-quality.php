<?php
// Air Quality API endpoint - PHP version
// Compatible with PHP 5.4+

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
const API_URL = 'https://api.airvisual.com/v2/city';
const CACHE_DURATION_SECONDS = 1800; // 30 minutes
const CACHE_FILE = __DIR__ . '/cache/air_quality_cache.json';

// Ensure cache directory exists
$cache_dir = dirname(CACHE_FILE);
if (!file_exists($cache_dir)) {
    mkdir($cache_dir, 0755, true);
}

function get_api_key() {
    // Try multiple ways to get the API key
    $api_key = getenv('IQAIR_KEY');
    if (!$api_key && file_exists(__DIR__ . '/.env')) {
        $env_content = file_get_contents(__DIR__ . '/.env');
        if (preg_match('/IQAIR_KEY=(.+)/', $env_content, $matches)) {
            $api_key = trim($matches[1]);
        }
    }
    return $api_key;
}

function is_cache_valid() {
    if (!file_exists(CACHE_FILE)) {
        return false;
    }

    $cache_time = filemtime(CACHE_FILE);
    $current_time = time();

    return ($current_time - $cache_time) < CACHE_DURATION_SECONDS;
}

function get_cached_data() {
    if (!file_exists(CACHE_FILE)) {
        return null;
    }

    $cache_content = file_get_contents(CACHE_FILE);
    $cache_data = json_decode($cache_content, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }

    return $cache_data;
}

function save_cache_data($data) {
    $cache_data = array(
        'data' => $data,
        'timestamp' => time(),
        'cached' => false,
        'lastFetch' => date('c')
    );

    file_put_contents(CACHE_FILE, json_encode($cache_data));
}

function fetch_air_quality_data() {
    $api_key = get_api_key();

    if (!$api_key) {
        return array(
            'error' => 'Missing IQAIR_KEY environment variable',
            'status' => 500
        );
    }

    // Build API URL
    $url = API_URL . '?' . http_build_query(array(
        'city' => 'Salaya',
        'state' => 'Nakhon-pathom',
        'country' => 'Thailand',
        'key' => $api_key
    ));

    // Create context for HTTP request
    $context = stream_context_create(array(
        'http' => array(
            'method' => 'GET',
            'header' => "Cache-Control: no-store\r\n",
            'timeout' => 30
        )
    ));

    // Fetch data from API
    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return array(
            'error' => 'Failed to fetch air quality data from API',
            'status' => 500
        );
    }

    $data = json_decode($response, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        return array(
            'error' => 'Invalid JSON response from API',
            'status' => 500
        );
    }

    if (!isset($data['status']) || $data['status'] !== 'success') {
        return array(
            'error' => 'API returned error: ' . (isset($data['data']['message']) ? $data['data']['message'] : 'Unknown error'),
            'status' => 400
        );
    }

    return $data;
}

// Main execution
try {
    // Check if we have valid cached data
    if (is_cache_valid()) {
        $cached_data = get_cached_data();
        if ($cached_data) {
            // Return cached data
            $cached_data['cached'] = true;
            $cache_age_minutes = floor((time() - $cached_data['timestamp']) / 60);
            $cached_data['cacheAge'] = $cache_age_minutes . ' minutes';

            echo json_encode($cached_data);
            exit;
        }
    }

    // Cache is expired or doesn't exist, fetch fresh data
    $api_response = fetch_air_quality_data();

    if (isset($api_response['error'])) {
        // API call failed, try to return stale cache if available
        $stale_cache = get_cached_data();
        if ($stale_cache) {
            $stale_cache['cached'] = true;
            $stale_cache['stale'] = true;
            $stale_cache['apiError'] = $api_response['error'];

            echo json_encode($stale_cache);
            exit;
        }

        // No cache available, return error
        http_response_code(isset($api_response['status']) ? $api_response['status'] : 500);
        echo json_encode($api_response);
        exit;
    }

    // Save fresh data to cache
    save_cache_data($api_response);

    // Return fresh data
    $response_data = array(
        'status' => $api_response['status'],
        'data' => $api_response['data'],
        'cached' => false,
        'lastFetch' => date('c')
    );

    echo json_encode($response_data);

} catch (Exception $e) {
    error_log('Air Quality API Error: ' . $e->getMessage());

    // Try to return stale cache if available
    $stale_cache = get_cached_data();
    if ($stale_cache) {
        $stale_cache['cached'] = true;
        $stale_cache['stale'] = true;
        $stale_cache['error'] = $e->getMessage();

        echo json_encode($stale_cache);
        exit;
    }

    // No cache available, return error
    http_response_code(500);
    echo json_encode(array(
        'error' => 'An error occurred while fetching air quality data'
    ));
}
?>