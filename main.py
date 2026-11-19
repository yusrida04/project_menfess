from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menfess

app = FastAPI(title="UNIMED Menfess API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menfess.router)

@app.get("/")
def root():
    return {"status": "Backend UNIMED Menfess aktif"}