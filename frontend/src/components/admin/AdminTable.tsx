import React from 'react';
import { HiSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useTranslation } from '../../i18n';
import { useResponsive } from '../../hooks/useResponsive';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
  className?: string;
  /** Hide this column in mobile card view */
  hideOnMobile?: boolean;
  /** Mark this as the primary column (shown as card title on mobile) */
  primary?: boolean;
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
  /** Custom mobile card renderer — if provided, overrides the default card layout */
  mobileCardRender?: (item: any) => React.ReactNode;
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
  mobileCardRender,
}: AdminTableProps) {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const ph = searchPlaceholder || t('admin.search_placeholder');
  const empty = emptyMessage || t('admin.no_items');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-full min-w-0 overflow-hidden">
      {/* Search & Filters */}
      {(searchable || extraFilters) && (
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            {searchable && (
              <div className="relative flex-1 sm:max-w-xs">
                <HiSearch className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={ph}
                  value={searchValue}
                  onChange={(e) => { onSearchChange?.(e.target.value); }}
                  className="input-field ps-10 py-2 text-sm"
                />
              </div>
            )}
            {extraFilters && <div className="flex items-center gap-2 flex-wrap">{extraFilters}</div>}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 px-4 text-gray-500">{empty}</div>
      ) : isMobile ? (
        /* ── Mobile Card View ── */
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((item) => (
            <div key={keyExtractor(item)} className="p-3 sm:p-4">
              {mobileCardRender ? (
                mobileCardRender(item)
              ) : (
                <div className="space-y-2">
                  {columns
                    .filter((col) => !col.hideOnMobile)
                    .map((col) => {
                      const value = col.render ? col.render(item) : item[col.key];
                      if (col.primary) {
                        return (
                          <div key={col.key} className="font-semibold text-sm text-gray-900 dark:text-white break-words">
                            {value}
                          </div>
                        );
                      }
                      return (
                        <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                          <span className="text-gray-500 dark:text-gray-400 shrink-0 text-xs uppercase tracking-wide">
                            {col.header}
                          </span>
                          <span className="text-end text-gray-900 dark:text-gray-100 break-words min-w-0">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── Desktop Table View ── */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                {columns.map((col) => (
                  <th key={col.key} className={'px-4 py-3 text-start ' + (col.className || '')}>{col.header}</th>
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

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-gray-100 dark:border-gray-800 gap-2">
          <span className="text-xs sm:text-sm text-gray-500 shrink-0">
            {t('admin.page')} {page} {t('admin.of')} {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="btn-secondary !py-1.5 !px-3 disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <HiChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="btn-secondary !py-1.5 !px-3 disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <HiChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
