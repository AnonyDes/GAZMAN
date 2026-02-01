import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DriverOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { language } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [failureDetails, setFailureDetails] = useState('');
  const [failureReasons, setFailureReasons] = useState([]);

  const t = (fr, en) => language === 'fr' ? fr : en;

  useEffect(() => {
    fetchOrder();
    fetchFailureReasons();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/driver/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFailureReasons = async () => {
    try {
      const response = await axios.get(`${API}/driver/failure-reasons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFailureReasons(response.data.reasons);
    } catch (error) {
      console.error('Error fetching failure reasons:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const updateStatus = async (newStatus) => {
    if (newStatus === 'echouee') {
      setShowFailureModal(true);
      return;
    }
    
    setUpdating(true);
    try {
      await axios.put(
        `${API}/driver/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      const message = error.response?.data?.detail || t('Erreur lors de la mise à jour', 'Error updating status');
      alert(message);
    } finally {
      setUpdating(false);
    }
  };

  const submitFailure = async () => {
    if (!failureReason) {
      alert(t('Veuillez sélectionner une raison', 'Please select a reason'));
      return;
    }
    
    setUpdating(true);
    try {
      await axios.put(
        `${API}/driver/orders/${orderId}/status`,
        { 
          status: 'echouee',
          failure_reason: failureReason,
          failure_details: failureReason === 'autre' ? failureDetails : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(prev => ({ 
        ...prev, 
        status: 'echouee',
        failure_reason: failureReason,
        failure_details: failureDetails
      }));
      setShowFailureModal(false);
    } catch (error) {
      console.error('Error submitting failure:', error);
      const message = error.response?.data?.detail || t('Erreur lors de la mise à jour', 'Error updating status');
      alert(message);
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = () => {
    const transitions = {
      en_attente: { next: 'en_preparation', label: t('Commencer préparation', 'Start Preparing'), icon: Clock },
      en_preparation: { next: 'en_livraison', label: t('Partir en livraison', 'Start Delivery'), icon: Truck },
      en_livraison: { next: 'livree', label: t('Marquer comme livrée', 'Mark as Delivered'), icon: CheckCircle },
    };
    return transitions[order?.status];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('En attente', 'Pending') },
      en_preparation: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('En préparation', 'Preparing') },
      en_livraison: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('En livraison', 'Delivering') },
      livree: { bg: 'bg-green-100', text: 'text-green-800', label: t('Livrée', 'Delivered') },
      echouee: { bg: 'bg-red-100', text: 'text-red-800', label: t('Échouée', 'Failed') }
    };
    const config = statusConfig[status] || statusConfig.en_attente;
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('Commande non trouvée', 'Order not found')}</p>
        <button
          onClick={() => navigate('/driver/orders')}
          className="mt-4 text-green-600 hover:text-green-700 font-medium"
        >
          {t('Retour aux livraisons', 'Back to deliveries')}
        </button>
      </div>
    );
  }

  const nextAction = getNextStatus();
  const canFail = order.status === 'en_livraison';
  const isCompleted = ['livree', 'echouee'].includes(order.status);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/driver/orders')}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Commande', 'Order')} #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-600">{formatDate(order.created_at)}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Actions */}
          {!isCompleted && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('Actions', 'Actions')}
              </h2>
              <div className="space-y-3">
                {nextAction && (
                  <button
                    onClick={() => updateStatus(nextAction.next)}
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <nextAction.icon size={20} />
                    <span>{nextAction.label}</span>
                  </button>
                )}
                {canFail && (
                  <button
                    onClick={() => setShowFailureModal(true)}
                    disabled={updating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    <span>{t('Signaler un échec', 'Report Failure')}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Failure Info */}
          {order.status === 'echouee' && order.failure_reason && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800">{t('Raison de l\'échec', 'Failure Reason')}</h3>
                  <p className="text-red-700 mt-1">
                    {failureReasons.find(r => r.code === order.failure_reason)?.[language] || order.failure_reason}
                  </p>
                  {order.failure_details && (
                    <p className="text-red-600 mt-2 text-sm">{order.failure_details}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Articles', 'Items')} ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {item.size?.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">×{item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{t('Total à collecter', 'Total to Collect')}</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(order.total)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {order.payment_method === 'cash' 
                  ? t('Paiement en espèces', 'Cash payment')
                  : 'Mobile Money'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Client', 'Customer')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.customer?.name}</p>
                  <p className="text-sm text-gray-500">{order.customer?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Livraison', 'Delivery')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('Adresse', 'Address')}</p>
                  <p className="font-medium text-gray-900">{order.delivery_address}</p>
                </div>
              </div>
              <a 
                href={`tel:${order.phone}`}
                className="flex items-start space-x-3 hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('Téléphone', 'Phone')}</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Modal */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <XCircle size={24} className="text-red-500" />
                <span>{t('Signaler un échec', 'Report Failure')}</span>
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Raison de l\'échec', 'Failure Reason')} *
                </label>
                <div className="space-y-2">
                  {failureReasons.map((reason) => (
                    <button
                      key={reason.code}
                      onClick={() => setFailureReason(reason.code)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        failureReason === reason.code
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{reason[language]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {failureReason === 'autre' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Détails (optionnel)', 'Details (optional)')}
                  </label>
                  <textarea
                    value={failureDetails}
                    onChange={(e) => setFailureDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    placeholder={t('Expliquez la raison...', 'Explain the reason...')}
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowFailureModal(false);
                  setFailureReason('');
                  setFailureDetails('');
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {t('Annuler', 'Cancel')}
              </button>
              <button
                onClick={submitFailure}
                disabled={updating || !failureReason}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {updating ? t('Envoi...', 'Submitting...') : t('Confirmer l\'échec', 'Confirm Failure')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverOrderDetails;
