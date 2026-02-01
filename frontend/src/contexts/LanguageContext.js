import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

// Translation dictionary
const translations = {
  // Common
  'app.name': { en: 'GAZ MAN', fr: 'GAZ MAN' },
  'common.loading': { en: 'Loading...', fr: 'Chargement...' },
  'common.error': { en: 'Error', fr: 'Erreur' },
  'common.save': { en: 'Save', fr: 'Enregistrer' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler' },
  'common.delete': { en: 'Delete', fr: 'Supprimer' },
  'common.edit': { en: 'Edit', fr: 'Modifier' },
  'common.add': { en: 'Add', fr: 'Ajouter' },
  'common.back': { en: 'Back', fr: 'Retour' },
  'common.confirm': { en: 'Confirm', fr: 'Confirmer' },
  'common.yes': { en: 'Yes', fr: 'Oui' },
  'common.no': { en: 'No', fr: 'Non' },
  'common.soon': { en: 'Coming soon', fr: 'Bientôt' },
  'common.free': { en: 'Free', fr: 'Gratuit' },

  // Navigation
  'nav.home': { en: 'Home', fr: 'Accueil' },
  'nav.search': { en: 'Search', fr: 'Rechercher' },
  'nav.cart': { en: 'Cart', fr: 'Panier' },
  'nav.profile': { en: 'Profile', fr: 'Profil' },

  // Auth
  'auth.login': { en: 'Login', fr: 'Connexion' },
  'auth.register': { en: 'Sign Up', fr: 'Inscription' },
  'auth.logout': { en: 'Logout', fr: 'Se Déconnecter' },
  'auth.logout.confirm': { en: 'Are you sure you want to logout?', fr: 'Êtes-vous sûr de vouloir vous déconnecter?' },
  'auth.email': { en: 'Email Address', fr: 'Adresse Email' },
  'auth.password': { en: 'Password', fr: 'Mot de passe' },
  'auth.forgotPassword': { en: 'Forgot Password?', fr: 'Mot de passe oublié?' },
  'auth.rememberMe': { en: 'Remember me', fr: 'Se souvenir de moi' },
  'auth.welcomeBack': { en: 'Welcome back!', fr: 'Content de vous revoir!' },
  'auth.createAccount': { en: 'Create Account', fr: 'Créer un compte' },
  'auth.noAccount': { en: "Don't have an account?", fr: "Vous n'avez pas de compte?" },
  'auth.hasAccount': { en: 'Already have an account?', fr: 'Vous avez déjà un compte?' },

  // Home
  'home.welcome': { en: 'Welcome,', fr: 'Bienvenue,' },
  'home.expressDelivery': { en: 'Express Delivery', fr: 'Livraison Express' },
  'home.expressDeliveryDesc': { en: 'Your gas delivered in 15-20 minutes anywhere in Yaoundé', fr: 'Votre gaz livré en 15-20 minutes partout à Yaoundé' },
  'home.orderNow': { en: 'Order Now', fr: 'Commander Maintenant' },
  'home.serviceAvailable': { en: 'Service available', fr: 'Service disponible' },
  'home.serviceHours': { en: 'Mon - Sun, 8am - 10pm', fr: 'Lun - Dim, 8h00 - 22h00' },
  'home.open': { en: 'OPEN', fr: 'OUVERT' },
  'home.fastDelivery': { en: 'Fast delivery', fr: 'Livraison rapide' },
  'home.ourServices': { en: 'Our Services', fr: 'Nos Services' },
  'home.addDeliveryAddress': { en: 'Add a delivery address', fr: 'Ajouter une adresse de livraison' },

  // Products
  'products.title': { en: 'All Products', fr: 'Tous les Produits' },
  'products.search': { en: 'Search products...', fr: 'Rechercher des produits...' },
  'products.filters': { en: 'Filters', fr: 'Filtres' },
  'products.sort': { en: 'Sort by', fr: 'Trier par' },
  'products.category': { en: 'Category', fr: 'Catégorie' },
  'products.brand': { en: 'Brand', fr: 'Marque' },
  'products.priceRange': { en: 'Price Range (FCFA)', fr: 'Plage de Prix (FCFA)' },
  'products.allCategories': { en: 'All categories', fr: 'Toutes les catégories' },
  'products.allBrands': { en: 'All brands', fr: 'Toutes les marques' },
  'products.clearFilters': { en: 'Clear filters', fr: 'Réinitialiser les filtres' },
  'products.noResults': { en: 'No products found', fr: 'Aucun produit trouvé' },
  'products.noResultsDesc': { en: 'Try adjusting your filters or search terms', fr: 'Essayez d\'ajuster vos filtres ou termes de recherche' },
  'products.addToCart': { en: 'Add to Cart', fr: 'Ajouter au panier' },
  'products.addedToCart': { en: 'Added to cart!', fr: 'Ajouté au panier!' },
  'products.selectSize': { en: 'Select Size', fr: 'Sélectionner la Taille' },
  'products.quantity': { en: 'Quantity', fr: 'Quantité' },
  'products.description': { en: 'Description', fr: 'Description' },
  'products.details': { en: 'Product Details', fr: 'Détails du Produit' },
  'products.inStock': { en: 'In Stock', fr: 'En Stock' },
  'products.outOfStock': { en: 'Out of Stock', fr: 'Rupture de Stock' },

  // Categories
  'category.domestic': { en: 'Domestic Gas', fr: 'Gaz Domestique' },
  'category.industrial': { en: 'Industrial Gas', fr: 'Gaz Industriel' },
  'category.refill': { en: 'Refills', fr: 'Recharges' },
  'category.rental': { en: 'Rentals', fr: 'Locations' },
  'category.installation': { en: 'Installation', fr: 'Installation' },
  'category.emergency': { en: 'Emergency', fr: 'Urgence' },

  // Cart
  'cart.title': { en: 'My Cart', fr: 'Mon Panier' },
  'cart.empty': { en: 'Cart Empty', fr: 'Panier Vide' },
  'cart.emptyDesc': { en: 'You haven\'t added any products to your cart yet', fr: 'Vous n\'avez pas encore ajouté de produits à votre panier' },
  'cart.browseProducts': { en: 'Browse Products', fr: 'Parcourir les Produits' },
  'cart.subtotal': { en: 'Subtotal', fr: 'Sous-total' },
  'cart.deliveryFee': { en: 'Delivery Fee', fr: 'Frais de livraison' },
  'cart.total': { en: 'Total', fr: 'Total' },
  'cart.checkout': { en: 'Checkout', fr: 'Passer la Commande' },
  'cart.orderSummary': { en: 'Order Summary', fr: 'Résumé de la Commande' },
  'cart.freeDelivery': { en: 'Free Delivery', fr: 'Livraison Gratuite' },
  'cart.freeDeliveryInfo': { en: 'For orders over 20,000 FCFA', fr: 'Pour toute commande supérieure à 20 000 FCFA' },
  'cart.removeConfirm': { en: 'Remove this item from cart?', fr: 'Retirer cet article du panier?' },
  'cart.removeError': { en: 'Error removing item', fr: 'Erreur lors de la suppression de l\'article' },
  'cart.updateError': { en: 'Error updating quantity', fr: 'Erreur lors de la mise à jour de la quantité' },
  'cart.items': { en: 'items', fr: 'articles' },
  'cart.item': { en: 'item', fr: 'article' },

  // Checkout
  'checkout.title': { en: 'Checkout', fr: 'Paiement' },
  'checkout.deliveryInfo': { en: 'Delivery Information', fr: 'Informations de Livraison' },
  'checkout.deliveryAddress': { en: 'Delivery Address', fr: 'Adresse de Livraison' },
  'checkout.phone': { en: 'Phone Number', fr: 'Numéro de Téléphone' },
  'checkout.paymentMethod': { en: 'Payment Method', fr: 'Mode de Paiement' },
  'checkout.cash': { en: 'Cash on Delivery', fr: 'Espèces à la livraison' },
  'checkout.mobileMoney': { en: 'Mobile Money', fr: 'Mobile Money' },
  'checkout.placeOrder': { en: 'Place Order', fr: 'Confirmer la Commande' },
  'checkout.processing': { en: 'Processing...', fr: 'Traitement...' },
  'checkout.selectAddress': { en: 'Select a saved address', fr: 'Sélectionner une adresse enregistrée' },
  'checkout.newAddress': { en: 'Enter new address', fr: 'Entrer une nouvelle adresse' },

  // Orders
  'orders.title': { en: 'My Orders', fr: 'Mes Commandes' },
  'orders.empty': { en: 'No Orders', fr: 'Aucune Commande' },
  'orders.emptyDesc': { en: 'You haven\'t placed any orders yet', fr: 'Vous n\'avez pas encore passé de commande' },
  'orders.startShopping': { en: 'Start Shopping', fr: 'Commencer mes Achats' },
  'orders.order': { en: 'Order', fr: 'Commande' },
  'orders.date': { en: 'Date', fr: 'Date' },
  'orders.articles': { en: 'Articles', fr: 'Articles' },
  'orders.amount': { en: 'Amount', fr: 'Montant' },
  'orders.viewDetails': { en: 'View details', fr: 'Voir détails' },
  'orders.product': { en: 'product', fr: 'produit' },
  'orders.products': { en: 'products', fr: 'produits' },
  'orders.tracking': { en: 'Order Tracking', fr: 'Suivi de Commande' },
  'orders.inProgress': { en: 'In progress', fr: 'En cours' },

  // Order Status
  'status.en_attente': { en: 'Order Received', fr: 'Commande reçue' },
  'status.en_preparation': { en: 'Being Prepared', fr: 'En préparation' },
  'status.en_livraison': { en: 'Out for Delivery', fr: 'En livraison' },
  'status.livree': { en: 'Delivered', fr: 'Livrée' },
  'status.annulee': { en: 'Cancelled', fr: 'Annulée' },
  'status.desc.en_attente': { en: 'Your order has been confirmed', fr: 'Votre commande a été confirmée' },
  'status.desc.en_preparation': { en: 'We are preparing your order', fr: 'Nous préparons votre commande' },
  'status.desc.en_livraison': { en: 'Your order is on the way', fr: 'Votre commande est en route' },
  'status.desc.livree': { en: 'Order delivered successfully', fr: 'Commande livrée avec succès' },
  'status.cancelled': { en: 'Order Cancelled', fr: 'Commande Annulée' },
  'status.cancelledDesc': { en: 'This order has been cancelled', fr: 'Cette commande a été annulée' },

  // Order Details
  'orderDetails.title': { en: 'Order Details', fr: 'Détails Commande' },
  'orderDetails.deliveryInfo': { en: 'Delivery Information', fr: 'Informations de Livraison' },
  'orderDetails.deliveryAddress': { en: 'Delivery address', fr: 'Adresse de livraison' },
  'orderDetails.phone': { en: 'Phone', fr: 'Téléphone' },
  'orderDetails.paymentMethod': { en: 'Payment method', fr: 'Mode de paiement' },
  'orderDetails.summary': { en: 'Summary', fr: 'Récapitulatif' },
  'orderDetails.help': { en: 'Need help?', fr: 'Besoin d\'aide ?' },
  'orderDetails.helpDesc': { en: 'Contact our customer service at +237 6XX XXX XXX for any questions about your order.', fr: 'Contactez notre service client au +237 6XX XXX XXX pour toute question concernant votre commande.' },
  'orderDetails.orderNotFound': { en: 'Order not found', fr: 'Commande introuvable' },
  'orderDetails.backToOrders': { en: 'Back to orders', fr: 'Retour aux commandes' },
  'orderDetails.placedOn': { en: 'Placed on', fr: 'Passée le' },

  // Order Success
  'orderSuccess.title': { en: 'Order Confirmed!', fr: 'Commande Confirmée!' },
  'orderSuccess.thankYou': { en: 'Thank you for your order', fr: 'Merci pour votre commande' },
  'orderSuccess.message': { en: 'Your order has been placed successfully. You will receive a confirmation shortly.', fr: 'Votre commande a été passée avec succès. Vous recevrez une confirmation sous peu.' },
  'orderSuccess.orderId': { en: 'Order ID', fr: 'N° de Commande' },
  'orderSuccess.estimatedDelivery': { en: 'Estimated Delivery', fr: 'Livraison Estimée' },
  'orderSuccess.trackOrder': { en: 'Track Order', fr: 'Suivre la Commande' },
  'orderSuccess.backToHome': { en: 'Back to Home', fr: 'Retour à l\'Accueil' },

  // Profile
  'profile.title': { en: 'Profile', fr: 'Profil' },
  'profile.myOrders': { en: 'My Orders', fr: 'Mes Commandes' },
  'profile.myOrdersDesc': { en: 'View order history', fr: 'Voir l\'historique des commandes' },
  'profile.myAddresses': { en: 'My Addresses', fr: 'Mes Adresses' },
  'profile.myAddressesDesc': { en: 'Manage delivery addresses', fr: 'Gérer mes adresses de livraison' },
  'profile.settings': { en: 'Settings', fr: 'Paramètres' },
  'profile.settingsDesc': { en: 'Update my information', fr: 'Modifier mes informations' },
  'profile.help': { en: 'Help & Support', fr: 'Aide & Support' },
  'profile.helpDesc': { en: 'Help center and FAQ', fr: 'Centre d\'aide et FAQ' },
  'profile.privacy': { en: 'Privacy', fr: 'Confidentialité' },
  'profile.privacyDesc': { en: 'Privacy policy', fr: 'Politique de confidentialité' },
  'profile.stats.orders': { en: 'Orders', fr: 'Commandes' },
  'profile.stats.inProgress': { en: 'In Progress', fr: 'En cours' },
  'profile.stats.delivered': { en: 'Delivered', fr: 'Livrées' },

  // Addresses
  'addresses.title': { en: 'My Addresses', fr: 'Mes Adresses' },
  'addresses.empty': { en: 'No Addresses', fr: 'Aucune Adresse' },
  'addresses.emptyDesc': { en: 'You haven\'t saved any addresses yet', fr: 'Vous n\'avez pas encore enregistré d\'adresse' },
  'addresses.addNew': { en: 'Add New Address', fr: 'Ajouter une Adresse' },
  'addresses.edit': { en: 'Edit Address', fr: 'Modifier l\'Adresse' },
  'addresses.delete': { en: 'Delete Address', fr: 'Supprimer l\'Adresse' },
  'addresses.deleteConfirm': { en: 'Are you sure you want to delete this address?', fr: 'Êtes-vous sûr de vouloir supprimer cette adresse?' },
  'addresses.setDefault': { en: 'Set as Default', fr: 'Définir par défaut' },
  'addresses.default': { en: 'Default', fr: 'Par défaut' },
  'addresses.name': { en: 'Address Name', fr: 'Nom de l\'adresse' },
  'addresses.namePlaceholder': { en: 'e.g. Home, Office', fr: 'ex. Maison, Bureau' },
  'addresses.city': { en: 'City', fr: 'Ville' },
  'addresses.cityPlaceholder': { en: 'e.g. Yaoundé, Douala', fr: 'ex. Yaoundé, Douala' },
  'addresses.quartier': { en: 'Neighborhood', fr: 'Quartier' },
  'addresses.quartierPlaceholder': { en: 'e.g. Bastos, Bonapriso', fr: 'ex. Bastos, Bonapriso' },
  'addresses.description': { en: 'Landmark / Description', fr: 'Description / Point de repère' },
  'addresses.descriptionPlaceholder': { en: 'e.g. Near the market, red gate', fr: 'ex. Près du marché, portail rouge' },
  'addresses.phone': { en: 'Contact Phone', fr: 'Téléphone de contact' },
  'addresses.saved': { en: 'Address saved successfully', fr: 'Adresse enregistrée avec succès' },
  'addresses.deleted': { en: 'Address deleted', fr: 'Adresse supprimée' },
  'addresses.updated': { en: 'Address updated', fr: 'Adresse mise à jour' },

  // Errors
  'error.generic': { en: 'Something went wrong', fr: 'Une erreur s\'est produite' },
  'error.network': { en: 'Network error. Please try again.', fr: 'Erreur réseau. Veuillez réessayer.' },
  'error.auth': { en: 'Authentication failed', fr: 'Échec de l\'authentification' },
  'error.notFound': { en: 'Not found', fr: 'Non trouvé' },
};

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('fr'); // Default to French

  // Sync language with user preference
  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    }
  }, [user]);

  // Also check localStorage for non-logged-in users
  useEffect(() => {
    const savedLang = localStorage.getItem('gaz_man_language');
    if (savedLang && !user) {
      setLanguage(savedLang);
    }
  }, [user]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('gaz_man_language', lang);
  };

  // Translation function
  const t = (key, fallback = key) => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return fallback;
    }
    return translation[language] || translation['fr'] || fallback;
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    isEnglish: language === 'en',
    isFrench: language === 'fr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
