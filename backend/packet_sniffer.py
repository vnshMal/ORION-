from database import init_db
init_db()
from scapy.layers.inet import IP
from scapy.all import sniff

from feature_extractor import extract_features
from anomaly_detector import check_anomaly
from signature_detector import check_signature

from threat_score import calculate_threat_score
from reputation_engine import update_reputation
from adaptive_engine import determine_severity
from blacklist import add_to_blacklist, is_blacklisted
from database import save_alert


def process_packet(packet):
    # Ignore non-IP packets
    if IP not in packet:
        return

    src_ip = packet[IP].src

    # Skip if already blacklisted
    if is_blacklisted(src_ip):
        return

    # Extract features
    features = extract_features(packet)
    if not features:
        return

    # Multi-layer detection
    sig_alert = check_signature(packet)
    ml_alert = check_anomaly(features)

    # Calculate threat score
    threat_score = calculate_threat_score(sig_alert, ml_alert)

    # If any threat detected
    if threat_score > 0:
        reputation_score = update_reputation(src_ip)
        severity = determine_severity(threat_score, reputation_score)

        print(f"🚨 Threat Detected | IP: {src_ip} | Severity: {severity}")

        # Auto-block critical attackers
        if severity == "Critical":
            add_to_blacklist(src_ip)

        # Save alert to DB
        save_alert(
            alert={
                "type": "Intrusion Detected",
                "severity": severity
            },
            src_ip=src_ip
        )


def start_sniffing():
    print("🚀 IDS Started... Listening for traffic...")
    sniff(prn=process_packet, store=False)


if __name__ == "__main__":
    start_sniffing()