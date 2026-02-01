import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Homepage from '@/pages/Homepage';
import ProductCatalog from '@/pages/ProductCatalog';
import ProductDetail from '@/pages/ProductDetail';
import ShoppingCart from '@/pages/ShoppingCart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import MyOrders from '@/pages/MyOrders';
import OrderDetails from '@/pages/OrderDetails';
import Profile from '@/pages/Profile';
import MyAddresses from '@/pages/MyAddresses';
// Admin Pages
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetails from '@/pages/admin/AdminOrderDetails';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminUsers from '@/pages/admin/AdminUsers';
import '@/App.css';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Homepage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductCatalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:productId"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <ShoppingCart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success/:orderId"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addresses"
              element={
                <ProtectedRoute>
                  <MyAddresses />
                </ProtectedRoute>
              }
            />
            
            {/* Default route - redirect to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
