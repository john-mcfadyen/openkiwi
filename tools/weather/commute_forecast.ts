
export default {
    definition: {
        name: 'commute_forecast',
        displayName: 'Commute Forecast',
        pluginType: 'tool',
        description: 'Get an hourly weather forecast for a location, ideal for planning a commute. Returns hourly temperature, precipitation, wind, and conditions for the next N hours.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The location to get the forecast for. Can be a city name, postcode, or address.'
                },
                hours: {
                    type: 'number',
                    description: 'Number of hours to forecast (1-24). Defaults to 12.'
                },
                unit: {
                    type: 'string',
                    enum: ['celsius', 'fahrenheit'],
                    description: 'Temperature unit. Defaults to celsius.'
                }
            },
            required: ['location']
        }
    },
    handler: async ({ location, hours = 12, unit = 'celsius' }: { location: string; hours?: number; unit?: 'celsius' | 'fahrenheit' }) => {
        try {
            // Clamp hours to 1-24
            const forecastHours = Math.max(1, Math.min(24, hours));

            // 1. Geocode the location
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
            const geocodeResponse = await fetch(geocodeUrl, {
                headers: { 'User-Agent': 'OpenKiwi/1.0' }
            });

            if (!geocodeResponse.ok) {
                throw new Error(`Geocoding failed: ${geocodeResponse.statusText}`);
            }

            const geocodeData = await geocodeResponse.json() as any[];
            if (!geocodeData || geocodeData.length === 0) {
                return { error: `Could not find location: ${location}` };
            }

            const { lat, lon, display_name } = geocodeData[0];

            // 2. Fetch hourly forecast from Open-Meteo
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=${unit}&wind_speed_unit=kmh&timezone=auto&forecast_hours=${forecastHours}`;

            const weatherResponse = await fetch(weatherUrl);
            if (!weatherResponse.ok) {
                throw new Error(`Weather API failed: ${weatherResponse.statusText}`);
            }

            const weatherData = await weatherResponse.json() as any;

            // WMO weather code mapping
            const weatherCodes: Record<number, string> = {
                0: 'Clear sky',
                1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
                45: 'Fog', 48: 'Depositing rime fog',
                51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
                56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
                61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
                66: 'Light freezing rain', 67: 'Heavy freezing rain',
                71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
                77: 'Snow grains',
                80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
                85: 'Slight snow showers', 86: 'Heavy snow showers',
                95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
            };

            // Build hourly forecast array
            const hourly = weatherData.hourly;
            const forecast = [];
            const count = Math.min(forecastHours, hourly.time.length);

            for (let i = 0; i < count; i++) {
                forecast.push({
                    time: hourly.time[i],
                    temperature: `${hourly.temperature_2m[i]}°C`,
                    feels_like: `${hourly.apparent_temperature[i]}°C`,
                    precipitation_probability: `${hourly.precipitation_probability[i]}%`,
                    precipitation: `${hourly.precipitation[i]} mm`,
                    condition: weatherCodes[hourly.weather_code[i]] || 'Unknown',
                    weather_code: hourly.weather_code[i],
                    wind_speed: `${hourly.wind_speed_10m[i]} km/h`,
                    wind_gusts: `${hourly.wind_gusts_10m[i]} km/h`
                });
            }

            // Current conditions summary
            const current = weatherData.current;
            const currentSummary = {
                temperature: `${current.temperature_2m}°C`,
                feels_like: `${current.apparent_temperature}°C`,
                condition: weatherCodes[current.weather_code] || 'Unknown',
                precipitation: `${current.precipitation} mm`,
                wind_speed: `${current.wind_speed_10m} km/h`
            };

            return {
                location: display_name,
                coordinates: { lat, lon },
                timezone: weatherData.timezone,
                current: currentSummary,
                hourly_forecast: forecast
            };

        } catch (error: any) {
            console.error('[CommuteForecast] Error:', error);
            return { error: `Failed to get commute forecast: ${error.message}` };
        }
    }
};
