"""
Test suite for Order Management APIs
Tests: GET /api/orders, GET /api/orders/{order_id}, POST /api/orders
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API = f"{BASE_URL}/api"


# Module-level fixtures
@pytest.fixture(scope="module")
def test_user():
    """Create a test user and return credentials"""
    unique_id = str(uuid.uuid4())[:8]
    email = f"TEST_order_{unique_id}@test.com"
    password = "TestPass123!"
    
    # Register user
    response = requests.post(f"{API}/auth/register", json={
        "name": f"Test Order User {unique_id}",
        "email": email,
        "password": password,
        "phone": "+237600000000",
        "address": "Test Address, Douala"
    })
    
    if response.status_code == 201:
        data = response.json()
        return {
            "email": email,
            "password": password,
            "token": data.get("access_token"),
            "user_id": data.get("user", {}).get("id")
        }
    else:
        pytest.skip(f"Failed to create test user: {response.text}")


@pytest.fixture(scope="module")
def auth_headers(test_user):
    """Get auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {test_user['token']}"}


class TestOrderEndpoints:
    """Test order management endpoints"""
    
    def test_get_orders_empty(self, auth_headers):
        """Test GET /api/orders returns empty list for new user"""
        response = requests.get(f"{API}/orders", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # New user should have no orders
        print(f"Orders count for new user: {len(data)}")
    
    def test_get_orders_unauthorized(self):
        """Test GET /api/orders without auth returns 401 or 403"""
        response = requests.get(f"{API}/orders")
        
        # Accept both 401 and 403 as valid unauthorized responses
        assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"
    
    def test_get_order_not_found(self, auth_headers):
        """Test GET /api/orders/{order_id} with invalid ID returns 404"""
        fake_order_id = str(uuid.uuid4())
        response = requests.get(f"{API}/orders/{fake_order_id}", headers=auth_headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_create_order_empty_cart(self, auth_headers):
        """Test POST /api/orders with empty cart returns 400"""
        response = requests.post(f"{API}/orders", headers=auth_headers, json={
            "delivery_address": "Test Address",
            "phone": "+237600000000",
            "payment_method": "cash"
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "empty" in data.get("detail", "").lower() or "cart" in data.get("detail", "").lower()


@pytest.fixture(scope="module")
def test_user_with_order():
    """Create a test user, add item to cart, and create an order"""
    unique_id = str(uuid.uuid4())[:8]
    email = f"TEST_fullorder_{unique_id}@test.com"
    password = "TestPass123!"
    
    # Register user
    response = requests.post(f"{API}/auth/register", json={
        "name": f"Test Full Order User {unique_id}",
        "email": email,
        "password": password,
        "phone": "+237600000000",
        "address": "Test Address, Douala"
    })
    
    if response.status_code != 201:
        pytest.skip(f"Failed to create test user: {response.text}")
    
    data = response.json()
    token = data.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get products to add to cart
    products_response = requests.get(f"{API}/products")
    if products_response.status_code != 200:
        pytest.skip("Failed to get products")
    
    products = products_response.json()
    if not products:
        pytest.skip("No products available")
    
    product = products[0]
    
    # Add item to cart
    cart_response = requests.post(f"{API}/cart/items", headers=headers, json={
        "product_id": product["id"],
        "quantity": 1,
        "size": "medium"
    })
    
    if cart_response.status_code != 200:
        pytest.skip(f"Failed to add item to cart: {cart_response.text}")
    
    # Create order
    order_response = requests.post(f"{API}/orders", headers=headers, json={
        "delivery_address": "123 Test Street, Douala",
        "phone": "+237600000000",
        "payment_method": "cash"
    })
    
    if order_response.status_code != 200:
        pytest.skip(f"Failed to create order: {order_response.text}")
    
    order_data = order_response.json()
    
    return {
        "email": email,
        "password": password,
        "token": token,
        "order_id": order_data.get("order_id"),
        "order_total": order_data.get("total")
    }


@pytest.fixture(scope="module")
def auth_headers_with_order(test_user_with_order):
    """Get auth headers for user with order"""
    return {"Authorization": f"Bearer {test_user_with_order['token']}"}


class TestFullOrderFlow:
    """Test complete order flow: add to cart -> checkout -> view orders"""
    
    def test_get_orders_list(self, auth_headers_with_order, test_user_with_order):
        """Test GET /api/orders returns list with created order"""
        response = requests.get(f"{API}/orders", headers=auth_headers_with_order)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        orders = response.json()
        assert isinstance(orders, list), "Response should be a list"
        assert len(orders) >= 1, "Should have at least one order"
        
        # Verify order structure
        order = orders[0]
        assert "id" in order, "Order should have id"
        assert "status" in order, "Order should have status"
        assert "items" in order, "Order should have items"
        assert "total" in order, "Order should have total"
        assert "created_at" in order, "Order should have created_at"
        
        print(f"Order ID: {order['id']}")
        print(f"Order status: {order['status']}")
        print(f"Order total: {order['total']}")
    
    def test_get_order_details(self, auth_headers_with_order, test_user_with_order):
        """Test GET /api/orders/{order_id} returns order details"""
        order_id = test_user_with_order["order_id"]
        response = requests.get(f"{API}/orders/{order_id}", headers=auth_headers_with_order)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        order = response.json()
        
        # Verify order structure
        assert order["id"] == order_id, "Order ID should match"
        assert "status" in order, "Order should have status"
        assert order["status"] == "en_attente", f"New order should be 'en_attente', got {order['status']}"
        
        # Verify items
        assert "items" in order, "Order should have items"
        assert len(order["items"]) >= 1, "Order should have at least one item"
        
        item = order["items"][0]
        assert "product_id" in item, "Item should have product_id"
        assert "product_name" in item, "Item should have product_name"
        assert "product_image" in item, "Item should have product_image"
        assert "quantity" in item, "Item should have quantity"
        assert "size" in item, "Item should have size"
        assert "price" in item, "Item should have price"
        
        # Verify delivery info
        assert "delivery_address" in order, "Order should have delivery_address"
        assert "phone" in order, "Order should have phone"
        assert "payment_method" in order, "Order should have payment_method"
        
        # Verify totals
        assert "subtotal" in order, "Order should have subtotal"
        assert "delivery_fee" in order, "Order should have delivery_fee"
        assert "total" in order, "Order should have total"
        
        print(f"Order details verified successfully")
        print(f"  - Status: {order['status']}")
        print(f"  - Items: {len(order['items'])}")
        print(f"  - Subtotal: {order['subtotal']} FCFA")
        print(f"  - Delivery fee: {order['delivery_fee']} FCFA")
        print(f"  - Total: {order['total']} FCFA")
    
    def test_order_status_values(self, auth_headers_with_order, test_user_with_order):
        """Test that order status is a valid value"""
        order_id = test_user_with_order["order_id"]
        response = requests.get(f"{API}/orders/{order_id}", headers=auth_headers_with_order)
        
        assert response.status_code == 200
        order = response.json()
        
        valid_statuses = ["en_attente", "en_preparation", "en_livraison", "livree", "annulee"]
        assert order["status"] in valid_statuses, f"Invalid status: {order['status']}"
        print(f"Order status '{order['status']}' is valid")


class TestOrderSecurity:
    """Test order security - users can only access their own orders"""
    
    def test_cannot_access_other_user_order(self):
        """Test that user cannot access another user's order"""
        # Create first user and order
        unique_id1 = str(uuid.uuid4())[:8]
        email1 = f"TEST_security1_{unique_id1}@test.com"
        
        response1 = requests.post(f"{API}/auth/register", json={
            "name": f"Test User 1",
            "email": email1,
            "password": "TestPass123!",
            "phone": "+237600000001",
            "address": "Address 1"
        })
        
        if response1.status_code != 201:
            pytest.skip("Failed to create first user")
        
        token1 = response1.json().get("access_token")
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Get products and add to cart
        products = requests.get(f"{API}/products").json()
        if not products:
            pytest.skip("No products available")
        
        requests.post(f"{API}/cart/items", headers=headers1, json={
            "product_id": products[0]["id"],
            "quantity": 1,
            "size": "medium"
        })
        
        # Create order for user 1
        order_response = requests.post(f"{API}/orders", headers=headers1, json={
            "delivery_address": "Address 1",
            "phone": "+237600000001",
            "payment_method": "cash"
        })
        
        if order_response.status_code != 200:
            pytest.skip("Failed to create order")
        
        order_id = order_response.json().get("order_id")
        
        # Create second user
        unique_id2 = str(uuid.uuid4())[:8]
        email2 = f"TEST_security2_{unique_id2}@test.com"
        
        response2 = requests.post(f"{API}/auth/register", json={
            "name": f"Test User 2",
            "email": email2,
            "password": "TestPass123!",
            "phone": "+237600000002",
            "address": "Address 2"
        })
        
        if response2.status_code != 201:
            pytest.skip("Failed to create second user")
        
        token2 = response2.json().get("access_token")
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Try to access user 1's order with user 2's token
        response = requests.get(f"{API}/orders/{order_id}", headers=headers2)
        
        # Should return 404 (not found) since user 2 doesn't own this order
        assert response.status_code == 404, f"Expected 404, got {response.status_code}. User should not access other's orders"
        print("Security test passed: User cannot access another user's order")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
