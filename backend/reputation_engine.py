import sqlite3
from database import DB_PATH

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS reputation(
    ip TEXT PRIMARY KEY,
    score INTEGER
)
""")

def update_reputation(ip):
    cursor.execute("SELECT score FROM reputation WHERE ip=?", (ip,))
    result = cursor.fetchone()

    if result:
        new_score = result[0] + 10
        cursor.execute("UPDATE reputation SET score=? WHERE ip=?", (new_score, ip))
    else:
        new_score = 10
        cursor.execute("INSERT INTO reputation(ip, score) VALUES (?, ?)", (ip, new_score))

    conn.commit()
    return new_score
