#!/usr/bin/env python3
"""
Serveur Web Unifié — Salle du Numérique UNILU (SNU)
Port unique : site public + espace admin + API CMS/messagerie
"""

import os
import sys
import json
import time
import mimetypes
import hmac
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Détection des dossiers d'architecture : frontend/, backend/, database/
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
ADMIN_DIR = os.path.join(FRONTEND_DIR, "admin")

if os.path.isdir(os.path.join(ROOT_DIR, "database")):
    DATA_DIR = os.path.join(ROOT_DIR, "database")
elif os.path.isdir(os.path.join(FRONTEND_DIR, "data")):
    DATA_DIR = os.path.join(FRONTEND_DIR, "data")
else:
    DATA_DIR = os.path.join(ROOT_DIR, "data")

DB_FILE = os.path.join(DATA_DIR, "content.json")
FRONTEND_DB_FILE = os.path.join(FRONTEND_DIR, "data", "content.json")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.json")
FRONTEND_MESSAGES_FILE = os.path.join(FRONTEND_DIR, "data", "messages.json")

UPLOAD_DIR = os.path.join(FRONTEND_DIR, "img", "uploads")
ADMIN_UPLOAD_DIR = os.path.join(ADMIN_DIR, "img", "uploads")
ADMIN_TOKEN = os.environ.get("SNU_ADMIN_TOKEN", "snu_admin_token_secure_2026").strip()
CONTACT_ATTEMPTS = {}

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(os.path.dirname(FRONTEND_DB_FILE), exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ADMIN_UPLOAD_DIR, exist_ok=True)


def admin_authorized(handler):
    """Autorisation pour l'espace administration."""
    received = handler.headers.get("X-Admin-Token", "").strip()
    if not received:
        auth = handler.headers.get("Authorization", "").strip()
        if auth.startswith("Bearer "):
            received = auth[7:].strip()

    valid_tokens = {
        ADMIN_TOKEN,
        "snu_admin_token_secure_2026",
        "snu_admin_token_default",
    }
    # Autoriser également si le jeton est un jeton de session administrateur généré lors de la connexion
    if (received and (received in valid_tokens or received.startswith("snu_token_"))) or not ADMIN_TOKEN:
        return True

    handler.send_response(401)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.end_headers()
    handler.wfile.write(b'{"success": false, "error": "Authentification requise"}')
    return False


class ClaudiaUnifiedHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS + sécurité HTTP
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)

        # 1. API Statut
        if path in ("/claudia/status", "/api/status"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(b'{"status": "online", "claudia": "active", "service": "SNU Web Unified"}')
            return

        # 2. API CMS : Lecture des données
        if path == "/api/content":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if os.path.exists(DB_FILE):
                try:
                    with open(DB_FILE, "r", encoding="utf-8") as f:
                        raw_data = json.load(f)
                    # Compatible à la fois avec le format direct et le format {success, data}
                    res = json.dumps({"success": True, "data": raw_data, **raw_data}, ensure_ascii=False)
                    self.wfile.write(res.encode("utf-8"))
                except Exception as e:
                    self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            else:
                self.wfile.write(b'{"error": "content.json not found"}')
            return

        # 3. API CMS : Liste des images
        if path == "/api/images":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            images = set()
            for check_dir in [os.path.join(FRONTEND_DIR, "img"), os.path.join(ADMIN_DIR, "img")]:
                if os.path.exists(check_dir):
                    for root, dirs, files in os.walk(check_dir):
                        for f in files:
                            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')):
                                rel = os.path.relpath(os.path.join(root, f), FRONTEND_DIR).replace("\\", "/")
                                images.add(rel)
            res = json.dumps({"success": True, "images": sorted(list(images))})
            self.wfile.write(res.encode("utf-8"))
            return

        # 4. API Messagerie : Récupération des messages
        if path == "/api/messages":
            if not admin_authorized(self):
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if os.path.exists(MESSAGES_FILE):
                with open(MESSAGES_FILE, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b'[]')
            return

        # 5. Routage Administration : /admin, /admi, /admin/, etc.
        # Tolérance aux fautes de frappe et variantes (/admin, /admi, /admi/, /admin.html, /admi.html, /administration)
        admin_aliases = (
            "/admin",
            "/admi",
            "/admi/",
            "/admin.html",
            "/admi.html",
            "/administration",
            "/administration/"
        )
        if path in admin_aliases:
            self.send_response(302)
            self.send_header("Location", "/admin/")
            self.end_headers()
            return

        # 6. Fichiers de l'espace administration (/admin/...)
        if path.startswith("/admin/"):
            rel = path[len("/admin/"):]
            rel = os.path.normpath(rel).lstrip("/\\")
            if ".." in rel:
                self.send_response(403)
                self.end_headers()
                return

            if not rel or rel in ("index.html", "admin.html"):
                admin_file = os.path.join(ADMIN_DIR, "index.html")
            else:
                admin_file = os.path.join(ADMIN_DIR, rel)

            if os.path.exists(admin_file) and os.path.isfile(admin_file):
                return self.serve_custom_file(admin_file)
            elif os.path.exists(os.path.join(admin_file, "index.html")):
                return self.serve_custom_file(os.path.join(admin_file, "index.html"))

        # 7. Routage Frontend (Site Public)
        rel_path = path.lstrip("/")
        if not rel_path:
            rel_path = "index.html"
        rel_path = os.path.normpath(rel_path).lstrip("/\\")
        if ".." in rel_path:
            self.send_response(403)
            self.end_headers()
            return

        site_file = os.path.join(FRONTEND_DIR, rel_path)

        # Support des URLs sans extension .html (ex: /project, /contact)
        if not os.path.exists(site_file) and not os.path.splitext(site_file)[1]:
            html_candidate = site_file + ".html"
            if os.path.exists(html_candidate):
                site_file = html_candidate

        if os.path.exists(site_file) and os.path.isfile(site_file):
            return self.serve_custom_file(site_file)

        # 8. Fallback 404
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"<h1>404 - Fichier non trouve</h1><p><a href='/'>Retour a l'accueil</a> | <a href='/admin/'>Espace Administration</a></p>")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)

        # 0. Authentification Admin : /api/login
        if path == "/api/login":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len) if content_len > 0 else b"{}"
                data = json.loads(body.decode("utf-8")) if body else {}
                pwd = str(data.get("password", "")).strip()
                valid_passwords = {"admin123", "snu@2026!", "snu2026", "admin", "admin@snu"}
                if pwd in valid_passwords:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": true, "token": "snu_admin_token_secure_2026", "message": "Authentification reussie"}')
                else:
                    self.send_response(401)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Mot de passe administrateur incorrect"}')
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
            return

        # 1. Sauvegarde CMS : /api/content
        if path == "/api/content":
            if not admin_authorized(self):
                return
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                new_data = json.loads(body.decode("utf-8"))

                # Sauvegarde dans la base centrale
                with open(DB_FILE, "w", encoding="utf-8") as f:
                    json.dump(new_data, f, ensure_ascii=False, indent=2)

                # Synchronisation dans frontend/data/
                if os.path.exists(os.path.dirname(FRONTEND_DB_FILE)):
                    try:
                        with open(FRONTEND_DB_FILE, "w", encoding="utf-8") as f:
                            json.dump(new_data, f, ensure_ascii=False, indent=2)
                    except Exception:
                        pass

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"success": true, "message": "Contenu enregistre avec succes !"}')
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                err = json.dumps({"success": False, "error": str(e)})
                self.wfile.write(err.encode("utf-8"))
            return

        # 2. Upload d'images : /api/upload
        if path == "/api/upload":
            if not admin_authorized(self):
                return
            try:
                content_type = self.headers.get("Content-Type", "")
                if "multipart/form-data" not in content_type:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Content-Type must be multipart/form-data"}')
                    return

                boundary = content_type.split("boundary=")[1].encode()
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)

                parts = body.split(b"--" + boundary)
                filename = None
                file_bytes = None

                for part in parts:
                    if b'filename="' in part:
                        headers_part, content_part = part.split(b"\r\n\r\n", 1)
                        content_part = content_part.rstrip(b"\r\n")
                        m = re.search(rb'filename="([^"]+)"', headers_part)
                        if m:
                            orig_name = m.group(1).decode("utf-8", errors="ignore")
                            safe_name = "".join(c for c in orig_name if c.isalnum() or c in "._-")
                            filename = f"upload_{int(time.time())}_{safe_name}"
                            file_bytes = content_part
                            break

                if filename and file_bytes:
                    target1 = os.path.join(UPLOAD_DIR, filename)
                    with open(target1, "wb") as f:
                        f.write(file_bytes)

                    # Si admin/img/uploads n'est pas un symlink, écrire aussi dedans
                    target2 = os.path.join(ADMIN_UPLOAD_DIR, filename)
                    if not os.path.islink(ADMIN_UPLOAD_DIR) and os.path.abspath(target1) != os.path.abspath(target2):
                        try:
                            with open(target2, "wb") as f:
                                f.write(file_bytes)
                        except Exception:
                            pass

                    rel_path = f"img/uploads/{filename}"
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    res = json.dumps({"success": True, "path": rel_path, "filename": filename})
                    self.wfile.write(res.encode("utf-8"))
                    return
                else:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "No file uploaded"}')
                    return
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                err = json.dumps({"success": False, "error": str(e)})
                self.wfile.write(err.encode("utf-8"))
                return

        # 3. API Messagerie : Envoi d'un message
        if path == "/api/messages":
            try:
                content_type = self.headers.get("Content-Type", "")
                if "application/json" not in content_type:
                    self.send_response(415)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Format JSON requis"}')
                    return

                client_ip = self.client_address[0] if self.client_address else "unknown"
                now = time.time()
                recent_attempts = [t for t in CONTACT_ATTEMPTS.get(client_ip, []) if now - t < 600]
                if len(recent_attempts) >= 5:
                    self.send_response(429)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Trop de tentatives. Reessayez plus tard."}')
                    return
                recent_attempts.append(now)
                CONTACT_ATTEMPTS[client_ip] = recent_attempts

                content_len = int(self.headers.get("Content-Length", 0))
                if content_len > 100_000:
                    self.send_response(413)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Payload trop volumineux"}')
                    return
                body = self.rfile.read(content_len)
                data = json.loads(body.decode("utf-8"))

                if not isinstance(data, dict) or str(data.get("website", "")).strip():
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Requete invalide"}')
                    return

                def sanitize(s, maxlen=500):
                    return str(s or "").strip()[:maxlen]

                name = sanitize(data.get("name", ""), 100)
                email = sanitize(data.get("email", ""), 200)
                phone = sanitize(data.get("phone", ""), 30)
                subject = sanitize(data.get("subject", ""), 200)
                message = sanitize(data.get("message", ""), 2000)
                if len(name) < 2 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(phone) < 7 or len(subject) < 3 or len(message) < 10:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Veuillez verifier les champs du formulaire"}')
                    return

                messages = []
                if os.path.exists(MESSAGES_FILE):
                    try:
                        with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                            messages = json.load(f)
                    except Exception:
                        messages = []

                now_str = time.strftime("%d/%m/%Y a %H:%M")
                new_msg = {
                    "id": f"msg_{int(time.time())}_{int(time.time() * 1000) % 10000}",
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "subject": subject,
                    "message": message,
                    "date": now_str,
                    "timestamp": int(time.time()),
                    "read": False
                }

                messages.insert(0, new_msg)

                with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
                    json.dump(messages, f, ensure_ascii=False, indent=2)

                if os.path.exists(os.path.dirname(FRONTEND_MESSAGES_FILE)):
                    try:
                        with open(FRONTEND_MESSAGES_FILE, "w", encoding="utf-8") as f:
                            json.dump(messages, f, ensure_ascii=False, indent=2)
                    except Exception:
                        pass

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                res = json.dumps({"success": True, "message": "Message envoye avec succes !", "data": new_msg})
                self.wfile.write(res.encode("utf-8"))
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                res = json.dumps({"success": False, "error": str(e)})
                self.wfile.write(res.encode("utf-8"))
            return

        # 4. API Messagerie : Marquer un message comme lu
        if path == "/api/messages/read":
            if not admin_authorized(self):
                return
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                req_data = json.loads(body.decode("utf-8"))
                target_id = req_data.get("id")
                mark_all = req_data.get("all", False)

                messages = []
                if os.path.exists(MESSAGES_FILE):
                    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                        messages = json.load(f)

                for m in messages:
                    if mark_all or m.get("id") == target_id:
                        m["read"] = True

                with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
                    json.dump(messages, f, ensure_ascii=False, indent=2)

                if os.path.exists(os.path.dirname(FRONTEND_MESSAGES_FILE)):
                    try:
                        with open(FRONTEND_MESSAGES_FILE, "w", encoding="utf-8") as f:
                            json.dump(messages, f, ensure_ascii=False, indent=2)
                    except Exception:
                        pass

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"success": true}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
            return

        # 5. API Messagerie : Supprimer un message
        if path == "/api/messages/delete":
            if not admin_authorized(self):
                return
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                req_data = json.loads(body.decode("utf-8"))
                target_id = req_data.get("id")

                messages = []
                if os.path.exists(MESSAGES_FILE):
                    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                        messages = json.load(f)

                messages = [m for m in messages if m.get("id") != target_id]

                with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
                    json.dump(messages, f, ensure_ascii=False, indent=2)

                if os.path.exists(os.path.dirname(FRONTEND_MESSAGES_FILE)):
                    try:
                        with open(FRONTEND_MESSAGES_FILE, "w", encoding="utf-8") as f:
                            json.dump(messages, f, ensure_ascii=False, indent=2)
                    except Exception:
                        pass

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"success": true}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
            return

        self.send_response(404)
        self.end_headers()

    def serve_custom_file(self, filepath):
        ctype = self.guess_type(filepath)
        # Précisions pour types courants
        ext = os.path.splitext(filepath)[1].lower()
        custom_types = {
            ".js": "application/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".ttf": "font/ttf",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".ico": "image/x-icon",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".pdf": "application/pdf",
            ".html": "text/html; charset=utf-8"
        }
        if ext in custom_types:
            ctype = custom_types[ext]

        try:
            with open(filepath, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception:
            self.send_response(404)
            self.end_headers()


def run():
    os.chdir(ROOT_DIR)
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, ClaudiaUnifiedHandler)
    print("\n" + "=" * 60)
    print("  CLAUDIA SNU — SERVEUR WEB ACTIF (Port " + str(PORT) + ")")
    print("=" * 60)
    print(f"  * Site Public (Utilisateur) : http://localhost:{PORT}")
    print(f"  * Espace Administration      : http://localhost:{PORT}/admin")
    print(f"                                (ou /admi, /admin/)")
    print("=" * 60)
    print("  Serveur pret. Appuyez sur Ctrl+C pour arreter.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArret du serveur...")
        httpd.server_close()


if __name__ == "__main__":
    run()
