from fastapi import FastAPI
from .api.users.user_routes import user_router

app = FastAPI(title="SwipIt", version="v1")

app.include_router(user_router, prefix="/api/user")

@app.get("/health")
def get_health():
    return {"message":"App Running"}