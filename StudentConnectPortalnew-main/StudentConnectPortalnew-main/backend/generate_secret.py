import secrets

# Generate a secure secret key for JWT
secret_key = secrets.token_urlsafe(32)
print(f"Generated SECRET_KEY: {secret_key}")
print("\nCopy this value to your Render backend environment variables:")
print(f"SECRET_KEY={secret_key}")
