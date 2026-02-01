"""Create an admin user for testing."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    """Create an admin user if not exists."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    admin_email = "admin@gazman.cm"
    admin_password = "Admin123!"
    
    try:
        # Check if admin already exists
        existing = await db.users.find_one({"email": admin_email})
        if existing:
            print(f"✅ Admin user already exists: {admin_email}")
            print(f"   Password: {admin_password}")
            return
        
        # Create admin user
        admin_user = {
            "id": str(uuid.uuid4()),
            "name": "Admin GAZ MAN",
            "email": admin_email,
            "password_hash": pwd_context.hash(admin_password),
            "role": "admin",
            "address": "Yaoundé, Cameroun",
            "state": "Centre",
            "language": "fr",
            "created_at": "2026-01-01T00:00:00"
        }
        
        await db.users.insert_one(admin_user)
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🔐 Creating admin user...")
    asyncio.run(create_admin_user())
