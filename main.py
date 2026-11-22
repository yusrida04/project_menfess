from dotenv import load_dotenv
load_dotenv()

from database import init_db
init_db()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import menfess, admin

app = FastAPI(title="UNIMED Menfess API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menfess.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"status": "Backend UNIMED Menfess aktif"}