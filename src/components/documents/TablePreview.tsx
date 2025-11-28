'use client';

import React from 'react';
import { TableData } from '@/lib/utils/csv-parser';

interface TablePreviewProps {
  data: TableData;
  maxRows?: number;
  className?: string;
  showFullTable?: boolean;
}

export default function TablePreview({ 
  data, 
  maxRows = 10, 
  className = '',
  showFullTable = false 
}: TablePreviewProps) {
  if (!data || data.headers.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Таблиця порожня
      </div>
    );
  }

  const displayRows = showFullTable ? data.rows : data.rows.slice(0, maxRows);
  const hasMoreRows = !showFullTable && data.rows.length > maxRows;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {data.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0"
              >
                {header || `Колонка ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayRows.length === 0 ? (
            <tr>
              <td
                colSpan={data.headers.length}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                Немає даних
              </td>
            </tr>
          ) : (
            displayRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {data.headers.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                  >
                    {row[colIndex] || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
          {hasMoreRows && (
            <tr>
              <td
                colSpan={data.headers.length}
                className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50"
              >
                ... і ще {data.rows.length - maxRows} рядків
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

