import { useState, useEffect, useRef } from 'react';
import { HiPlus, HiFilter, HiUpload } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
import { admin, categories as catApi, teachers as teachersApi, books as booksApi } from '../../lib/api';
import { Lesson, Category, Teacher, Book } from '../../types';
import { AdminTable, AdminModal, ConfirmDeleteModal, LocalizedFields, useAdminCrud } from '../../components/admin';
import { slugify, renderActions, formatDuration, StatusBadge } from '../../components/admin/helpers';

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
  audioUrl: string;
  videoUrl: string;
  pdfUrl: string;
  duration: number;
  episodeNumber: number;
  categoryId: number | '';
  teacherId: number | '';
  bookId: number | '';
  isBeginner: boolean;
  published: boolean;
}

function UploadField({
  value, accept, label, uploadingLabel, overwrite = false, onUpload,
}: {
  value: string;
  accept: string;
  label: string;
  uploadingLabel: string;
  overwrite?: boolean;
  onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (overwrite) fd.append('overwrite', 'true');
      const res = await admin.upload(fd);
      onUpload(res.data.url);
    } catch { /* silent */ }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onUpload(e.target.value)}
        className="input-field flex-1 text-xs"
        placeholder="https://..."
      />
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary text-xs shrink-0 inline-flex items-center gap-1.5 px-3 py-2"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HiUpload className="w-3.5 h-3.5" />}
        {uploading ? uploadingLabel : label}
      </button>
    </div>
  );
}

const emptyForm: FormData = {
  title: '', titleAmharic: '', titleArabic: '', titleOromic: '',
  slug: '',
  description: '', descriptionAmharic: '', descriptionArabic: '', descriptionOromic: '',
  audioUrl: '', videoUrl: '', pdfUrl: '',
  duration: 0, episodeNumber: 0,
  categoryId: '', teacherId: '', bookId: '',
  isBeginner: false, published: true,
};

const ITEM_MAPPER = (item: Lesson): FormData => ({
  title: item.title || '',
  titleAmharic: item.titleAmharic || '',
  titleArabic: item.titleArabic || '',
  titleOromic: item.titleOromic || '',
  slug: item.slug || '',
  description: item.description || '',
  descriptionAmharic: item.descriptionAmharic || '',
  descriptionArabic: item.descriptionArabic || '',
  descriptionOromic: item.descriptionOromic || '',
  audioUrl: item.audioUrl || '',
  videoUrl: (item as any).videoUrl || '',
  pdfUrl: item.pdfUrl || '',
  duration: item.duration ?? 0,
  episodeNumber: item.episodeNumber ?? 0,
  categoryId: item.categoryId ?? '',
  teacherId: item.teacherId ?? '',
  bookId: item.bookId ?? '',
  isBeginner: item.isBeginner,
  published: item.published,
});

