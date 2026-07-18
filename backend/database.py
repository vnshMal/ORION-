import os
import sqlite3
from datetime import datetime

# Centralized absolute path to alerts.db in the backend folder
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'alerts.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        src_ip TEXT,
        severity TEXT,
        timestamp TEXT
    )
    """)

    conn.commit()
    conn.close()


def save_alert(alert, src_ip):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO alerts (src_ip, severity, timestamp) VALUES (?, ?, ?)",
        (
            src_ip,
            alert["severity"],
            datetime.now().strftime("%H:%M:%S")
        )
    )

    conn.commit()
    conn.close()