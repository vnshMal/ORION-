@echo off
npx concurrently -c "cyan.bold,magenta.bold" -n "BACKEND,FRONTEND" "cd backend && .\venv\Scripts\uvicorn main:app --reload" "cd frontend && npm run dev"