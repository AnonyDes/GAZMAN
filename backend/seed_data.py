"""Seed initial data for the application."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from models import Product
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Sample gas products with prices in XAF (FCFA)
SAMPLE_PRODUCTS = [
    # Total Brand - Domestic
    {
        "name": "Total Gas Bottle",
        "brand": "Total",
        "category": "domestic",
        "size": "small",
        "capacity": "7.5L",
        "price": 10000,  # 10,000 FCFA
        "stock": 50,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        "description": "Perfect for small households. Ideal for cooking and heating.",
        "rating": 4.8,
        "delivery_time": "15-20 min"
    },
    {
        "name": "Total Gas Cylinder",
        "brand": "Total",
        "category": "domestic",
        "size": "medium",
        "capacity": "12kg",
        "price": 18000,  # 18,000 FCFA
        "stock": 80,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        "description": "Standard size for regular household use. Long-lasting and reliable.",
        "rating": 4.9,
        "delivery_time": "15-20 min"
    },
    {
        "name": "Total Gas Large",
        "brand": "Total",
        "category": "domestic",
        "size": "large",
        "capacity": "15kg",
        "price": 23000,  # 23,000 FCFA
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        "description": "Large capacity for big families or extended use.",
        "rating": 4.7,
        "delivery_time": "20-25 min"
    },
    
    # Tradex Brand - Domestic
    {
        "name": "Tradex Gas Bottle",
        "brand": "Tradex",
        "category": "domestic",
        "size": "small",
        "capacity": "7.5L",
        "price": 9500,  # 9,500 FCFA
        "stock": 60,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop",
        "description": "Affordable and efficient gas bottle for daily cooking needs.",
        "rating": 4.6,
        "delivery_time": "15-20 min"
    },
    {
        "name": "Tradex Gas Cylinder",
        "brand": "Tradex",
        "category": "domestic",
        "size": "medium",
        "capacity": "12kg",
        "price": 17000,  # 17,000 FCFA
        "stock": 70,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop",
        "description": "Reliable medium-sized gas cylinder for your home.",
        "rating": 4.5,
        "delivery_time": "15-20 min"
    },
    {
        "name": "Tradex Gas Large",
        "brand": "Tradex",
        "category": "domestic",
        "size": "large",
        "capacity": "15kg",
        "price": 21000,  # 21,000 FCFA
        "stock": 45,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop",
        "description": "Large capacity, great value for extended household use.",
        "rating": 4.4,
        "delivery_time": "20-25 min"
    },
    
    # Industrial Gas
    {
        "name": "Total Industrial Propane",
        "brand": "Total",
        "category": "industrial",
        "size": "large",
        "capacity": "35kg",
        "price": 55000,  # 55,000 FCFA
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        "description": "Heavy-duty propane for industrial and commercial use. Perfect for restaurants, hotels, and factories.",
        "rating": 4.9,
        "delivery_time": "30-40 min"
    },
    {
        "name": "Tradex Industrial Gas",
        "brand": "Tradex",
        "category": "industrial",
        "size": "large",
        "capacity": "35kg",
        "price": 53000,  # 53,000 FCFA
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        "description": "High-performance industrial gas for heavy-duty operations.",
        "rating": 4.7,
        "delivery_time": "30-40 min"
    },
    
    # Refill Service
    {
        "name": "Cylinder Refill Service",
        "brand": "Total",
        "category": "refill",
        "size": "medium",
        "capacity": "12kg",
        "price": 14000,  # 14,000 FCFA
        "stock": 100,
        "image_url": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop",
        "description": "Refill your existing cylinder. Eco-friendly and cost-effective.",
        "rating": 4.8,
        "delivery_time": "25-30 min"
    },
    
    # Rental Service
    {
        "name": "Gas Cylinder Rental",
        "brand": "Total",
        "category": "rental",
        "size": "medium",
        "capacity": "12kg",
        "price": 5000,  # 5,000 FCFA per month
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop",
        "description": "Monthly rental service for gas cylinders. No purchase required.",
        "rating": 4.5,
        "delivery_time": "20-25 min"
    },
]

async def seed_products():
    """Seed products into the database."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        # Check if products already exist
        count = await db.products.count_documents({})
        if count > 0:
            print(f"Products already seeded ({count} products found). Skipping...")
            return
        
        # Insert products
        products_to_insert = []
        for product_data in SAMPLE_PRODUCTS:
            product = Product(**product_data)
            product_dict = product.model_dump()
            product_dict['created_at'] = product_dict['created_at'].isoformat()
            products_to_insert.append(product_dict)
        
        result = await db.products.insert_many(products_to_insert)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} products!")
        
        # Print summary
        print("\n📦 Product Summary:")
        for product in SAMPLE_PRODUCTS:
            print(f"  - {product['brand']} {product['name']} ({product['capacity']}) - ${product['price']}")
        
    except Exception as e:
        print(f"❌ Error seeding products: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🌱 Starting database seeding...")
    asyncio.run(seed_products())
    print("\n✨ Seeding complete!")
