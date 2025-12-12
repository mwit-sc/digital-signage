<?php
// Time API endpoint - PHP version
// Returns current server time in ISO format

header('Content-Type: text/plain');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get current server time with high precision
    $server_time = new DateTime('now', new DateTimeZone('Asia/Bangkok'));

    // Return time in ISO 8601 format
    echo $server_time->format('c');

} catch (Exception $e) {
    error_log('Time API Error: ' . $e->getMessage());
    http_response_code(500);
    echo 'Internal Server Error';
}
?>