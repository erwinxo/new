#!/usr/bin/env python3
"""
Script to generate a secure encryption key for chat messages.
Run this script once to generate a key, then add it to your environment variables.
"""

from cryptography.fernet import Fernet
import base64

def generate_encryption_key():
    """Generate a new encryption key"""
    key = Fernet.generate_key()
    return key.decode()

if __name__ == "__main__":
    print("🔐 Generating secure encryption key for chat messages...")
    key = generate_encryption_key()
    
    print("\n✅ Encryption key generated successfully!")
    print(f"\n🔑 Your encryption key: {key}")
    
    print("\n📝 Add this to your .env file:")
    print(f"CHAT_ENCRYPTION_KEY={key}")
    
    print("\n⚠️  IMPORTANT SECURITY NOTES:")
    print("1. Keep this key secret and secure")
    print("2. Never commit this key to version control")
    print("3. Use the same key across all your deployments")
    print("4. If you lose this key, you cannot decrypt existing messages")
    print("5. For production, consider using a secure key management service")
    
    print("\n🚀 Your chat messages will now be encrypted in the database!") 