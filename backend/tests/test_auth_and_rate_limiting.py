"""
Unit tests for Authentication and Rate Limiting API endpoints.
Verifies password hashing, user registration, authentication, token session validation, and server-side rate-limit enforcement.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.auth import (
    hash_password,
    verify_password,
    create_session,
    get_session,
    revoke_session,
    check_rate_limit
)
from app.core.redis import redis_manager


def test_password_hashing():
    """Verify PBKDF2-HMAC-SHA256 password hashing and verification."""
    raw_pwd = "SecretPassword123!"
    h = hash_password(raw_pwd)

    assert h != raw_pwd
    assert "$" in h
    assert verify_password(raw_pwd, h) is True
    assert verify_password("WrongPassword", h) is False


def test_session_token_lifecycle():
    """Verify token generation, session retrieval, and token revocation."""
    user_id = "user-12345"
    email = "analyst@thermalwatch.org"
    name = "Test Analyst"

    token = create_session(user_id, email, name)
    assert token.startswith("tw-")

    session = get_session(token)
    assert session is not None
    assert session["user_id"] == user_id
    assert session["email"] == email

    res = revoke_session(token)
    assert res is True
    assert get_session(token) is None


@pytest.mark.anyio
async def test_rate_limiter_enforcement():
    """Verify server-side rate limit checking for anonymous vs authenticated calls."""
    test_id = "test-user-rate-limit-auth-file"

    # Delete previous key if present in Redis
    client = redis_manager.get_client()
    await client.delete(f"thermalwatch:quota:ai:guest:{test_id}")

    # Anonymous AI limit test (10 requests max)
    for _ in range(10):
        allowed, msg = await check_rate_limit(test_id, is_ai_endpoint=True, is_authenticated=False)
        assert allowed is True

    # 11th call should exceed quota
    allowed, msg = await check_rate_limit(test_id, is_ai_endpoint=True, is_authenticated=False)
    assert allowed is False
    assert "limit" in msg.lower()


def test_supabase_jwt_verification():
    """Verify get_session decodes Supabase JWT tokens."""
    import jwt
    payload = {
        "sub": "supa-user-999",
        "email": "supa@thermalwatch.org",
        "user_metadata": {"name": "Supabase Analyst"},
        "aud": "authenticated"
    }
    jwt_token = jwt.encode(payload, "secret", algorithm="HS256")
    sess = get_session(jwt_token)
    assert sess is not None
    assert sess["user_id"] == "supa-user-999"
    assert sess["email"] == "supa@thermalwatch.org"
    assert sess["name"] == "Supabase Analyst"
