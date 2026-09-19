from fastapi import status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from app.core.security import decode_jwt_token
from app.api.users.user_service import user_service
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.redis.redis import redis


class TokenBearer(HTTPBearer):
    def __init__(self, auto_error=True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        token = None
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")

        if auth_header:
            auth_header = auth_header.strip()
            if auth_header.lower().startswith("bearer "):
                token = auth_header.split(" ", 1)[1].strip()
            else:
                token = auth_header

        if not token:
            token = (
                request.cookies.get("refresh_token")
                or request.cookies.get("access_token")
                or request.cookies.get("token")
            )

        if not token:
            token = request.query_params.get("token")

        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

        token = token.strip()
        if token.lower().startswith("bearer "):
            token = token.split(" ", 1)[1].strip()

        token_data = decode_jwt_token(token)

        if not token_data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired token")

        check_in_blocklist = await user_service.token_in_blocklist(token_data['jti'])

        if check_in_blocklist:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked, please login again!")

        return token_data

class OptionalTokenBearer(TokenBearer):
    def __init__(self, auto_error=False):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        try:
            return await super().__call__(request)
        except Exception:
            return None

class AccessTokenBearer(TokenBearer):
    def __init__(self, auto_error = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials | None:
        token_data = await super().__call__(request)
        
        if token_data.get('refresh'):
            raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail="Please provide an access token")

        return token_data

class OptionalAccessTokenBearer(AccessTokenBearer):
    def __init__(self):
        super().__init__(auto_error=False)

    async def __call__(self, request: Request):
        try:
            return await super().__call__(request)
        except Exception:
            return None

class RefreshTokenBearer(TokenBearer):
    def __init__(self, auto_error=True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        token_data = await super().__call__(request)
        
        if not token_data.get('refresh'):
            raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail="Please provide a refresh token")

        return token_data

async def get_curr_user(db: AsyncSession = Depends(get_db), token_data: dict = Depends(AccessTokenBearer())):
    username = token_data['user']['username']
    current_user = await user_service.get_user_by_username(db, username)

    return current_user


async def get_curr_user_flexible(db: AsyncSession = Depends(get_db), token_data: dict = Depends(TokenBearer())):
    username = token_data['user']['username']
    current_user = await user_service.get_user_by_username(db, username)

    return current_user


RATE_LIMIT_LUA = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
end
return current
"""


def get_client_ip(request: Request) -> str:
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


def rate_limit(limit: int, window: int = 60):
    async def dependency(request: Request) -> None:
        ip = get_client_ip(request)
        key = f"rate_limit:{ip}:{request.url.path}"
        current = await redis.eval(RATE_LIMIT_LUA, 1, key, window)
        if current > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
    return dependency
