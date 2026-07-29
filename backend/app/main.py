from fastapi import FastAPI
from .api.users.user_routes import user_router
from .api.users.google_auth_routes import google_router

app = FastAPI(title="SwipIt", version="v1")

app.include_router(user_router, prefix="/api/user")
app.include_router(google_router, prefix="/auth/google")

@app.get("/health")
def get_health():
    return {"message":"App Running"}