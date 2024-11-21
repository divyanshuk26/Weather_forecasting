const apiKey = '36fd30ec0f09fdb83afde13601b6b8ff'; //Api key

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const cityNameElem = document.getElementById('city-name');
const temperatureElem = document.getElementById('temperature');
const weatherConditionElem = document.getElementById('Condition');
const humidityElem = document.getElementById('humidity');
const airQualityElem = document.getElementById('air-quality');
const recentCitiesDropdown = document.getElementById('recent-cities');
const forecastContainer = document.getElementById('forecast-container');

// Event listeners
searchBtn.addEventListener('click', () => searchWeather(cityInput.value));
currentLocationBtn.addEventListener('click', getWeatherByLocation);

// Fetch weather by city name
function searchWeather(city) {
    if (city.trim() === "") return;
    fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    fetchFiveDayForecast(city);
}

// Fetch weather for current location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            fetchFiveDayForecastByCoords(latitude, longitude);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Fetch weather data from the API
function fetchWeatherData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                alert('City not found!');
                return;
            }
            updateWeatherUI(data);
            storeRecentCity(data.name); // Store the city in recent searches
        })
        .catch(err => alert('Error fetching weather data.'));
}

// Update the UI with the weather data
// Update the UI with the weather data
function updateWeatherUI(data) {
    cityNameElem.textContent = data.name;
    temperatureElem.textContent = `${data.main.temp}°C`;
    weatherConditionElem.textContent = data.weather[0].description;
    humidityElem.textContent = `Humidity: ${data.main.humidity}%`;
    airQualityElem.textContent = `Air Quality: ${data.main.pressure} hPa`; // Using pressure as air quality (as an example)

    // Update the weather icon dynamically based on condition
    const weatherIconElem = document.querySelector('.weather-icon img');
    const iconCode = data.weather[0].icon; // Get icon code from API response
    weatherIconElem.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; // Set new icon URL

    updateRecentCitiesDropdown();
}



// Fetch the 5-day weather forecast by city name
function fetchFiveDayForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                alert('Error fetching forecast data.');
                return;
            }
            updateForecastUI(data.list);
        })
        .catch(err => console.error('Error fetching forecast data:', err));
}

// Fetch the 5-day weather forecast by coordinates
function fetchFiveDayForecastByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                alert('Error fetching forecast data.');
                return;
            }
            updateForecastUI(data.list);
        })
        .catch(err => console.error('Error fetching forecast data:', err));
}

// Update the 5-day forecast section in the UI
function updateForecastUI(forecastList) {
    forecastContainer.innerHTML = ""; // Clear previous forecast
    for (let i = 0; i < forecastList.length; i += 8) { // Fetch one forecast per day (every 8th entry)
        const forecast = forecastList[i];
        const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "short"
        });
        const temp = `${forecast.main.temp}°C`;
        const condition = forecast.weather[0].description;

        // Create forecast card
        const forecastCard = document.createElement('div');
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
            <p>${date}</p>
            <p>Temp: ${temp}</p>
            <p>${condition}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    }
}

// Store recent city in localStorage
function storeRecentCity(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    updateRecentCitiesDropdown();
}

// Update the dropdown with recently searched cities
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCitiesDropdown.innerHTML = '<option value="">Select a city</option>'; // Clear the dropdown
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
}

// Get weather from the dropdown selection
function getWeatherFromDropdown() {
    const city = recentCitiesDropdown.value;
    if (city) {
        searchWeather(city);
    }
}

// Initialize recent cities on page load
document.addEventListener('DOMContentLoaded', updateRecentCitiesDropdown);
