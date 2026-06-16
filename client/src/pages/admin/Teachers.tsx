import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import { admin } from '../../lib/api';
import { Teacher } from '../../types';
import { AdminTable, AdminModal, ConfirmDeleteModal, LocalizedFields, useAdminCrud } from '../../components/admin';
import { slugify, renderActions } from '../../components/admin/helpers';

interface FormData {
  name: string;
  nameAmharic: string;
  nameArabic: string;
  nameOromic: string;
  slug: string;
  bio: string;
  bioAmharic: string;
  bioArabic: string;
  bioOromic: string;
  image: string;
  telegram: string;
  youtube: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  whatsapp: string;
  website: string;
  languages: string;
  specialties: string;
  education: string;
  verified: boolean;
  featured: boolean;
  studentsCount: number;
}

const emptyForm: FormData = {
  name: '', nameAmharic: '', nameArabic: '', nameOromic: '',
  slug: '',
  bio: '', bioAmharic: '', bioArabic: '', bioOromic: '',
  image: '',
  telegram: '', youtube: '', facebook: '', instagram: '', tiktok: '', twitter: '', whatsapp: '',
  website: '', languages: '', specialties: '', education: '',
  verified: false, featured: false, studentsCount: 0,
};

const ITEM_MAPPER = (item: Teacher): FormData => ({
  name: item.name || '',
  nameAmharic: item.nameAmharic || '',
  nameArabic: item.nameArabic || '',
  nameOromic: item.nameOromic || '',
  slug: item.slug || '',
  bio: item.bio || '',
  bioAmharic: item.bioAmharic || '',
  bioArabic: item.bioArabic || '',
  bioOromic: item.bioOromic || '',
  image: item.image || '',
  telegram: item.telegram || '',
  youtube: item.youtube || '',
  facebook: item.facebook || '',
  instagram: item.instagram || '',
  tiktok: item.tiktok || '',
  twitter: item.twitter || '',
  whatsapp: item.whatsapp || '',
  website: item.website || '',
  languages: item.languages || '',
  specialties: item.specialties || '',
  education: item.education || '',
  verified: item.verified ?? false,
  featured: item.featured ?? false,
  studentsCount: item.studentsCount ?? 0,
});

const SOCIAL_FIELDS = [
  { key: 'telegram', label: 'Telegram URL', placeholder: 'https://t.me/...' },
  { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/...' },
  { key: 'twitter', label: 'Twitter URL', placeholder: 'https://twitter.com/...' },
  { key: 'whatsapp', label: 'WhatsApp URL', placeholder: 'https://wa.me/...' },
];

export default function AdminTeachers() {
  const crud = useAdminCrud<Teacher>(admin.teachers, 'teachers', emptyForm);
  const [localForm, setLocalForm] = useState<FormData>(emptyForm);

  const handleFormChange = (key: string, value: any) => {
    setLocalForm(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'name' && !crud.editId ? { slug: slugify(value) } : {}),
    }));
  };

  const openCreate = () => {
    crud.openCreate();
    setLocalForm(emptyForm);
  };

  const openEdit = (item: Teacher) => {
    crud.openEdit(item, ITEM_MAPPER);
    setLocalForm(ITEM_MAPPER(item));
  };

  const handleSave = (e: React.FormEvent) => {
    crud.handleSave(e, () => localForm);
  };

  const columns = [
    {
      key: 'image', header: 'Image',
      render: (item: Teacher) => item.image ? (
        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600">
          {item.name.charAt(0)}
        </div>
      ),
    },
    { key: 'name', header: 'Name', render: (item: Teacher) => <span className="font-medium">{item.name}</span> },
    { key: 'slug', header: 'Slug', render: (item: Teacher) => <span className="text-gray-500">{item.slug}</span> },
    { key: 'lessons', header: 'Lessons', render: (item: Teacher) => item._count?.lessons ?? 0 },
    { key: 'actions', header: '', className: 'text-right', render: (item: Teacher) => renderActions(item, openEdit, (id) => crud.setDeleteId(id)) },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> Add Teacher
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={crud.items}
        loading={crud.loading}
        searchPlaceholder="Search teachers..."
        searchValue={crud.search}
        onSearchChange={(v) => { crud.setSearch(v); crud.setPage(1); }}
        page={crud.page}
        totalPages={crud.totalPages}
        onPageChange={crud.setPage}
        emptyMessage="No teachers found"
      />

      <AdminModal
        open={crud.modalOpen}
        onClose={() => crud.setModalOpen(false)}
        title={crud.editId ? 'Edit Teacher' : 'Add Teacher'}
        size="xl"
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocalizedFields
              fields={[{ key: 'name', label: 'Name', placeholder: 'Name' }]}
              form={localForm}
              onChange={handleFormChange}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input value={localForm.slug} onChange={(e) => handleFormChange('slug', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input value={localForm.image} onChange={(e) => handleFormChange('image', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Languages</label>
              <input value={localForm.languages} onChange={(e) => handleFormChange('languages', e.target.value)} className="input-field" placeholder="Afaan Oromo, Arabic" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specialties</label>
              <input value={localForm.specialties} onChange={(e) => handleFormChange('specialties', e.target.value)} className="input-field" placeholder="Tafsir, Fiqh, Hadith" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Education</label>
              <input value={localForm.education} onChange={(e) => handleFormChange('education', e.target.value)} className="input-field" placeholder="Islamic University of Madinah" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input value={localForm.website} onChange={(e) => handleFormChange('website', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Students Count</label>
              <input type="number" value={localForm.studentsCount} onChange={(e) => handleFormChange('studentsCount', Number(e.target.value))} className="input-field" />
            </div>
            <div className="flex items-end gap-4 pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={localForm.verified} onChange={(e) => handleFormChange('verified', e.target.checked)} className="rounded" />
                Verified
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={localForm.featured} onChange={(e) => handleFormChange('featured', e.target.checked)} className="rounded" />
                Featured
              </label>
            </div>
          </div>

          <LocalizedFields
            fields={[{ key: 'bio', label: 'Bio', type: 'textarea', rows: 3, placeholder: 'Bio' }]}
            form={localForm}
            onChange={handleFormChange}
          />

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Social Media Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <input
                    value={(localForm as any)[field.key] || ''}
                    onChange={(e) => handleFormChange(field.key, e.target.value)}
                    className="input-field"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
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
        title="Delete Teacher"
        entityName="Teacher"
        loading={crud.deleteLoading}
      />
    </div>
  );
}
