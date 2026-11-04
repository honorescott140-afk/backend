#!/usr/bin/env python3
"""
Test de validation de l'architecture séparée :
- frontend/ (pages HTML, assets, admin)
- backend/ (code Python Flask / Claudia)
- database/ (content.json, messages.json)
"""

import urllib.request
import urllib.error
import json
import os
import sys

BASE = "http://localhost:8080"
PASS = 0
FAIL = 0

def check(name, cond, details=""):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"  \033[92m✔ [SUCCÈS]\033[0m {name}")
    else:
        FAIL += 1
        print(f"  \033[91m✘ [ÉCHEC]\033[0m {name} : {details}")

def get_url(path):
    url = f"{BASE}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "BackendValidator"})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status, r.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return 0, str(e)

print("\n" + "=" * 65)
print("  TESTS DE CONNEXION DE L'ARCHITECTURE SÉPARÉE")
print("=" * 65)

# 1. Vérification des routes Frontend
print("\n[1/3] Vérification des pages du sous-dossier frontend/...")
for page in ["/", "/actualites.html", "/formations.html", "/services.html", "/project.html", "/contact.html"]:
    st, html = get_url(page)
    check(f"Route {page} accessible (200 OK)", st == 200, f"Status: {st}")

st, html = get_url("/admin/")
check("Route /admin/ accessible (200 OK)", st == 200, f"Status: {st}")

# 2. Vérification des assets statiques dans frontend/
print("\n[2/3] Vérification des assets statiques...")
for asset in ["/css/style.css", "/css/dark-mode.css", "/js/main.js", "/data/content.json"]:
    st, _ = get_url(asset)
    check(f"Asset {asset} servi depuis frontend/ (200 OK)", st == 200, f"Status: {st}")

# 3. Vérification des API Backend & Database
print("\n[3/3] Vérification des endpoints API...")
st, body = get_url("/api/content")
check("GET /api/content répond 200", st == 200)

st, body = get_url("/api/images")
check("GET /api/images répond 200", st == 200)

# Test envoi message
msg_data = json.dumps({
    "name": "Jean Testeur",
    "email": "jean.test@unilu.cd",
    "phone": "+243 812 345 678",
    "subject": "Test de connexion architecture",
    "message": "Bonjour, vérification de l'envoi de message avec succès."
}).encode("utf-8")

req = urllib.request.Request(
    f"{BASE}/api/messages",
    data=msg_data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        res = json.loads(r.read().decode("utf-8"))
        check("POST /api/messages enregistre le message", r.status == 200 and res.get("success") is True)
        msg_id = res.get("data", {}).get("id")
except Exception as e:
    check("POST /api/messages enregistre le message", False, str(e))
    msg_id = None

# Vérification admin lecture messages
admin_token = "snu_admin_token_secure_2026"
req_msgs = urllib.request.Request(
    f"{BASE}/api/messages",
    headers={"X-Admin-Token": admin_token}
)
try:
    with urllib.request.urlopen(req_msgs, timeout=5) as r:
        msgs = json.loads(r.read().decode("utf-8"))
        check("GET /api/messages (autorisé admin)", r.status == 200 and isinstance(msgs, list))
        if msg_id:
            found = any(m.get("id") == msg_id for m in msgs)
            check("Le message envoyé est visible par l'admin", found)
            # Nettoyage
            del_req = urllib.request.Request(
                f"{BASE}/api/messages/delete",
                data=json.dumps({"id": msg_id}).encode("utf-8"),
                headers={"Content-Type": "application/json", "X-Admin-Token": admin_token},
                method="POST"
            )
            with urllib.request.urlopen(del_req, timeout=5) as del_r:
                pass
except Exception as e:
    check("GET /api/messages (autorisé admin)", False, str(e))

print("\n" + "=" * 65)
print(f"  RÉSULTATS : {PASS} SUCCÈS / {FAIL} ÉCHECS")
print("=" * 65 + "\n")

if FAIL > 0:
    sys.exit(1)
sys.exit(0)

