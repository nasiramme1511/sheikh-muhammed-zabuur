import { useState, useEffect } from 'react';
import { HiShieldCheck, HiUsers, HiKey, HiCheck, HiX } from 'react-icons/hi';
import api from '../../lib/api';
import { AdminModal } from '../../components/admin';
import toast from 'react-hot-toast';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissionCount: number;
}

interface Permission {
  id: number;
  action: string;
  description: string;
  module: string;
  assigned: boolean;
}

interface ModuleGroup {
  module: string;
  permissions: Permission[];
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  SUPER_ADMIN: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', label: 'SUPER_ADMIN' },
  ADMIN: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', label: 'ADMIN' },
  EDITOR: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', label: 'EDITOR' },
  CONTENT_MANAGER: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', label: 'CONTENT_MANAGER' },
  MODERATOR: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', label: 'MODERATOR' },
  USER: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', label: 'USER' },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: 'Full system access with all permissions',
  ADMIN: 'Administrative access to manage content and users',
  EDITOR: 'Can create and edit content',
  CONTENT_MANAGER: 'Manages content organization and publishing',
  MODERATOR: 'Moderates user content and comments',
  USER: 'Standard user with basic access',
};

const ROLE_ICONS: Record<string, string> = {
  SUPER_ADMIN: '\u{1F451}',
  ADMIN: '\u{1F6E1}\uFE0F',
  EDITOR: '\u270F\uFE0F',
  CONTENT_MANAGER: '\u{1F4C1}',
  MODERATOR: '\u{1F6A8}',
  USER: '\u{1F464}',
};

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ModuleGroup[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadRoles = () => {
    setLoading(true);
    setError('');
    api.get('/admin/roles')
      .then((res) => setRoles(res.data.roles ?? res.data))
      .catch(() => setError('Failed to load roles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRoles() }, []);

  const openPermissions = async (roleName: string) => {
    setSelectedRole(roleName);
    setPermLoading(true);
    try {
      const res = await api.get(`/admin/roles/${roleName}/permissions`);
      setPermissions(res.data.modules ?? res.data);
    } catch {
      toast.error('Failed to load permissions');
    } finally {
      setPermLoading(false);
    }
  };

  const togglePermission = (moduleIndex: number, permIndex: number) => {
    setPermissions((prev) => {
      const next = prev.map((m) => ({ ...m, permissions: [...m.permissions] }));
      next[moduleIndex].permissions[permIndex] = {
        ...next[moduleIndex].permissions[permIndex],
        assigned: !next[moduleIndex].permissions[permIndex].assigned,
      };
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const allPermissions = permissions.flatMap((m) =>
        m.permissions.map((p) => ({ id: p.id, assigned: p.assigned }))
      );
      await api.put(`/admin/roles/${selectedRole}/permissions`, { permissions: allPermissions });
      toast.success('Permissions updated');
      setSelectedRole(null);
      loadRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    ROLE_DESCRIPTIONS[r.name]?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <HiShieldCheck className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button onClick={loadRoles} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system roles and their permissions</p>
        </div>
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-4 py-2 text-sm w-full"
          />
        </div>
      </div>

      {filteredRoles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          No roles found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => {
            const colors = ROLE_COLORS[role.name] || ROLE_COLORS.USER;
            return (
              <div
                key={role.name}
                className={`rounded-2xl ${colors.bg} ${colors.border} border p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
                onClick={() => openPermissions(role.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm">
                      {ROLE_ICONS[role.name] || '\u{1F6E1}\uFE0F'}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${colors.text}`}>{role.name.replace(/_/g, ' ')}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {ROLE_DESCRIPTIONS[role.name] || role.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-inherit">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <HiUsers className="w-4 h-4" />
                    <span className="font-semibold">{role.userCount ?? 0}</span>
                    <span className="text-xs">users</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <HiKey className="w-4 h-4" />
                    <span className="font-semibold">{role.permissionCount ?? 0}</span>
                    <span className="text-xs">permissions</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminModal
        open={selectedRole !== null}
        onClose={() => setSelectedRole(null)}
        title={`Permissions — ${selectedRole?.replace(/_/g, ' ')}`}
        size="xl"
      >
        {permLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No permissions configured</div>
        ) : (
          <div className="p-6 space-y-6">
            {permissions.map((group, mi) => (
              <div key={group.module}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HiShieldCheck className="w-4 h-4 text-emerald-500" />
                  {group.module}
                </h3>
                <div className="space-y-2">
                  {group.permissions.map((perm, pi) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          perm.assigned
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        onClick={() => togglePermission(mi, pi)}
                      >
                        {perm.assigned && <HiCheck className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{perm.action}</p>
                        <p className="text-xs text-gray-500 truncate">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setSelectedRole(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSavePermissions} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                Save Permissions
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
