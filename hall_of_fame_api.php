<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "******";
$username = "******";
$password = "******";
$dbname = "******";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function getRecords() {
    global $conn;
    $sql = "SELECT * FROM hall_of_fame ORDER BY player_level DESC, game_round DESC, stage_name DESC, monsters_killed DESC LIMIT 5";
    $result = $conn->query($sql);
    $records = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $records[] = [
                'playerName' => $row['player_name'],
                'playerLevel' => $row['player_level'],
                'stageName' => $row['stage_name'],
                'gameRound' => $row['game_round'],
                'monstersKilled' => $row['monsters_killed']
            ];
        }
    }
    return $records;
}

function addRecord($playerName, $playerLevel, $stageName, $gameRound, $monstersKilled) {
    global $conn;
    $sql = "INSERT INTO hall_of_fame (player_name, player_level, stage_name, game_round, monsters_killed) 
            VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssii", $playerName, $playerLevel, $stageName, $gameRound, $monstersKilled);
    $stmt->execute();
    $stmt->close();
    
    // 최대 5개의 기록만 유지
    $sql = "DELETE FROM hall_of_fame WHERE id NOT IN (
        SELECT id FROM (
            SELECT id FROM hall_of_fame 
            ORDER BY player_level DESC, game_round DESC, stage_name DESC, monsters_killed DESC 
            LIMIT 5
        ) as top5
    )";
    $conn->query($sql);
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    echo json_encode(getRecords());
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    addRecord($data['playerName'], $data['playerLevel'], $data['stageName'], $data['gameRound'], $data['monstersKilled']);
    echo json_encode(["success" => true]);
}

$conn->close();
?>
