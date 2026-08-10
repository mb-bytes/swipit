from fastapi import status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from app.core.security import decode_jwt_token
from app.api.users.user_service import user_service
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db


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
            token = request.cookies.get("access_token") or request.cookies.get("token")

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

class AccessTokenBearer(TokenBearer):
    def __init__(self, auto_error = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials | None:
        token_data = await super().__call__(request)
        
        if token_data.get('refresh'):
            raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail="Please provide an access token")

        return token_data

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


        
