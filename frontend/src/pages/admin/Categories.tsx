import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import { admin } from '../../lib/api';
import { Category } from '../../types';
import { AdminTable, AdminModal, ConfirmDeleteModal, LocalizedFields, useAdminCrud } from '../../components/admin';
import { slugify, renderActions, StatusBadge } from '../../components/admin/helpers';

interface FormData {
  name: string;
  nameAmharic: string;
  nameArabic: string;
  nameOromic: string;
  slug: string;
  description: string;
  descriptionAmharic: string;
  descriptionArabic: string;
  descriptionOromic: string;
  icon: string;
  color: string;
  order: number;
  isBeginner: boolean;
}

const emptyForm: FormData = {
  name: '', nameAmharic: '', nameArabic: '', nameOromic: '',
  slug: '',
  description: '', descriptionAmharic: '', descriptionArabic: '', descriptionOromic: '',
  icon: '\u{1F4DA}', color: '#1d4ed8', order: 0, isBeginner: false,
};

const EMOJIS = ['\u{1F4DA}', '\u{1F4D6}', '\u{1F54C}', '\u{262A}', '\u{1F932}', '\u{1F4FF}', '\u{1F31F}', '\u{1F48E}', '\u{1F319}', '\u{2728}', '\u{1F4DC}', '\u{1F516}', '\u{1F3AF}', '\u{1F4A1}', '\u{1F3B5}', '\u{1F5E3}'];

const ITEM_MAPPER = (item: Category): FormData => ({
  name: item.name || '',
  nameAmharic: item.nameAmharic || '',
  nameArabic: item.nameArabic || '',
  nameOromic: item.nameOromic || '',
  slug: item.slug || '',
  description: item.description || '',
  descriptionAmharic: item.descriptionAmharic || '',
  descriptionArabic: item.descriptionArabic || '',
  descriptionOromic: item.descriptionOromic || '',
  icon: item.icon || '\u{1F4DA}',
  color: item.color || '#1d4ed8',
  order: item.order ?? 0,
  isBeginner: item.isBeginner,
});

export default function AdminCategories() {
  const crud = useAdminCrud<Category>(admin.categories, 'categories', emptyForm);
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

  const openEdit = (item: Category) => {
    crud.openEdit(item, ITEM_MAPPER);
    setLocalForm(ITEM_MAPPER(item));
  };

  const handleSave = (e: React.FormEvent) => {
    crud.handleSave(e, () => localForm);
  };

  const columns = [
    { key: 'icon', header: 'Icon', render: (item: Category) => <span className="text-xl">{item.icon || '\u{1F4DA}'}</span> },
    { key: 'name', header: 'Name', render: (item: Category) => <span className="font-medium">{item.name}</span> },
    { key: 'slug', header: 'Slug', render: (item: Category) => <span className="text-gray-500">{item.slug}</span> },
    { key: 'order', header: 'Order' },
    { key: 'lessons', header: 'Lessons', render: (item: Category) => item._count?.lessons ?? 0 },
    { key: 'books', header: 'Books', render: (item: Category) => item._count?.books ?? 0 },
    { key: 'beginner', header: 'Beginner', render: (item: Category) => item.isBeginner ? <StatusBadge active={true} /> : '-' },
    { key: 'actions', header: '', className: 'text-right', render: (item: Category) => renderActions(item, openEdit, (id) => crud.setDeleteId(id)) },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <HiPlus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={crud.items}
        loading={crud.loading}
        searchPlaceholder="Search categories..."
        searchValue={crud.search}
        onSearchChange={(v) => { crud.setSearch(v); crud.setPage(1); }}
        page={crud.page}
        totalPages={crud.totalPages}
        onPageChange={crud.setPage}
        emptyMessage="No categories found"
      />

      <AdminModal
        open={crud.modalOpen}
        onClose={() => crud.setModalOpen(false)}
        title={crud.editId ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocalizedFields
              fields={[
                { key: 'name', label: 'Name', placeholder: 'Name' },
              ]}
              form={localForm}
              onChange={handleFormChange}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input value={localForm.slug} onChange={(e) => handleFormChange('slug', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input type="number" value={localForm.order} onChange={(e) => handleFormChange('order', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
          </div>

          <LocalizedFields
            fields={[
              { key: 'description', label: 'Description', type: 'textarea', rows: 2, placeholder: 'Description' },
            ]}
            form={localForm}
            onChange={handleFormChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji} type="button"
                    onClick={() => handleFormChange('icon', emoji)}
                    className={'w-9 h-9 flex items-center justify-center rounded-lg text-lg border-2 transition-all ' + (localForm.icon === emoji ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400')}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input value={localForm.icon} onChange={(e) => handleFormChange('icon', e.target.value)} className="input-field text-sm" placeholder="Or type emoji" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={localForm.color} onChange={(e) => handleFormChange('color', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
                <input value={localForm.color} onChange={(e) => handleFormChange('color', e.target.value)} className="input-field text-sm flex-1" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isBeginner" checked={localForm.isBeginner} onChange={(e) => handleFormChange('isBeginner', e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="isBeginner" className="text-sm font-medium">Beginner Category</label>
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
        title="Delete Category"
        entityName="Category"
        loading={crud.deleteLoading}
      />
    </div>
  );
}
