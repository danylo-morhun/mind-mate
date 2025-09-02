import React from 'react';

interface CategoryData {
  [key: string]: number;
}

interface CategoryChartProps {
  data: CategoryData;
  title: string;
  loading?: boolean;
}

const categoryColors = {
  education: '#3B82F6',      // blue
  administrative: '#10B981', // green
  student_support: '#8B5CF6', // purple
  academic: '#F59E0B',       // amber
  other: '#6B7280',          // gray
};

const categoryLabels = {
  education: 'Освіта',
  administrative: 'Адміністрація',
  student_support: 'Підтримка студентів',
  academic: 'Академічна',
  other: 'Інше',
};

export default function CategoryChart({ data, title, loading = false }: CategoryChartProps) {
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

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>Немає даних для відображення</p>
            <p className="text-sm">Спробуйте змінити період</p>
          </div>
        </div>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const categories = Object.entries(data)
    .map(([key, count]) => ({
      key,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: categoryColors[key as keyof typeof categoryColors] || categoryColors.other,
      label: categoryLabels[key as keyof typeof categoryLabels] || key
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="flex items-center justify-center mb-6">
        {/* Кругова діаграма */}
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
            {categories.map((category, index) => {
              const previousCategories = categories.slice(0, index);
              const previousPercentage = previousCategories.reduce((sum, cat) => sum + cat.percentage, 0);
              const startAngle = (previousPercentage / 100) * 360;
              const endAngle = ((previousPercentage + category.percentage) / 100) * 360;
              
              const startX = 16 + 14 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 16 + 14 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 16 + 14 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 16 + 14 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = category.percentage > 50 ? 1 : 0;
              
              return (
                <path
                  key={category.key}
                  d={`M 16 16 L ${startX} ${startY} A 14 14 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  fill={category.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
          
          {/* Центральний текст */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">всього</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Легенда */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.key} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-gray-700">{category.label}</span>
            </div>
            <div className="text-sm text-gray-600">
              {category.count} ({category.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
