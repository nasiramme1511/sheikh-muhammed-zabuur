import { HiTrash } from 'react-icons/hi';
import { useTranslation } from '../../i18n';

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  entityName: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({ open, onClose, onConfirm, title, entityName, loading }: ConfirmDeleteModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <HiTrash className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{t('admin.confirm_delete')}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary">{t('admin.cancel')}</button>
          <button onClick={onConfirm} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50">
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
            {t('admin.delete')} {entityName}
          </button>
        </div>
      </div>
    </div>
  );
}
