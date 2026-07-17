@echo off
npx concurrently -c "cyan.bold,magenta.bold" -n "BACKEND,FRONTEND" "cd backend && " "cd frontend && npm run dev"
uvicorn main:app --reload