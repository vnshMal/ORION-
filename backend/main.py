from fastapi.security import OAuth2PasswordRequestForm
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from auth import authenticate_user, create_access_token
from jose import jwt
import sqlite3
from auth import SECRET_KEY
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def home():
    return {"message": "IDS System Running 🚀"}

@app.get("/api/v1/alerts")
def external_alerts(user=Depends(get_current_user)):
    return get_alerts()


class AlertSubmitItem(BaseModel):
    src_ip: str
    severity: str
    type: str


@app.post("/api/v1/alerts/submit")
def submit_alert(item: AlertSubmitItem):
    from database import save_alert
    save_alert(
        alert={
            "type": item.type,
            "severity": item.severity
        },
        src_ip=item.src_ip
    )
    return {"message": "Alert submitted successfully"}



@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({
        "sub": user["username"],
        "role": user["role"]
    })

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/admin-only")
def admin_route(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"message": "Welcome Admin"}


from database import DB_PATH

@app.get("/heatmap")
def heatmap_data():
    # Mocking heatmap data because alerts table lacks latitude/longitude columns
    import random
    points = []
    for _ in range(50):
        points.append({
            "lat": random.uniform(-60, 60),
            "lon": random.uniform(-150, 150)
        })

    return {"heatmap": points}


@app.get("/alerts")
def get_alerts():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, src_ip, severity, timestamp FROM alerts ORDER BY id DESC LIMIT 50")
        rows = cursor.fetchall()
    except sqlite3.OperationalError:
        rows = []
    finally:
        conn.close()

    alerts = []
    for row in rows:
        alerts.append({
            "id": row[0],
            "source_ip": row[1],
            "severity": row[2],
            "timestamp": row[3],
            "type": "Anomaly Detected",
            "latitude": None,
            "longitude": None
        })

    return {"alerts": alerts}


from pydantic import BaseModel
from typing import List, Dict, Optional
import time
import signature_detector
import blacklist

class SignatureItem(BaseModel):
    id: Optional[int] = None
    name: str
    protocol: str
    pattern: str
    severity: str
    active: Optional[bool] = True

class BlacklistIP(BaseModel):
    ip: str

class PacketPayload(BaseModel):
    src_bytes: int
    dst_bytes: int
    protocol_type: int

class ConfigData(BaseModel):
    alert_threshold: int
    reputation_increment: int
    blacklist_duration: int
    active_interface: str


@app.get("/api/v1/signatures")
def get_signatures():
    return {"signatures": signature_detector.signatures}

@app.post("/api/v1/signatures")
def add_signature(sig: SignatureItem):
    if sig.id is None:
        new_id = max([s["id"] for s in signature_detector.signatures], default=0) + 1
        sig.id = new_id
    else:
        for index, existing in enumerate(signature_detector.signatures):
            if existing["id"] == sig.id:
                signature_detector.signatures[index] = sig.dict()
                return {"message": "Signature updated successfully", "signature": sig}
    
    signature_detector.signatures.append(sig.dict())
    return {"message": "Signature added successfully", "signature": sig}

@app.delete("/api/v1/signatures/{sig_id}")
def delete_signature(sig_id: int):
    for index, sig in enumerate(signature_detector.signatures):
        if sig["id"] == sig_id:
            deleted = signature_detector.signatures.pop(index)
            return {"message": "Signature deleted successfully", "signature": deleted}
    raise HTTPException(status_code=404, detail="Signature not found")

@app.post("/api/v1/signatures/{sig_id}/toggle")
def toggle_signature(sig_id: int):
    for sig in signature_detector.signatures:
        if sig["id"] == sig_id:
            sig["active"] = not sig.get("active", True)
            return {"message": f"Signature active status set to {sig['active']}", "signature": sig}
    raise HTTPException(status_code=404, detail="Signature not found")


@app.get("/api/v1/blacklist")
def get_blacklist_ips():
    current_time = time.time()
    active_blacklist = []
    for ip, block_time in list(blacklist.blacklisted_ips.items()):
        elapsed = current_time - block_time
        if elapsed < 300:
            active_blacklist.append({
                "ip": ip,
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(block_time)),
                "expires_in": int(300 - elapsed)
            })
        else:
            if ip in blacklist.blacklisted_ips:
                del blacklist.blacklisted_ips[ip]
    return {"blacklist": active_blacklist}

@app.post("/api/v1/blacklist")
def add_blacklist_ip(item: BlacklistIP):
    blacklist.add_to_blacklist(item.ip)
    return {"message": f"IP {item.ip} blacklisted successfully"}

@app.delete("/api/v1/blacklist/{ip}")
def remove_blacklist_ip(ip: str):
    if ip in blacklist.blacklisted_ips:
        del blacklist.blacklisted_ips[ip]
        return {"message": f"IP {ip} removed from blacklist"}
    raise HTTPException(status_code=404, detail="IP not found in blacklist")


@app.get("/api/v1/ml-stats")
def get_ml_stats():
    return {
        "accuracy": 97.33,
        "precision": 97.23,
        "recall": 99.80,
        "model_type": "Random Forest Classifier",
        "dataset": "NSL-KDD",
        "features": [
            {"name": "src_bytes", "description": "Source to destination bytes (size of packet)", "importance": 0.45},
            {"name": "dst_bytes", "description": "Destination to source bytes (size of payload)", "importance": 0.38},
            {"name": "protocol_type", "description": "Protocol type (TCP = 0, UDP = 1, Other = 2)", "importance": 0.17}
        ]
    }

@app.post("/api/v1/predict")
def predict_anomaly(payload: PacketPayload):
    import anomaly_detector
    features = {
        "src_bytes": payload.src_bytes,
        "dst_bytes": payload.dst_bytes,
        "protocol_type": payload.protocol_type
    }
    result = anomaly_detector.check_anomaly(features)
    if result:
        return {"anomaly": True, "details": result}
    return {"anomaly": False, "details": {"type": "Normal Traffic", "severity": "None"}}


system_config = {
    "alert_threshold": 50,
    "reputation_increment": 10,
    "blacklist_duration": 300,
    "active_interface": "Wi-Fi (NPCAP Loopback adapter)"
}

@app.get("/api/v1/config")
def get_config():
    return system_config

@app.post("/api/v1/config")
def update_config(config: ConfigData):
    global system_config
    system_config.update(config.dict())
    return {"message": "Configuration updated successfully", "config": system_config}

