
<?php
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["city"])) {
    $city = $_GET["city"];
    $apiKey = "520e51c494171adbe1793623d6b715e8";
    $apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=$city&appid=$apiKey&units=metric";
    $response = file_get_contents($apiUrl);
    if ($response !== false) {
        $data = json_decode($response, true);
        if ($data["cod"] == 200) {
            // Data is fetched successfully, store it in the database
            $conn = new mysqli("mysql2.serv00.com", "m3259_aaryush", "Aryush@1234", "m3259_weather_aryush");
            if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
            }
            $name = $conn->real_escape_string($data["name"]);
            $temperature = $conn->real_escape_string($data["main"]["temp"]);
            $description = $conn->real_escape_string($data["weather"][0]["description"]);
            $main = $conn->real_escape_string($data["weather"][0]["main"]);
            $humidity = $conn->real_escape_string($data["main"]["humidity"]);
            $windSpeed = $conn->real_escape_string($data["wind"]["speed"]);
            $pressure = $conn->real_escape_string($data["main"]["pressure"]);
            $timestamp = $data["dt"];
            $datetimeString = date("Y-m-d", $timestamp);
            $icon = $conn->real_escape_string($data["weather"][0]["icon"]);

            $sql = "INSERT INTO `weather_details` (city_name, temperature, description, main, humidity, wind, pressure, icon, weather_date)
                    VALUES ('$name', '$temperature', '$description', '$main', '$humidity', '$windSpeed', '$pressure', '$icon', '$datetimeString')";
            $conn->query($sql);

            $current_query = "SELECT * FROM `weather_details` where city_name ='$city' ORDER BY Id DESC LIMIT 1;";
            $current_result = $conn->query($current_query);
            
            $history_query = "SELECT a.*
            FROM `weather_details` a
            JOIN (
                SELECT MAX(Id) AS max_Id, weather_date
                FROM `weather_details`
                WHERE city_name = '$name'
                GROUP BY weather_date
            ) b
            ON a.Id = b.max_Id AND a.weather_date = b.weather_date
            WHERE a.city_name = '$name'
            ORDER BY a.Id DESC";
            $history_result = $conn->query($history_query);
            if (!$history_result) {
                die("Error retrieving historical data: " . $conn->error);
            }
            // Fetch the result into an associative array
            $history_data = array();
            while ($row = $history_result->fetch_assoc()) {
                $history_data[] = $row;
            }
            $conn->close();
            // Prepare the final response including both current and historical data
            $response_data = [
                "status" => "success",
                "current_weather" => [
                    "city_name" => $data["name"],
                    "temperature" => $data["main"]["temp"],
                    "description" => $data["weather"][0]["description"],
                    "main" => $data["weather"][0]["main"],
                    "humidity" => $data["main"]["humidity"],
                    "wind" => $data["wind"]["speed"],
                    "pressure" => $data["main"]["pressure"],
                    "weather_date" => date("Y-m-d", $data["dt"]),
                    "icon" => $data["weather"][0]["icon"]
                ],
                "historical_weather" => $history_data
            ];
            echo json_encode($response_data);
        } 
        else 
        {
            echo json_encode(["status" => "error", "message" => "City not found"]);
        }
    } 
    else 
    {
        echo json_encode(["status" => "error", "message" => "Error fetching data from OpenWeatherMap API"]);
    }
} 
else 
{
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
}
?>
