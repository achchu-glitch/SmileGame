<?php
/**
 * Upsert Firebase user into MySQL `users`.
 * POST password (optional) → password_hash for api/login.php (column must exist, or fallback insert without it).
 */
header("Content-Type: application/json; charset=utf-8");

/**
 * @return int|null user id or null if no row
 */
function smilegame_user_id_by_firebase(mysqli $conn, string $firebaseUid): ?int
{
    $stmt = $conn->prepare("SELECT id FROM users WHERE firebase_uid = ? LIMIT 1");
    if (!$stmt) {
        throw new RuntimeException($conn->error ?: "prepare SELECT failed");
    }
    $stmt->bind_param("s", $firebaseUid);
    if (!$stmt->execute()) {
        $err = $stmt->error;
        $stmt->close();
        throw new RuntimeException($err ?: "execute SELECT failed");
    }
    $rowId = null;
    $stmt->bind_result($rowId);
    $found = $stmt->fetch();
    $stmt->close();
    return ($found && $rowId !== null) ? (int) $rowId : null;
}

try {
    require_once __DIR__ . "/db.php";
    $conn = smilegame_db_or_exit();

    $firebaseUid = trim($_POST["firebase_uid"] ?? "");
    $username = trim($_POST["username"] ?? "");
    $email = trim($_POST["email"] ?? "");

    $password = isset($_POST["password"]) ? (string) $_POST["password"] : "";
    // Use password_hash only when a password was sent (Google/phone sign-in sends none).
    $passwordHash = $password !== "" ? password_hash($password, PASSWORD_DEFAULT) : null;

    if ($firebaseUid === "" || $username === "") {
        echo json_encode(["success" => false, "message" => "Missing firebase_uid or username"]);
        exit;
    }

    if ($email === "") {
        $email = $firebaseUid . "@firebase.smilegame.local";
    }

    $existingId = smilegame_user_id_by_firebase($conn, $firebaseUid);

    if ($existingId !== null) {
        $ok = false;
        $det = null;
        if ($passwordHash !== null) {
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, password_hash = ? WHERE firebase_uid = ?");
            if (!$stmt) {
                $conn->close();
                echo json_encode([
                    "success" => false,
                    "message" => "Could not prepare password update",
                    "detail" => $conn->error,
                    "user_id" => $existingId,
                ]);
                exit;
            }
            $stmt->bind_param("ssss", $username, $email, $passwordHash, $firebaseUid);
            $ok = $stmt->execute();
            $det = $ok ? null : $stmt->error;
            $stmt->close();
            if (!$ok) {
                $conn->close();
                echo json_encode([
                    "success" => false,
                    "message" => "Could not save password_hash",
                    "detail" => $det,
                    "user_id" => $existingId,
                ]);
                exit;
            }
        } else {
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE firebase_uid = ?");
            if (!$stmt) {
                throw new RuntimeException($conn->error ?: "prepare update failed");
            }
            $stmt->bind_param("sss", $username, $email, $firebaseUid);
            $ok = $stmt->execute();
            $det = $ok ? null : $stmt->error;
            $stmt->close();
            if (!$ok) {
                $conn->close();
                echo json_encode([
                    "success" => false,
                    "message" => "Could not update user",
                    "detail" => $det,
                    "user_id" => null,
                ]);
                exit;
            }
        }
        $conn->close();
        echo json_encode([
            "success" => true,
            "message" => "User updated",
            "detail" => null,
            "user_id" => $existingId,
        ]);
        exit;
    }

    $ok = false;
    $insErr = null;
    $insErrno = 0;

    if ($passwordHash !== null) {
        $stmt = $conn->prepare("INSERT INTO users (firebase_uid, username, email, password_hash) VALUES (?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("ssss", $firebaseUid, $username, $email, $passwordHash);
            $ok = $stmt->execute();
            if (!$ok) {
                $insErrno = $stmt->errno;
                $insErr = $stmt->error;
            }
            $stmt->close();
        } else {
            $insErr = $conn->error;
        }
        if (!$ok) {
            $stmt = $conn->prepare("INSERT INTO users (firebase_uid, username, email) VALUES (?, ?, ?)");
            if ($stmt) {
                $stmt->bind_param("sss", $firebaseUid, $username, $email);
                $ok = $stmt->execute();
                if (!$ok) {
                    $insErrno = $stmt->errno;
                    $insErr = $stmt->error;
                }
                $stmt->close();
            }
        }
    } else {
        $stmt = $conn->prepare("INSERT INTO users (firebase_uid, username, email, password_hash) VALUES (?, ?, ?, NULL)");
        if ($stmt) {
            $stmt->bind_param("sss", $firebaseUid, $username, $email);
            $ok = $stmt->execute();
            if (!$ok) {
                $insErrno = $stmt->errno;
                $insErr = $stmt->error;
            }
            $stmt->close();
        }
        if (!$ok) {
            $stmt = $conn->prepare("INSERT INTO users (firebase_uid, username, email) VALUES (?, ?, ?)");
            if (!$stmt) {
                throw new RuntimeException($conn->error ?: "prepare insert failed");
            }
            $stmt->bind_param("sss", $firebaseUid, $username, $email);
            $ok = $stmt->execute();
            if (!$ok) {
                $insErrno = $stmt->errno;
                $insErr = $stmt->error;
            }
            $stmt->close();
        }
    }

    if ($ok) {
        $userId = (int) $conn->insert_id;
        $conn->close();
        echo json_encode(["success" => true, "message" => "User saved", "user_id" => $userId]);
        exit;
    }

    if ($insErrno === 1062) {
        $stmt = $conn->prepare("UPDATE users SET firebase_uid = ?, username = ? WHERE email = ? LIMIT 1");
        if (!$stmt) {
            throw new RuntimeException($conn->error ?: "prepare link failed");
        }
        $stmt->bind_param("sss", $firebaseUid, $username, $email);
        $linked = $stmt->execute() && $stmt->affected_rows > 0;
        $det = $linked ? null : $stmt->error;
        $stmt->close();
        $userId = null;
        if ($linked) {
            if ($passwordHash !== null) {
                $pu = $conn->prepare("UPDATE users SET password_hash = ? WHERE firebase_uid = ?");
                if ($pu) {
                    $pu->bind_param("ss", $passwordHash, $firebaseUid);
                    $pu->execute();
                    $pu->close();
                }
            }
            $userId = smilegame_user_id_by_firebase($conn, $firebaseUid);
        }
        $conn->close();
        echo json_encode([
            "success" => $linked,
            "message" => $linked ? "User linked to Firebase" : "Could not save user (email conflict)",
            "detail" => $det,
            "user_id" => $userId,
        ]);
        exit;
    }

    $conn->close();
    echo json_encode([
        "success" => false,
        "message" => "Could not save user",
        "detail" => $insErr,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error in register.php",
        "detail" => $e->getMessage(),
    ]);
}
