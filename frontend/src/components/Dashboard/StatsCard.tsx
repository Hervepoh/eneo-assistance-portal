//import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: typeof LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';
  description?: string;
  onClick?: () => void
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title,description, value, icon: Icon, color, onClick, trend }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    orange: 'bg-orange-500 text-orange-600 bg-orange-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50'
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md dark:hover:shadow-slate-900/20 transition-shadow ${onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-1">{value}</p>
          {description && <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">{description}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-500 ml-2">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color].split(' ')[2]} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
}