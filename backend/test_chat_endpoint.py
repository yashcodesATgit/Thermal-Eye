import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoint():
    response = client.post("/api/v1/chat", json={
        "message": "What is the status of the system?",
        "history": []
    })
    print(f"HTTP Status: {response.status_code}")
    print(f"Response JSON: {response.json()}")

test_endpoint()
