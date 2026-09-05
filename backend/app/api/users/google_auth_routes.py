from fastapi import APIRouter, Depends
from fastapi.requests import Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import get_curr_user, OptionalAccessTokenBearer
from app.api.users.google_service import google_service
from app.api.users.user_service import user_service
from app.core.config import settings
from app.core.security import encrypt_token, create_url_safe_token, decode_url_safe_token
from datetime import datetime, timezone
from googleapiclient.discovery import build
import urllib.parse

google_router = APIRouter(tags=['google-oauth'])

@google_router.get("/login")
async def google_login(
    request: Request,
    action: str = "login",
    token_data = Depends(OptionalAccessTokenBearer()),
    db: AsyncSession = Depends(get_db)
):
    flow = google_service.build_flow()
    flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="select_account consent",
    )

    state_dict = {
        "action": action,
        "code_verifier": flow.code_verifier,
    }

    if action == "connect":
        if not token_data or not token_data.get("user"):
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Please%20log%20in%20to%20connect%20Gmail")
        current_user = await user_service.get_user_by_username(db, token_data["user"]["username"])
        if not current_user:
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=User%20not%20found")
        state_dict["user_id"] = str(current_user.user_id)

    state_payload = create_url_safe_token(state_dict)

    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="select_account consent",
        state=state_payload,
    )

    return RedirectResponse(authorization_url)

@google_router.get("/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    error = request.query_params.get("error")
    if error:
        encoded_err = urllib.parse.quote(error)
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={encoded_err}")

    state = request.query_params.get("state")
    if not state:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Missing%20OAuth%20state")

    state_data = decode_url_safe_token(state)
    if not state_data:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Invalid%20or%20expired%20OAuth%20state")

    code_verifier = state_data.get("code_verifier")
    action = state_data.get("action", "login")

    flow = google_service.build_flow(state=state)
    if code_verifier:
        flow.code_verifier = code_verifier

    flow.fetch_token(authorization_response=str(request.url))
    creds = flow.credentials

    oauth2_service = build("oauth2", "v2", credentials=creds)
    user_info = oauth2_service.userinfo().get().execute()
    email = user_info.get("email")
    name = user_info.get("name")

    if not email:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Could%20not%20retrieve%20email%20from%20Google")

    encrypted_access = encrypt_token(creds.token)
    encrypted_refresh = encrypt_token(creds.refresh_token) if creds.refresh_token else ""
    token_expiry = creds.expiry.replace(tzinfo=timezone.utc) if creds.expiry else datetime.now(timezone.utc)
    scopes = " ".join(creds.scopes or [])

    if action == "connect":
        user_id = state_data.get("user_id")
        if not user_id:
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Missing%20user%20ID%20for%20account%20connection")
        await google_service.upsert_connected_account(
            db,
            user_id=user_id,
            email=email,
            encrypted_access_token=encrypted_access,
            encrypted_refresh_token=encrypted_refresh,
            token_expiry=token_expiry,
            scopes=scopes,
        )
        return RedirectResponse(f"{settings.FRONTEND_URL}/dashboard?google_connected=true")

    user = await user_service.get_or_create_google_user(db, email=email, name=name)

    await google_service.upsert_connected_account(
        db,
        user_id=user.user_id,
        email=email,
        encrypted_access_token=encrypted_access,
        encrypted_refresh_token=encrypted_refresh,
        token_expiry=token_expiry,
        scopes=scopes,
    )

    access_token, refresh_token = user_service.create_session_tokens(user)

    response = RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={access_token}")
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRY * 86400,
        path="/",
    )
    return response

@google_router.get("/status")
async def google_status(current_user = Depends(get_curr_user), db: AsyncSession = Depends(get_db)):
    account = await google_service.get_connected_account(db, current_user.user_id)
    if not account:
        return {"connected": False, "email": None}
    return {"connected": True, "email": account.email}

@google_router.post("/disconnect")
async def google_disconnect(current_user = Depends(get_curr_user), db: AsyncSession = Depends(get_db)):
    deleted = await google_service.delete_connected_account(db, current_user.user_id)
    return {"success": deleted, "message": "Google account disconnected" if deleted else "No account connected"}

@google_router.get("/test-fetch")
async def test_fetch(current_user = Depends(get_curr_user), db: AsyncSession = Depends(get_db)):
    creds = await google_service.get_valid_credentials(db, current_user.user_id)
    gmail = build("gmail", "v1", credentials=creds)

    results = gmail.users().messages().list(
        userId="me", maxResults=5
    ).execute()

    messages = results.get("messages", [])
    subjects = []
    for msg in messages:
        detail = gmail.users().messages().get(
            userId="me", id=msg["id"],
            format="metadata", metadataHeaders=["Subject"]
        ).execute()
        headers = detail.get("payload", {}).get("headers", [])
        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "(no subject)")
        subjects.append(subject)

    return {"count": len(subjects), "subjects": subjects}
