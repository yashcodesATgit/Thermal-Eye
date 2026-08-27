"""
ThermalWatch backend configuration.
Loads settings from environment variables via pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str
    database_url_direct: str | None = None
    testing: bool = False

    @property
    def get_database_url(self) -> str:
        """
        Return the preferred database URL.

        Always prefers database_url_direct (port 5432, direct PostgreSQL) when
        configured. This bypasses PgBouncer (port 6543, transaction-pool mode)
        which conflicts with asyncpg's internal prepared statement initialization
        (DuplicatePreparedStatementError). Falls back to database_url (PgBouncer
        pooler) when database_url_direct is not set.
        """
        if self.database_url_direct:
            return self.database_url_direct
        return self.database_url

    # CORS
    frontend_origin: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        """Return list of allowed CORS origins, supporting comma-separated strings."""
        origins = [o.strip() for o in self.frontend_origin.split(",") if o.strip()]
        return origins or ["http://localhost:5173"]

    # Environment
    environment: str = "development"

    # NASA FIRMS API key — keep backend-only, never expose to frontend
    firms_map_key: str = ""

    # Number of past days to include in each FIRMS ingestion request.
    # NASA FIRMS Area API supports 1–10 days per request.
    # Configurable via FIRMS_INGESTION_DAYS in .env.
    firms_ingestion_days: int = 7

    # Comma-separated list of FIRMS source identifiers to ingest in multi-source mode.
    # Configurable via FIRMS_SOURCES in .env.
    # Defaults to all three operational VIIRS NRT satellites:
    #   VIIRS_SNPP_NRT   (Suomi NPP, ~375 m resolution)
    #   VIIRS_NOAA20_NRT (NOAA-20, ~375 m resolution)
    #   VIIRS_NOAA21_NRT (NOAA-21, ~375 m resolution)
    firms_sources: str = "VIIRS_SNPP_NRT,VIIRS_NOAA20_NRT,VIIRS_NOAA21_NRT"
    firms_sync_interval_hours: int = 1
    firms_stale_threshold_hours: int = 3

    # Redis Infrastructure Configuration
    redis_url: str = "redis://localhost:6379/0"
    ai_user_quota_per_hour: int = 100
    ai_guest_quota_per_hour: int = 10
    analytics_cache_ttl_seconds: int = 300
    rate_limit_general_per_minute: int = 60
    rate_limit_expensive_per_minute: int = 15

    @property
    def firms_source_list(self) -> list[str]:
        """Return the list of configured FIRMS sources (trimmed, non-empty)."""
        return [s.strip() for s in self.firms_sources.split(",") if s.strip()]

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    # LLM Settings (Backend Only)
    llm_provider: str = "gemini"
    llm_model: str = "gemini-3.6-flash"
    gemini_api_key: str = ""


settings = Settings()  # type: ignore[call-arg]
