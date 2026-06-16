import React from 'react';
import { HiSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useTranslation } from '../../i18n';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
  className?: string;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  keyExtractor?: (item: any) => string | number;
  extraFilters?: React.ReactNode;
}

export default function AdminTable({
  columns,
  data,
  loading,
  searchable = true,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage,
  keyExtractor = (item) => item.id,
  extraFilters,
}: AdminTableProps) {
  const { t } = useTranslation();
  const ph = searchPlaceholder || t('admin.search_placeholder');
  const empty = emptyMessage || t('admin.no_items');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      {(searchable || extraFilters) && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            {searchable && (
              <div className="relative flex-1 max-w-xs">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={ph}
                  value={searchValue}
                  onChange={(e) => { onSearchChange?.(e.target.value); }}
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
            )}
            {extraFilters && <div className="flex items-center gap-2 flex-wrap">{extraFilters}</div>}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                {columns.map((col) => (
                  <th key={col.key} className={'px-4 py-3 ' + (col.className || '')}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={'px-4 py-3 ' + (col.className || '')}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500">{t('admin.page')} {page} {t('admin.of')} {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="btn-secondary !py-1.5 !px-3 disabled:opacity-50"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="btn-secondary !py-1.5 !px-3 disabled:opacity-50"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
