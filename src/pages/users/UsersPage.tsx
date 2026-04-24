import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Search, Edit2, Trash2, Mail, Calendar, Loader2 } from 'lucide-react';
import { User, UserRole } from '../../types/users';
import { usersService } from '../../services/users.service';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import UserFormModal from './components/UserFormModal';
import { SyncScope, USER_FIELD_POLICY } from '../../types/sync';
import { syncEngine } from '../../lib/syncCore';
import { useScrollRestoration } from '../../hooks/useScrollRestoration';

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(dateString));
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const navigate = useNavigate();
  useScrollRestoration();

  const currentScope: SyncScope = searchTerm ? 'users:search' : 'users:list';

  const loadUsers = async (signal?: AbortSignal, isInitial = true) => {
    if (isInitial) setLoading(true);
    else setSyncing(true);

    const requestVersion = syncEngine.generateVersion(currentScope);

    try {
      const data = await usersService.getAll(signal);

      if (!syncEngine.isVersionValid(currentScope, requestVersion)) return;

      if (isInitial) {
        setUsers(data);
      } else {
        setUsers(prev => syncEngine.mergeCollections(prev, data, USER_FIELD_POLICY));
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error('Error loading users:', error);
    } finally {
      if (syncEngine.isVersionValid(currentScope, requestVersion)) {
        if (isInitial) setLoading(false);
        else setSyncing(false);
      }
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
    if (confirm('¿Estás seguro de que deseas eliminar este miembro del equipo?')) {
      try {
        await usersService.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roles: Record<UserRole, { label: string; color: string }> = {
      'ROLE_SUPER_ADMIN': { label: 'Súper Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      'ROLE_ADMIN': { label: 'Administrador', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      'ROLE_SUPERVISOR': { label: 'Supervisor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'ROLE_OPERATOR': { label: 'Operador', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    };
    const config = roles[role] ?? { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredUsers = users.filter(
    u =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-800">
            <UsersIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Equipo</h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 font-medium text-sm">Gestiona los accesos de tu empresa.</p>
              {syncing && (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-300">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sincronizando</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => { setSelectedUser(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[22px] font-black transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="w-5 h-5" />
          Añadir Miembro
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-white dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
        <div className="relative w-full max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl">
            <Search className="w-4 h-4 text-indigo-600" />
          </div>
          <input
            type="text"
            placeholder="Nombre o email..."
            className="w-full pl-14 pr-4 py-3.5 md:py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white font-medium text-base"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white dark:bg-slate-900 rounded-[30px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sincronizando equipo...</p>
          </div>
        ) : isDesktop ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Miembro</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Alta</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border border-indigo-100 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="text-indigo-600 font-black text-lg">{user.fullName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1">{user.fullName}</p>
                        <p className="text-xs text-slate-400 font-bold tracking-tight">ID: {user.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">{getRoleBadge(user.role)}</td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 space-y-4">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => navigate(`/users/${user.id}`)}
                className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white leading-tight">{user.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleEdit(user); }}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-400 shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  {getRoleBadge(user.role)}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <Search className="w-12 h-12 opacity-20" />
            <p className="font-bold">No se encontraron miembros.</p>
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadUsers}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersPage;
