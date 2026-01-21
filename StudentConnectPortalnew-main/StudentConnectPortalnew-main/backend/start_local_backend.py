import os
import subprocess
import sys

# Set the MongoDB URL environment variable
os.environ['MONGODB_URL'] = 'mongodb+srv://admin:wbWR1zL8vNgWylMg@cluster0.nxklt.mongodb.net/studyconnect'

print("🚀 Starting local backend with correct MongoDB URL...")
print(f"📡 MongoDB URL: {os.environ['MONGODB_URL'].split('@')[-1]}")

# Start the uvicorn server
try:
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "main:app", 
        "--reload", 
        "--host", "0.0.0.0", 
        "--port", "8000"
    ])
except KeyboardInterrupt:
    print("\n👋 Backend stopped by user")
except Exception as e:
    print(f"❌ Error starting backend: {e}") 