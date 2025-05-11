"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import didarha from '../didarha.json';
import Link from 'next/link';

const Location = dynamic(
  () => import('../components/Location/LocationWrapper'),
  { loading: () => <p>Loading Map...</p> }
);

const getPastEvents = () => {
  const now = new Date();
  return Object.entries(didarha)
    .filter(([, value]) => {
      if (typeof value !== 'object' || !value.time) return false;
      return new Date(value.time) < now;
    })
    .map(([key, value]) => {
      const v = value as { time: string; location: { name: string; position: number[] } };
      return {
        name: key,
        time: v.time,
        location: v.location,
      };
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // latest to soonest
};

export default function HistoryPage() {
  const pastEvents = getPastEvents();
  const [expandedMaps, setExpandedMaps] = useState<string[]>([]);

  const toggleMap = (name: string) => {
    setExpandedMaps(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-8 overflow-hidden">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold ml-4 text-white">Didars History</h1>
        </div>
        {pastEvents.length === 0 ? (
          <p className="text-gray-500">No past didar yet.</p>
        ) : (
          <ul className="space-y-4">
            {pastEvents.map(didar => (
              <li key={didar.name} className="border rounded p-4 bg-white shadow overflow-hidden">
                <div className="text-black font-semibold text-lg">{didar.location?.name}</div>
                <div className="text-gray-700">{new Date(didar.time).toLocaleString()}</div>
                <div className="text-gray-500 text-sm">{didar.name}</div>
                <button
                  onClick={() => toggleMap(didar.name)}
                  className="mt-2 text-blue-500 underline"
                >
                  {expandedMaps.includes(didar.name) ? 'Hide Map' : 'Show Map'}
                </button>
                {expandedMaps.includes(didar.name) && (
                  <div className="mt-4 w-full">
                    <Location locations={[didar.location]} zoom={15} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {pastEvents.length === 0 ? (
        <div></div>
      ) : (
        <div className="mt-8">
          <Location locations={pastEvents.map(event => event.location)} zoom={5} />
        </div>
      )}
    </>
  );
} 