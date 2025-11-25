import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { getAdminStats } from '../services/driverService';
import { useLanguage } from '../contexts/LanguageContext';
import { API_SIMULATION_DELAY_MEDIUM } from '../constants';

interface AdminStats {
  totalRides: number;
  totalCommission: number;
  activeDrivers: number;
  activeUsers: number;
}

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { translations } = useLanguage();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate a longer delay for admin panel data
      await new Promise((resolve) => setTimeout(resolve, API_SIMULATION_DELAY_MEDIUM));
      const fetchedStats = await getAdminStats();
      setStats(fetchedStats as AdminStats);
    } catch (e: unknown) {
      setError(`Failed to fetch admin stats: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
        {translations.adminPanel}
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {translations.loading}...
        </p>
      ) : error ? (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </p>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={translations.totalRides}
            value={stats.totalRides}
          />
          <StatCard
            title={translations.totalCommission}
            value={`₹${stats.totalCommission}`}
          />
          <StatCard
            title={translations.activeDrivers}
            value={stats.activeDrivers}
          />
          <StatCard
            title={translations.activeUsers}
            value={stats.activeUsers}
          />
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No data available.
        </p>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <Card className="text-center">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
        {value}
      </p>
    </Card>
  );
};

export default AdminPanel;