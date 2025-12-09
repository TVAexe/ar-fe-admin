'use client';

import React from 'react';
export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  cell?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
  };
  rowKey: keyof T;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No data available',
  pagination,
  rowKey,
}: TableProps<T>) {
  const renderCell = (column: Column<T>, row: T) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    
    const value = row[column.accessor];
    
    if (column.cell) {
      return column.cell(value, row);
    }
    
    return value ?? '—';
  };

  const generatePageNumbers = () => {
    if (!pagination) return [];
    
    const { currentPage, totalPages } = pagination;
    const maxToShow = 5;
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - maxToShow));
    const end = Math.min(totalPages, start + maxToShow);
    
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-grey-200">
          <thead className="bg-grey-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-xs font-semibold text-grey-600 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-100">
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={String(row[rowKey])} className="hover:bg-grey-50">
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-3 text-sm ${column.className || 'text-grey-700'}`}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-grey-500"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-grey-200">
          <div className="text-sm text-grey-600">
            Page {pagination.currentPage + 1} of {pagination.totalPages}
          </div>
          <nav aria-label="Pagination">
            <ul className="flex -space-x-px text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => pagination.onPageChange(Math.max(0, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 0 || pagination.isLoading}
                  className="flex items-center justify-center rounded-l-md px-3 h-9 border border-grey-300 bg-white text-grey-700 hover:bg-grey-100 hover:text-grey-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
              </li>
              {pageNumbers.map((pageNum) => (
                <li key={pageNum}>
                  <button
                    type="button"
                    onClick={() => pagination.onPageChange(pageNum)}
                    disabled={pageNum === pagination.currentPage || pagination.isLoading}
                    aria-current={pageNum === pagination.currentPage ? 'page' : undefined}
                    className={`flex items-center justify-center w-9 h-9 border border-grey-300 text-sm font-medium focus:outline-none ${
                      pageNum === pagination.currentPage
                        ? 'bg-primary/10 text-primary border-primary cursor-default'
                        : 'bg-white text-grey-700 hover:bg-grey-100 hover:text-grey-900'
                    } ${pagination.isLoading ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}
                  >
                    {pageNum + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => pagination.onPageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                  disabled={pagination.currentPage >= pagination.totalPages - 1 || pagination.isLoading}
                  className="flex items-center justify-center rounded-r-md px-3 h-9 border border-grey-300 bg-white text-grey-700 hover:bg-grey-100 hover:text-grey-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Table;