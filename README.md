# 🌌 ORION: Operational Risk Identification & Observation Network
### *Next-Generation Intelligent Intrusion Detection & Security Operations Center (IDS/SOC)*

ORION is a hybrid, multi-layered Intrusion Detection System (IDS) paired with a high-fidelity Security Operations Center (SOC) dashboard. By combining **Signature-Based Inspection** with **Machine Learning Anomaly Detection**, ORION sniffs real-time packet telemetry, extracts network features, assigns dynamically scaled threat scores, and orchestrates automated response actions.

---

## 🏛️ System Architecture Overview

ORION consists of three primary layers working in concert:

```
                  ┌─────────────────────────────────────────┐
                  │          Network Interface / NIC        │
                  └────────────────────┬────────────────────┘
                                       │ Raw Packets (Ethernet/IP)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Scapy Sniffer & Feature Extractor    │
                  └────┬───────────────────────────────┬────┘
                       │ Protocol, Payload, Bytes      │ Protocol, TCP Flags
                       ▼                               ▼
        ┌──────────────────────────────┐┌──────────────────────────────┐
        │  ML Anomaly Detection Engine ││  Signature Detection Engine  │
        │      (Random Forest)         ││     (TCP Flags Inspection)   │
        └──────────────┬───────────────┘└──────────────┬───────────────┘
                       │ Prediction (0/1)              │ Severity (Medium/High)
                       ▼                               ▼
                  ┌─────────────────────────────────────────┐
                  │   Threat Scoring & Reputation Engine    │
                  └────────────────────┬────────────────────┘
                                       │ Threat Score + Reputation Score
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │  Adaptive Severity & Defensive Actions   │
                  └────┬───────────────────────────────┬────┘
                       │ Blacklist IP (5-min block)    │ Commit Alert
                       ▼                               ▼
        ┌──────────────────────────────┐┌──────────────────────────────┐
        │       IP Blacklist Engine    ││      SQLite Database         │
        └──────────────────────────────┘└──────────────┬───────────────┘
                                                       │ REST API (FastAPI)
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │      Next.js SOC Frontend    │
                                        └──────────────────────────────┘
```

---

## 🔬 Core Engine Mechanics

### 1. Packet Sniffing & Feature Extraction
* **Module**: `backend/packet_sniffer.py` & `backend/feature_extractor.py`
* **Logic**: Uses Scapy to bind to the primary network interface. It filters out non-IP traffic and extracts three key variables:
  * `protocol_type`: Encoded as `0` for TCP, `1` for UDP, and `2` for other protocols.
  * `src_bytes`: The total length of the raw packet.
  * `dst_bytes`: The length of the packet payload.

### 2. Machine Learning Anomaly Classifier
* **Module**: `backend/anomaly_detector.py` & `backend/train_model.py`
* **Model**: A Scikit-learn **Random Forest Classifier** trained on the **NSL-KDD dataset**.
* **Performance**: Achieves **97.33% accuracy**, **97.23% precision**, and **99.80% recall** in validating anomalous payload volumes and protocol behavior.
* **Inference**: Converts packet statistics into a Pandas DataFrame and returns an anomaly indicator if predicted as `1`.

### 3. Signature-Based Threat Inspector
* **Module**: `backend/signature_detector.py`
* **Logic**: Evaluates network packets against known vulnerability signatures. Currently targets TCP headers to flag stealth scanning methods:
  * **SYN Scan (`flags == "S"`)**: Flagged when an attacker sends synchronization flags to probe port states without establishing full handshakes.

### 4. Correlation & Threat Scoring Engine
* **Module**: `backend/threat_score.py`
* **Logic**: Combines ML results and signature detection into a unified threat metric:
  $$\text{Threat Score} = \min((\text{Signature Alert } [40]) + (\text{ML Alert } [50]), 100)$$

### 5. Dynamic Reputation & Adaptive Severity
* **Module**: `backend/reputation_engine.py` & `backend/adaptive_engine.py`
* **Logic**: Maintains an ongoing history of attacker profiles. If an IP repeatedly triggers alerts, its database reputation score increases by `+10` per incident.
* **Adaptive Scoring**: The total alert severity is evaluated based on:
  $$\text{Total Metric} = \text{Threat Score} + \text{Reputation Score}$$
  * `Total > 120`: **Critical**
  * `Total > 80`: **High**
  * `Total > 50`: **Medium**
  * `Otherwise`: **Low**

