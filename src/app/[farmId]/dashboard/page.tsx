'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dashboard Statistics Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  positive = true,
  loading = false
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode;
  positive?: boolean;
  loading?: boolean;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {loading ? (
          <div className="mt-1 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
        ) : (
          <h3 className="text-xl font-bold mt-1">{value}</h3>
        )}
        <p className={`text-xs mt-2 flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414l-3.293 3.293A1 1 0 0112 13z" clipRule="evenodd" />
            </svg>
          )}
          {change} from last month
        </p>
      </div>
      <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-md">
        {icon}
      </div>
    </div>
  </div>
);

// Task Component
const Task = ({ 
  title, 
  description, 
  dueDate, 
  priority 
}: { 
  title: string; 
  description: string; 
  dueDate: string; 
  priority: 'high' | 'medium' | 'low'; 
}) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex justify-between">
        <h4 className="font-medium">{title}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[priority]}`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Due: {dueDate}</span>
        <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs">
          Mark as complete
        </button>
      </div>
    </div>
  );
};

// Recent Activity Component
const Activity = ({ 
  activity, 
  time, 
  user, 
  icon 
}: { 
  activity: string; 
  time: string; 
  user: string; 
  icon: React.ReactNode; 
}) => (
  <div className="flex items-start p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md mr-3">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm">{activity}</p>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">by {user}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
      </div>
    </div>
  </div>
);

// Helper function to get activity icon based on activity type
const getActivityIcon = (activityType: string) => {
  const iconClass = "h-5 w-5 text-gray-600 dark:text-gray-300";
  
  switch (activityType) {
    case 'livestock_added':
    case 'livestock_updated':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'egg_collection':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'egg_sale':
    case 'income_recorded':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'crop_added':
    case 'crop_updated':
    case 'crop_harvested':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'task_created':
    case 'task_completed':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'expense_added':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

// Weather Widget Component
const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temp: '26°C',
    condition: 'Partly Cloudy',
    humidity: '65%',
    wind: '12 km/h'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching weather data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 animate-pulse p-4 rounded-lg shadow">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Today's Weather</h3>
          <p className="text-sm opacity-90">Kampala, Uganda</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </div>
      <div className="mt-4">
        <div className="flex justify-between">
          <h4 className="text-2xl font-bold">{weather.temp}</h4>
          <p>{weather.condition}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs opacity-80">Humidity</p>
            <p className="text-sm">{weather.humidity}</p>
          </div>
          <div>
            <p className="text-xs opacity-80">Wind</p>
            <p className="text-sm">{weather.wind}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// New Quick Link Card Component
const QuickLinkCard = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
  >
    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
  </Link>
);


export default function Dashboard({ params }: { params: { farmId: string } }) {
  const { farmId } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalLivestock, setTotalLivestock] = useState<number>(0);
  const [eggsToday, setEggsToday] = useState<number>(0);
  const [financialAnalytics, setFinancialAnalytics] = useState<any>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [feedStock, setFeedStock] = useState<any>(null);
  const [feedStockLoading, setFeedStockLoading] = useState(true);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    if (amount === 0) return `${currency} 0`;
    
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const [stats, setStats] = useState([
    {
      title: 'Total Livestock',
      value: '0',
      change: '+12.5%',
      positive: true,
      loading: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: 'Eggs Today',
      value: '0',
      change: '+5.2%',
      positive: true,
      loading: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
        </svg>
      )
    },
    {
      title: 'Net Profit',
      value: 'UGX 0',
      change: '+0.0%',
      positive: true,
      loading: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Feed Stock',
      value: '0%',
      change: '+0.0%',
      positive: true,
      loading: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    }
  ]);
  
  const quickLinks = [
    {
      label: 'Add Livestock',
      href: `/${farmId}/dashboard/livestock/add`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
    },
    {
      label: 'Record Eggs',
      href: `/${farmId}/dashboard/eggs/record`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      label: 'Add Expense',
      href: `/${farmId}/dashboard/finances/expense`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Record Sale',
      href: `/${farmId}/dashboard/finances/income`,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
  ];
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  
  const [weather, setWeather] = useState({
    temp: '26°C',
    condition: 'Partly Cloudy',
    humidity: '65%',
    wind: '12 km/h'
  });

  // Fetch feed stock data
  useEffect(() => {
    const fetchFeedStock = async () => {
      try {
        setFeedStockLoading(true);
        const response = await fetch('/api/feedstock');
        if (response.ok) {
          const data = await response.json();
          setFeedStock(data.data);
        } else {
          console.error('Failed to fetch feed stock data');
        }
      } catch (error) {
        console.error('Error fetching feed stock data:', error);
      } finally {
        setFeedStockLoading(false);
      }
    };

    fetchFeedStock();
  }, []);

  // Update stats when data changes
  useEffect(() => {
    setStats([
      {
        title: 'Total Livestock',
        value: totalLivestock.toString(),
        change: '+12.5%',
        positive: true,
        loading: statsLoading,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      },
      {
        title: 'Eggs Today',
        value: eggsToday.toString(),
        change: '+5.2%',
        positive: true,
        loading: statsLoading,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 714.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z" />
          </svg>
        )
      },
      {
        title: 'Net Profit',
        value: financialAnalytics ? formatCurrency(financialAnalytics.summary.netProfit, 'UGX') : 'UGX 0',
        change: financialAnalytics ? `${financialAnalytics.growth.profitGrowth >= 0 ? '+' : ''}${financialAnalytics.growth.profitGrowth.toFixed(1)}%` : '+0.0%',
        positive: financialAnalytics ? financialAnalytics.growth.profitGrowth >= 0 : true,
        loading: financialLoading,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        title: 'Feed Stock',
        value: feedStock ? `${feedStock.stockPercentage}%` : '0%',
        change: feedStock && feedStock.totalItems > 0 ? `${feedStock.lowStockItems.length > 0 ? '-' : '+'}${Math.abs(feedStock.stockPercentage - 75).toFixed(1)}%` : '+0.0%',
        positive: feedStock ? feedStock.lowStockItems.length === 0 : true,
        loading: feedStockLoading,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      }
    ]);
  }, [totalLivestock, eggsToday, statsLoading, financialAnalytics, financialLoading, feedStock, feedStockLoading]);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch total livestock and today's eggs in parallel
      const [livestockResponse, eggsResponse] = await Promise.all([
        fetch('/api/livestock/total', { credentials: 'include' }),
        fetch('/api/eggs/today', { credentials: 'include' })
    ]);

    if (livestockResponse.ok) {
      const livestockData = await livestockResponse.json();
      setTotalLivestock(livestockData.totalLivestock || 0);
    }

    if (eggsResponse.ok) {
      const eggsData = await eggsResponse.json();
      setEggsToday(eggsData.eggsCollected || 0);
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  } finally {
    setStatsLoading(false);
  }
};

