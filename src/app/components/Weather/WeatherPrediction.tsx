'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWeatherInfo } from '../../utils/weather';

interface WeatherData {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
}

interface WeatherPredictionProps {
    location: {
        position: number[];
        name: string;
    };
    eventTime: string;
}

export default function WeatherPrediction({ location, eventTime }: WeatherPredictionProps) {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the maximum available forecast starting from TODAY
                const startDate = new Date();
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 15); // Max API limit (~16 days)

                const formatDate = (d: Date) => d.toISOString().split('T')[0];

                const startStr = formatDate(startDate);
                const endStr = formatDate(endDate);
                const [lat, lng] = location.position;

                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&start_date=${startStr}&end_date=${endStr}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
                console.log('Fetching weather:', url);

                const res = await fetch(url);
                if (!res.ok) {
                    const text = await res.text();
                    console.error('Weather API Error:', text);
                    throw new Error('Failed to fetch weather data');
                }

                const json = await res.json();
                if (json.error) throw new Error(json.reason || 'API Error');

                setData(json.daily);
            } catch (err) {
                console.error(err);
                setError('Could not load weather forecast.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location, eventTime]);

    useEffect(() => {
        if (!data) return;
        const targetDate = eventTime.split('T')[0];

        // Wait for entrance animations to settle slightly
        const timer = setTimeout(() => {
            const el = document.getElementById(`weather-card-${targetDate}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }
        }, 800); // Delay to follow entrance animation
        return () => clearTimeout(timer);
    }, [data, eventTime]);

    if (loading) return <div className="text-center p-8 text-white/50 animate-pulse">Checking the skies...</div>;
    if (error) return <div className="text-center p-8 text-red-300">{error}</div>;
    if (!data) return null;

    return (
        <div className="w-full my-8">
            <div className="mb-4 px-4 text-center sm:text-left">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 pb-1">
                    {location.name} Weather
                </h2>
                <p className="text-white/60 text-sm">14-Day Forecast</p>
            </div>

            {/* Horizontal Slider Container */}
            <motion.div
                className="w-full overflow-x-auto pb-6 px-4 scrollbar-hide snap-x"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex gap-4 w-max min-w-full">
                    {data.time.map((dateStr, i) => {
                        const date = new Date(dateStr);
                        const isEventDay = dateStr === eventTime.split('T')[0];
                        const { label, icon } = getWeatherInfo(data.weathercode[i]);

                        return (
                            <motion.div
                                key={dateStr}
                                id={`weather-card-${dateStr}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`
                  relative flex flex-col items-center justify-between
                  min-w-[140px] h-[200px] p-4 rounded-3xl
                  backdrop-blur-xl border
                  transition-all duration-300 snap-start
                  ${isEventDay ? 'bg-white/20 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-black/10 border-white/10 hover:bg-white/10'}
                `}
                            >
                                {/* Date Header */}
                                <div className="text-center">
                                    <span className="block text-xs uppercase tracking-wider text-white/70">
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className={`block font-bold mt-1 ${isEventDay ? 'text-white' : 'text-white/90'}`}>
                                        {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                {/* Icon */}
                                <div className="text-6xl my-2 filter drop-shadow-lg transform hover:scale-110 transition-transform">
                                    {icon}
                                </div>

                                {/* Temps */}
                                <div className="w-full text-center">
                                    <div className="text-sm font-medium text-white/60 truncate px-2">{label}</div>
                                    <div className="flex justify-center gap-3 mt-2 font-mono text-sm">
                                        <span className="text-white font-bold">{Math.round(data.temperature_2m_max[i])}°</span>
                                        <span className="text-white/50">{Math.round(data.temperature_2m_min[i])}°</span>
                                    </div>
                                </div>

                                {isEventDay && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