### 6. Automated Mitigation & Blacklist
* **Module**: `backend/blacklist.py`
* **Logic**: High-impact threats categorized as **Critical** are dynamically blocked. The attacker's IP is blacklisted in-memory. The sniffer drops any inbound packets from a blacklisted IP for a cooldown period of **5 minutes (300 seconds)**.

---

## 💻 Interactive SOC Dashboard & Navigation Architecture

The Next.js React frontend operates as a full-featured, high-fidelity Security Operations Center. It provides an intuitive layout driven by a global top Navigation Bar and dynamic page states.

### 🌐 Global Navigation Layout
ORION features a responsive top-navigation layout replacing the legacy sidebar, maximizing screen real estate for wide SVG canvas maps and deep telemetry tables.

#### 1. Glassmorphic Navigation Bar (Navbar)
Fixed at the top of the viewport with a blurred glass-panel aesthetic, the Navbar houses the central controls:
* **ORION Brand & Sniffer Pulse**: Displays a breathing green pulse indicating the raw Scapy sniffer is actively listening on the network adapter interface.
* **Portal Gateway Link**: Securely redirects users to authentication views or logouts.
* **Core Functional Sections**:
  * **Dashboard Overview (`/`)**: Main central command console rendering the raw network nodes map, threat sweeps radar, average security metrics gauge, and active streaming log console.
  * **Alerts Registry (`/alerts`)**: Live searchable registry displaying all historical anomalies, intrusion events, source IPs, and severities compiled in the database.
  * **Threat Map (`/map`)**: Global geomap marking latitude/longitude geolocation mappings of incoming threat origins.
  * **Signature Rules (`/signatures`)**: Comprehensive rule manager to deploy, toggle, or edit TCP header matching expressions (e.g. SYN Probe, HTTP SQLi patterns) dynamically checkable by the Scapy engine.
  * **Firewall Control (`/firewall`)**: Dynamic mitigation command center displaying in-memory blocked leases, automatic TTL cooldown sliders, and manual IP blocker panels.
  * **ML Classifier (`/ml-model`)**: Interactive model evaluation center mapping Random Forest metrics (Accuracy, Precision, Recall), Split Gini feature importances, and an input playground to run test packets against the machine learning engine.
  * **System Configuration (`/settings`)**: Settings panel to adjust threat severity thresholds, packet sniffer NIC interfaces, and sqlite connection options.

#### 2. Real-time Status Footer
Positioned at the bottom of the content container, the Footer acts as an on-screen health monitor:
* **NIC Interface Status**: Displays the active network adapter interface configured for raw Scapy sniffing (e.g., `Wi-Fi (NPCAP Loopback adapter)`).
* **API Server Ping**: Tracks millisecond latencies from the dashboard layout to the FastAPI backend microservice.
* **SQLite Connection**: Confirms database write accessibility to `alerts.db`.
* **Health Enforcer Dot**: Glowing green notification dot verifying all services are healthy and operational.

---

### 📊 Dashboard Visual Components
The main overview dashboard integrates the following premium widgets:
* **Interactive Network Map**: Custom SVG mapping that charts connections between the Internet, Core Firewall, Internal Switches, and database/web servers. Data packet animations fly across nodes based on active network traffic.
* **Threat Radar Sweep**: A retro-style circular sweeps radar drawing live blips labeled with active threats (`DDoS`, `SQLi`, `Brute Force`, `SYN Scan`).
* **Real-time Log Stream**: A scrolling console outputting raw telemetry logs color-coded by severity level (`INFO`, `WARN`, `CRITICAL`).
* **Security Score Arc**: A gauge that computes a real-time risk index of the network based on the average severity of threats blocked in the database.


---

## ⚙️ How to Setup & Run

### Prerequisites
* Python 3.10+
* Node.js 18+
* WinPcap / Npcap (required for Scapy to sniff raw packets on Windows)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Train the ML model (generates `model.pkl` and `encoder.pkl`):
   ```bash
   python train_model.py
   ```
5. Start the FastAPI backend:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Quickstart (Dual Launch)
Double-click `start.bat` in the root directory. It runs the virtualenv activation, starts the FastAPI server on port `8000`, and launches the Next.js dashboard on port `3000` concurrently.

---

## 🛠️ The Gap Analysis & Perfection Roadmap
*How to transform this project from a prototype into a production-grade, resume-defining masterpiece.*

Currently, the project functions as a great proof-of-concept, but features several architectural shortcuts (such as evaluating packets individually, mock geolocation, and in-memory blocking). Below is the exact step-by-step roadmap to make it **production-ready**.

---

### Phase I: Flow-Based Feature Extraction (Real ML Feature Space)
> [!WARNING]
> **The Current Limitation**: The machine learning model is trained on the NSL-KDD dataset, which relies heavily on statistical network flow variables calculated over a time window (e.g., `count` [number of connections to the same host in past 2s], `srv_count`, `serror_rate`). However, `feature_extractor.py` only inspects packets **individually**, extracting only `src_bytes` and `dst_bytes`. This results in data mismatch and limits classification accuracy.

#### 🔧 How to Fix:
1. **Build a Flow Aggregator**: Maintain a sliding window queue of recent packets grouped by `(src_ip, dst_ip, dst_port)` for the last 2 seconds.
2. **Calculate Flow Statistics**:
   * Count the total connection attempts from the same source in the window (`count`).
   * Count attempts to the same service (`srv_count`).
   * Compute error rates (e.g., percentage of packets with SYN errors or reset errors).
3. **Feed Aggregated Features to ML**: Pass these dynamically computed flow features into `train_model.py` and `anomaly_detector.py` to match the true NSL-KDD feature definition.

---

### Phase II: Multi-threaded Ingestion Pipeline (Non-blocking Sniffer)
> [!CAUTION]
> **The Current Limitation**: The packet sniffer is synchronous. Scapy intercepts a packet, calls `process_packet`, performs feature extraction, runs ML inference, and writes to SQLite **in a single thread**. If packets arrive rapidly (e.g., during a real DDoS attack), this processing bottleneck will cause massive packet loss (NIC buffer overflows).

#### 🔧 How to Fix:
1. **Producer-Consumer Design**: Separate packet capturing from packet analysis using Python's `queue.Queue` or `multiprocessing`.
2. **Sniffing Thread (Producer)**: Runs a lightweight Scapy sniffing loop that *only* intercepts raw bytes, pushes them into a thread-safe Queue, and immediately returns.
3. **Worker Pool (Consumers)**: Spin up multiple background worker threads (or processes to bypass the Python GIL). These workers pop packets from the Queue, extract features, and run machine learning predictions asynchronously.

---

### Phase III: Real OS Firewall Integration (True Prevention Capability)
> [!NOTE]
> **The Current Limitation**: Currently, "blacklisting" simply drops packets *within* the Python sniffer application. The operating system kernel is still allocating memory and processing the network interrupt for those packets, meaning an attacker can still exhaust system resources.

#### 🔧 How to Fix:
1. **Kernel-level Blocking**: Write platform-specific commands to block traffic at the OS firewall level:
   * **Linux**: Invoke `iptables` commands:
     ```python
     os.system(f"sudo iptables -A INPUT -s {ip} -j DROP")
     ```
   * **Windows**: Invoke `netsh` command rules:
     ```python
     os.system(f"netsh advfirewall firewall add rule name='ORION Block {ip}' dir=in action=block remoteip={ip}")
     ```
2. **Automatic Cleanup (TTL)**: Run a background daemon thread that periodically checks the database for expired blocks (e.g., older than 5 minutes) and removes the rule to restore clean access.

---

### Phase IV: Live Geolocation Database Lookup
> [!IMPORTANT]
> **The Current Limitation**: The `/heatmap` endpoint randomly generates coordinates across the globe for the threat map. Real IDS engines map IPs to actual geography.

#### 🔧 How to Fix:
1. **Integrate GeoLite2 Database**: Store the official `GeoLite2-City.mmdb` locally (or download it automatically at startup).
2. **Perform Lookups**: In `geo_engine.py`, query the database for incoming public source IPs to retrieve their actual latitude, longitude, country, and city.
3. **Map Frontend Rendering**: Pass these coordinates from `/alerts` to the frontend Map component. Switch from mock points to a React Leaflet map plotting the real origins of attack vectors.

---

### Phase V: WebSocket Push Architecture (Instant Telemetry Streaming)
> [!TIP]
> **The Current Limitation**: The frontend relies on interval polling or mock rendering loops to display alerts. This introduces delay and creates excessive HTTP request overhead.

#### 🔧 How to Fix:
1. **FastAPI WebSockets**: Expose a WebSocket endpoint `/ws/alerts` in `main.py`.
2. **Broadcast Alerts**: When `packet_sniffer.py` identifies a threat, broadcast the alert payload immediately to all active WebSocket clients.
3. **Reactive UI Update**: Establish a React state socket connection on mount in the Next.js frontend, pushing threats to the log stream instantly without polling lag.
