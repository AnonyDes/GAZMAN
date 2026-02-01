# GAZ MAN - E-Commerce Application for Gas Cylinders

## Original Problem Statement
Build a full-stack e-commerce application named "GAZ MAN" for selling gas cylinders and related services in Cameroon. The UI should be premium, mobile-first, and inspired by the GOZEM app with a Dark Blue/Orange/White color scheme. All UI text must be in French, and currency must be displayed in FCFA (XAF).

## Tech Stack
- **Frontend**: React, Tailwind CSS, React Router, Axios, Shadcn UI components
- **Backend**: FastAPI (Python), Motor (async MongoDB driver), Pydantic, JWT authentication
- **Database**: MongoDB
- **Architecture**: Full-stack SPA with REST API

## What's Been Implemented

### Phase 1 - Foundation & Authentication ✅
- [x] User registration with email/password
- [x] JWT-based authentication
- [x] Login/Logout functionality
- [x] Password reset flow (mocked email)
- [x] Protected routes

### Phase 2 - Core Shopping Experience ✅
- [x] Product catalog with filters (category, brand, price)
- [x] Product search functionality
- [x] Product detail pages
- [x] Shopping cart (add, update quantity, delete)
- [x] GOZEM-style UI redesign
- [x] FCFA currency formatting

### Phase 3 - Checkout & Order Management ✅
- [x] Checkout page with delivery address and phone input
- [x] Payment method selection (MOCKED - cash, mobile money, card)
- [x] Order creation API
- [x] Order success/confirmation page
- [x] My Orders page - List all user orders with status badges
- [x] Order Details page - Full order info with tracking timeline
- [x] Profile page - User info, dynamic order stats, menu navigation

### Phase 3.5 - Polish Pass ✅
- [x] **Address Management (Mes Adresses)**: Full CRUD for delivery addresses
  - Add/Edit/Delete addresses
  - Set default address
  - Address fields: name, city, quartier, description, phone
- [x] **Checkout Integration**: Auto-fill from saved addresses, address picker
- [x] **Language Support (i18n)**: French/English toggle via LanguageContext
  - UI labels, buttons, status messages translated
  - Default language: French
- [x] **FCFA Formatting**: Verified consistent across all pages (no $, no decimals)
- [x] **Product Images**: Updated seed data with gas cylinder stock photos

### Order Status Timeline
The app supports 5 order statuses:
1. `en_attente` - Commande reçue (Order received)
2. `en_preparation` - En préparation (Being prepared)
3. `en_livraison` - En livraison (Out for delivery)
4. `livree` - Livrée (Delivered)
5. `annulee` - Annulée (Cancelled)

## Key API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |
| GET | /api/products | List products (with filters) |
| GET | /api/products/{id} | Get product details |
| GET | /api/cart | Get user's cart |
| POST | /api/cart/items | Add item to cart |
| PUT | /api/cart/items/{product_id} | Update cart item quantity |
| DELETE | /api/cart/items/{product_id} | Remove item from cart |
| POST | /api/orders | Create order from cart |
| GET | /api/orders | Get user's orders |
| GET | /api/orders/{id} | Get order details |
| GET | /api/addresses | Get user's saved addresses |
| POST | /api/addresses | Create new address |
| PUT | /api/addresses/{id} | Update address |
| DELETE | /api/addresses/{id} | Delete address |
| POST | /api/addresses/{id}/set-default | Set address as default |

## Database Schema
```
users: {id, name, email, password_hash, role, address, state, language, created_at}
products: {id, name, brand, price, stock, image_url, description, category, capacity, rating, delivery_time}
carts: {user_id, items: [{product_id, product_name, product_image, quantity, size, price}], updated_at}
orders: {id, user_id, items, subtotal, delivery_fee, total, delivery_address, phone, payment_method, status, created_at}
addresses: {id, user_id, name, city, quartier, description, phone, is_default, created_at}
```

## File Structure
```
/app/
├── backend/
│   ├── server.py          # Main API server
│   ├── models.py          # Pydantic models
│   ├── auth.py            # JWT utilities
│   ├── dependencies.py    # Auth dependencies
│   ├── seed_data.py       # Database seeding
│   └── tests/             # Pytest test files
└── frontend/
    └── src/
        ├── components/
        │   ├── BottomNav.js
        │   ├── ProtectedRoute.js
        │   └── ui/           # Shadcn components
        ├── contexts/
        │   ├── AuthContext.js
        │   └── LanguageContext.js   # i18n support
        ├── pages/
        │   ├── Homepage.js
        │   ├── ProductCatalog.js
        │   ├── ProductDetail.js
        │   ├── ShoppingCart.js
        │   ├── Checkout.js
        │   ├── OrderSuccess.js
        │   ├── MyOrders.js
        │   ├── OrderDetails.js
        │   ├── Profile.js
        │   ├── MyAddresses.js       # Address management
        │   └── (Auth pages)
        ├── utils/
        │   └── currency.js
        └── App.js
```

## Mocked Features
- **Payment Processing**: Payment methods are selectable but not integrated with real payment gateways
- **Email Notifications**: Password reset emails are not actually sent
- **Delivery Driver Data**: No real driver/delivery tracking integration

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Phase 4: Delivery Driver Application
- [ ] Phase 5: Administrator Dashboard
- [ ] Real payment integration (Orange Money, MTN Mobile Money, etc.)

### P2 - Medium Priority
- [ ] Push notifications for order status updates
- [ ] Real-time delivery tracking with maps
- [ ] User settings/preferences page

### P3 - Low Priority
- [ ] Help & Support page
- [ ] Privacy policy page
- [ ] Full product content translation (names, descriptions)

## Test Reports
- `/app/test_reports/iteration_1.json` - Cart operations testing
- `/app/test_reports/iteration_2.json` - Order management testing

## Preview URL
https://gas-cylinder-shop.preview.emergentagent.com
