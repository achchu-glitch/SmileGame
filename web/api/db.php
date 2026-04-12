<?php
/**
 * Shared MySQL connection for SmileGame API endpoints.
 *
 * Optional: copy db.local.example.php → db.local.php (see that file for MAMP/XAMPP ports).
 * Or set env: SMILEGAME_DB_HOST, SMILEGAME_DB_PORT, SMILEGAME_DB_NAME, SMILEGAME_DB_USER, SMILEGAME_DB_PASS
 *
 * If connection fails on the configured port, other common local ports are tried (MAMP often uses 8889).
 */
// Do not use MYSQLI_REPORT_STRICT here: thrown mysqli_sql_exception becomes an HTML error page,
// breaking api/register.php for clients that expect JSON only.
mysqli_report(MYSQLI_REPORT_OFF);

$smilegame_db_host = "127.0.0.1";
$smilegame_db_port = 3306;
$smilegame_db_name = "smilegame";
$smilegame_db_user = "root";
$smilegame_db_pass = "root";

if (is_readable(__DIR__ . "/db.local.php")) {
    require_once __DIR__ . "/db.local.php";
}

$smilegame_db_host = getenv("SMILEGAME_DB_HOST") ?: $smilegame_db_host;
$smilegame_db_port = (int) (getenv("SMILEGAME_DB_PORT") ?: $smilegame_db_port);
$smilegame_db_name = getenv("SMILEGAME_DB_NAME") ?: $smilegame_db_name;
$smilegame_db_user = getenv("SMILEGAME_DB_USER") ?: $smilegame_db_user;
$db_pass_env = getenv("SMILEGAME_DB_PASS");
$smilegame_db_pass = $db_pass_env !== false ? $db_pass_env : $smilegame_db_pass;

$try_ports = [$smilegame_db_port];
foreach ([8889, 3306, 3307] as $p) {
    if (!in_array($p, $try_ports, true)) {
        $try_ports[] = $p;
    }
}

$conn = null;
foreach ($try_ports as $port) {
    try {
        $c = new mysqli($smilegame_db_host, $smilegame_db_user, $smilegame_db_pass, $smilegame_db_name, $port);
        $c->set_charset("utf8mb4");
        $conn = $c;
        break;
    } catch (Throwable $e) {
        $conn = null;
    }
}

// XAMPP / some stacks: root with empty password (only if configured password failed everywhere)
if (!$conn && $smilegame_db_user === "root" && $smilegame_db_pass === "root") {
    foreach ($try_ports as $port) {
        try {
            $c = new mysqli($smilegame_db_host, "root", "", $smilegame_db_name, $port);
            $c->set_charset("utf8mb4");
            $conn = $c;
            break;
        } catch (Throwable $e) {
            $conn = null;
        }
    }
}

/**
 * @return mysqli
 */
function smilegame_db_or_exit()
{
    global $conn;
    if (!$conn instanceof mysqli) {
        header("Content-Type: application/json; charset=utf-8");
        http_response_code(503);
        echo json_encode([
            "success" => false,
            "message" => "Database unavailable. Set MySQL user/password in web/api/db.local.php (copy db.local.example.php). Try opening web/api/health.php while npm start is running.",
            "detail" => "Common fixes: MAMP MySQL port 8889; XAMPP often uses empty root password.",
        ]);
        exit;
    }
    return $conn;
}
