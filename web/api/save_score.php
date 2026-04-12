<?php
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db.php";
$conn = smilegame_db_or_exit();

$userId = intval($_POST["user_id"] ?? 0);
$score = intval($_POST["score"] ?? 0);

if ($userId <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid user"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO leaderboard (user_id, score) VALUES (?, ?)");
$stmt->bind_param("ii", $userId, $score);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Score saved"]);
} else {
    echo json_encode(["success" => false, "message" => "Could not save score"]);
}

$stmt->close();
$conn->close();
