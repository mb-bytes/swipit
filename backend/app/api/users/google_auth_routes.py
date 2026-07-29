from fastapi import APIRouter, Depends
from fastapi.requests import Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import get_curr_user
from app.api.users.google_service import google_service
from app.core.security import encrypt_token, create_url_safe_token, decode_url_safe_token
import json
from datetime import datetime, timezone
from googleapiclient.discovery import build

google_router = APIRouter(tags=['google-oauth'])

@google_router.get("/login")
async def google_login(current_user = Depends(get_curr_user)):
    flow = google_service.build_flow()

    # Step 1: Initial call generates PKCE code_verifier on flow instance
    authorization_url, _ = flow.authorization_url(
        access_type="offline",      # REQUIRED to get a refresh_token
        include_granted_scopes="true",
        prompt="consent",           # forces refresh_token even on repeat consent
    )

    # Step 2: Pack user_id and PKCE code_verifier into signed state token
    state_payload = create_url_safe_token({
        "user_id": str(current_user.user_id),
        "code_verifier": flow.code_verifier,
    })

    # Step 3: Generate final redirect URL containing state
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state_payload,
    )

    return RedirectResponse(authorization_url)

@google_router.get("/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Recover which user and code_verifier this state belongs to
    state = request.query_params.get("state")
    state_data = decode_url_safe_token(state)
    user_id = state_data["user_id"]
    code_verifier = state_data.get("code_verifier")
 
    # 2. Rebuild the Flow, attach code_verifier and exchange the code for tokens
    flow = google_service.build_flow(state=state)
    if code_verifier:
        flow.code_verifier = code_verifier

    flow.fetch_token(authorization_response=str(request.url))
 
    creds = flow.credentials  # google.oauth2.credentials.Credentials
 
    # 3. Find out which Gmail address this actually is
    oauth2_service = build("oauth2", "v2", credentials=creds)
    user_info = oauth2_service.userinfo().get().execute()
    email = user_info["email"]
 
    # 4. Encrypt before storing — never save creds.token or creds.refresh_token raw
    encrypted_access = encrypt_token(creds.token)
    encrypted_refresh = encrypt_token(creds.refresh_token) if creds.refresh_token else ""
 
    await google_service.upsert_connected_account(
        db,
        user_id=user_id,
        email=email,
        encrypted_access_token=encrypted_access,
        encrypted_refresh_token=encrypted_refresh,
        token_expiry=creds.expiry.replace(tzinfo=timezone.utc) if creds.expiry else datetime.now(timezone.utc),
        scopes=" ".join(creds.scopes or []),
    )
 
    return {"status": "connected", "email": email}

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






