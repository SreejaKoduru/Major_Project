const KELVIN = 273;
// API KEY
const key = "f885e86e06355a45c4247486cfb1f93c";

// Set up the clock display
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('current-time').textContent = time;
  document.getElementById('current-date').textContent = date;
}

// Update the clock every second
setInterval(updateClock, 1000);
updateClock();

// Function to display current weather
function displayWeather(data) {
  const temperatureElement = document.querySelector('.temperature-value');
  const descriptionElement = document.querySelector('.temperature-description');
  const locationElement = document.querySelector('.location');
  const iconElement = document.querySelector('.weather-icon img');
  const humidityElement = document.getElementById('humidity');
  const windSpeedElement = document.getElementById('wind-speed');

  const temperature = Math.floor(data.main.temp - KELVIN);
  const description = data.weather[0].description;
  const location = `${data.name}, ${data.sys.country}`;
  const icon = data.weather[0].icon;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  temperatureElement.innerHTML = `${temperature}°<span>C</span>`;
  descriptionElement.textContent = description;
  locationElement.textContent = location;
  iconElement.src = `icons/${icon}.png`;
  humidityElement.textContent = `Humidity: ${humidity}%`;
  windSpeedElement.textContent = `Wind Speed: ${windSpeed} km/s`;
}

// Function to display the 7-day forecast
function displayForecast(data) {
  const forecastBoxes = document.querySelectorAll('.forecast .box');

  // Group forecast data by date
  const groupedData = data.list.reduce((acc, item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const dailyData = Object.keys(groupedData).map(date => {
    const items = groupedData[date];
    const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;
    const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
    const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;
    const icon = items[Math.floor(items.length / 2)].weather[0].icon;
    const description = items[Math.floor(items.length / 2)].weather[0].description;

    return {
      date: new Date(date),
      temp: avgTemp,
      humidity: avgHumidity,
      windSpeed: avgWindSpeed,
      icon: icon,
      description: description
    };
  });

  // Calculate the 7th day forecast based on averages of the first 6 days
  const avgTemp7thDay = dailyData.slice(0, 6).reduce((sum, day) => sum + day.temp, 0) / 6;
  const avgHumidity7thDay = dailyData.slice(0, 6).reduce((sum, day) => sum + day.humidity, 0) / 6;
  const icon7thDay = dailyData[2].icon; // Example icon selection, adjust as needed
  const description7thDay = dailyData[2].description; // Example description selection, adjust as needed
  const avgWindSpeed7thDay = dailyData.slice(0, 6).reduce((sum, day) => sum + day.windSpeed, 0) / 6;

  const seventhDay = {
    date: new Date(dailyData[5].date.getTime() + 24 * 60 * 60 * 1000),
    temp: avgTemp7thDay,
    humidity: avgHumidity7thDay,
    icon: icon7thDay,
    description: description7thDay,
    windSpeed: avgWindSpeed7thDay
  };

  dailyData.push(seventhDay);

  dailyData.forEach((data, index) => {
    if (forecastBoxes[index]) {
      const date = data.date;
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const temp = Math.floor(data.temp - KELVIN);
      const icon = data.icon;
      const description = data.description;
      const humidity = Math.round(data.humidity);
      const windSpeed = Math.round(data.windSpeed * 10) / 10;

      forecastBoxes[index].querySelector('.date').textContent = `${day} ${month}`;
      forecastBoxes[index].querySelector('.temp').innerHTML = `Temperature: ${temp}°<span>C</span>`;
      forecastBoxes[index].querySelector('.icon').src = `icons/${icon}.png`;
      forecastBoxes[index].querySelector('.desc').textContent = `${description}`;
      forecastBoxes[index].querySelector('.humidity').textContent = `Humidity: ${humidity}%`;
      forecastBoxes[index].querySelector('.wind').textContent = `Wind Speed: ${windSpeed} km/s`;
    }
  });

  // Call function to plot the temperature and humidity chart
  plotTemperatureHumidityGraph(dailyData);
}

function plotTemperatureHumidityGraph(dailyData) {
    const dates = dailyData.map(data => data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const temperatures = dailyData.map(data => Math.floor(data.temp - KELVIN));
    const humidities = dailyData.map(data => Math.round(data.humidity));
    const ctx = document.getElementById('temperature-humidity-chart').getContext('2d');
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                fill: false,
                borderColor: 'rgba(300, 0, 0, 1)', // Dark red
                borderWidth: 2,
                pointBackgroundColor: 'rgba(300, 0, 0, 1)', // Dark red
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Humidity (%)',
                data: humidities,
                fill: false,
                borderColor: 'rgba(0, 0, 300, 1)', // Dark blue
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 0, 300, 1)', // Dark blue
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: false,
                        fontColor: 'rgba(0, 0, 0, 1)' // Darker tick labels
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 1)' // Darker grid lines
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'rgba(0, 0, 0, 1)' // Darker tick labels
                    },
                    gridLines: {
                        color: 'rgba(0, 0, 0, 1)' // Darker grid lines
                    }
                }]
            },
            legend: {
                labels: {
                    fontColor: 'rgba(0, 0, 0, 1)' // Darker legend labels
                }
            }
        }
    });
    

    
  }
    

// Fetch weather data by city name
function getWeatherByCity(city) {
  const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayWeather(data));
}

// Fetch forecast data by city name
function getForecastByCity(city) {
  const api = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayForecast(data));
}

// Fetch weather data by geographic coordinates
function getWeatherByCoordinates(latitude, longitude) {
  const api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayWeather(data));
}

// Fetch forecast data by geographic coordinates
function getForecastByCoordinates(latitude, longitude) {
  const api = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayForecast(data));
}

// Event listeners for search input and current location button
document.querySelector('.place').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const city = event.target.value;

        // Reset weather and forecast display to default
        resetWeatherDisplay();

        // Fetch new weather and forecast data
        getWeatherByCity(city);
        getForecastByCity(city);
    }
});

function resetWeatherDisplay() {
    // Reset temperature value to default
    document.querySelector('.temperature-value').innerHTML = `°<span>C</span>`;
    
    // Reset other weather elements as needed (description, location, icon, humidity, wind speed, etc.)
    document.querySelector('.temperature-description').textContent = 'Climate';
    document.querySelector('.location').textContent = 'City Name';
    document.querySelector('.weather-icon img').src = 'icons/unknown.png';
    document.getElementById('humidity').textContent = 'Humidity: _%';
    document.getElementById('wind-speed').textContent = 'Wind Speed: _ km/s';

    // Reset forecast boxes
    const forecastBoxes = document.querySelectorAll('.forecast .box');
    forecastBoxes.forEach(box => {
        box.querySelector('.temp').innerHTML = 'Temperature: _°C';
        box.querySelector('.icon').src = 'icons/unknown.png';
        box.querySelector('.desc').textContent = 'Climate';
        box.querySelector('.humidity').textContent = 'Humidity: _%';
        box.querySelector('.wind').textContent = 'Wind Speed: _ km/s';
    });
    if (window.myChart) {
        window.myChart.destroy();
    }
}


document.querySelector('.currentLocation').addEventListener('click', function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      getWeatherByCoordinates(latitude, longitude);
      getForecastByCoordinates(latitude, longitude);
    });
  } else {
    getWeatherByCity('Delhi');
    getForecastByCity('Delhi');
  }
});
