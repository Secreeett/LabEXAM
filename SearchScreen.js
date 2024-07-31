import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, FlatList, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchWeatherData } from "./api/weather"; // Ensure the path is correct
import moment from "moment";
import MapView, { Marker } from 'react-native-maps';

// Replace with your weather icon image import
import WeatherIcon from "./assets/clouds.png";

// Example imports for different weather conditions
import cloudsImage from "./assets/cloudy.gif";
import sunnyImage from "./assets/sun.gif";
import rainImage from "./assets/rain.gif";
// Add more imports for other weather conditions as needed

const SearchScreen = ({ navigation }) => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]); // State for 24-hour forecast data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true); // State to manage showing the welcome/loading screen
  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 }); // State for coordinates

  useEffect(() => {
    // Simulate a delay to show the welcome/loading screen for a few seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1000); // Adjust the duration as needed

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setWeatherData(null); // Clear previous weather data
    setForecastData([]); // Clear previous forecast data
    setHourlyData([]); // Clear previous 24-hour forecast data
    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data.currentWeather);

      // Set coordinates for the map
      const { coord } = data.currentWeather;
      setCoordinates({ latitude: coord.lat, longitude: coord.lon });

      // Filter data to get 7 days forecast
      const currentDate = moment().startOf('day');
      const filteredData = data.forecast.list.filter(item => {
        // Use moment.js to compare dates and select one per day
        const itemDate = moment(item.dt_txt, 'YYYY-MM-DD HH:mm:ss');
        return itemDate.isSameOrAfter(currentDate, 'day');
      }).slice(0, 7); // Ensure we have exactly 7 days

      setForecastData(filteredData);

      // Filter data to get 24 hours forecast
      const hourlyData = data.forecast.list.filter(item => {
        const itemDate = moment(item.dt_txt, 'YYYY-MM-DD HH:mm:ss');
        return itemDate.isSameOrAfter(moment()) && itemDate.isBefore(moment().add(24, 'hours'));
      });

      setHourlyData(hourlyData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForecastItem = ({ item }) => (
    <View style={styles.forecastItem}>
      <Text style={styles.forecastDate}>{moment(item.dt_txt).format('dddd')}</Text>
      <AnimatedWeatherIcon weatherType={item.weather[0].main.toLowerCase()} />
      <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
      <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
    </View>
  );

  const renderHourlyItem = ({ item }) => (
    <View style={styles.forecastItem}>
      <Text style={styles.forecastDate}>{moment(item.dt_txt).format('h:mm a')}</Text>
      <AnimatedWeatherIcon weatherType={item.weather[0].main.toLowerCase()} />
      <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
      <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
    </View>
  );

  if (showWelcome) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Image source={WeatherIcon} style={styles.logo} />
      <Text style={styles.title}>Weather Forecast</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a city"
          onChangeText={(text) => setCity(text)}
          value={city}
        />
        <TouchableOpacity onPress={handleSearch} disabled={!city || loading} style={styles.iconContainer}>
          <Icon name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {weatherData && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>
            {weatherData.name}, {weatherData.sys.country}
          </Text>
          <Text style={styles.dateTime}>
            {moment().format('MMMM, D YYYY, h:mm:ss a')}
          </Text>
          <View style={styles.infoItem}>
            <Icon name="thermometer" size={24} color="black" style={styles.icon} />
            <Text style={styles.temperature}>
              Temperature: {weatherData.main.temp}°C
            </Text>
          </View>
          <Text style={styles.description}>
            {weatherData.weather[0].description}
          </Text>
          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <Icon name="tint" size={24} color="black" style={styles.icon} />
              <Text style={styles.infoLabel}>Humidity:</Text>
              <Text style={styles.infoValue}>{weatherData.main.humidity}%</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="flag" size={24} color="black" style={styles.icon} />
              <Text style={styles.infoLabel}>Wind:</Text>
              <Text style={styles.infoValue}>{weatherData.wind.speed} m/s</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="eye" size={24} color="black" style={styles.icon} />
              <Text style={styles.infoLabel}>Visibility:</Text>
              <Text style={styles.infoValue}>{weatherData.visibility / 1000} km</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="sun-o" size={24} color="black" style={styles.icon} />
              <Text style={styles.infoLabel}>Sunrise:</Text>
              <Text style={styles.infoValue}>{moment.unix(weatherData.sys.sunrise).format('h:mm a')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="moon-o" size={24} color="black" style={styles.icon} />
              <Text style={styles.infoLabel}>Sunset:</Text>
              <Text style={styles.infoValue}>{moment.unix(weatherData.sys.sunset).format('h:mm a')}</Text>
            </View>
          </View>
        </View>
      )}

      {forecastData.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>7-Day Forecast</Text>
          <FlatList
            data={forecastData}
            renderItem={renderForecastItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
          />
        </View>
      )}

      {hourlyData.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>24-Hour Forecast</Text>
          <FlatList
            data={hourlyData}
            renderItem={renderHourlyItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
          />
        </View>
      )}

      <View style={styles.divider} />
      <Text style={styles.additionalText}>Map Viewing</Text>

      {/* Add the MapView below */}
      {weatherData && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker
            coordinate={coordinates}
            title={weatherData.name}
            description={`Temperature: ${weatherData.main.temp}°C`}
          />
        </MapView>
      )}
    </ScrollView>
  );
};

const AnimatedWeatherIcon = ({ weatherType }) => {
  // Function to determine which image to use based on weatherType
  const getWeatherImage = () => {
    switch (weatherType) {
      case "clouds":
        return cloudsImage;
      case "clear":
      case "sunny":
        return sunnyImage;
      case "rain":
        return rainImage;
      // Add more cases for other weather conditions
      default:
        return null; // Default image or handle unknown weatherType
    }
  };

  // Get the correct image path based on weatherType
  const weatherImage = getWeatherImage();

  if (!weatherImage) {
    return null; // Handle if no image found for weatherType
  }

  return <Image source={weatherImage} style={styles.weatherIcon} />;
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff", // White background
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "black",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  iconContainer: {
    padding: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007aff",
    borderRadius: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 20,
    color: "red",
    fontSize: 16,
    textAlign: "center",
    fontWeight: 'bold'
  },
  weatherContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  weatherText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  dateTime: {
    fontSize: 16,
    marginBottom: 10,
    color: "black",
  },
  temperature: {
    fontSize: 20,
    marginBottom: 5,
    color: "black",
  },
  description: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 20,
    color: "black",
  },
  additionalInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
  },
  infoItem: {
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  infoValue: {
    color: "black",
  },
  icon: {
    marginBottom: 5,
  },
  forecastContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },
  forecastItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  forecastDate: {
    fontSize: 16,
    color: "black",
  },
  forecastTemp: {
    fontSize: 16,
    color: "black",
  },
  forecastDesc: {
    fontSize: 14,
    color: "black",
  },
  weatherIcon: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  divider: {
    marginTop: 30,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    width: "100%",
  },
  additionalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "black",
    textAlign: "center",
  },
  map: {
    width: '100%',
    height: 300, // Adjust the height as needed
    marginTop: 20,
  },
});

export default SearchScreen;
