# Test file for Driver App & Admin Driver Assignment (Phase 4)
# Tests: Driver login, dashboard, orders, status updates, admin driver assignment

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from PRD
ADMIN_EMAIL = "admin@gazman.cm"
ADMIN_PASSWORD = "CHANGE_ME_IN_PRODUCTION"
DRIVER_EMAIL = "driver@gazman.cm"
DRIVER_PASSWORD = "CHANGE_ME_IN_PRODUCTION"


class TestAuthLogin:
    """Test authentication login for different roles"""
    
    def test_admin_login_success(self):
        """Test admin can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
    
    def test_driver_login_success(self):
        """Test driver can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DRIVER_EMAIL,
            "password": DRIVER_PASSWORD
        })
        assert response.status_code == 200, f"Driver login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "driver"
        assert data["user"]["email"] == DRIVER_EMAIL
    
    def test_login_wrong_password(self):
        """Test login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DRIVER_EMAIL,
            "password": "wrong_password"
        })
        assert response.status_code == 401


@pytest.fixture
def driver_token():
    """Get driver auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": DRIVER_EMAIL,
        "password": DRIVER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Driver authentication failed")


@pytest.fixture
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed")


@pytest.fixture
def driver_id():
    """Get driver user ID"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": DRIVER_EMAIL,
        "password": DRIVER_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["user"]["id"]
    pytest.skip("Could not get driver ID")


class TestDriverEndpoints:
    """Test driver-specific endpoints"""
    
    def test_driver_stats_endpoint(self, driver_token):
        """Test GET /api/driver/stats returns driver statistics"""
        response = requests.get(
            f"{BASE_URL}/api/driver/stats",
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 200, f"Driver stats failed: {response.text}"
        
        data = response.json()
        # Verify expected fields in stats response
        assert "total_assigned" in data
        assert "delivered" in data
        assert "failed" in data
        assert "in_progress" in data
        assert "total_delivered_value" in data
        
        # Verify data types
        assert isinstance(data["total_assigned"], int)
        assert isinstance(data["delivered"], int)
        assert isinstance(data["failed"], int)
        assert isinstance(data["in_progress"], int)
        assert isinstance(data["total_delivered_value"], (int, float))
    
    def test_driver_orders_endpoint(self, driver_token):
        """Test GET /api/driver/orders returns driver's assigned orders"""
        response = requests.get(
            f"{BASE_URL}/api/driver/orders",
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 200, f"Driver orders failed: {response.text}"
        
        data = response.json()
        assert "orders" in data
        assert "stats" in data
        assert isinstance(data["orders"], list)
    
    def test_driver_failure_reasons_endpoint(self, driver_token):
        """Test GET /api/driver/failure-reasons returns predefined failure reasons"""
        response = requests.get(
            f"{BASE_URL}/api/driver/failure-reasons",
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 200, f"Failure reasons failed: {response.text}"
        
        data = response.json()
        assert "reasons" in data
        assert isinstance(data["reasons"], list)
        assert len(data["reasons"]) > 0
        
        # Verify each reason has required fields
        for reason in data["reasons"]:
            assert "code" in reason
            assert "fr" in reason  # French translation
            assert "en" in reason  # English translation
    
    def test_driver_endpoint_unauthorized(self):
        """Test driver endpoints reject unauthorized requests"""
        response = requests.get(f"{BASE_URL}/api/driver/stats")
        assert response.status_code in [401, 422]  # No auth header
    
    def test_driver_endpoint_with_client_token(self):
        """Test driver endpoints reject non-driver roles"""
        # First register a test client
        test_email = f"test_client_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test Client"
        })
        
        if reg_response.status_code == 201:
            client_token = reg_response.json().get("access_token")
            
            # Try to access driver endpoint with client token
            response = requests.get(
                f"{BASE_URL}/api/driver/stats",
                headers={"Authorization": f"Bearer {client_token}"}
            )
            assert response.status_code == 403, "Client should not access driver endpoints"


