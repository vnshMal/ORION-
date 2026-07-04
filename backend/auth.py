from jose import jwt
from datetime import datetime, timedelta
import bcrypt

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

fake_users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": "$2b$12$usHN3mlemF/OZ8BKMPAZN.MJT0diveVB/Yur89WIUslouyDCLUPAO",
        "role": "admin"
    }
}


def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print("Bcrypt verify error:", e)
        return False


def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

