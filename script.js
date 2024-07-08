const KELVIN = 273;
const key = "f885e86e06355a45c4247486cfb1f93c";

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('current-time').textContent = time;
  document.getElementById('current-date').textContent = date;
}

setInterval(updateClock, 1000);
updateClock();

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

function displayForecast(data) {
  const forecastBoxes = document.querySelectorAll('.forecast .box');

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

  const avgTemp7thDay = dailyData.slice(0, 6).reduce((sum, day) => sum + day.temp, 0) / 6;
  const avgHumidity7thDay = dailyData.slice(0, 6).reduce((sum, day) => sum + day.humidity, 0) / 6;
  const icon7thDay = dailyData[2].icon;
  const description7thDay = dailyData[2].description;
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
        borderColor: 'rgba(300, 0, 0, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(300, 0, 0, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }, {
        label: 'Humidity (%)',
        data: humidities,
        fill: false,
        borderColor: 'rgba(0, 0, 300, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 0, 300, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: false,
            fontColor: 'rgba(0, 0, 0, 1)'
          },
          gridLines: {
            color: 'rgba(0, 0, 0, 1)'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontColor: 'rgba(0, 0, 0, 1)'
          },
          gridLines: {
            color: 'rgba(0, 0, 0, 1)'
          }
        }]
      },
      legend: {
        labels: {
          fontColor: 'rgba(0, 0, 0, 1)'
        }
      }
    }
  });
}

function getWeatherByCity(city) {
  const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayWeather(data));
}

function getForecastByCity(city) {
  const api = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayForecast(data));
}

function getWeatherByCoordinates(latitude, longitude) {
  const api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayWeather(data));
}

function getForecastByCoordinates(latitude, longitude) {
  const api = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`;

  fetch(api)
    .then(response => response.json())
    .then(data => displayForecast(data));
}

document.querySelector('.place').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const city = event.target.value;
    resetWeatherDisplay();
    getWeatherByCity(city);
    getForecastByCity(city);
  }
});

function resetWeatherDisplay() {
  document.querySelector('.temperature-value').innerHTML = `°<span>C</span>`;
  document.querySelector('.temperature-description').textContent = 'Climate';
  document.querySelector('.location').textContent = 'City Name';
  document.querySelector('.weather-icon img').src = 'icons/unknown.png';
  document.getElementById('humidity').textContent = 'Humidity: _%';
  document.getElementById('wind-speed').textContent = 'Wind Speed: _ km/s';

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
