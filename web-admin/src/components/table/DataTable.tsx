import React from 'react';
import { Database } from '@phosphor-icons/react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey: (row: T) => string;
}

export default function DataTable<T>({ columns, data, loading, emptyText = 'Chưa có dữ liệu', rowKey }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="table-wrap" aria-busy="true" aria-live="polite">
        <div className="skeleton-table">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="skeleton-row" style={{ width: `${88 - (index % 3) * 8}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} style={{ width: column.width }}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                <div className="table-empty-content">
                  <Database size={26} weight="duotone" aria-hidden="true" />
                  <strong>{emptyText}</strong>
                  <span>Dữ liệu sẽ xuất hiện tại đây khi có phát sinh.</span>
                </div>
              </td>
            </tr>
          ) : data.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render ? column.render(row) : String((row as any)[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
