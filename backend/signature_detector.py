from scapy.layers.inet import TCP, UDP, ICMP
import re

signatures = [
    {"id": 1, "name": "TCP SYN Scan", "protocol": "TCP", "pattern": "flags == 'S'", "severity": "Medium", "active": True},
    {"id": 2, "name": "UDP Probe", "protocol": "UDP", "pattern": "dst_bytes == 0", "severity": "Low", "active": True},
    {"id": 3, "name": "HTTP SQLi Injection", "protocol": "TCP", "pattern": "payload_contains('UNION')", "severity": "High", "active": True},
    {"id": 4, "name": "Ping of Death", "protocol": "ICMP", "pattern": "packet_len > 1500", "severity": "High", "active": True},
]

def check_signature(packet):
    for sig in signatures:
        if not sig.get("active", True):
            continue
        
        # Check TCP
        if sig["protocol"] == "TCP" and packet.haslayer(TCP):
            flags = packet[TCP].flags
            if sig["pattern"] == "flags == 'S'" and flags == "S":
                return {
                    "type": sig["name"],
                    "severity": sig["severity"]
                }
            if "payload_contains" in sig["pattern"] and packet[TCP].payload:
                payload_str = str(packet[TCP].payload)
                matches = re.findall(r"'(.*?)'", sig["pattern"])
                if matches and matches[0] in payload_str:
                    return {
                        "type": sig["name"],
                        "severity": sig["severity"]
                    }

        # Check UDP
        elif sig["protocol"] == "UDP" and packet.haslayer(UDP):
            if sig["pattern"] == "dst_bytes == 0" and len(packet[UDP].payload) == 0:
                return {
                    "type": sig["name"],
                    "severity": sig["severity"]
                }

        # Check ICMP
        elif sig["protocol"] == "ICMP" and packet.haslayer(ICMP):
            if sig["pattern"] == "packet_len > 1500" and len(packet) > 1500:
                return {
                    "type": sig["name"],
                    "severity": sig["severity"]
                }

    return None