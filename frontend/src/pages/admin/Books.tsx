import { useState, useEffect, useRef } from 'react';
import { HiPlus, HiUpload } from 'react-icons/hi';
import { Loader2, Globe, FileText, Image } from 'lucide-react';
import { admin, categories as catApi } from '../../lib/api';
import { Book, Category } from '../../types';
import { AdminTable, AdminModal, ConfirmDeleteModal, useAdminCrud } from '../../components/admin';
import { slugify, renderActions, StatusBadge } from '../../components/admin/helpers';
import { useTranslation } from '../../i18n';

interface FormData {
  title: string;
  titleAmharic: string;
  titleArabic: string;
  titleOromic: string;
  slug: string;
  description: string;
  descriptionAmharic: string;
  descriptionArabic: string;
  descriptionOromic: string;
  author: string;
  pdfUrl: string;
  pdfUrlAr: string;
  pdfUrlAm: string;
  pdfUrlOm: string;
  coverImage: string;
  coverImageAr: string;
  coverImageAm: string;
  coverImageOm: string;
  categoryId: number | '';
  isBeginner: boolean;
}

const emptyForm: FormData = {
  title: '', titleAmharic: '', titleArabic: '', titleOromic: '',
  slug: '',
  description: '', descriptionAmharic: '', descriptionArabic: '', descriptionOromic: '',
  author: '', pdfUrl: '', pdfUrlAr: '', pdfUrlAm: '', pdfUrlOm: '',
  coverImage: '', coverImageAr: '', coverImageAm: '', coverImageOm: '',
  categoryId: '',
  isBeginner: false,
};

const ITEM_MAPPER = (item: Book): FormData => ({
  title: item.title || '',
  titleAmharic: item.titleAmharic || '',
  titleArabic: item.titleArabic || '',
  titleOromic: item.titleOromic || '',
  slug: item.slug || '',
  description: item.description || '',
  descriptionAmharic: item.descriptionAmharic || '',
  descriptionArabic: item.descriptionArabic || '',
  descriptionOromic: item.descriptionOromic || '',
  author: item.author || '',
  pdfUrl: item.pdfUrl || '',
  pdfUrlAr: item.pdfUrlAr || '',
  pdfUrlAm: item.pdfUrlAm || '',
  pdfUrlOm: item.pdfUrlOm || '',
  coverImage: item.coverImage || '',
  coverImageAr: item.coverImageAr || '',
  coverImageAm: item.coverImageAm || '',
  coverImageOm: item.coverImageOm || '',
  categoryId: item.categoryId ?? '',
  isBeginner: item.isBeginner,
});

const LANGUAGES = [
  { key: '', labelKey: 'admin.book_english', lang: 'en', flag: '🇬🇧' },
  { key: 'Ar', labelKey: 'admin.book_arabic', lang: 'ar', flag: '🇸🇦' },
  { key: 'Am', labelKey: 'admin.book_amharic', lang: 'am', flag: '🇪🇹' },
  { key: 'Om', labelKey: 'admin.book_oromo', lang: 'om', flag: '🇪🇹' },
] as const;

function UploadField({ value, accept, label, uploadingLabel, overwrite = false, onUpload }: { value: string; accept: string; label: string; uploadingLabel: string; overwrite?: boolean; onUpload: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', accept.includes('pdf') ? 'pdf' : 'image');
      if (overwrite) fd.append('overwrite', 'true');
      const res = await admin.upload(fd);
      onUpload(res.data.url);
    } catch { /* silent */ }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
      <input value={value} onChange={(e) => onUpload(e.target.value)} className="input-field flex-1 text-xs" placeholder="https://..." />
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary text-xs shrink-0 inline-flex items-center gap-1.5 px-3 py-2">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HiUpload className="w-3.5 h-3.5" />}
        {uploading ? uploadingLabel : label}
      </button>
    </div>
  );
}

function LangSection({ form, onChange, suffix, label, flag }: { form: FormData; onChange: (k: string, v: any) => void; suffix: string; label: string; flag: string }) {
  const { t } = useTranslation();
  const titleKey = `title${suffix}`;
  const descKey = `description${suffix}`;
  const pdfKey = `pdfUrl${suffix}`;
  const coverKey = `coverImage${suffix}`;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Globe className="w-4 h-4 text-icc-500" />
        {flag} {t(label as any)}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">{t('admin.book_title')}</label>
          <input value={(form as any)[titleKey] || ''} onChange={(e) => onChange(titleKey, e.target.value)} className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t('admin.book_author')}</label>
          <input value={form.author} onChange={(e) => onChange('author', e.target.value)} className="input-field text-sm" placeholder="Author" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">{t('admin.description')}</label>
        <textarea value={(form as any)[descKey] || ''} onChange={(e) => onChange(descKey, e.target.value)} className="input-field text-sm" rows={2} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">
          <FileText className="w-3.5 h-3.5 inline mr-1 text-red-400" />
          {suffix ? t(`admin.book_pdf_${suffix.toLowerCase()}` as any) : t('admin.book_pdf')}
        </label>
        <UploadField
          value={(form as any)[pdfKey] || ''}
          accept=".pdf,application/pdf"
          label={suffix ? t(`admin.upload_pdf_${suffix.toLowerCase()}` as any) : t('admin.upload_pdf')}
          uploadingLabel={t('admin.uploading')}
          onUpload={(url) => onChange(pdfKey, url)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">
          <Image className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
          {suffix ? t(`admin.book_cover_${suffix.toLowerCase()}` as any) : t('admin.book_cover')}
        </label>
        <UploadField
          value={(form as any)[coverKey] || ''}
          accept="image/*"
          label={t('admin.upload_image')}
          uploadingLabel={t('admin.uploading')}
          onUpload={(url) => onChange(coverKey, url)}
        />
      </div>
    </div>
  );
}

