
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaArrowLeft } from "react-icons/fa";
import dayjs from "dayjs";
import Loader from "./Loading";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const WeatherPage = () => {
  const { city, lat, lon } = useParams();
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiKey = "e211664780beb1f7cdada25b4c488ae7"; // Replace with your OpenWeatherMap API key

  // Fetch 5-day forecast data
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        setForecastData(data.list); // Save forecast data
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [lat, lon, apiKey]);

  if (loading) return <Loader />;
  if (error) return <p>Error fetching forecast data: {error.message}</p>;

  // Helper function to group forecast data by day
  const getDailyForecast = () => {
    const groupedForecast = {};

    forecastData.forEach((entry) => {
      const date = dayjs(entry.dt_txt).format("YYYY-MM-DD"); // Group by date
      if (!groupedForecast[date]) {
        groupedForecast[date] = [];
      }
      groupedForecast[date].push(entry);
    });

    return Object.entries(groupedForecast).slice(0, 5); // Get only 5 days
  };

  const dailyForecast = getDailyForecast();
  console.log(forecastData);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-200 p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Back Button with Left Arrow */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-full"
        >
          <FaArrowLeft size={20} />
        </button>

        <div className="p-8 m-3 lg:flex lg:justify-between">
          <div className="lg:w-full mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              5-Day Weather Forecast {city}
            </h1>

            {/* Display daily forecast cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {dailyForecast.map(([date, entries], index) => {
                const middayEntry = entries.find((entry) =>
                  entry.dt_txt.includes("12:00:00")
                ); // Choose midday for a better summary
                const weatherIconCode = middayEntry?.weather[0]?.icon;
                const weatherDescription = middayEntry?.weather[0]?.description;
                const temp = middayEntry?.main?.temp;
                const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherIconCode}@2x.png`;

                return (
                  <div
                    key={index}
                    className="bg-blue-500 text-white rounded-lg shadow-md p-4 text-center"
                  >
                    <h2 className="text-lg font-semibold mb-2">
                      {dayjs(date).format("dddd")}
                    </h2>
                    <p className="text-sm">{dayjs(date).format("MMM D, YYYY")}</p>
                    {weatherIconCode && (
                      <img
                        src={weatherIconUrl}
                        alt={weatherDescription}
                        className="mx-auto my-2 w-16 h-16"
                      />
                    )}
                    <p className="text-xl font-bold">{temp}°C</p>
                    <p className="capitalize">{weatherDescription}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map section */}
        <div className="w-full h-64 lg:h-80 mt-6">
          <MapContainer
            center={[lat, lon]}
            zoom={10}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lon]}>
              <Popup>{`Weather for ${forecastData[0]?.name || "this location"}`}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
