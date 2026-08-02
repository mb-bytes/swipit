from celery import Celery
from app.core.mail import mail, create_message
from asgiref.sync import async_to_sync

c_app = Celery()

c_app.config_from_object('app.core.config')

@c_app.task()
def send_mail(recipient: str, subject: str, body: str):
    message = create_message(recipients=[recipient], subject=subject, body=body)
    async_to_sync(mail.send_message)(message)


