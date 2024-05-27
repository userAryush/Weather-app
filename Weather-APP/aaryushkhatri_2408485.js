document.addEventListener("DOMContentLoaded", function () {// function will be executed when the "DOMContentLoaded" event occurs. 
    //This function contains entire code that should run when the DOM is fully loaded.
    const submitBtn = document.getElementById("submit-btn");
    const cityInputField = document.getElementById("city-input-field");
    const tbody = document.querySelector(".weather-history-table tbody");
    submitBtn.addEventListener("click", function () {
        const cityName = cityInputField.value.trim();
        if (cityName !== "") {
            // Making an API request to fetch weather data
            fetchWeatherData(cityName);
        } else {
            alert("Search bar cannot be empty!! Please enter a city name.");
        }
    });

    async function fetchWeatherData(city) {
        // Update this URL with your PHP file location
        const apiUrl = `./aaryushkhatri_2408485.php?city=${(city)}`;
        await fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                localStorage.setItem("current_weather", JSON.stringify(data.current_weather))
                localStorage.setItem("historical_weather", JSON.stringify(data.historical_weather))

//checking if the status property of the returned data is "success". If so, it means the API request was successful, and it proceeds to update the UI with the fetched weather data.
                if (data.status === "success") {
                    console.log(data);
                    updateCurrentWeatherUI(data.current_weather);//This function call updates the UI with the current weather data.
                    updateHistoricalWeatherUI(data.historical_weather);//This function call updates the UI with the historical weather data.
                } else {

                    alert(`Error: ${data.message}`);
                    //Whenever there is an error in fetiching this function calls to retrieve weather data from local storage and update the UI with it.
                    localstoragedata();


                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                alert("City not found. Please try again with valid name.");
                localstoragedata();
            });
    }
    function localstoragedata() {
       // localStorage is a property that allows web applications to store data in the browser with no expiration date.
       // retrieves values from the keys and storing in new variables
        const storecurrentdata = localStorage.getItem("current_weather");
        const storehistoricaldata = localStorage.getItem("historical_weather");
        if (storecurrentdata) {
        //checking if the "current_weather" data exists in localStorage
            const currentdata = JSON.parse(storecurrentdata);
            //parses the JSON-formatted string stored in storecurrentdata back into a JavaScript object
            updateCurrentWeatherUI(currentdata);
        }
        if (storehistoricaldata) {
            const historicaldata = JSON.parse(storehistoricaldata);

            updateHistoricalWeatherUI(historicaldata);
        }
    }
    //this function simply updates the DOM elements with the provided weather data.
    //takes a parameter currentWeather, which is expected to be an object containing the current weather data.
    function updateCurrentWeatherUI(currentWeather) {
        const { city_name, temperature, description, main, humidity, wind, pressure, weather_date, icon } =
            currentWeather;//useing object destructuring to extract specific properties from the currentWeather object. 
        // Updating the main weather information
        document.getElementById("city-header").textContent = city_name;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        document.getElementById("temperature").textContent = `${temperature} ℃`;
        document.getElementById("description").textContent = description;
        document.getElementById("main").textContent = main;
        document.getElementById("humidity").textContent = `Humidity: ${humidity}%`;
        document.getElementById("wind").textContent = `Wind: ${wind} m/s`;
        document.getElementById("pressure").textContent = `Pressure: ${pressure} hPa`;
        document.getElementById("datetime").textContent = `DateTime: ${weather_date}`;
    }

    function updateHistoricalWeatherUI(historicalWeather) {
        // Clearing existing table rows This ensures that the table is empty before populating it with new historical weather data
        tbody.innerHTML = "";
        // Looping through each entry in the array 'historicalWeather'. Each entry represents historical weather data for a specific time period.
        historicalWeather.forEach((entry) => {
            const iconUrl = `http://openweathermap.org/img/wn/${entry.icon}.png`;
            const row = document.createElement("tr");
             //This block of code dynamically creates HTML content for each row in the table.
            row.innerHTML = `
           
                <td><img src="${iconUrl}" alt="Weather Icon"></td>
                <td>${entry.temperature}℃</td>
                <td>${entry.description}</td>
                <td>${entry.main}</td>
                <td>${entry.humidity}%</td>
                <td>${entry.wind} m/s</td>
                <td>${entry.pressure} hPa</td>
                <td>${entry.weather_date}</td>
            `;
            tbody.appendChild(row);// appends the newly created row(representing historical weather data) to the <tbody> element of the table.
        });
    }
    fetchWeatherData("Hinganghat");//Initiating the fetching of weather data for the assigned city "Hinganghat" when the page is loaded.
});
