from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

engine = create_async_engine(settings.DB_URL, echo=True, pool_size=10, max_overflow=20, pool_pre_ping=True)

AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, autoflush= False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

