import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoint():
    response = client.post("/api/v1/chat", json={
        "message": "Hello, how are you?",
        "history": []
    })
    print(f"HTTP Status: {response.status_code}")
    print(f"Response JSON: {response.json()}")

test_endpoint()
