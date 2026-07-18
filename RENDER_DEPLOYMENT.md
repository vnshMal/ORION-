# 🌌 Deploying ORION to Render

This guide walks you through deploying the FastAPI backend and Next.js frontend to Render, and configuring your local packet sniffer to send network alert telemetry to your cloud dashboard.

---

## 🚀 Deployment Instructions

### 1. Push Changes to GitHub
Make sure all your code changes (including `render.yaml` and frontend/backend refactors) are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Render blueprint and path updates"
git push origin main
```

### 2. Deploy the Blueprint on Render
1. Go to [Render](https://render.com/) and log in.
2. Click the **New +** button in the top right and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will parse your `render.yaml` file and show the services to deploy:
   - `orion-backend` (FastAPI Python service)
   - `orion-frontend` (Next.js Node service)
5. Click **Apply**.
6. Render will build and deploy both applications concurrently. During the backend build, it will automatically run `train_model.py` to train the ML Random Forest model.

---

## 📡 Running the Packet Sniffer Locally

Since cloud containers on Render run in isolated environments without direct access to raw network cards, **your packet sniffer must run locally on your PC**. 

To connect your local sniffer to your Render database:

### 1. Copy your Backend URL
Once deployment is complete, copy the public URL of your `orion-backend` service (e.g., `https://orion-backend.onrender.com`).

### 2. Run the Sniffer with the environment variable
Set the `ORION_API_URL` environment variable before running the sniffer so it redirects logs to the cloud:

#### In Windows PowerShell:
```powershell
$env:ORION_API_URL="https://your-backend-url.onrender.com"
backend\venv\Scripts\python backend/packet_sniffer.py
```

#### In Windows Command Prompt (CMD):
```cmd
set ORION_API_URL=https://your-backend-url.onrender.com
backend\venv\Scripts\python backend/packet_sniffer.py
```

#### In Linux/macOS:
```bash
export ORION_API_URL="https://your-backend-url.onrender.com"
source backend/venv/bin/activate
python backend/packet_sniffer.py
```

---

## ⚠️ Notes on Render Free Tier
- **SQLite Database Ephemerality**: The backend uses SQLite. On Render's Free tier, container filesystems are ephemeral. Every time your service restarts (after being idle for 15+ minutes or when redeployed), the database `alerts.db` is reset to blank. This is normal behavior for free containers.
- **Spin-up Delay**: Free instances spin down when inactive. If you haven't visited your site in a while, the first request to the dashboard or API might take 50 seconds to boot up.
