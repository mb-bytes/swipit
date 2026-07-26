from passlib.context import CryptContext
from .config import settings
from datetime import datetime, timedelta
import jwt
import uuid
import logging

password_context = CryptContext(schemes=['bcrypt'])

def gen_pswd_hash(password: str) -> str:
    hash = password_context.hash(password)
    return hash

def verify_pswd(password: str, hash: str) ->bool:
    return password_context.verify(password, hash)

def generate_jwt_token(user_data: dict, expiry: timedelta = None, refresh: bool = False):
    payload = {
        "user": user_data,
        "exp": datetime.now() + (expiry if expiry is not None else timedelta(seconds=settings.ACCESS_TOKEN_EXPIRY)),
        "jti":str(uuid.uuid4()),
        "refresh":refresh
    }
    token = jwt.encode(payload=payload, key= settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token

def decode_jwt_token(token: str):
    try:
        token_data = jwt.decode(jwt=token, key=settings.JWT_SECRET, algorithms=settings.JWT_ALGORITHM)
        return token_data
    except jwt.PyJWTError as e:
        logging.exception(e)
        return None


def create_url_safe_token(data: dict):
    pass

def decode_url_safe_token(token: str):
    pass