from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, entities, graph, analytics, anomalies, evidence

app = FastAPI(title="Criminal Network Analysis System", version="0.1.0")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(entities.router, prefix="/entities", tags=["entities"])
app.include_router(graph.router, prefix="/graph", tags=["graph"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(anomalies.router, prefix="/anomalies", tags=["anomalies"])
app.include_router(evidence.router, prefix="/evidence", tags=["evidence"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Criminal Network Analysis System"}
