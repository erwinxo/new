import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URL from environment or use the default
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://admin:wbWR1zL8vNgWylMg@cluster0.nxklt.mongodb.net/studyconnect")

async def test_mongodb_connection():
    try:
        print(f"Attempting to connect to MongoDB...")
        print(f"URL: {MONGODB_URL.split('@')[-1] if '@' in MONGODB_URL else 'localhost'}")  # Hide credentials
        
        # Create client
        client = AsyncIOMotorClient(MONGODB_URL)
        
        # Test connection by listing databases
        print("Testing connection...")
        db_list = await client.list_database_names()
        print(f" Successfully connected to MongoDB!")
        print(f"Available databases: {db_list}")
        
        # Connect to specific database
        db = client.studyconnect
        print(f"Connecting to 'studyconnect' database...")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"Collections in 'studyconnect': {collections}")
        
        # Test specific collections
        if 'users' in collections:
            user_count = await db.users.count_documents({})
            print(f"Users collection: {user_count} documents")
        
        if 'posts' in collections:
            post_count = await db.posts.count_documents({})
            print(f"Posts collection: {post_count} documents")
        
        # Close connection
        client.close()
        print("Database connection test completed successfully!")
        
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        print("Please check your MongoDB URL and network connection.")

if __name__ == "__main__":
    asyncio.run(test_mongodb_connection()) 