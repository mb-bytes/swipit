from passlib.context import CryptContext

password_context = CryptContext(schemes=['bcrypt'])

def gen_pswd_hash(password: str) -> str:
    hash = password_context.hash(password)
    return hash

def verify_pswd(password: str, hash: str) ->bool:
    return password_context.verify(password, hash)