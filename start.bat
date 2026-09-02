@echo off
echo Starting Criminal Network Analysis System...

echo Checking Docker (Neo4j)...
docker-compose up -d

echo Starting Backend...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"

echo Starting Frontend...
start cmd /k "cd frontend && npm start"

echo All services are starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