export default function AdminBooks() {
  const { t } = useTranslation();
  const crud = useAdminCrud<Book>(admin.books, 'books', emptyForm);
  const [localForm, setLocalForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    catApi.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleFormChange = (key: string, value: any) => {
    setLocalForm(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'title' && !crud.editId ? { slug: slugify(value) } : {}),
    }));
  };

  const openCreate = () => {
    crud.openCreate();
    setLocalForm(emptyForm);
  };

  const openEdit = (item: Book) => {
    crud.openEdit(item, ITEM_MAPPER);
    setLocalForm(ITEM_MAPPER(item));
  };

  const handleSave = (e: React.FormEvent) => {
    crud.handleSave(e, () => ({
      ...localForm,
      categoryId: localForm.categoryId || null,
    }));
  };

  const columns = [
    {
      key: 'cover', header: t('admin.book_cover_col'),
      render: (item: Book) => item.coverImage ? (
        <img src={item.coverImage} alt={item.title} className="w-10 h-14 object-cover rounded" />
      ) : (
        <div className="w-10 h-14 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">{t('admin.no_image')}</div>
      ),
    },
    { key: 'title', header: t('admin.book_title_col'), render: (item: Book) => <span className="font-medium max-w-[200px] truncate block">{item.title}</span> },
    { key: 'author', header: t('admin.book_author_col'), render: (item: Book) => <span className="text-gray-500">{item.author || '-'}</span> },
    { key: 'category', header: t('admin.book_category_col'), render: (item: Book) => <span className="text-gray-500">{item.category?.name || '-'}</span> },
    { key: 'lessons', header: t('admin.book_lessons_col'), render: (item: Book) => item._count?.lessons ?? 0 },
    { key: 'beginner', header: t('admin.book_beginner'), render: (item: Book) => item.isBeginner ? <StatusBadge active={true} /> : '-' },
    { key: 'actions', header: '', className: 'text-right', render: (item: Book) => renderActions(item, openEdit, (id) => crud.setDeleteId(id)) },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('admin.books')}</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> {t('admin.add_book')}
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={crud.items}
        loading={crud.loading}
        searchPlaceholder={t('admin.search_books')}
        searchValue={crud.search}
        onSearchChange={(v) => { crud.setSearch(v); crud.setPage(1); }}
        page={crud.page}
        totalPages={crud.totalPages}
        onPageChange={crud.setPage}
        emptyMessage={t('admin.no_books_found')}
      />

      <AdminModal
        open={crud.modalOpen}
        onClose={() => crud.setModalOpen(false)}
        title={crud.editId ? t('admin.edit_book') : t('admin.add_book')}
        size="xl"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.book_slug')}</label>
              <input value={localForm.slug} onChange={(e) => handleFormChange('slug', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.book_category')}</label>
              <select value={localForm.categoryId} onChange={(e) => handleFormChange('categoryId', e.target.value ? parseInt(e.target.value) : '')} className="input-field">
                <option value="">{t('admin.none')}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={localForm.isBeginner} onChange={(e) => handleFormChange('isBeginner', e.target.checked)} className="w-4 h-4 rounded" />
                {t('admin.book_is_beginner')}
              </label>
            </div>
          </div>

          {/* Per-language sections */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-gray-500 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-icc-500" />
              {t('admin.book_localized')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LANGUAGES.map((l) => (
                <LangSection
                  key={l.key || 'en'}
                  form={localForm}
                  onChange={handleFormChange}
                  suffix={l.key}
                  label={l.labelKey}
                  flag={l.flag}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => crud.setModalOpen(false)} className="btn-secondary">{t('admin.cancel')}</button>
            <button type="submit" disabled={crud.saving} className="btn-primary inline-flex items-center gap-2">
              {crud.saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              {crud.editId ? t('admin.update') : t('admin.create')}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={crud.deleteId !== null}
        onClose={() => crud.setDeleteId(null)}
        onConfirm={crud.handleDelete}
        title={t('admin.delete_book')}
        entityName={t('admin.books')}
        loading={crud.deleteLoading}
      />
    </div>
  );
}