class TestAdminDriverEndpoints:
    """Test admin endpoints for driver management"""
    
    def test_admin_get_drivers(self, admin_token):
        """Test GET /api/admin/drivers returns list of drivers"""
        response = requests.get(
            f"{BASE_URL}/api/admin/drivers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin get drivers failed: {response.text}"
        
        data = response.json()
        assert "drivers" in data
        assert "total" in data
        assert isinstance(data["drivers"], list)
        
        # Verify at least one driver exists (the seeded driver)
        assert len(data["drivers"]) >= 1, "Expected at least 1 driver (seeded driver)"
        
        # Verify driver data structure
        for driver in data["drivers"]:
            assert "id" in driver
            assert "name" in driver
            assert "email" in driver
            assert "role" in driver
            assert driver["role"] == "driver"
            assert "password_hash" not in driver  # Should not expose password hash
    
    def test_admin_get_orders(self, admin_token):
        """Test GET /api/admin/orders returns all orders"""
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin get orders failed: {response.text}"
        
        data = response.json()
        assert "orders" in data
        assert "total" in data
        assert isinstance(data["orders"], list)


class TestAdminDriverAssignment:
    """Test admin driver assignment functionality"""
    
    @pytest.fixture
    def test_order_with_items(self, admin_token):
        """Create a test order for assignment testing"""
        # First, register a test client
        test_email = f"test_order_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test Order Client",
            "address": "123 Test Street"
        })
        
        if reg_response.status_code != 201:
            pytest.skip("Could not create test client")
        
        client_token = reg_response.json()["access_token"]
        
        # Get a product
        products_response = requests.get(f"{BASE_URL}/api/products")
        if products_response.status_code != 200 or len(products_response.json()) == 0:
            pytest.skip("No products available")
        
        product = products_response.json()[0]
        
        # Add to cart
        cart_response = requests.post(
            f"{BASE_URL}/api/cart/items",
            json={
                "product_id": product["id"],
                "quantity": 1,
                "size": "medium"
            },
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if cart_response.status_code not in [200, 201]:
            pytest.skip("Could not add to cart")
        
        # Create order
        order_response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "delivery_address": "123 Test Address, Douala",
                "phone": "+237600000000",
                "payment_method": "cash"
            },
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if order_response.status_code not in [200, 201]:
            pytest.skip("Could not create order")
        
        return order_response.json()["order_id"]
    
    def test_assign_driver_to_order(self, admin_token, driver_id, test_order_with_items):
        """Test assigning a driver to an order"""
        order_id = test_order_with_items
        
        response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/assign-driver",
            json={"driver_id": driver_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Assign driver failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert "driver" in data
        assert data["driver"]["id"] == driver_id
    
    def test_unassign_driver_from_order(self, admin_token, driver_id, test_order_with_items):
        """Test unassigning a driver from an order"""
        order_id = test_order_with_items
        
        # First assign driver
        assign_response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/assign-driver",
            json={"driver_id": driver_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert assign_response.status_code == 200
        
        # Then unassign (send null/empty driver_id)
        unassign_response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/assign-driver",
            json={"driver_id": None},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert unassign_response.status_code == 200, f"Unassign driver failed: {unassign_response.text}"
        
        data = unassign_response.json()
        assert "unassigned" in data["message"].lower() or "message" in data
    
    def test_assign_invalid_driver(self, admin_token, test_order_with_items):
        """Test assigning non-existent driver returns 404"""
        order_id = test_order_with_items
        fake_driver_id = str(uuid.uuid4())
        
        response = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/assign-driver",
            json={"driver_id": fake_driver_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404, "Should return 404 for non-existent driver"
    
    def test_admin_get_single_order(self, admin_token, test_order_with_items):
        """Test GET /api/admin/orders/{order_id} returns order with driver info"""
        order_id = test_order_with_items
        
        response = requests.get(
            f"{BASE_URL}/api/admin/orders/{order_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get single order failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert "status" in data
        assert "items" in data
        assert "user" in data  # Should include customer info


class TestDriverOrderStatusUpdates:
    """Test driver order status update flow"""
    
    @pytest.fixture
    def assigned_order(self, admin_token, driver_token, driver_id):
        """Create and assign an order to driver for testing"""
        # Register test client
        test_email = f"test_status_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test Status Client",
            "address": "456 Status Test Street"
        })
        
        if reg_response.status_code != 201:
            pytest.skip("Could not create test client")
        
        client_token = reg_response.json()["access_token"]
        
        # Get product and add to cart
        products = requests.get(f"{BASE_URL}/api/products").json()
        if not products:
            pytest.skip("No products")
        
        requests.post(
            f"{BASE_URL}/api/cart/items",
            json={"product_id": products[0]["id"], "quantity": 1, "size": "medium"},
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        # Create order
        order_res = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "delivery_address": "Status Test Address",
                "phone": "+237611111111",
                "payment_method": "cash"
            },
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if order_res.status_code not in [200, 201]:
            pytest.skip("Could not create order")
        
        order_id = order_res.json()["order_id"]
        
        # Assign to driver
        assign_res = requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/assign-driver",
            json={"driver_id": driver_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if assign_res.status_code != 200:
            pytest.skip("Could not assign order to driver")
        
        return order_id
    
    def test_driver_can_view_assigned_order(self, driver_token, assigned_order):
        """Test driver can view their assigned order"""
        order_id = assigned_order
        
        response = requests.get(
            f"{BASE_URL}/api/driver/orders/{order_id}",
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 200, f"Driver view order failed: {response.text}"
        
        data = response.json()
        assert data["id"] == order_id
        assert "customer" in data
        assert "items" in data
    
    def test_driver_status_transition_en_attente_to_en_preparation(self, driver_token, assigned_order):
        """Test driver can change status from en_attente to en_preparation"""
        order_id = assigned_order
        
        response = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "en_preparation"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 200, f"Status update failed: {response.text}"
        
        data = response.json()
        assert data["new_status"] == "en_preparation"
    
    def test_driver_full_status_flow(self, driver_token, assigned_order):
        """Test complete driver status flow: en_attente -> en_preparation -> en_livraison -> livree"""
        order_id = assigned_order
        
        # Step 1: en_attente -> en_preparation
        res1 = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "en_preparation"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert res1.status_code == 200, f"Step 1 failed: {res1.text}"
        
        # Step 2: en_preparation -> en_livraison
        res2 = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "en_livraison"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert res2.status_code == 200, f"Step 2 failed: {res2.text}"
        
        # Step 3: en_livraison -> livree
        res3 = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "livree"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert res3.status_code == 200, f"Step 3 failed: {res3.text}"
        assert res3.json()["new_status"] == "livree"
    
    def test_driver_invalid_status_transition(self, driver_token, assigned_order):
        """Test driver cannot skip status steps"""
        order_id = assigned_order
        
        # Try to go directly from en_attente to livree (should fail)
        response = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "livree"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 400, "Should not allow skipping status steps"


class TestDriverFailureFlow:
    """Test driver marking orders as failed"""
    
    @pytest.fixture
    def order_in_delivery(self, admin_token, driver_token, driver_id):
        """Create an order that's in delivery status"""
        # Create client and order
        test_email = f"test_fail_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test Fail Client"
        })
        
        if reg_response.status_code != 201:
            pytest.skip("Could not create test client")
        
        client_token = reg_response.json()["access_token"]
        
        # Add to cart and create order
        products = requests.get(f"{BASE_URL}/api/products").json()
        if not products:
            pytest.skip("No products")
        
        requests.post(
            f"{BASE_URL}/api/cart/items",
            json={"product_id": products[0]["id"], "quantity": 1, "size": "medium"},
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        order_res = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "delivery_address": "Fail Test Address",
                "phone": "+237622222222",
                "payment_method": "cash"
            },
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if order_res.status_code not in [200, 201]:
            pytest.skip("Could not create order")
        
        order_id = order_res.json()["order_id"]
        
        # Assign to driver
        requests.put(
            f"{BASE_URL}/api/admin/orders/{order_id}/assign-driver",
            json={"driver_id": driver_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Move to en_livraison status
        requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "en_preparation"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "en_livraison"},
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        
        return order_id
    
    def test_driver_mark_order_as_failed_with_reason(self, driver_token, order_in_delivery):
        """Test driver can mark order as failed with reason"""
        order_id = order_in_delivery
        
        response = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={
                "status": "echouee",
                "failure_reason": "client_absent"
            },
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 200, f"Mark as failed failed: {response.text}"
        assert response.json()["new_status"] == "echouee"
    
    def test_driver_fail_without_reason_rejected(self, driver_token, order_in_delivery):
        """Test driver cannot mark order as failed without reason"""
        order_id = order_in_delivery
        
        response = requests.put(
            f"{BASE_URL}/api/driver/orders/{order_id}/status",
            json={"status": "echouee"},  # No failure_reason
            headers={"Authorization": f"Bearer {driver_token}"}
        )
        assert response.status_code == 400, "Should require failure reason"
