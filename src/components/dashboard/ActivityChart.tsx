import React from 'react';

interface ActivityData {
  date: string;
  count: number;
  dayName: string;
}

interface ActivityChartProps {
  data: ActivityData[];
  title: string;
  loading?: boolean;
}

export default function ActivityChart({ data, title, loading = false }: ActivityChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>Немає даних для відображення</p>
            <p className="text-sm">Спробуйте змінити період або перевірте підключення</p>
          </div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const maxHeight = 200; // максимальна висота стовпчика

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => {
          const height = maxCount > 0 ? (item.count / maxCount) * maxHeight : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {/* Стовпчик */}
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}px` }}
                title={`${item.dayName}: ${item.count} листів`}
              />
              
              {/* Підпис дня */}
              <div className="mt-2 text-xs text-gray-600 text-center">
                <div className="font-medium">{item.dayName}</div>
                <div className="text-gray-500">{item.count}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Легенда */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center text-sm text-gray-600">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          Кількість листів за день
        </div>
      </div>
    </div>
  );
}
