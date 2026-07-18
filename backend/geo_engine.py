import os
import geoip2.database

GEO_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "GeoLite2-City.mmdb")
try:
    reader = geoip2.database.Reader(GEO_DB_PATH)
except Exception:
    reader = None


def get_location(ip):
    if reader is None:
        return None

    try:
        response = reader.city(ip)
        return {
            "lat": response.location.latitude,
            "lon": response.location.longitude
        }
    except Exception:
        return None
