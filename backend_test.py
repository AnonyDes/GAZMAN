#!/usr/bin/env python3
"""
GAZ MAN Backend API Testing - Phase 4 Driver App
Tests Driver and Admin APIs for order management and delivery flow.
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://gazman-ecommerce.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test credentials
ADMIN_CREDENTIALS = {"email": "admin@gazman.cm", "password": "CHANGE_ME_IN_PRODUCTION"}
DRIVER_CREDENTIALS = {"email": "driver@gazman.cm", "password": "CHANGE_ME_IN_PRODUCTION"}

# Global variables for test data
admin_token = None
driver_token = None
client_token = None
test_order_id = None
test_order_id_2 = None
client_user_id = None

def log_test(test_name, status, details=""):
    """Log test results with timestamp."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    {details}")

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling."""
    url = f"{API_BASE}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # Check if response status matches expected
        if response.status_code != expected_status:
            return False, f"Expected {expected_status}, got {response.status_code}: {response.text}"
        
        try:
            return True, response.json()
        except:
            return True, response.text
            
    except requests.exceptions.RequestException as e:
        return False, f"Request failed: {str(e)}"

def get_auth_headers(token):
    """Get authorization headers."""
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# ============================================
# Test Setup Functions
# ============================================

def test_admin_login():
    """Test admin login and get token."""
    global admin_token
    
    success, result = make_request("POST", "/auth/login", ADMIN_CREDENTIALS)
    if not success:
        log_test("Admin Login", "FAIL", result)
        return False
    
    if "access_token" not in result:
        log_test("Admin Login", "FAIL", "No access token in response")
        return False
    
    admin_token = result["access_token"]
    user_role = result.get("user", {}).get("role")
    
    if user_role != "admin":
        log_test("Admin Login", "FAIL", f"Expected admin role, got {user_role}")
        return False
    
    log_test("Admin Login", "PASS", f"Token received, role: {user_role}")
    return True

def test_driver_login():
    """Test driver login and get token."""
    global driver_token
    
    success, result = make_request("POST", "/auth/login", DRIVER_CREDENTIALS)
    if not success:
        log_test("Driver Login", "FAIL", result)
        return False
    
    if "access_token" not in result:
        log_test("Driver Login", "FAIL", "No access token in response")
        return False
    
    driver_token = result["access_token"]
    user_role = result.get("user", {}).get("role")
    
    if user_role != "driver":
        log_test("Driver Login", "FAIL", f"Expected driver role, got {user_role}")
        return False
    
    log_test("Driver Login", "PASS", f"Token received, role: {user_role}")
    return True

def test_create_test_client():
    """Register a test client for creating orders."""
    global client_token, client_user_id
    
    # Generate unique email for test client with valid domain
    test_email = f"testclient_{uuid.uuid4().hex[:8]}@example.com"
    client_data = {
        "name": "Test Client",
        "email": test_email,
        "password": "TestClient123!",
        "address": "123 Test Street, Douala",
        "state": "Littoral"
    }
    
    success, result = make_request("POST", "/auth/register", client_data, expected_status=201)
    if not success:
        log_test("Create Test Client", "FAIL", result)
        return False
    
    if "access_token" not in result:
        log_test("Create Test Client", "FAIL", "No access token in response")
        return False
    
    client_token = result["access_token"]
    client_user_id = result.get("user", {}).get("id")
    
    log_test("Create Test Client", "PASS", f"Client created: {test_email}")
    return True

def test_create_test_order():
    """Create a test order for testing driver assignment."""
    global test_order_id
    
    if not client_token:
        log_test("Create Test Order", "FAIL", "No client token available")
        return False
    
    headers = get_auth_headers(client_token)
    
    # First, get available products
    success, products = make_request("GET", "/products", headers=headers)
    if not success or not products:
        log_test("Create Test Order", "FAIL", "Could not fetch products")
        return False
    
    if len(products) == 0:
        log_test("Create Test Order", "FAIL", "No products available")
        return False
    
    # Add first product to cart
    product = products[0]
    cart_data = {
        "product_id": product["id"],
        "quantity": 2,
        "size": "medium"
    }
    
    success, result = make_request("POST", "/cart/items", cart_data, headers)
    if not success:
        log_test("Create Test Order", "FAIL", f"Failed to add to cart: {result}")
        return False
    
    # Create order
    order_data = {
        "delivery_address": "456 Test Delivery Street, Douala, Cameroon",
        "phone": "+237123456789",
        "payment_method": "cash"
    }
    
    success, result = make_request("POST", "/orders", order_data, headers)
    if not success:
        log_test("Create Test Order", "FAIL", f"Failed to create order: {result}")
        return False
    
    test_order_id = result.get("order_id")
    if not test_order_id:
        log_test("Create Test Order", "FAIL", "No order ID in response")
        return False
    
    log_test("Create Test Order", "PASS", f"Order created: {test_order_id}")
    return True

# ============================================
# Admin API Tests
# ============================================

def test_admin_get_drivers():
    """Test admin endpoint to get list of drivers."""
    if not admin_token:
        log_test("Admin Get Drivers", "FAIL", "No admin token")
        return False
    
    headers = get_auth_headers(admin_token)
    success, result = make_request("GET", "/admin/drivers", headers=headers)
    
    if not success:
        log_test("Admin Get Drivers", "FAIL", result)
        return False
    
    if "drivers" not in result:
        log_test("Admin Get Drivers", "FAIL", "No drivers field in response")
        return False
    
    drivers = result["drivers"]
    driver_count = len(drivers)
    
    # Check if our test driver is in the list
    test_driver_found = any(d.get("email") == DRIVER_CREDENTIALS["email"] for d in drivers)
    
    if not test_driver_found:
        log_test("Admin Get Drivers", "FAIL", "Test driver not found in drivers list")
        return False
    
    log_test("Admin Get Drivers", "PASS", f"Found {driver_count} drivers, test driver included")
    return True

def test_admin_get_orders():
    """Test admin endpoint to get orders list."""
    if not admin_token:
        log_test("Admin Get Orders", "FAIL", "No admin token")
        return False
    
    headers = get_auth_headers(admin_token)
    success, result = make_request("GET", "/admin/orders", headers=headers)
    
    if not success:
        log_test("Admin Get Orders", "FAIL", result)
        return False
    
    if "orders" not in result:
        log_test("Admin Get Orders", "FAIL", "No orders field in response")
        return False
    
    orders = result["orders"]
    order_count = len(orders)
    
    # Check if our test order is in the list
    test_order_found = any(o.get("id") == test_order_id for o in orders) if test_order_id else False
    
    log_test("Admin Get Orders", "PASS", f"Found {order_count} orders, test order included: {test_order_found}")
    return True

def test_admin_assign_driver():
    """Test admin endpoint to assign driver to order."""
    if not admin_token or not test_order_id:
        log_test("Admin Assign Driver", "FAIL", "Missing admin token or test order")
        return False
    
    # First get the driver ID
    headers = get_auth_headers(admin_token)
    success, drivers_result = make_request("GET", "/admin/drivers", headers=headers)
    
    if not success:
        log_test("Admin Assign Driver", "FAIL", f"Could not get drivers: {drivers_result}")
        return False
    
    test_driver = None
    for driver in drivers_result["drivers"]:
        if driver.get("email") == DRIVER_CREDENTIALS["email"]:
            test_driver = driver
            break
    
    if not test_driver:
        log_test("Admin Assign Driver", "FAIL", "Test driver not found")
        return False
    
    # Assign driver to order
    assignment_data = {"driver_id": test_driver["id"]}
    success, result = make_request("PUT", f"/admin/orders/{test_order_id}/assign-driver", 
                                 assignment_data, headers)
    
    if not success:
        log_test("Admin Assign Driver", "FAIL", result)
        return False
    
    if "message" not in result or "driver" not in result:
        log_test("Admin Assign Driver", "FAIL", "Invalid response format")
        return False
    
    assigned_driver = result["driver"]
    if assigned_driver["id"] != test_driver["id"]:
        log_test("Admin Assign Driver", "FAIL", "Driver ID mismatch in response")
        return False
    
    log_test("Admin Assign Driver", "PASS", f"Driver {assigned_driver['name']} assigned to order")
    return True

def test_admin_verify_assignment():
    """Verify that the order now has driver_id and driver_name."""
    if not admin_token or not test_order_id:
        log_test("Admin Verify Assignment", "FAIL", "Missing admin token or test order")
        return False
    
    headers = get_auth_headers(admin_token)
    success, result = make_request("GET", f"/admin/orders/{test_order_id}", headers=headers)
    
    if not success:
        log_test("Admin Verify Assignment", "FAIL", result)
        return False
    
    driver_id = result.get("driver_id")
    driver_name = result.get("driver_name")
    
    if not driver_id or not driver_name:
        log_test("Admin Verify Assignment", "FAIL", "Order missing driver_id or driver_name")
        return False
    
    log_test("Admin Verify Assignment", "PASS", f"Order has driver: {driver_name} ({driver_id})")
    return True

# ============================================
# Driver API Tests
# ============================================

def test_driver_get_stats():
    """Test driver stats endpoint."""
    if not driver_token:
        log_test("Driver Get Stats", "FAIL", "No driver token")
        return False
    
    headers = get_auth_headers(driver_token)
    success, result = make_request("GET", "/driver/stats", headers=headers)
    
    if not success:
        log_test("Driver Get Stats", "FAIL", result)
        return False
    
    required_fields = ["total_assigned", "delivered", "failed", "in_progress", "total_delivered_value"]
    for field in required_fields:
        if field not in result:
            log_test("Driver Get Stats", "FAIL", f"Missing field: {field}")
            return False
    
    stats = {k: result[k] for k in required_fields}
    log_test("Driver Get Stats", "PASS", f"Stats: {stats}")
    return True

def test_driver_get_orders():
    """Test driver endpoint to get assigned orders."""
    if not driver_token:
        log_test("Driver Get Orders", "FAIL", "No driver token")
        return False
    
    headers = get_auth_headers(driver_token)
    success, result = make_request("GET", "/driver/orders", headers=headers)
    
    if not success:
        log_test("Driver Get Orders", "FAIL", result)
        return False
    
    if "orders" not in result or "stats" not in result:
        log_test("Driver Get Orders", "FAIL", "Missing orders or stats in response")
        return False
    
    orders = result["orders"]
    stats = result["stats"]
    
    # Check if our assigned order appears
    assigned_order_found = any(o.get("id") == test_order_id for o in orders) if test_order_id else False
    
    log_test("Driver Get Orders", "PASS", 
             f"Found {len(orders)} orders, assigned order included: {assigned_order_found}")
    return True

def test_driver_get_order_details():
    """Test driver endpoint to get specific order details."""
    if not driver_token or not test_order_id:
        log_test("Driver Get Order Details", "FAIL", "Missing driver token or test order")
        return False
    
    headers = get_auth_headers(driver_token)
    success, result = make_request("GET", f"/driver/orders/{test_order_id}", headers=headers)
    
    if not success:
        log_test("Driver Get Order Details", "FAIL", result)
        return False
    
    # Verify order details
    if result.get("id") != test_order_id:
        log_test("Driver Get Order Details", "FAIL", "Order ID mismatch")
        return False
    
    if "customer" not in result:
        log_test("Driver Get Order Details", "FAIL", "Missing customer info")
        return False
    
    customer = result["customer"]
    if not customer.get("name") or not customer.get("email"):
        log_test("Driver Get Order Details", "FAIL", "Incomplete customer info")
        return False
    
    log_test("Driver Get Order Details", "PASS", 
             f"Order details retrieved, customer: {customer['name']}")
    return True

def test_driver_get_failure_reasons():
    """Test driver endpoint to get failure reasons."""
    if not driver_token:
        log_test("Driver Get Failure Reasons", "FAIL", "No driver token")
        return False
    
    headers = get_auth_headers(driver_token)
    success, result = make_request("GET", "/driver/failure-reasons", headers=headers)
    
    if not success:
        log_test("Driver Get Failure Reasons", "FAIL", result)
        return False
    
    if "reasons" not in result:
        log_test("Driver Get Failure Reasons", "FAIL", "No reasons field in response")
        return False
    
    reasons = result["reasons"]
    if len(reasons) == 0:
        log_test("Driver Get Failure Reasons", "FAIL", "No failure reasons returned")
        return False
    
    # Check for required fields in each reason
    for reason in reasons:
        if not all(field in reason for field in ["code", "fr", "en"]):
            log_test("Driver Get Failure Reasons", "FAIL", "Invalid reason format")
            return False
    
    log_test("Driver Get Failure Reasons", "PASS", f"Found {len(reasons)} failure reasons")
    return True

# ============================================
# Driver Status Update Tests
# ============================================

def test_driver_status_progression():
    """Test the complete driver status progression flow."""
    if not driver_token or not test_order_id:
        log_test("Driver Status Progression", "FAIL", "Missing driver token or test order")
        return False
    
    headers = get_auth_headers(driver_token)
    
    # Status progression: en_attente -> en_preparation -> en_livraison -> livree
    status_flow = [
        ("en_preparation", "Order preparation started"),
        ("en_livraison", "Order out for delivery"),
        ("livree", "Order delivered successfully")
    ]
    
    for new_status, description in status_flow:
        status_data = {"status": new_status}
        success, result = make_request("PUT", f"/driver/orders/{test_order_id}/status", 
                                     status_data, headers)
        
        if not success:
            log_test("Driver Status Progression", "FAIL", 
                     f"Failed to update to {new_status}: {result}")
            return False
        
        if result.get("new_status") != new_status:
            log_test("Driver Status Progression", "FAIL", 
                     f"Status mismatch for {new_status}")
            return False
        
        log_test(f"Status Update: {new_status}", "PASS", description)
    
    log_test("Driver Status Progression", "PASS", "Complete status flow successful")
    return True

def test_driver_failure_flow():
    """Test driver failure reporting flow."""
    global test_order_id_2
    
    if not admin_token or not driver_token or not client_token:
        log_test("Driver Failure Flow Setup", "FAIL", "Missing required tokens")
        return False
    
    # Create another test order
    headers = get_auth_headers(client_token)
    
    # Add product to cart again
    success, products = make_request("GET", "/products", headers=headers)
    if not success or not products:
        log_test("Driver Failure Flow Setup", "FAIL", "Could not fetch products")
        return False
    
    product = products[0]
    cart_data = {
        "product_id": product["id"],
        "quantity": 1,
        "size": "medium"
    }
    
    success, result = make_request("POST", "/cart/items", cart_data, headers)
    if not success:
        log_test("Driver Failure Flow Setup", "FAIL", f"Failed to add to cart: {result}")
        return False
    
    # Create second order
    order_data = {
        "delivery_address": "789 Failure Test Street, Yaounde, Cameroon",
        "phone": "+237987654321",
        "payment_method": "cash"
    }
    
    success, result = make_request("POST", "/orders", order_data, headers)
    if not success:
        log_test("Driver Failure Flow Setup", "FAIL", f"Failed to create order: {result}")
        return False
    
    test_order_id_2 = result.get("order_id")
    
    # Assign driver to second order (admin)
    admin_headers = get_auth_headers(admin_token)
    success, drivers_result = make_request("GET", "/admin/drivers", headers=admin_headers)
    
    test_driver = None
    for driver in drivers_result["drivers"]:
        if driver.get("email") == DRIVER_CREDENTIALS["email"]:
            test_driver = driver
            break
    
    assignment_data = {"driver_id": test_driver["id"]}
    success, result = make_request("PUT", f"/admin/orders/{test_order_id_2}/assign-driver", 
                                 assignment_data, admin_headers)
    
    if not success:
        log_test("Driver Failure Flow Setup", "FAIL", f"Failed to assign driver: {result}")
        return False
    
    # Now test failure flow (driver)
    driver_headers = get_auth_headers(driver_token)
    
    # Update to en_preparation first
    status_data = {"status": "en_preparation"}
    success, result = make_request("PUT", f"/driver/orders/{test_order_id_2}/status", 
                                 status_data, driver_headers)
    
    # Update to en_livraison
    status_data = {"status": "en_livraison"}
    success, result = make_request("PUT", f"/driver/orders/{test_order_id_2}/status", 
                                 status_data, driver_headers)
    
    # Now test failure with reason
    failure_data = {
        "status": "echouee",
        "failure_reason": "client_absent"
    }
    
    success, result = make_request("PUT", f"/driver/orders/{test_order_id_2}/status", 
                                 failure_data, driver_headers)
    
    if not success:
        log_test("Driver Failure Flow", "FAIL", result)
        return False
    
    if result.get("new_status") != "echouee":
        log_test("Driver Failure Flow", "FAIL", "Status not updated to echouee")
        return False
    
    log_test("Driver Failure Flow", "PASS", "Order marked as failed with reason")
    return True

# ============================================
# Invalid Transition Tests
# ============================================

def test_invalid_status_transitions():
    """Test that invalid status transitions are rejected."""
    if not driver_token:
        log_test("Invalid Status Transitions", "FAIL", "No driver token")
        return False
    
    # Create a new order for this test
    if not client_token:
        log_test("Invalid Status Transitions", "FAIL", "No client token")
        return False
    
    # This test assumes we have an order in en_attente status
    # We'll try invalid transitions
    headers = get_auth_headers(driver_token)
    
    # Try to go directly from en_attente to livree (should fail)
    invalid_data = {"status": "livree"}
    success, result = make_request("PUT", f"/driver/orders/{test_order_id}/status", 
                                 invalid_data, headers, expected_status=400)
    
    if success:
        log_test("Invalid Status Transitions", "PASS", "Invalid transition correctly rejected")
        return True
    else:
        log_test("Invalid Status Transitions", "FAIL", "Invalid transition was allowed")
        return False

# ============================================
# Main Test Runner
# ============================================

def run_all_tests():
    """Run all backend API tests in sequence."""
    print("=" * 60)
    print("GAZ MAN Backend API Testing - Phase 4 Driver App")
    print("=" * 60)
    
    test_results = []
    
    # Setup Tests
    print("\n🔧 SETUP TESTS")
    test_results.append(("Admin Login", test_admin_login()))
    test_results.append(("Driver Login", test_driver_login()))
    test_results.append(("Create Test Client", test_create_test_client()))
    test_results.append(("Create Test Order", test_create_test_order()))
    
    # Admin API Tests
    print("\n👨‍💼 ADMIN API TESTS")
    test_results.append(("Admin Get Drivers", test_admin_get_drivers()))
    test_results.append(("Admin Get Orders", test_admin_get_orders()))
    test_results.append(("Admin Assign Driver", test_admin_assign_driver()))
    test_results.append(("Admin Verify Assignment", test_admin_verify_assignment()))
    
    # Driver API Tests
    print("\n🚚 DRIVER API TESTS")
    test_results.append(("Driver Get Stats", test_driver_get_stats()))
    test_results.append(("Driver Get Orders", test_driver_get_orders()))
    test_results.append(("Driver Get Order Details", test_driver_get_order_details()))
    test_results.append(("Driver Get Failure Reasons", test_driver_get_failure_reasons()))
    
    # Status Update Tests
    print("\n📋 STATUS UPDATE TESTS")
    test_results.append(("Driver Status Progression", test_driver_status_progression()))
    test_results.append(("Driver Failure Flow", test_driver_failure_flow()))
    test_results.append(("Invalid Status Transitions", test_invalid_status_transitions()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print(f"⚠️  {total - passed} tests failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)