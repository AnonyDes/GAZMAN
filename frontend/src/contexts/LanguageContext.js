import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext(null);

// Comprehensive Translation dictionary
const translations = {
  // ===========================
  // Common / General
  // ===========================
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
  'common.close': { en: 'Close', fr: 'Fermer' },
  'common.submit': { en: 'Submit', fr: 'Soumettre' },
  'common.search': { en: 'Search', fr: 'Rechercher' },
  'common.filter': { en: 'Filter', fr: 'Filtrer' },
  'common.all': { en: 'All', fr: 'Tous' },
  'common.none': { en: 'None', fr: 'Aucun' },
  'common.or': { en: 'or', fr: 'ou' },
  'common.and': { en: 'and', fr: 'et' },

  // ===========================
  // Navigation
  // ===========================
  'nav.home': { en: 'Home', fr: 'Accueil' },
  'nav.search': { en: 'Search', fr: 'Rechercher' },
  'nav.cart': { en: 'My Cart', fr: 'Panier' },
  'nav.profile': { en: 'Profile', fr: 'Profil' },

  // ===========================
  // Authentication
  // ===========================
  'auth.login': { en: 'Login', fr: 'Connexion' },
  'auth.register': { en: 'Sign Up', fr: 'Inscription' },
  'auth.logout': { en: 'Logout', fr: 'Se Déconnecter' },
  'auth.logout.confirm': { en: 'Are you sure you want to logout?', fr: 'Êtes-vous sûr de vouloir vous déconnecter?' },
  'auth.email': { en: 'Email Address', fr: 'Adresse Email' },
  'auth.password': { en: 'Password', fr: 'Mot de passe' },
  'auth.confirmPassword': { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
  'auth.forgotPassword': { en: 'Forgot Password?', fr: 'Mot de passe oublié?' },
  'auth.rememberMe': { en: 'Remember me', fr: 'Se souvenir de moi' },
  'auth.welcomeBack': { en: 'Welcome back!', fr: 'Content de vous revoir!' },
  'auth.createAccount': { en: 'Create Account', fr: 'Créer un compte' },
  'auth.noAccount': { en: "Don't have an account?", fr: "Vous n'avez pas de compte?" },
  'auth.hasAccount': { en: 'Already have an account?', fr: 'Vous avez déjà un compte?' },
  'auth.fullName': { en: 'Full Name', fr: 'Nom complet' },
  'auth.enterEmail': { en: 'Enter your email', fr: 'Entrez votre email' },
  'auth.enterPassword': { en: 'Enter your password', fr: 'Entrez votre mot de passe' },
  'auth.loginButton': { en: 'Sign In', fr: 'Se Connecter' },
  'auth.registerButton': { en: 'Create Account', fr: 'Créer un Compte' },
  'auth.loginError': { en: 'Invalid email or password', fr: 'Email ou mot de passe incorrect' },
  'auth.registerError': { en: 'Registration failed', fr: 'Échec de l\'inscription' },

  // ===========================
  // Homepage
  // ===========================
  'home.hello': { en: 'Hello', fr: 'Bonjour' },
  'home.user': { en: 'User', fr: 'Utilisateur' },
  'home.welcome': { en: 'Welcome,', fr: 'Bienvenue,' },
  'home.whatService': { en: 'What Service Do You Want?', fr: 'Quel Service Voulez-Vous?' },
  'home.searchPlaceholder': { en: 'Search "Gas Cylinder"', fr: 'Rechercher "Bouteille de Gaz"' },
  'home.fastBites': { en: 'Fast Gas, Fast Delivery.', fr: 'Gaz Rapide, Livraison Express.' },
  'home.upTo3Times': { en: 'Up to 3 times per day', fr: 'Jusqu\'à 3 fois par jour' },
  'home.orderNow': { en: 'Order Now', fr: 'Commander' },
  'home.serviceCategories': { en: 'Service Categories', fr: 'Catégories de Services' },
  'home.seeMore': { en: 'See More', fr: 'Voir Plus' },
  'home.popularProducts': { en: 'Popular Products', fr: 'Produits Populaires' },
  'home.expressDelivery': { en: 'Express Delivery', fr: 'Livraison Express' },
  'home.expressDeliveryDesc': { en: 'Your gas delivered in 15-20 minutes anywhere in Yaoundé', fr: 'Votre gaz livré en 15-20 minutes partout à Yaoundé' },
  'home.serviceAvailable': { en: 'Service available', fr: 'Service disponible' },
  'home.serviceHours': { en: 'Mon - Sun, 8am - 10pm', fr: 'Lun - Dim, 8h00 - 22h00' },
  'home.open': { en: 'OPEN', fr: 'OUVERT' },
  'home.closed': { en: 'CLOSED', fr: 'FERMÉ' },
  'home.fastDelivery': { en: 'Fast delivery', fr: 'Livraison rapide' },
  'home.ourServices': { en: 'Our Services', fr: 'Nos Services' },
  'home.addDeliveryAddress': { en: 'Add a delivery address', fr: 'Ajouter une adresse de livraison' },
  'home.freeDelivery': { en: 'Free Delivery', fr: 'Livraison Gratuite' },
  'home.freeDeliveryDesc': { en: 'For orders over 20,000 FCFA', fr: 'Pour toute commande supérieure à 20 000 FCFA' },
  'home.specialOffer': { en: 'Special Offer', fr: 'Offre Spéciale' },
  'home.takeAdvantage': { en: 'Take advantage', fr: 'En profiter' },

  // ===========================
  // Categories
  // ===========================
  'category.domestic': { en: 'Domestic', fr: 'Domestique' },
  'category.industrial': { en: 'Industrial', fr: 'Industriel' },
  'category.refill': { en: 'Refill', fr: 'Recharge' },
  'category.rental': { en: 'Rental', fr: 'Location' },
  'category.installation': { en: 'Installation', fr: 'Installation' },
  'category.emergency': { en: 'Emergency', fr: 'Urgence' },
  'category.all': { en: 'All Categories', fr: 'Toutes les catégories' },

  // ===========================
  // Products
  // ===========================
  'products.title': { en: 'All Products', fr: 'Tous les Produits' },
  'products.search': { en: 'Search products...', fr: 'Rechercher des produits...' },
  'products.filters': { en: 'Filters', fr: 'Filtres' },
  'products.sortBy': { en: 'Sort by', fr: 'Trier par' },
  'products.sortName': { en: 'Name', fr: 'Nom' },
  'products.sortPriceAsc': { en: 'Price: Low to High', fr: 'Prix: Croissant' },
  'products.sortPriceDesc': { en: 'Price: High to Low', fr: 'Prix: Décroissant' },
  'products.sortRating': { en: 'Best Rating', fr: 'Meilleure Note' },
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
  'products.available': { en: 'available', fr: 'disponible' },
  'products.availablePlural': { en: 'available', fr: 'disponibles' },
  'products.product': { en: 'product', fr: 'produit' },
  'products.products': { en: 'products', fr: 'produits' },
  'products.min': { en: 'Min', fr: 'Min' },
  'products.max': { en: 'Max', fr: 'Max' },

  // ===========================
  // Sizes
  // ===========================
  'size.small': { en: 'Small', fr: 'Petit' },
  'size.medium': { en: 'Medium', fr: 'Moyen' },
  'size.large': { en: 'Large', fr: 'Grand' },

  // ===========================
  // Cart
  // ===========================
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

  // ===========================
  // Checkout
  // ===========================
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
  'checkout.savedAddresses': { en: 'Saved Addresses', fr: 'Adresses Enregistrées' },
  'checkout.enterAddress': { en: 'Enter delivery address', fr: 'Entrer l\'adresse de livraison' },
  'checkout.enterPhone': { en: 'Enter phone number', fr: 'Entrer le numéro de téléphone' },

  // ===========================
  // Orders
  // ===========================
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
  'orders.history': { en: 'Order History', fr: 'Historique des Commandes' },

  // ===========================
  // Order Status
  // ===========================
  'status.en_attente': { en: 'Order Received', fr: 'Commande reçue' },
  'status.en_preparation': { en: 'Being Prepared', fr: 'En préparation' },
  'status.en_livraison': { en: 'Out for Delivery', fr: 'En livraison' },
  'status.livree': { en: 'Delivered', fr: 'Livrée' },
  'status.annulee': { en: 'Cancelled', fr: 'Annulée' },
  'status.echouee': { en: 'Failed', fr: 'Échouée' },
  'status.desc.en_attente': { en: 'Your order has been confirmed', fr: 'Votre commande a été confirmée' },
  'status.desc.en_preparation': { en: 'We are preparing your order', fr: 'Nous préparons votre commande' },
  'status.desc.en_livraison': { en: 'Your order is on the way', fr: 'Votre commande est en route' },
  'status.desc.livree': { en: 'Order delivered successfully', fr: 'Commande livrée avec succès' },
  'status.cancelled': { en: 'Order Cancelled', fr: 'Commande Annulée' },
  'status.cancelledDesc': { en: 'This order has been cancelled', fr: 'Cette commande a été annulée' },

  // ===========================
  // Order Details
  // ===========================
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
  'orderDetails.items': { en: 'Items', fr: 'Articles' },

  // ===========================
  // Order Success
  // ===========================
  'orderSuccess.title': { en: 'Order Confirmed!', fr: 'Commande Confirmée!' },
  'orderSuccess.thankYou': { en: 'Thank you for your order', fr: 'Merci pour votre commande' },
  'orderSuccess.message': { en: 'Your order has been placed successfully. You will receive a confirmation shortly.', fr: 'Votre commande a été passée avec succès. Vous recevrez une confirmation sous peu.' },
  'orderSuccess.orderId': { en: 'Order ID', fr: 'N° de Commande' },
  'orderSuccess.estimatedDelivery': { en: 'Estimated Delivery', fr: 'Livraison Estimée' },
  'orderSuccess.trackOrder': { en: 'Track Order', fr: 'Suivre la Commande' },
  'orderSuccess.backToHome': { en: 'Back to Home', fr: 'Retour à l\'Accueil' },

  // ===========================
  // Profile
  // ===========================
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
  'profile.language': { en: 'Language', fr: 'Langue' },
  'profile.languageDesc': { en: 'French / English', fr: 'Français / English' },

  // ===========================
  // Addresses
  // ===========================
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

  // ===========================
  // Admin
  // ===========================
  'admin.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
  'admin.orders': { en: 'Orders', fr: 'Commandes' },
  'admin.products': { en: 'Products', fr: 'Produits' },
  'admin.users': { en: 'Users', fr: 'Utilisateurs' },
  'admin.drivers': { en: 'Drivers', fr: 'Livreurs' },
  'admin.stats': { en: 'Statistics', fr: 'Statistiques' },
  'admin.totalOrders': { en: 'Total Orders', fr: 'Total Commandes' },
  'admin.totalRevenue': { en: 'Total Revenue', fr: 'Revenu Total' },
  'admin.totalProducts': { en: 'Total Products', fr: 'Total Produits' },
  'admin.totalUsers': { en: 'Total Users', fr: 'Total Utilisateurs' },
  'admin.pendingOrders': { en: 'Pending Orders', fr: 'Commandes en Attente' },
  'admin.recentOrders': { en: 'Recent Orders', fr: 'Commandes Récentes' },
  'admin.updateStatus': { en: 'Update Status', fr: 'Mettre à jour le statut' },
  'admin.assignDriver': { en: 'Assign Driver', fr: 'Assigner un livreur' },
  'admin.selectDriver': { en: 'Select Driver', fr: 'Sélectionner un livreur' },
  'admin.noDriver': { en: '-- No driver --', fr: '-- Aucun livreur --' },
  'admin.assignThisDriver': { en: 'Assign this driver', fr: 'Assigner ce livreur' },
  'admin.removeDriver': { en: 'Remove driver', fr: 'Retirer le livreur' },
  'admin.driverAssigned': { en: 'Assigned Driver', fr: 'Livreur assigné' },
  'admin.driverAssignSuccess': { en: 'Driver assigned successfully', fr: 'Livreur assigné avec succès' },
  'admin.noDriversAvailable': { en: 'No drivers available. Create a driver account first.', fr: 'Aucun livreur disponible. Créez d\'abord un compte livreur.' },
  'admin.newProduct': { en: 'New Product', fr: 'Nouveau produit' },
  'admin.editProduct': { en: 'Edit Product', fr: 'Modifier le produit' },
  'admin.productName': { en: 'Name', fr: 'Nom' },
  'admin.productBrand': { en: 'Brand', fr: 'Marque' },
  'admin.productCategory': { en: 'Category', fr: 'Catégorie' },
  'admin.productSize': { en: 'Size', fr: 'Taille' },
  'admin.productPrice': { en: 'Price (FCFA)', fr: 'Prix (FCFA)' },
  'admin.productStock': { en: 'Stock', fr: 'Stock' },
  'admin.productCapacity': { en: 'Capacity', fr: 'Capacité' },
  'admin.productImageUrl': { en: 'Image URL', fr: 'URL de l\'image' },
  'admin.productDescription': { en: 'Description', fr: 'Description' },
  'admin.saving': { en: 'Saving...', fr: 'Sauvegarde...' },
  'admin.saveError': { en: 'Error saving', fr: 'Erreur lors de la sauvegarde' },
  'admin.deleteConfirm': { en: 'Are you sure you want to delete this?', fr: 'Êtes-vous sûr de vouloir supprimer?' },
  'admin.deleteError': { en: 'Error deleting', fr: 'Erreur lors de la suppression' },
  'admin.totalProductsCount': { en: 'total products', fr: 'produits au total' },
  'admin.noProducts': { en: 'No products found', fr: 'Aucun produit trouvé' },
  'admin.customer': { en: 'Customer', fr: 'Client' },
  'admin.delivery': { en: 'Delivery', fr: 'Livraison' },
  'admin.address': { en: 'Address', fr: 'Adresse' },
  'admin.payment': { en: 'Payment', fr: 'Paiement' },
  'admin.previewWarning': { en: 'Preview environment - Data may not be real', fr: 'Environnement de prévisualisation - Les données peuvent ne pas être réelles' },

  // ===========================
  // Driver
  // ===========================
  'driver.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
  'driver.myDeliveries': { en: 'My Deliveries', fr: 'Mes Livraisons' },
  'driver.welcome': { en: 'Welcome, driver!', fr: 'Bienvenue, livreur!' },
  'driver.totalAssigned': { en: 'Total Assigned', fr: 'Total assignées' },
  'driver.inProgress': { en: 'In Progress', fr: 'En cours' },
  'driver.delivered': { en: 'Delivered', fr: 'Livrées' },
  'driver.failed': { en: 'Failed', fr: 'Échouées' },
  'driver.totalDeliveredValue': { en: 'Total Delivered Value', fr: 'Valeur totale livrée' },
  'driver.activeDeliveries': { en: 'Active Deliveries', fr: 'Livraisons actives' },
  'driver.viewAll': { en: 'View all', fr: 'Voir tout' },
  'driver.noActiveDeliveries': { en: 'No active deliveries', fr: 'Aucune livraison active' },
  'driver.assignedDeliveries': { en: 'assigned deliveries', fr: 'livraisons assignées' },
  'driver.noDeliveriesFound': { en: 'No deliveries found', fr: 'Aucune livraison trouvée' },
  'driver.actions': { en: 'Actions', fr: 'Actions' },
  'driver.startPreparing': { en: 'Start Preparing', fr: 'Commencer préparation' },
  'driver.startDelivery': { en: 'Start Delivery', fr: 'Partir en livraison' },
  'driver.markDelivered': { en: 'Mark as Delivered', fr: 'Marquer comme livrée' },
  'driver.reportFailure': { en: 'Report Failure', fr: 'Signaler un échec' },
  'driver.failureReason': { en: 'Failure Reason', fr: 'Raison de l\'échec' },
  'driver.failureDetails': { en: 'Details (optional)', fr: 'Détails (optionnel)' },
  'driver.confirmFailure': { en: 'Confirm Failure', fr: 'Confirmer l\'échec' },
  'driver.selectReason': { en: 'Please select a reason', fr: 'Veuillez sélectionner une raison' },
  'driver.explainReason': { en: 'Explain the reason...', fr: 'Expliquez la raison...' },
  'driver.totalToCollect': { en: 'Total to Collect', fr: 'Total à collecter' },
  'driver.cashPayment': { en: 'Cash payment', fr: 'Paiement en espèces' },
  'driver.customer': { en: 'Customer', fr: 'Client' },
  'driver.backToDeliveries': { en: 'Back to deliveries', fr: 'Retour aux livraisons' },
  'driver.orderNotFound': { en: 'Order not found', fr: 'Commande non trouvée' },
  'driver.pending': { en: 'Pending', fr: 'En attente' },
  'driver.preparing': { en: 'Preparing', fr: 'Préparation' },
  'driver.delivering': { en: 'Delivering', fr: 'En livraison' },
  'driver.order': { en: 'Order', fr: 'Commande' },

  // ===========================
  // Errors
  // ===========================
  'error.generic': { en: 'Something went wrong', fr: 'Une erreur s\'est produite' },
  'error.network': { en: 'Network error. Please try again.', fr: 'Erreur réseau. Veuillez réessayer.' },
  'error.auth': { en: 'Authentication failed', fr: 'Échec de l\'authentification' },
  'error.notFound': { en: 'Not found', fr: 'Non trouvé' },
  'error.updateStatus': { en: 'Error updating status', fr: 'Erreur lors de la mise à jour' },
  'error.assignDriver': { en: 'Error assigning driver', fr: 'Erreur lors de l\'assignation' },
};

export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('gaz_man_language');
      return savedLang || 'fr';
    }
    return 'fr';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('gaz_man_language', lang);
  };

  // Translation function
  const t = (key, fallback = key) => {
    const translation = translations[key];
    if (!translation) {
      // For debugging - log missing translations
      // console.warn(`Missing translation: ${key}`);
      return fallback;
    }
    return translation[language] || translation['fr'] || fallback;
  };

  const value = {
    language,
    setLanguage,
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
