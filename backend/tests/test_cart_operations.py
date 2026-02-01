"""
Cart Operations Tests for GAZ MAN E-commerce App
Tests: Cart item addition, deletion, quantity update, and full workflow
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://driver-app-phase4.preview.emergentagent.com')

# Test product ID from the database
TEST_PRODUCT_ID = "c18e85b9-c66d-458c-bf1d-b0f05c864ded"  # Cylinder Refill Service
TEST_PRODUCT_ID_2 = "7c13001a-a971-46b5-9576-7b78f3bb6455"  # Total Gas Cylinder


class TestCartOperations:
    """Cart CRUD operations tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Register a new test user and get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Register a unique test user
        unique_email = f"test_cart_{uuid.uuid4().hex[:8]}@test.com"
        register_response = self.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "TestPass123!",
            "name": "Test Cart User",
            "phone": "+237600000000"
        })
        
        assert register_response.status_code == 201, f"Registration failed: {register_response.text}"
        
        data = register_response.json()
        self.token = data.get("access_token")
        self.user = data.get("user")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        yield
        
        # Cleanup: Clear cart after tests
        try:
            self.session.delete(f"{BASE_URL}/api/cart")
        except:
            pass
    
    def test_01_get_empty_cart(self):
        """Test getting an empty cart returns correct structure"""
        response = self.session.get(f"{BASE_URL}/api/cart")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify empty cart structure
        assert "items" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) == 0
        assert "subtotal" in data
        assert data["subtotal"] == 0
        assert "delivery_fee" in data
        assert "total" in data
        print(f"✓ Empty cart returned correctly: {data}")
    
    def test_02_add_item_to_cart(self):
        """Test adding an item to cart via POST /api/cart/items"""
        add_payload = {
            "product_id": TEST_PRODUCT_ID,
            "quantity": 2,
            "size": "medium"
        }
        
        response = self.session.post(f"{BASE_URL}/api/cart/items", json=add_payload)
        
        assert response.status_code == 200, f"Add to cart failed: {response.text}"
        data = response.json()
        
        assert "message" in data
        assert "cart_id" in data
        print(f"✓ Item added to cart: {data}")
        
        # Verify item was added by fetching cart
        cart_response = self.session.get(f"{BASE_URL}/api/cart")
        assert cart_response.status_code == 200
        
        cart_data = cart_response.json()
        assert len(cart_data["items"]) == 1
        assert cart_data["items"][0]["product_id"] == TEST_PRODUCT_ID
        assert cart_data["items"][0]["quantity"] == 2
        assert cart_data["items"][0]["size"] == "medium"
        print(f"✓ Cart verified with item: {cart_data}")
    
    def test_03_update_cart_item_quantity(self):
        """Test updating item quantity via PUT /api/cart/items/{product_id}"""
        # First add an item
        self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 1,
            "size": "medium"
        })
        
        # Update quantity
        update_payload = {
            "quantity": 5,
            "size": "medium"
        }
        
        response = self.session.put(
            f"{BASE_URL}/api/cart/items/{TEST_PRODUCT_ID}",
            json=update_payload
        )
        
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ Cart item updated: {data}")
        
        # Verify update by fetching cart
        cart_response = self.session.get(f"{BASE_URL}/api/cart")
        cart_data = cart_response.json()
        
        item = next((i for i in cart_data["items"] if i["product_id"] == TEST_PRODUCT_ID), None)
        assert item is not None
        assert item["quantity"] == 5
        print(f"✓ Quantity verified: {item['quantity']}")
    
    def test_04_delete_cart_item(self):
        """Test deleting item from cart via DELETE /api/cart/items/{product_id}?size=medium"""
        # First add an item
        self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 1,
            "size": "medium"
        })
        
        # Verify item exists
        cart_before = self.session.get(f"{BASE_URL}/api/cart").json()
        assert len(cart_before["items"]) >= 1
        print(f"✓ Cart before delete: {len(cart_before['items'])} items")
        
        # Delete the item
        response = self.session.delete(
            f"{BASE_URL}/api/cart/items/{TEST_PRODUCT_ID}",
            params={"size": "medium"}
        )
        
        assert response.status_code == 200, f"Delete failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ Delete response: {data}")
        
        # Verify item was removed
        cart_after = self.session.get(f"{BASE_URL}/api/cart").json()
        item = next((i for i in cart_after["items"] if i["product_id"] == TEST_PRODUCT_ID and i["size"] == "medium"), None)
        assert item is None, "Item should have been removed from cart"
        print(f"✓ Cart after delete: {len(cart_after['items'])} items - Item successfully removed")
    
    def test_05_delete_nonexistent_item(self):
        """Test deleting a non-existent item returns 404"""
        response = self.session.delete(
            f"{BASE_URL}/api/cart/items/nonexistent-product-id",
            params={"size": "medium"}
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Non-existent item delete returns 404 as expected")
    
    def test_06_full_cart_workflow(self):
        """Test full workflow: add -> view -> update -> delete -> verify empty"""
        # Step 1: Add first item
        add_response1 = self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 2,
            "size": "medium"
        })
        assert add_response1.status_code == 200
        print("✓ Step 1: Added first item")
        
        # Step 2: Add second item
        add_response2 = self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID_2,
            "quantity": 1,
            "size": "medium"
        })
        assert add_response2.status_code == 200
        print("✓ Step 2: Added second item")
        
        # Step 3: View cart - should have 2 items
        cart_response = self.session.get(f"{BASE_URL}/api/cart")
        cart_data = cart_response.json()
        assert len(cart_data["items"]) == 2
        assert cart_data["subtotal"] > 0
        print(f"✓ Step 3: Cart has {len(cart_data['items'])} items, subtotal: {cart_data['subtotal']} FCFA")
        
        # Step 4: Update first item quantity
        update_response = self.session.put(
            f"{BASE_URL}/api/cart/items/{TEST_PRODUCT_ID}",
            json={"quantity": 3, "size": "medium"}
        )
        assert update_response.status_code == 200
        print("✓ Step 4: Updated first item quantity to 3")
        
        # Step 5: Delete first item
        delete_response1 = self.session.delete(
            f"{BASE_URL}/api/cart/items/{TEST_PRODUCT_ID}",
            params={"size": "medium"}
        )
        assert delete_response1.status_code == 200
        print("✓ Step 5: Deleted first item")
        
        # Step 6: Verify only second item remains
        cart_after_delete = self.session.get(f"{BASE_URL}/api/cart").json()
        assert len(cart_after_delete["items"]) == 1
        assert cart_after_delete["items"][0]["product_id"] == TEST_PRODUCT_ID_2
        print(f"✓ Step 6: Cart has {len(cart_after_delete['items'])} item remaining")
        
        # Step 7: Delete second item
        delete_response2 = self.session.delete(
            f"{BASE_URL}/api/cart/items/{TEST_PRODUCT_ID_2}",
            params={"size": "medium"}
        )
        assert delete_response2.status_code == 200
        print("✓ Step 7: Deleted second item")
        
        # Step 8: Verify cart is empty
        final_cart = self.session.get(f"{BASE_URL}/api/cart").json()
        assert len(final_cart["items"]) == 0
        print("✓ Step 8: Cart is now empty - Full workflow completed successfully!")
    
    def test_07_add_same_item_increases_quantity(self):
        """Test adding same item twice increases quantity instead of duplicating"""
        # Add item first time
        self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 2,
            "size": "medium"
        })
        
        # Add same item again
        self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 3,
            "size": "medium"
        })
        
        # Verify quantity is combined
        cart = self.session.get(f"{BASE_URL}/api/cart").json()
        item = next((i for i in cart["items"] if i["product_id"] == TEST_PRODUCT_ID), None)
        
        assert item is not None
        assert item["quantity"] == 5, f"Expected quantity 5, got {item['quantity']}"
        print(f"✓ Same item added twice - quantity combined to {item['quantity']}")
    
    def test_08_clear_entire_cart(self):
        """Test clearing entire cart via DELETE /api/cart"""
        # Add items
        self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 1,
            "size": "medium"
        })
        self.session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID_2,
            "quantity": 1,
            "size": "medium"
        })
        
        # Clear cart
        response = self.session.delete(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        
        # Verify cart is empty
        cart = self.session.get(f"{BASE_URL}/api/cart").json()
        assert len(cart["items"]) == 0
        print("✓ Cart cleared successfully")


class TestCartWithoutAuth:
    """Test cart endpoints without authentication"""
    
    def test_cart_requires_auth(self):
        """Test that cart endpoints require authentication"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Try to get cart without auth
        response = session.get(f"{BASE_URL}/api/cart")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ GET /api/cart requires authentication")
        
        # Try to add to cart without auth
        response = session.post(f"{BASE_URL}/api/cart/items", json={
            "product_id": TEST_PRODUCT_ID,
            "quantity": 1,
            "size": "medium"
        })
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ POST /api/cart/items requires authentication")
        
        # Try to delete from cart without auth
        response = session.delete(f"{BASE_URL}/api/cart/items/{TEST_PRODUCT_ID}", params={"size": "medium"})
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ DELETE /api/cart/items requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
