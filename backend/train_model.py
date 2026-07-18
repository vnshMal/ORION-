import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score


import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
train_path = os.path.join(backend_dir, "dataset", "KDDTrain+.txt")

columns = [
    "duration","protocol_type","service","flag","src_bytes","dst_bytes","land",
    "wrong_fragment","urgent","hot","num_failed_logins","logged_in","num_compromised",
    "root_shell","su_attempted","num_root","num_file_creations","num_shells",
    "num_access_files","num_outbound_cmds","is_host_login","is_guest_login",
    "count","srv_count","serror_rate","srv_serror_rate","rerror_rate","srv_rerror_rate",
    "same_srv_rate","diff_srv_rate","srv_diff_host_rate","dst_host_count",
    "dst_host_srv_count","dst_host_same_srv_rate","dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate","dst_host_srv_diff_host_rate","dst_host_serror_rate",
    "dst_host_srv_serror_rate","dst_host_rerror_rate","dst_host_srv_rerror_rate",
    "label","difficulty"
]

df = pd.read_csv(train_path, names=columns)

# ONLY FEATURES WE CAN EXTRACT FROM PACKETS
df = df[["src_bytes", "dst_bytes", "protocol_type", "label"]]

# Encode protocol
le = LabelEncoder()
df["protocol_type"] = le.fit_transform(df["protocol_type"])

# Convert label to binary
df["label"] = df["label"].apply(lambda x: 0 if x == "normal" else 1)

X = df.drop("label", axis=1)
y = df["label"]

# 1. Split the data (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# 2. Train the model ONLY on the training data
model = RandomForestClassifier()
model.fit(X_train, y_train)
# 3. Ask the model to predict the test dataset
y_pred = model.predict(X_test)
# 4. Calculate actual metrics!
accuracy = accuracy_score(y_test, y_pred) * 100
precision = precision_score(y_test, y_pred) * 100
recall = recall_score(y_test, y_pred) * 100
print("Model trained successfully.")
print(f"- Accuracy:  {accuracy:.2f}%")
print(f"- Precision: {precision:.2f}%")
print(f"- Recall:    {recall:.2f}%")
# Save the model
joblib.dump(model, os.path.join(backend_dir, "model.pkl"))
joblib.dump(le, os.path.join(backend_dir, "encoder.pkl"))