// api/weather.js
export const fetchWeatherData = async (city) => {
  const apiKey = "c296699fde488d49ff9a75fb7b54fd93";
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;


  try {
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);


    if (!currentWeatherResponse.ok) {
      throw new Error('City not found');
    }


    if (!forecastResponse.ok) {
      throw new Error('Error fetching forecast data');
    }


    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();


    console.log("Current Weather Data:", currentWeatherData);
    console.log("Forecast Data:", forecastData);


    return {
      currentWeather: currentWeatherData,
      forecast: forecastData,
    };
  } catch (error) {
    //console.error("Error fetching weather data:", error);
   throw error;
  }
};



 