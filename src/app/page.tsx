"use client";

import { useState } from "react";

interface WeatherData {
  city: string;
  temperature: number;
  windspeed: number;
  time: string;
}

interface Result {
  current_weather: {
    time: string;
    interval: number;
    temperature: number;
    windspeed: number;
    winddirection: number;
    is_day: number;
    weathercode: number;
  };
}

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setModalOpen(true);
        throw new Error("Ciudad no encontrada");
      }

      const { latitude, longitude } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData: Result = await weatherRes.json();

      if (!weatherData.current_weather) {
        throw new Error("Weather data not available.");
      }

      setWeather((prevWeather) => [
        ...prevWeather,
        { ...weatherData.current_weather, city },
      ]);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeWeatherCard = (index: number) => {
    setWeather((prevWeather) => prevWeather.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-[70px] flex flex-col items-center gap-4">
      <input
        type="text"
        placeholder="Poner ciudad"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="text-black border p-2 rounded-md"
      />
      <button
        onClick={fetchWeather}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? "Cargando..." : "Da la temperatura"}
      </button>

      <div className="mt-4 grid lg:grid-cols-3 gap-4">
        {weather.map((data, index) => (
          <div key={index} className="relative p-4 pb-8 border rounded-md bg-white shadow-md text-black">
            <button
              onClick={() => removeWeatherCard(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              ×
            </button>
            <div className="text-2xl text-center py-5">{data.city}</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center">
                <div>
                  <p>
                    <strong>Temperatura:</strong> {data.temperature}°C
                  </p>
                  <p>
                    <strong>Velocidad de viento:</strong> {data.windspeed} km/h
                  </p>
                  <p>
                    <strong>Tiempo:</strong> {data.time}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="flex justify-content items-center bg-white w-[400px] h-[200px] p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <p className="text-lg font-semibold text-black">La ciudad no fue encontrada</p>
              <button
                onClick={() => setModalOpen(false)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



