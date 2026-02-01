"""
Admin Dashboard API Tests for GAZ MAN E-commerce App
Tests: Admin stats, orders management, products CRUD, users list
Phase 5 Admin Dashboard features
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://driver-app-phase4.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

# Admin credentials
ADMIN_EMAIL = "admin@gazman.cm"
ADMIN_PASSWORD = "Admin123!"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{API}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if response.status_code != 200:
        pytest.skip(f"Admin login failed: {response.text}")
    
    data = response.json()
    token = data.get("access_token")
    user = data.get("user", {})
    
    # Verify admin role
    assert user.get("role") == "admin", f"Expected admin role, got {user.get('role')}"
    print(f"✓ Admin login successful: {user.get('email')}")
    
    return token


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    """Get admin auth headers"""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def regular_user_token():
    """Create a regular (non-admin) user and get token"""
    unique_id = str(uuid.uuid4())[:8]
    email = f"TEST_regular_{unique_id}@test.com"
    
    response = requests.post(f"{API}/auth/register", json={
        "name": f"Regular User {unique_id}",
        "email": email,
        "password": "TestPass123!",
        "phone": "+237600000000"
    })
    
    if response.status_code != 201:
        pytest.skip(f"Failed to create regular user: {response.text}")
    
    return response.json().get("access_token")


@pytest.fixture(scope="module")
def regular_user_headers(regular_user_token):
    """Get regular user auth headers"""
    return {"Authorization": f"Bearer {regular_user_token}"}


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["role"] == "admin", "User should have admin role"
        assert data["user"]["email"] == ADMIN_EMAIL, "Email should match"
        
        print(f"✓ Admin login successful: {data['user']['name']}")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "WrongPassword123!"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Wrong password correctly rejected")


class TestAdminStats:
    """Test admin dashboard statistics endpoint"""
    
    def test_get_stats_success(self, admin_headers):
        """Test GET /api/admin/stats returns dashboard statistics"""
        response = requests.get(f"{API}/admin/stats", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify orders stats structure
        assert "orders" in data, "Response should contain orders stats"
        orders = data["orders"]
        assert "total" in orders, "Orders should have total"
        assert "pending" in orders, "Orders should have pending count"
        assert "preparing" in orders, "Orders should have preparing count"
        assert "delivering" in orders, "Orders should have delivering count"
        assert "delivered" in orders, "Orders should have delivered count"
        assert "cancelled" in orders, "Orders should have cancelled count"
        
        # Verify other stats
        assert "users" in data, "Response should contain users count"
        assert "products" in data, "Response should contain products count"
        assert "revenue" in data, "Response should contain revenue"
        
        # Verify data types
        assert isinstance(data["users"], int), "Users should be integer"
        assert isinstance(data["products"], int), "Products should be integer"
        assert isinstance(data["revenue"], (int, float)), "Revenue should be numeric"
        
        print(f"✓ Stats retrieved: {data['orders']['total']} orders, {data['users']} users, {data['products']} products")
    
    def test_get_stats_unauthorized(self):
        """Test GET /api/admin/stats without auth returns 401/403"""
        response = requests.get(f"{API}/admin/stats")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Stats endpoint requires authentication")
    
    def test_get_stats_non_admin(self, regular_user_headers):
        """Test GET /api/admin/stats with non-admin user returns 403"""
        response = requests.get(f"{API}/admin/stats", headers=regular_user_headers)
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Stats endpoint requires admin role")


class TestAdminOrders:
    """Test admin orders management endpoints"""
    
    def test_get_orders_list(self, admin_headers):
        """Test GET /api/admin/orders returns orders list"""
        response = requests.get(f"{API}/admin/orders", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "orders" in data, "Response should contain orders"
        assert "total" in data, "Response should contain total count"
        assert isinstance(data["orders"], list), "Orders should be a list"
        
        if data["orders"]:
            order = data["orders"][0]
            assert "id" in order, "Order should have id"
            assert "status" in order, "Order should have status"
            assert "items" in order, "Order should have items"
            assert "total" in order, "Order should have total"
            assert "user" in order, "Order should have user info"
            
            # Verify user info is enriched
            assert "name" in order["user"], "User should have name"
            assert "email" in order["user"], "User should have email"
        
        print(f"✓ Orders list retrieved: {data['total']} total orders")
    
    def test_get_orders_with_status_filter(self, admin_headers):
        """Test GET /api/admin/orders with status filter"""
        response = requests.get(f"{API}/admin/orders?status=en_attente", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # All returned orders should have the filtered status
        for order in data["orders"]:
            assert order["status"] == "en_attente", f"Expected status 'en_attente', got {order['status']}"
        
        print(f"✓ Filtered orders: {len(data['orders'])} pending orders")
    
    def test_get_order_details(self, admin_headers):
        """Test GET /api/admin/orders/{order_id} returns order details"""
        # First get an order ID
        list_response = requests.get(f"{API}/admin/orders?limit=1", headers=admin_headers)
        
        if list_response.status_code != 200 or not list_response.json().get("orders"):
            pytest.skip("No orders available for testing")
        
        order_id = list_response.json()["orders"][0]["id"]
        
        # Get order details
        response = requests.get(f"{API}/admin/orders/{order_id}", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        order = response.json()
        assert order["id"] == order_id, "Order ID should match"
        assert "user" in order, "Order should have user info"
        assert "items" in order, "Order should have items"
        
        print(f"✓ Order details retrieved: #{order_id[:8]}")
    
    def test_update_order_status(self, admin_headers):
        """Test PUT /api/admin/orders/{order_id}/status updates order status"""
        # First get an order ID
        list_response = requests.get(f"{API}/admin/orders?limit=1", headers=admin_headers)
        
        if list_response.status_code != 200 or not list_response.json().get("orders"):
            pytest.skip("No orders available for testing")
        
        order = list_response.json()["orders"][0]
        order_id = order["id"]
        original_status = order["status"]
        
        # Determine new status based on current status
        status_flow = ["en_attente", "en_preparation", "en_livraison", "livree"]
        if original_status in status_flow:
            current_idx = status_flow.index(original_status)
            new_status = status_flow[(current_idx + 1) % len(status_flow)]
        else:
            new_status = "en_preparation"
        
        # Update status
        response = requests.put(
            f"{API}/admin/orders/{order_id}/status",
            headers=admin_headers,
            json={"status": new_status}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        assert data["new_status"] == new_status, f"Expected status {new_status}, got {data['new_status']}"
        
        # Verify status was updated
        verify_response = requests.get(f"{API}/admin/orders/{order_id}", headers=admin_headers)
        assert verify_response.json()["status"] == new_status
        
        print(f"✓ Order status updated: {original_status} -> {new_status}")
        
        # Restore original status
        requests.put(
            f"{API}/admin/orders/{order_id}/status",
            headers=admin_headers,
            json={"status": original_status}
        )
    
    def test_update_order_invalid_status(self, admin_headers):
        """Test PUT /api/admin/orders/{order_id}/status with invalid status returns 400"""
        # First get an order ID
        list_response = requests.get(f"{API}/admin/orders?limit=1", headers=admin_headers)
        
        if list_response.status_code != 200 or not list_response.json().get("orders"):
            pytest.skip("No orders available for testing")
        
        order_id = list_response.json()["orders"][0]["id"]
        
        # Try invalid status
        response = requests.put(
            f"{API}/admin/orders/{order_id}/status",
            headers=admin_headers,
            json={"status": "invalid_status"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid status correctly rejected")
    
    def test_orders_non_admin_access(self, regular_user_headers):
        """Test admin orders endpoints require admin role"""
        response = requests.get(f"{API}/admin/orders", headers=regular_user_headers)
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Orders endpoint requires admin role")


class TestAdminProducts:
    """Test admin products CRUD endpoints"""
    
    def test_get_products_list(self, admin_headers):
        """Test GET /api/admin/products returns products list"""
        response = requests.get(f"{API}/admin/products", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "products" in data, "Response should contain products"
        assert "total" in data, "Response should contain total count"
        assert isinstance(data["products"], list), "Products should be a list"
        
        if data["products"]:
            product = data["products"][0]
            assert "id" in product, "Product should have id"
            assert "name" in product, "Product should have name"
            assert "brand" in product, "Product should have brand"
            assert "price" in product, "Product should have price"
            assert "stock" in product, "Product should have stock"
        
        print(f"✓ Products list retrieved: {data['total']} total products")
    
    def test_create_product(self, admin_headers):
        """Test POST /api/admin/products creates new product"""
        unique_id = str(uuid.uuid4())[:8]
        
        product_data = {
            "name": f"TEST Product {unique_id}",
            "brand": "Test Brand",
            "category": "domestic",
            "size": "medium",
            "capacity": "12kg",
            "price": 15000,
            "stock": 50,
            "image_url": "https://example.com/test.jpg",
            "description": "Test product description"
        }
        
        response = requests.post(
            f"{API}/admin/products",
            headers=admin_headers,
            json=product_data
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        assert "product" in data, "Response should have product"
        
        product = data["product"]
        assert product["name"] == product_data["name"], "Name should match"
        assert product["brand"] == product_data["brand"], "Brand should match"
        assert product["price"] == product_data["price"], "Price should match"
        assert product["stock"] == product_data["stock"], "Stock should match"
        assert "id" in product, "Product should have generated id"
        
        print(f"✓ Product created: {product['name']} (ID: {product['id'][:8]})")
        
        # Cleanup - delete the test product
        requests.delete(f"{API}/admin/products/{product['id']}", headers=admin_headers)
    
    def test_create_product_missing_fields(self, admin_headers):
        """Test POST /api/admin/products with missing required fields returns 400"""
        response = requests.post(
            f"{API}/admin/products",
            headers=admin_headers,
            json={"name": "Incomplete Product"}  # Missing required fields
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Missing fields correctly rejected")
    
    def test_update_product(self, admin_headers):
        """Test PUT /api/admin/products/{product_id} updates product"""
        # First create a test product
        unique_id = str(uuid.uuid4())[:8]
        create_response = requests.post(
            f"{API}/admin/products",
            headers=admin_headers,
            json={
                "name": f"TEST Update Product {unique_id}",
                "brand": "Test Brand",
                "category": "domestic",
                "price": 10000,
                "stock": 20
            }
        )
        
        if create_response.status_code != 200:
            pytest.skip("Failed to create test product")
        
        product_id = create_response.json()["product"]["id"]
        
        # Update the product
        update_data = {
            "name": f"TEST Updated Product {unique_id}",
            "price": 12000,
            "stock": 30
        }
        
        response = requests.put(
            f"{API}/admin/products/{product_id}",
            headers=admin_headers,
            json=update_data
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "product" in data, "Response should have product"
        
        product = data["product"]
        assert product["name"] == update_data["name"], "Name should be updated"
        assert product["price"] == update_data["price"], "Price should be updated"
        assert product["stock"] == update_data["stock"], "Stock should be updated"
        
        print(f"✓ Product updated: {product['name']}")
        
        # Cleanup
        requests.delete(f"{API}/admin/products/{product_id}", headers=admin_headers)
    
    def test_delete_product(self, admin_headers):
        """Test DELETE /api/admin/products/{product_id} deletes product"""
        # First create a test product
        unique_id = str(uuid.uuid4())[:8]
        create_response = requests.post(
            f"{API}/admin/products",
            headers=admin_headers,
            json={
                "name": f"TEST Delete Product {unique_id}",
                "brand": "Test Brand",
                "category": "domestic",
                "price": 10000,
                "stock": 10
            }
        )
        
        if create_response.status_code != 200:
            pytest.skip("Failed to create test product")
        
        product_id = create_response.json()["product"]["id"]
        
        # Delete the product
        response = requests.delete(
            f"{API}/admin/products/{product_id}",
            headers=admin_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        
        # Verify product is deleted
        verify_response = requests.get(f"{API}/products/{product_id}")
        assert verify_response.status_code == 404, "Product should not exist after deletion"
        
        print(f"✓ Product deleted successfully")
    
    def test_delete_nonexistent_product(self, admin_headers):
        """Test DELETE /api/admin/products/{product_id} with invalid ID returns 404"""
        fake_id = str(uuid.uuid4())
        
        response = requests.delete(
            f"{API}/admin/products/{fake_id}",
            headers=admin_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent product deletion returns 404")
    
    def test_products_non_admin_access(self, regular_user_headers):
        """Test admin products endpoints require admin role"""
        response = requests.get(f"{API}/admin/products", headers=regular_user_headers)
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Products endpoint requires admin role")


class TestAdminUsers:
    """Test admin users list endpoint (read-only)"""
    
    def test_get_users_list(self, admin_headers):
        """Test GET /api/admin/users returns users list"""
        response = requests.get(f"{API}/admin/users", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "users" in data, "Response should contain users"
        assert "total" in data, "Response should contain total count"
        assert isinstance(data["users"], list), "Users should be a list"
        
        if data["users"]:
            user = data["users"][0]
            assert "id" in user, "User should have id"
            assert "name" in user, "User should have name"
            assert "email" in user, "User should have email"
            assert "role" in user, "User should have role"
            assert "password_hash" not in user, "Password hash should not be exposed"
        
        print(f"✓ Users list retrieved: {data['total']} total users")
    
    def test_users_non_admin_access(self, regular_user_headers):
        """Test admin users endpoint requires admin role"""
        response = requests.get(f"{API}/admin/users", headers=regular_user_headers)
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Users endpoint requires admin role")


class TestOrderStatusFlow:
    """Test order status update flow: en_attente -> en_preparation -> en_livraison -> livree"""
    
    def test_status_flow(self, admin_headers):
        """Test complete order status flow"""
        # Get an order with en_attente status
        list_response = requests.get(f"{API}/admin/orders?status=en_attente&limit=1", headers=admin_headers)
        
        if list_response.status_code != 200 or not list_response.json().get("orders"):
            pytest.skip("No pending orders available for testing")
        
        order_id = list_response.json()["orders"][0]["id"]
        
        # Test status flow
        status_flow = ["en_preparation", "en_livraison", "livree"]
        
        for new_status in status_flow:
            response = requests.put(
                f"{API}/admin/orders/{order_id}/status",
                headers=admin_headers,
                json={"status": new_status}
            )
            
            assert response.status_code == 200, f"Failed to update to {new_status}: {response.text}"
            assert response.json()["new_status"] == new_status
            print(f"  ✓ Status updated to: {new_status}")
        
        # Reset to en_attente for other tests
        requests.put(
            f"{API}/admin/orders/{order_id}/status",
            headers=admin_headers,
            json={"status": "en_attente"}
        )
        
        print("✓ Complete status flow tested successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
