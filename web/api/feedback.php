<?php
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db.php";
$conn = smilegame_db_or_exit();

$userId = intval($_POST["user_id"] ?? 0);
$rating = intval($_POST["rating"] ?? 0);
$comment = isset($_POST["comment"]) ? trim((string) $_POST["comment"]) : "";

if ($rating < 1 || $rating > 5) {
    echo json_encode(["success" => false, "message" => "Rating must be between 1 and 5"]);
    exit;
}

if ($userId > 0) {
    $stmt = $conn->prepare("INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $userId, $rating, $comment);
} else {
    $stmt = $conn->prepare("INSERT INTO feedback (user_id, rating, comment) VALUES (NULL, ?, ?)");
    $stmt->bind_param("is", $rating, $comment);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Feedback saved"]);
} else {
    echo json_encode(["success" => false, "message" => "Could not save feedback"]);
}

$stmt->close();
$conn->close();
