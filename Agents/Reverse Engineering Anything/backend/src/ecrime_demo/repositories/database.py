"""Async SQLAlchemy engine and session factory with connection pooling."""

from pathlib import Path

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from ecrime_demo.models.database import Base
from ecrime_demo.settings import Settings


def create_engine(settings: Settings) -> AsyncEngine:
    """Create the async engine, ensuring the SQLite directory exists."""
    url = make_url(settings.database_url)
    if url.database:
        Path(url.database).parent.mkdir(parents=True, exist_ok=True)
    return create_async_engine(settings.database_url, pool_pre_ping=True)


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    """Create the session factory."""
    return async_sessionmaker(engine, expire_on_commit=False)


async def init_database(engine: AsyncEngine) -> None:
    """Create tables if they do not exist."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