// Fetch financial analytics
const fetchFinancialAnalytics = async () => {
  try {
    setFinancialLoading(true);
    const response = await fetch('/api/finances/analytics');
    if (response.ok) {
      const data = await response.json();
      setFinancialAnalytics(data.data);
    } else {
      console.error('Failed to fetch financial analytics');
    }
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
  } finally {
    setFinancialLoading(false);
  }
};

  // Fetch upcoming tasks
  const fetchUpcomingTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      
      const response = await fetch('/api/tasks/upcoming?limit=5', { 
        credentials: 'include' 
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch tasks' }));
        setTasksError(errorData.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching upcoming tasks:', err);
      setTasksError('Failed to fetch tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      
      const response = await fetch('/api/activity/recent?limit=5', { 
        credentials: 'include' 
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch activities' }));
        setActivitiesError(errorData.error || 'Failed to fetch activities');
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setActivitiesError('Failed to fetch activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          credentials: 'include',
        });
        const data = await response.json();

        if (!response.ok || !data.isSignedUp) {
          router.replace('/auth/register');
          return;
        }

        // Fetch dashboard data if user is fully signed up
        await Promise.all([
          fetchDashboardStats(),
          fetchUpcomingTasks(),
          fetchRecentActivities(),
          fetchFinancialAnalytics()
        ]);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to verify user status. Please try again.');
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [router]);

  // Update stats when data is fetched
  useEffect(() => {
    setStats(prevStats => [
      {
        ...prevStats[0],
        value: totalLivestock.toString(),
        loading: statsLoading
      },
      {
        ...prevStats[1],
        value: eggsToday.toString(),
        loading: statsLoading
      },
      {
        ...prevStats[2],
        value: financialAnalytics ? formatCurrency(financialAnalytics.summary.netProfit, 'UGX') : 'UGX 0',
        change: financialAnalytics ? `${financialAnalytics.growth.profitGrowth >= 0 ? '+' : ''}${financialAnalytics.growth.profitGrowth.toFixed(1)}%` : '+0.0%',
        positive: financialAnalytics ? financialAnalytics.growth.profitGrowth >= 0 : true,
        loading: financialLoading
      },
      prevStats[3]  // Feed Stock (unchanged)
    ]);
  }, [totalLivestock, eggsToday, statsLoading, financialAnalytics, financialLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to your Farm Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Here's what's happening on your farm today.
        </p>
      </div>
      
      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            positive={stat.positive}
            loading={stat.loading}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Upcoming Tasks</h3>
            <Link href={`/${farmId}/dashboard/tasks`} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              View all
            </Link>
          </div>
          <div>
            {tasksLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : tasksError ? (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                {tasksError}
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium mb-2">No upcoming tasks</p>
                <p className="text-sm">You're all caught up! Create a new task to get started.</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <Task
                  key={task._id || index}
                  title={task.title}
                  description={task.description}
                  dueDate={new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  priority={task.priority}
                />
              ))
            )}
          </div>
          <div className="p-4">
            <button className="w-full btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">
              Add New Task
            </button>
          </div>
        </div>
        
        {/* Weather and Quick Links */}
        <div className="space-y-6">
          <WeatherWidget />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Quick Actions</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <QuickLinkCard
                  key={link.label}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <Link href={`/${farmId}/dashboard/activity`} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              View all
            </Link>
          </div>
          <div>
            {activitiesLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-start animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activitiesError ? (
              <div className="p-4 text-center text-red-600 dark:text-red-400">
                {activitiesError}
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-lg font-medium mb-2">No recent activity</p>
                <p className="text-sm">Activity will appear here as you use your farm management system.</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <Activity
                  key={activity._id || index}
                  activity={activity.description}
                  time={formatRelativeTime(activity.createdAt)}
                  user={activity.user?.name || 'Unknown User'}
                  icon={getActivityIcon(activity.activityType)}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="bg-primary-600 text-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Ready to optimize your farm operations?</h3>
            <p className="mt-1">Complete your farm profile to get personalized recommendations.</p>
          </div>
          <Link
            href={`/${farmId}/dashboard/settings/profile`}
            className="btn bg-white text-primary-700 hover:bg-gray-100"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    </div>
  );
}