<?php
/**
 * Email/password login for rows that have password_hash set.
 * Firebase sign-in accounts created via register.php do not have a password here — use the web app login.
 */
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db.php";
$conn = smilegame_db_or_exit();

$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT id, username, password_hash FROM users WHERE email = ? AND password_hash IS NOT NULL AND password_hash != '' LIMIT 1"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    echo json_encode([
        "success" => false,
        "message" => "No password login for this email. Sign in with Firebase on the site, or register with a password in the database.",
    ]);
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();
$conn->close();

if (password_verify($password, $user["password_hash"])) {
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "id" => (int) $user["id"],
            "username" => $user["username"],
        ],
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid password"]);
}
