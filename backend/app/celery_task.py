from celery import Celery
from app.core.mail import mail, create_message
from asgiref.sync import async_to_sync
import asyncio

c_app = Celery()

c_app.config_from_object('app.core.config')


@c_app.task()
def send_mail(recipient: str, subject: str, body: str):
    message = create_message(recipients=[recipient], subject=subject, body=body)
    async_to_sync(mail.send_message)(message)


@c_app.task(bind=True, max_retries=3, default_retry_delay=60)
def ingest_gmail_for_user(self, user_id: str, after_date: str = "2026/07/25"):
    import app.db.models
    from app.db.session import AsyncSessionLocal, engine
    from app.api.gmail.gmail_service import gmail_service
    from app.api.gmail.gmail_routes import PARSERS

    async def _run():
        try:
            async with AsyncSessionLocal() as db:
                from app.api.merchants.merchant_service import merchant_cache_service
                await merchant_cache_service.hydrate_cache(db)

                gmail_client = await gmail_service.get_gmail_client(db, user_id=user_id)
                result = await gmail_service.parse_and_save(
                    db=db,
                    user_id=user_id,
                    gmail_client=gmail_client,
                    parsers=PARSERS,
                    after_date=after_date,
                )
                return result
        finally:
            await engine.dispose()

    try:
        return asyncio.run(_run())
    except Exception as exc:
        raise self.retry(exc=exc)
