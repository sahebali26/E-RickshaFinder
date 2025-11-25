import React from 'react';
import { LatLng, Driver } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MapComponentProps {
  userLocation: LatLng | null;
  drivers: Driver[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  drivers,
}) => {
  const { translations } = useLanguage();

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
        {translations.loading}...
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
      <img
        src="https://picsum.photos/600/400?grayscale" // Placeholder map image
        alt="Map"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full w-4 h-4 z-10 animate-pulse border-2 border-white" title={translations.yourCurrentLocation}></div>

      {drivers.map((driver) => (
        <div
          key={driver.id}
          className="absolute bg-green-500 rounded-full w-3 h-3 z-10 border-2 border-white"
          style={{
            // Simple illustrative positioning, not actual geo-coordinates
            top: `${30 + Math.random() * 40}%`,
            left: `${30 + Math.random() * 40}%`,
          }}
          title={`${driver.name} (${driver.vehicleType})`}
        ></div>
      ))}

      <p className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {translations.yourCurrentLocation}: {userLocation.latitude.toFixed(4)},{' '}
        {userLocation.longitude.toFixed(4)}
      </p>
    </div>
  );
};

export default MapComponent;