export default function AdminLessons() {
  const crud = useAdminCrud<Lesson>(admin.lessons, 'lessons', emptyForm);
  const [localForm, setLocalForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterPublished, setFilterPublished] = useState('');

  useEffect(() => {
    catApi.getAll().then((r) => setCategories(r.data)).catch(() => {});
    teachersApi.getAll().then((r) => setTeachers(r.data)).catch(() => {});
    booksApi.getAll().then((r) => setBooks(r.data)).catch(() => {});
  }, []);

  // Override load to include filters
  const loadWithFilters = () => {
    crud.setLoading(true);
    const params: any = { search: crud.search, page: crud.page, limit: 10 };
    if (filterCategory) params.categoryId = filterCategory;
    if (filterTeacher) params.teacherId = filterTeacher;
    if (filterPublished !== '') params.published = filterPublished;
    admin.lessons.getAll(params)
      .then((res) => {
        crud.setItems(res.data.items ?? res.data);
        crud.setTotalPages(res.data.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => crud.setLoading(false));
  };

  useEffect(() => { loadWithFilters(); }, [crud.search, crud.page, filterCategory, filterTeacher, filterPublished]);

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

  const openEdit = (item: Lesson) => {
    crud.openEdit(item, ITEM_MAPPER);
    setLocalForm(ITEM_MAPPER(item));
  };

  const handleSave = (e: React.FormEvent) => {
    crud.handleSave(e, () => ({
      ...localForm,
      categoryId: localForm.categoryId || null,
      teacherId: localForm.teacherId || null,
      bookId: localForm.bookId || null,
    }));
  };

  const columns = [
    { key: 'title', header: 'Title', render: (item: Lesson) => <span className="font-medium max-w-[200px] truncate block">{item.title}</span> },
    { key: 'teacher', header: 'Teacher', render: (item: Lesson) => <span className="text-gray-500">{item.teacher?.name || '-'}</span> },
    { key: 'category', header: 'Category', render: (item: Lesson) => <span className="text-gray-500">{item.category?.name || '-'}</span> },
    { key: 'duration', header: 'Duration', render: (item: Lesson) => formatDuration(item.duration) },
    { key: 'episode', header: 'Ep.', render: (item: Lesson) => item.episodeNumber || '-' },
    { key: 'status', header: 'Status', render: (item: Lesson) => item.published ? <StatusBadge active={true} labelOn="Published" labelOff="Draft" /> : <StatusBadge active={false} labelOn="Published" labelOff="Draft" colorOn="green" colorOff="yellow" /> },
    { key: 'date', header: 'Date', render: (item: Lesson) => <span className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span> },
    { key: 'actions', header: '', className: 'text-right', render: (item: Lesson) => renderActions(item, openEdit, (id) => crud.setDeleteId(id)) },
  ];

  const filterControls = (
    <>
      <HiFilter className="w-4 h-4 text-gray-400" />
      <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); crud.setPage(1); }} className="input-field py-2 text-sm w-auto">
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={filterTeacher} onChange={(e) => { setFilterTeacher(e.target.value); crud.setPage(1); }} className="input-field py-2 text-sm w-auto">
        <option value="">All Teachers</option>
        {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select value={filterPublished} onChange={(e) => { setFilterPublished(e.target.value); crud.setPage(1); }} className="input-field py-2 text-sm w-auto">
        <option value="">All Status</option>
        <option value="true">Published</option>
        <option value="false">Draft</option>
      </select>
    </>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> Add Lesson
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={crud.items}
        loading={crud.loading}
        searchPlaceholder="Search lessons..."
        searchValue={crud.search}
        onSearchChange={(v) => { crud.setSearch(v); crud.setPage(1); }}
        page={crud.page}
        totalPages={crud.totalPages}
        onPageChange={crud.setPage}
        emptyMessage="No lessons found"
        extraFilters={filterControls}
      />

      <AdminModal
        open={crud.modalOpen}
        onClose={() => crud.setModalOpen(false)}
        title={crud.editId ? 'Edit Lesson' : 'Add Lesson'}
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocalizedFields
              fields={[{ key: 'title', label: 'Title', placeholder: 'Title' }]}
              form={localForm}
              onChange={handleFormChange}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input value={localForm.slug} onChange={(e) => handleFormChange('slug', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
              <input type="number" value={localForm.duration} onChange={(e) => handleFormChange('duration', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Episode Number</label>
              <input type="number" value={localForm.episodeNumber} onChange={(e) => handleFormChange('episodeNumber', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={localForm.categoryId} onChange={(e) => handleFormChange('categoryId', e.target.value ? parseInt(e.target.value) : '')} className="input-field">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teacher</label>
              <select value={localForm.teacherId} onChange={(e) => handleFormChange('teacherId', e.target.value ? parseInt(e.target.value) : '')} className="input-field">
                <option value="">None</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Book</label>
              <select value={localForm.bookId} onChange={(e) => handleFormChange('bookId', e.target.value ? parseInt(e.target.value) : '')} className="input-field">
                <option value="">None</option>
                {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
          </div>

          <LocalizedFields
            fields={[{ key: 'description', label: 'Description', type: 'textarea', rows: 2, placeholder: 'Description' }]}
            form={localForm}
            onChange={handleFormChange}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Audio URL</label>
            <UploadField
              value={localForm.audioUrl}
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac"
              label="Upload Audio"
              uploadingLabel="Uploading..."
              overwrite={false}
              onUpload={(url) => handleFormChange('audioUrl', url)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video URL</label>
            <UploadField
              value={localForm.videoUrl}
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              label="Upload Video"
              uploadingLabel="Uploading..."
              overwrite={false}
              onUpload={(url) => handleFormChange('videoUrl', url)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PDF URL</label>
            <UploadField
              value={localForm.pdfUrl}
              accept=".pdf,application/pdf"
              label="Upload PDF"
              uploadingLabel="Uploading..."
              overwrite={false}
              onUpload={(url) => handleFormChange('pdfUrl', url)}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isBeginner" checked={localForm.isBeginner} onChange={(e) => handleFormChange('isBeginner', e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="isBeginner" className="text-sm font-medium">Beginner</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={localForm.published} onChange={(e) => handleFormChange('published', e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="published" className="text-sm font-medium">Published</label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => crud.setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={crud.saving} className="btn-primary inline-flex items-center gap-2">
              {crud.saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              {crud.editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDeleteModal
        open={crud.deleteId !== null}
        onClose={() => crud.setDeleteId(null)}
        onConfirm={crud.handleDelete}
        title="Delete Lesson"
        entityName="Lesson"
        loading={crud.deleteLoading}
      />
    </div>
  );
}
