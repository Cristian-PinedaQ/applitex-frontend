import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Search, Edit2, Trash2 } from 'lucide-react';
import { User, UserRole } from '../../types/users';
import { usersService } from '../../services/users.service';
import UserFormModal from './components/UserFormModal';
import { USER_FIELD_POLICY } from '../../types/sync';
import { syncEngine } from '../../lib/syncCore';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  useScrollRestoration();

  const loadUsers = async (signal?: AbortSignal, isInitial = true) => {
    if (isInitial) setLoading(true);
    const requestVersion = syncEngine.generateVersion('users:list');

    try {
      const data = await usersService.getAll(signal);
      if (!syncEngine.isVersionValid('users:list', requestVersion)) return;
      if (isInitial) setUsers(data);
      else setUsers(prev => syncEngine.mergeCollections(prev, data, USER_FIELD_POLICY));
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Error loading users:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal, true);
    return () => controller.abort();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este miembro?')) {
      try {
        await usersService.delete(id);
        loadUsers(undefined, true);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const config: Record<UserRole, { label: string; bg: string; color: string }> = {
      'ROLE_SUPER_ADMIN': { label: 'Super Admin', bg: '#7C5CFF', color: '#ffffff' },
      'ROLE_ADMIN': { label: 'Administrador', bg: '#00C2A8', color: '#ffffff' },
      'ROLE_SUPERVISOR': { label: 'Supervisor', bg: '#4DA3FF', color: '#ffffff' },
      'ROLE_OPERATOR': { label: 'Operador', bg: '#475569', color: '#ffffff' },
    };
    const c = config[role] || { label: role, bg: '#475569', color: '#ffffff' };
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: c.bg, color: c.color }}>
        {c.label}
      </span>
    );
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'ROLE_ADMIN' || u.role === 'ROLE_SUPER_ADMIN').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-[#7C5CFF] border-t-transparent animate-spin" />
        <p className="mt-4 text-slate-600 font-medium">Cargando equipo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7C5CFF] font-bold text-xs uppercase tracking-widest mb-2">
            <UsersIcon className="w-4 h-4" />
            <span>Equipo de Trabajo</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Miembros</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} miembros en el equipo</p>
        </div>
        <button
          onClick={() => { setSelectedUser(undefined); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold" style={{ color: '#7C5CFF' }}>{adminCount}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Admins</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-2xl font-bold" style={{ color: '#475569' }}>{users.length - adminCount}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Operadores</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar miembro..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C5CFF]"
        />
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-white">
              <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No se encontraron miembros</p>
            </div>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Miembro</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ingreso</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#7C5CFF' }}>
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadUsers(undefined, true)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersPage;