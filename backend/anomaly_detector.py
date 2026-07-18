import os
import pandas as pd
import joblib

# Load trained model using absolute path relative to this file
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
model = joblib.load(MODEL_PATH)


def check_anomaly(features):
    try:
        # ✅ Convert dict → DataFrame (CRITICAL)
        df = pd.DataFrame([features])

        prediction = model.predict(df)[0]

        if prediction == 1:
            return {
                "type": "Intrusion Detected 🚨",
                "severity": "High"
            }
        else:
            return None

    except Exception as e:
        print("Prediction Error:", e)
        return None
