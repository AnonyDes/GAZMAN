"""
Create a driver user for development/testing.

⚠️ DEV ONLY - DO NOT USE IN PRODUCTION ⚠️

For production:
1. Set DRIVER_EMAIL and DRIVER_DEFAULT_PASSWORD in environment variables
2. Change the password immediately after first login
"""
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

async def create_driver_user():
    """Create a driver user if not exists."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Get credentials from environment variables or use defaults
    driver_email = os.environ.get('DRIVER_EMAIL', 'driver@gazman.cm')
    driver_password = os.environ.get('DRIVER_DEFAULT_PASSWORD', 'CHANGE_ME_IN_PRODUCTION')
    
    print("⚠️  DEV ONLY - Default driver credentials should be changed in production!")
    print(f"   Using DRIVER_EMAIL: {driver_email}")
    
    try:
        # Check if driver already exists
        existing = await db.users.find_one({"email": driver_email})
        if existing:
            print(f"✅ Driver user already exists: {driver_email}")
            print("   To reset password, delete the user from DB and re-run this script.")
            return
        
        # Create driver user
        driver_user = {
            "id": str(uuid.uuid4()),
            "name": "Livreur Test",
            "email": driver_email,
            "password_hash": pwd_context.hash(driver_password),
            "role": "driver",
            "address": "Yaoundé, Cameroun",
            "state": "Centre",
            "language": "fr",
            "created_at": "2026-01-01T00:00:00"
        }
        
        await db.users.insert_one(driver_user)
        print(f"✅ Driver user created successfully!")
        print(f"   Email: {driver_email}")
        print("   ⚠️  IMPORTANT: Change the default password immediately after first login!")
        
    except Exception as e:
        print(f"❌ Error creating driver user: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🚚 Creating driver user...")
    print("=" * 50)
    asyncio.run(create_driver_user())
