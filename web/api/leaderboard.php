<?php
header("Content-Type: application/json; charset=utf-8");

try {
    require_once __DIR__ . "/db.php";
    $conn = smilegame_db_or_exit();

    $sql = "
        SELECT u.username, MAX(l.score) AS best_score
        FROM leaderboard l
        INNER JOIN users u ON l.user_id = u.id
        GROUP BY u.id, u.username
        ORDER BY best_score DESC
        LIMIT 10
    ";

    $result = $conn->query($sql);
    if ($result === false) {
        echo json_encode([
            "success" => false,
            "message" => "Could not read leaderboard",
            "leaderboard" => [],
        ]);
        exit;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $conn->close();

    echo json_encode(["success" => true, "leaderboard" => $data]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "leaderboard" => [],
    ]);
}