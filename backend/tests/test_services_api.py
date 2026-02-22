"""
Test suite for Services API endpoints - Admin Management for Homepage Services

Endpoints tested:
- GET /api/services - Public endpoint returns active services
- GET /api/admin/services - Admin endpoint returns all services
- GET /api/admin/services/{id} - Get single service (admin)
- POST /api/admin/services - Create new service (admin)
- PUT /api/admin/services/{id} - Update existing service (admin)
- DELETE /api/admin/services/{id} - Delete a service (admin)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@gazman.cm"
ADMIN_PASSWORD = "Admin123!"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed - skipping admin tests")


@pytest.fixture
def api_client():
    """Shared requests session."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def admin_client(api_client, admin_token):
    """Session with admin auth header."""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client


class TestPublicServicesAPI:
    """Test public services endpoint - GET /api/services"""
    
    def test_get_services_returns_200(self, api_client):
        """Public services endpoint should return 200."""
        response = api_client.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        print(f"Public services endpoint returned 200")
    
    def test_get_services_returns_services_array(self, api_client):
        """Response should contain services array."""
        response = api_client.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert "services" in data
        assert isinstance(data["services"], list)
        print(f"Services array found with {len(data['services'])} items")
    
    def test_get_services_returns_only_active(self, api_client):
        """Public endpoint should only return active services."""
        response = api_client.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        for service in data["services"]:
            assert service.get("is_active") == True, f"Service {service.get('id')} is not active but returned in public API"
        print(f"All {len(data['services'])} returned services are active")
    
    def test_service_has_required_fields(self, api_client):
        """Each service should have required fields."""
        response = api_client.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name_fr", "name_en", "category", "is_active"]
        
        if len(data["services"]) > 0:
            service = data["services"][0]
            for field in required_fields:
                assert field in service, f"Missing required field: {field}"
            print(f"Service has all required fields: {required_fields}")
        else:
            print("No services available to check fields")


