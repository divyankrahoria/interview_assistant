from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import planner_routes

app = FastAPI(
    title="Interview Prep API",
    description="API for managing interview preparation study plans",
    version="1.0.0",
)

# CORS (allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js local dev
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Planner routes (RESTful)
app.include_router(planner_routes.router, prefix="/planner", tags=["Planner"])

# Health check
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "Interview Prep API is running",
        "endpoints": ["/planner/plans", "/planner/generate", "/planner/plan/{plan_id}"]
    }
