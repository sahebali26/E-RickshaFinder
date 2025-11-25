import React from 'react';
import { Driver } from '../types';
import Card from './Card';
import Button from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface DriverCardProps {
  driver: Driver;
  distanceKm: number;
  onBookRide: (driverId: string) => void;
}

const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  distanceKm,
  onBookRide,
}) => {
  const { translations } = useLanguage();

  const handleCall = () => {
    // In a real app, this would initiate a phone call
    window.open(`tel:${driver.phoneNumber}`);
    console.log(`Calling driver ${driver.name} at ${driver.phoneNumber}`);
  };

  return (
    <Card className="flex flex-col sm:flex-row items-center justify-between mb-4 p-4">
      <div className="flex-grow text-center sm:text-left mb-2 sm:mb-0">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {driver.name} ({driver.vehicleType})
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {translations.distance}: {distanceKm.toFixed(1)} km
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {translations.rating}: {driver.rating} ⭐
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleCall} variant="secondary">
          {translations.call}
        </Button>
        <Button onClick={() => onBookRide(driver.id)} variant="primary">
          {translations.bookRide}
        </Button>
      </div>
    </Card>
  );
};

export default DriverCard;