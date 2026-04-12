<?php
/**
 * Quick check: PHP runs and MySQL connects. Open: http://localhost:3000/api/health.php
 */
header("Content-Type: application/json; charset=utf-8");

try {
    require_once __DIR__ . "/db.php";

    global $conn;

    echo json_encode([
        "ok" => true,
        "php" => PHP_VERSION,
        "mysql_connected" => $conn instanceof mysqli,
        "hint" => $conn instanceof mysqli
            ? "Database OK — sign in again; users row should appear."
            : "MySQL not reachable. Edit web/api/db.local.php (port 8889 for MAMP, etc.).",
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "mysql_connected" => false,
        "detail" => $e->getMessage(),
    ], JSON_PRETTY_PRINT);
}