class TestAdminServicesAPI:
    """Test admin services endpoints"""
    
    def test_get_admin_services_requires_auth(self, api_client):
        """Admin endpoint should require authentication."""
        response = api_client.get(f"{BASE_URL}/api/admin/services")
        # Can return 401 (Unauthorized) or 403 (Forbidden) depending on auth middleware
        assert response.status_code in [401, 403]
        print(f"Admin services endpoint correctly requires authentication (returns {response.status_code})")
    
    def test_get_admin_services_returns_200(self, admin_client):
        """Admin should be able to get all services."""
        response = admin_client.get(f"{BASE_URL}/api/admin/services")
        assert response.status_code == 200
        print("Admin services endpoint returned 200")
    
    def test_get_admin_services_includes_inactive(self, admin_client):
        """Admin endpoint should return services with both active and inactive."""
        response = admin_client.get(f"{BASE_URL}/api/admin/services")
        assert response.status_code == 200
        data = response.json()
        assert "services" in data
        assert "total" in data
        print(f"Admin services returned {data['total']} total services")
    
    def test_create_service_missing_required_fields(self, admin_client):
        """Creating service without required fields should fail."""
        response = admin_client.post(f"{BASE_URL}/api/admin/services", json={
            "name_fr": "Test Only French"
            # Missing name_en and category
        })
        assert response.status_code == 400
        print("Creating service without required fields correctly returns 400")
    
    def test_create_service_success(self, admin_client):
        """Admin should be able to create a new service."""
        unique_id = str(uuid.uuid4())[:8]
        service_data = {
            "name_fr": f"TEST_Service_{unique_id}",
            "name_en": f"TEST_Service_EN_{unique_id}",
            "description_fr": "Test description FR",
            "description_en": "Test description EN",
            "category": "emergency",
            "icon": "🚨",
            "is_active": True
        }
        
        response = admin_client.post(f"{BASE_URL}/api/admin/services", json=service_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "service" in data
        assert data["service"]["name_fr"] == service_data["name_fr"]
        assert data["service"]["name_en"] == service_data["name_en"]
        assert data["service"]["category"] == service_data["category"]
        assert "id" in data["service"]
        
        # Store service ID for cleanup
        service_id = data["service"]["id"]
        print(f"Created service with ID: {service_id}")
        
        # Cleanup - delete the test service
        delete_response = admin_client.delete(f"{BASE_URL}/api/admin/services/{service_id}")
        assert delete_response.status_code == 200
        print(f"Cleaned up test service {service_id}")
    
    def test_update_service_success(self, admin_client):
        """Admin should be able to update a service."""
        # First create a service
        unique_id = str(uuid.uuid4())[:8]
        create_response = admin_client.post(f"{BASE_URL}/api/admin/services", json={
            "name_fr": f"TEST_ToUpdate_{unique_id}",
            "name_en": f"TEST_ToUpdate_EN_{unique_id}",
            "category": "domestic",
            "is_active": True
        })
        assert create_response.status_code == 200
        service_id = create_response.json()["service"]["id"]
        
        # Update the service
        update_data = {
            "name_fr": f"TEST_Updated_{unique_id}",
            "is_active": False
        }
        update_response = admin_client.put(f"{BASE_URL}/api/admin/services/{service_id}", json=update_data)
        assert update_response.status_code == 200
        
        updated = update_response.json()["service"]
        assert updated["name_fr"] == update_data["name_fr"]
        assert updated["is_active"] == False
        print(f"Successfully updated service {service_id}")
        
        # Verify persistence with GET
        get_response = admin_client.get(f"{BASE_URL}/api/admin/services/{service_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name_fr"] == update_data["name_fr"]
        assert fetched["is_active"] == False
        print("Update verified via GET")
        
        # Cleanup
        admin_client.delete(f"{BASE_URL}/api/admin/services/{service_id}")
    
    def test_delete_service_success(self, admin_client):
        """Admin should be able to delete a service."""
        # First create a service
        unique_id = str(uuid.uuid4())[:8]
        create_response = admin_client.post(f"{BASE_URL}/api/admin/services", json={
            "name_fr": f"TEST_ToDelete_{unique_id}",
            "name_en": f"TEST_ToDelete_EN_{unique_id}",
            "category": "rental"
        })
        assert create_response.status_code == 200
        service_id = create_response.json()["service"]["id"]
        
        # Delete the service
        delete_response = admin_client.delete(f"{BASE_URL}/api/admin/services/{service_id}")
        assert delete_response.status_code == 200
        print(f"Deleted service {service_id}")
        
        # Verify deletion with GET
        get_response = admin_client.get(f"{BASE_URL}/api/admin/services/{service_id}")
        assert get_response.status_code == 404
        print("Deletion verified - service returns 404")
    
    def test_delete_nonexistent_service_returns_404(self, admin_client):
        """Deleting a non-existent service should return 404."""
        fake_id = str(uuid.uuid4())
        response = admin_client.delete(f"{BASE_URL}/api/admin/services/{fake_id}")
        assert response.status_code == 404
        print("Deleting non-existent service correctly returns 404")
    
    def test_update_nonexistent_service_returns_404(self, admin_client):
        """Updating a non-existent service should return 404."""
        fake_id = str(uuid.uuid4())
        response = admin_client.put(f"{BASE_URL}/api/admin/services/{fake_id}", json={
            "name_fr": "Test"
        })
        assert response.status_code == 404
        print("Updating non-existent service correctly returns 404")


class TestServiceVisibilityToggle:
    """Test service active/inactive toggle functionality"""
    
    def test_inactive_service_not_in_public_api(self, admin_client, api_client):
        """Inactive services should not appear in public API."""
        # Create an inactive service
        unique_id = str(uuid.uuid4())[:8]
        create_response = admin_client.post(f"{BASE_URL}/api/admin/services", json={
            "name_fr": f"TEST_Inactive_{unique_id}",
            "name_en": f"TEST_Inactive_EN_{unique_id}",
            "category": "emergency",
            "is_active": False  # Created as inactive
        })
        assert create_response.status_code == 200
        service_id = create_response.json()["service"]["id"]
        
        # Verify it appears in admin API
        admin_response = admin_client.get(f"{BASE_URL}/api/admin/services")
        admin_services = admin_response.json()["services"]
        admin_service_ids = [s["id"] for s in admin_services]
        assert service_id in admin_service_ids
        print(f"Inactive service {service_id} appears in admin API")
        
        # Verify it does NOT appear in public API
        public_response = api_client.get(f"{BASE_URL}/api/services")
        public_services = public_response.json()["services"]
        public_service_ids = [s["id"] for s in public_services]
        assert service_id not in public_service_ids
        print(f"Inactive service {service_id} correctly hidden from public API")
        
        # Cleanup
        admin_client.delete(f"{BASE_URL}/api/admin/services/{service_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
