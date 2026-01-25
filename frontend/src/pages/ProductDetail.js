import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${productId}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await axios.post(
        `${API}/cart/items`,
        {
          product_id: productId,
          quantity: quantity,
          size: selectedSize
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/cart');
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-600 mb-4">Product not found</p>
        <button
          onClick={() => navigate('/products')}
          className="text-orange-500 font-semibold"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Product Details</h1>
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="cart-icon"
          >
            <ShoppingCart size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✓ Added to cart!
        </div>
      )}

      {/* Product Image */}
      <div className="bg-white">
        <div className="aspect-square bg-gray-100 flex items-center justify-center p-8">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
            data-testid="product-image"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white mt-2 px-4 py-6">
        {/* Brand Badge */}
        <div className="inline-block bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          {product.brand}
        </div>

        {/* Product Name */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="product-name">
          {product.name}
        </h2>

        {/* Capacity */}
        <p className="text-gray-600 mb-4">{product.capacity}</p>

        {/* Rating & Delivery Time */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <Star size={18} className="text-yellow-400 fill-current" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-gray-500 text-sm">(125 reviews)</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock size={18} />
            <span className="text-sm">{product.delivery_time}</span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Price</p>
          <p className="text-3xl font-bold text-orange-600" data-testid="product-price">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Size</h3>
          <div className="flex space-x-3">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`size-${size}`}
              >
                {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedSize === 'small' && 'Perfect for small households'}
            {selectedSize === 'medium' && 'Standard size for regular use'}
            {selectedSize === 'large' && 'Large capacity for extended use'}
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 flex items-center justify-center transition-colors"
              data-testid="decrease-quantity"
            >
              <Minus size={20} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-gray-900" data-testid="quantity-display">
                {quantity}
              </span>
            </div>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
              className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300 flex items-center justify-center transition-colors"
              data-testid="increase-quantity"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Stock Info */}
        {product.stock < 10 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-700 text-sm font-medium">
              ⚠️ Only {product.stock} items left in stock!
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar - Total & Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600">Total Price</p>
            <p className="text-2xl font-bold text-gray-900" data-testid="total-price">
              {formatCurrency(calculateTotal())}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            data-testid="add-to-cart-button"
          >
            <ShoppingCart size={20} />
            <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Bottom spacing to prevent content hiding under fixed bar */}
      <div className="h-24"></div>
    </div>
  );
};

export default ProductDetail;
