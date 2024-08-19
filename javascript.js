const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

searchBtn.addEventListener('click', () => {
    console.log('Search button clicked');
    const city = searchInput.value;
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name');
    }
});

async function fetchWeather(city) {
    try {
        // First, we need to get the latitude and longitude for the city
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        if (!geoResponse.ok) {
            throw new Error(`HTTP error! status: ${geoResponse.status}`);
        }
        const geoData = await geoResponse.json();
        if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude, name, country } = geoData.results[0];
            
            // Now fetch the weather data using the coordinates
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
            if (!weatherResponse.ok) {
                throw new Error(`HTTP error! status: ${weatherResponse.status}`);
            }
            const weatherData = await weatherResponse.json();
            console.log('Weather data:', weatherData);
            displayCurrentWeather(weatherData, name, country);
            displayForecast(weatherData);
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function displayCurrentWeather(data, city, country) {
    const current = data.current;
    const weatherCode = getWeatherDescription(current.weather_code);
    
    currentWeather.innerHTML = `
        <h2>Current Weather in ${city}, ${country}</h2>
        <p>Temperature: ${current.temperature_2m}°C</p>
        <p>Feels like: ${current.apparent_temperature}°C</p>
        <p>Humidity: ${current.relative_humidity_2m}%</p>
        <p>Precipitation: ${current.precipitation} mm</p>
        <p>Condition: ${weatherCode}</p>
    `;
}

function displayForecast(data) {
    const dailyData = data.daily;
    
    let forecastHTML = '<h2>5 - Day Forecast</h2>';
    forecastHTML += '<div class="forecast-container">';
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(dailyData.time[i]).toLocaleDateString();
        const maxTemp = dailyData.temperature_2m_max[i];
        const minTemp = dailyData.temperature_2m_min[i];
        const precipitation = dailyData.precipitation_sum[i];
        const weatherCode = getWeatherDescription(dailyData.weather_code[i]);
        
        forecastHTML += `
            <div class="forecast-day">
                <p>${date}</p>
                <p>Max: ${maxTemp}°C</p>
                <p>Min: ${minTemp}°C</p>
                <p>Precip: ${precipitation} mm</p>
                <p>${weatherCode}</p>
            </div>
        `;
    }
    
    forecastHTML += '</div>'; // Close the forecast-container div
    
    forecast.innerHTML = forecastHTML;
}

function getWeatherDescription(code) {
    // This is a simplified version. You might want to expand this for more detailed descriptions.
    if (code <= 3) return "Clear or partly cloudy";
    if (code <= 49) return "Foggy";
    if (code <= 59) return "Drizzle";
    if (code <= 69) return "Rain";
    if (code <= 79) return "Snow";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
}

