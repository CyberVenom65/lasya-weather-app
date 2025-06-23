import React, { useState, useEffect } from 'react';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);

  const fetchWeather = async (queryCity) => {
    if (!queryCity) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/weather?city=${queryCity}`);
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      setError('');
    } catch (err) {
      setWeather(null);
      setError('Could not fetch weather for that city.');
    }
    setLoading(false);
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const cityName = data.address.city || data.address.town || data.address.state;
          if (cityName) {
            setCity(cityName);
            fetchWeather(cityName);
          }
        } catch (err) {
          setError('Failed to detect location.');
        }
      });
    } else {
      setError('Geolocation not supported');
    }
  };

  useEffect(() => {
    handleLocation();
  }, []);

  const toggleMode = () => setDarkMode(!darkMode);

  const backgroundByWeather = () => {
    if (!weather) return 'from-blue-200 to-indigo-300';
    const desc = weather.description.toLowerCase();
    const hour = new Date().getHours();
    if (desc.includes('rain')) return 'from-sky-400 to-gray-700';
    if (desc.includes('cloud')) return 'from-gray-300 to-gray-600';
    if (desc.includes('clear')) {
      return hour >= 6 && hour <= 18
        ? 'from-yellow-100 to-blue-400'
        : 'from-purple-800 to-indigo-900';
    }
    if (desc.includes('snow')) return 'from-white to-blue-100';
    return 'from-blue-200 to-indigo-300';
  };

  const mapIcon = (iconCode) => {
    const iconMap = {
      "01d": "clear-day",
      "01n": "clear-night",
      "02d": "partly-cloudy-day",
      "02n": "partly-cloudy-night",
      "03d": "cloudy",
      "03n": "cloudy",
      "04d": "overcast",
      "04n": "overcast",
      "09d": "rain",
      "09n": "rain",
      "10d": "rain",
      "10n": "rain",
      "11d": "thunderstorms",
      "11n": "thunderstorms",
      "13d": "snow",
      "13n": "snow",
      "50d": "fog",
      "50n": "fog",
    };
    return iconMap[iconCode] || "cloudy";
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-white' : `bg-gradient-to-br ${backgroundByWeather()}`} flex flex-col items-center justify-center px-4`}>
      {/* 🍃 Animated Clouds */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="animate-clouds absolute top-10 left-0 w-[200%] h-32 bg-clouds bg-repeat-x opacity-30"></div>
      </div>

      <div className={`relative z-10 w-full max-w-md p-6 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🌤️ Lasya's Weather App</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleMode}
              className="text-sm border px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? 'Light' : 'Dark'} Mode
            </button>
            <button
              onClick={() => setIsCelsius(!isCelsius)}
              className="text-sm border px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              °{isCelsius ? 'F' : 'C'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-4 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => fetchWeather(city)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Get Weather
          </button>
        </div>

        {loading && <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>}
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}

        {weather && !loading && (
          <div className="text-center animate-fade-in">
            <h2 className="text-xl font-semibold">{weather.city}, {weather.country}</h2>
            <p className="text-4xl mt-2">
              {isCelsius ? weather.temperature : ((weather.temperature * 9) / 5 + 32).toFixed(1)}°{isCelsius ? 'C' : 'F'}
            </p>
            <p className="capitalize">{weather.description}</p>

            <object
              type="image/svg+xml"
              data={`https://raw.githubusercontent.com/manifestinteractive/weather-underground-icons/master/animated/${mapIcon(weather.icon)}.svg`}
              className="w-24 h-24 mx-auto animate-bounce"
            />

            <p className="text-sm text-gray-600 dark:text-gray-300">Humidity: {weather.humidity}%</p>
          </div>
        )}
      </div>

      {/* 🔗 GitHub Footer */}
      <footer className="relative z-10 mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Made with <span className="text-red-500">❤</span> by Lasya Priya PSS ·{' '}
        <a
          href="https://github.com/CyberVenom65"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
