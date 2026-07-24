from passlib.context import CryptContext
import jwt

password_context = CryptContext(schemes=['bcrypt'])

def gen_pswd_hash(password: str) -> str:
    hash = password_context.hash(password)
    return hash

def verify_pswd(password: str, hash: str) ->bool:
    return password_context.verify(password, hash)

def generate_jwt_token(user_data: dict):
    pass

def decode_jwt_token(token: str):
    pass

def create_url_safe_token(data: dict):
    pass

def decode_url_safe_token(token: str):
    pass