"""
ThermalWatch FastAPI application entry point.
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.exceptions import (
    DatabaseError,
    NotFoundError,
    database_error_handler,
    not_found_handler,
)

from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup/shutdown logging."""
    logger.info("ThermalWatch API starting up...")
    logger.info("Environment: %s", settings.environment)
    logger.info("Frontend origin: %s", settings.frontend_origin)
    logger.info("API docs available at /docs")
    yield
    logger.info("ThermalWatch API shutting down...")


# Create FastAPI application
app = FastAPI(
    title="ThermalWatch API",
    description="Geospatial thermal intelligence platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware — restricted to configured frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(NotFoundError, not_found_handler)  # type: ignore[arg-type]
app.add_exception_handler(DatabaseError, database_error_handler)  # type: ignore[arg-type]

# Include API v1 router
app.include_router(v1_router)

