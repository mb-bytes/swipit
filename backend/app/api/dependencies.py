from fastapi import status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from app.core.security import decode_jwt_token

class AccessTokenBearer(HTTPBearer):
    def __init__(self, auto_error = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials | None:
        creds = super().__call__(request)
        token = creds.credentials
        token_data = decode_jwt_token(token)

        if not token_data:
            raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail="Invalid or expired token")
        
        if token_data['refresh']:
            raise HTTPException(status_code= status.HTTP_403_FORBIDDEN, detail="Please provide an access token")
        
