import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { Users, Mail, MapPin, Calendar, Shield } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminUsers = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const t = (fr, en) => language === 'fr' ? fr : en;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
          <Shield size={12} />
          <span>Admin</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
        {t('Client', 'Customer')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('Utilisateurs', 'Users')}
        </h1>
        <p className="text-gray-600 mt-1">
          {total} {t('utilisateurs inscrits', 'registered users')}
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{getInitials(user.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                  {getRoleBadge(user.role)}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail size={14} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.address && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{user.address}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    <span>{t('Inscrit le', 'Joined')} {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('Aucun utilisateur trouvé', 'No users found')}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>{t('Note:', 'Note:')}</strong> {t('Cette page est en lecture seule. La gestion des utilisateurs (modification, suppression) n\'est pas disponible dans cette version.', 'This page is read-only. User management (edit, delete) is not available in this version.')}
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;
