#!/usr/bin/env python3
"""
Serveur Web Unifié — Salle du Numérique UNILU (SNU)
Port unique : site public + espace admin + API CMS/messagerie
"""

import os
import sys
import json
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
ADMIN_DIR = os.path.join(FRONTEND_DIR, "admin")
DATABASE_DIR = os.path.join(ROOT_DIR, "database")
DB_FILE = os.path.join(DATABASE_DIR, "content.json")
FRONTEND_DB_FILE = os.path.join(FRONTEND_DIR, "data", "content.json")
MESSAGES_FILE = os.path.join(DATABASE_DIR, "messages.json")
FRONTEND_MESSAGES_FILE = os.path.join(FRONTEND_DIR, "data", "messages.json")
UPLOAD_DIR = os.path.join(FRONTEND_DIR, "img", "uploads")
ADMIN_UPLOAD_DIR = os.path.join(ADMIN_DIR, "img", "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ADMIN_UPLOAD_DIR, exist_ok=True)
os.makedirs(DATABASE_DIR, exist_ok=True)


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

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. API CMS : Lecture des données
        if path == "/api/content":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            data_file = DB_FILE if os.path.exists(DB_FILE) else FRONTEND_DB_FILE
            if os.path.exists(data_file):
                with open(data_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b'{"error": "content.json not found"}')
            return

        # 2. API CMS : Liste des images
        if path == "/api/images":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            images = []
            img_dir = os.path.join(FRONTEND_DIR, "img")
            if os.path.exists(img_dir):
                for root, dirs, files in os.walk(img_dir):
                    for f in files:
                        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')):
                            rel = os.path.relpath(os.path.join(root, f), FRONTEND_DIR).replace("\\", "/")
                            images.append(rel)
            res = json.dumps({"success": True, "images": sorted(images)})
            self.wfile.write(res.encode("utf-8"))
            return

        # 3. API Messagerie : Récupération des messages
        if path == "/api/messages":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            msg_file = MESSAGES_FILE if os.path.exists(MESSAGES_FILE) else FRONTEND_MESSAGES_FILE
            if os.path.exists(msg_file):
                with open(msg_file, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b'[]')
            return

        # 4. Routage /admin -> redirection automatique vers /admin/
        if path == "/admin":
            self.send_response(301)
            self.send_header("Location", "/admin/")
            self.end_headers()
            return

        # 4. Routage /admin/ ou fichiers admin
        if path.startswith("/admin/") or path == "/admin.html":
            if path == "/admin/" or path == "/admin.html":
                admin_file = os.path.join(ADMIN_DIR, "index.html")
            else:
                rel = path[len("/admin/"):]
                # Sécurité : bloquer les traversées de chemin (path traversal)
                rel = os.path.normpath(rel).lstrip("/\\")
                if ".." in rel:
                    self.send_response(403)
                    self.end_headers()
                    return
                admin_file = os.path.join(ADMIN_DIR, rel)

            if os.path.exists(admin_file) and os.path.isfile(admin_file):
                return self.serve_custom_file(admin_file)
            elif os.path.exists(os.path.join(admin_file, "index.html")):
                return self.serve_custom_file(os.path.join(admin_file, "index.html"))

        # 5. Routage par défaut : Fichiers du frontend (Site public)
        rel_path = path.lstrip("/")
        if not rel_path:
            rel_path = "index.html"
        # Sécurité : bloquer les traversées de chemin
        rel_path = os.path.normpath(rel_path).lstrip("/\\")
        if ".." in rel_path:
            self.send_response(403)
            self.end_headers()
            return
        site_file = os.path.join(FRONTEND_DIR, rel_path)

        if os.path.exists(site_file) and os.path.isfile(site_file):
            return self.serve_custom_file(site_file)

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. Sauvegarde CMS : /api/content
        if path == "/api/content":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                new_data = json.loads(body.decode("utf-8"))

                # Sauvegarde 1 : Database centrale
                with open(DB_FILE, "w", encoding="utf-8") as f:
                    json.dump(new_data, f, ensure_ascii=False, indent=2)

                # Sauvegarde 2 : Frontend data
                with open(FRONTEND_DB_FILE, "w", encoding="utf-8") as f:
                    json.dump(new_data, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"success": true, "message": "Contenu enregistre et synchronise !"}')
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                err = json.dumps({"success": False, "error": str(e)})
                self.wfile.write(err.encode("utf-8"))
            return

        # 2. Upload de photos : /api/upload
        if path == "/api/upload":
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
                        # Extraire le nom de fichier
                        import re
                        m = re.search(rb'filename="([^"]+)"', headers_part)
                        if m:
                            orig_name = m.group(1).decode("utf-8", errors="ignore")
                            safe_name = "".join(c for c in orig_name if c.isalnum() or c in "._-")
                            filename = f"upload_{int(time.time())}_{safe_name}"
                            file_bytes = content_part
                            break

                if filename and file_bytes:
                    target1 = os.path.join(UPLOAD_DIR, filename)
                    target2 = os.path.join(ADMIN_UPLOAD_DIR, filename)
                    with open(target1, "wb") as f:
                        f.write(file_bytes)
                    with open(target2, "wb") as f:
                        f.write(file_bytes)

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

        # 3. API Messagerie : Envoi d'un message depuis le formulaire
        if path == "/api/messages":
            try:
                content_len = int(self.headers.get("Content-Length", 0))
                if content_len > 100_000:
                    self.send_response(413)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(b'{"success": false, "error": "Payload trop volumineux"}')
                    return
                body = self.rfile.read(content_len)
                data = json.loads(body.decode("utf-8"))

                def sanitize(s, maxlen=500):
                    return str(s or "").strip()[:maxlen]

                messages = []
                if os.path.exists(MESSAGES_FILE):
                    try:
                        with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                            messages = json.load(f)
                    except Exception:
                        messages = []

                now_str = time.strftime("%d/%m/%Y à %H:%M")
                new_msg = {
                    "id": f"msg_{int(time.time())}_{int(time.time() * 1000) % 10000}",
                    "name": sanitize(data.get("name", "Visiteur")),
                    "email": sanitize(data.get("email", ""), 200),
                    "phone": sanitize(data.get("phone", ""), 30),
                    "subject": sanitize(data.get("subject", "Sans objet"), 200),
                    "message": sanitize(data.get("message", ""), 2000),
                    "date": now_str,
                    "timestamp": int(time.time()),
                    "read": False
                }

                messages.insert(0, new_msg)

                with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
                    json.dump(messages, f, ensure_ascii=False, indent=2)

                if os.path.exists(os.path.dirname(FRONTEND_MESSAGES_FILE)):
                    with open(FRONTEND_MESSAGES_FILE, "w", encoding="utf-8") as f:
                        json.dump(messages, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                res = json.dumps({"success": True, "message": "Message envoyé avec succès !", "data": new_msg})
                self.wfile.write(res.encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                res = json.dumps({"success": False, "error": "Erreur serveur"})
                self.wfile.write(res.encode("utf-8"))
            return

        # 4. API Messagerie : Marquer un message comme lu
        if path == "/api/messages/read":
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
                    with open(FRONTEND_MESSAGES_FILE, "w", encoding="utf-8") as f:
                        json.dump(messages, f, ensure_ascii=False, indent=2)

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
                    with open(FRONTEND_MESSAGES_FILE, "w", encoding="utf-8") as f:
                        json.dump(messages, f, ensure_ascii=False, indent=2)

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
    print("\n" + "═" * 60)
    print("  CLAUDIA SNU — SERVEUR WEB ACTIF (Port " + str(PORT) + ")")
    print("═" * 60)
    print(f"  🌐 Site Utilisateur (Public) : http://localhost:{PORT}")
    print(f"  ⚙️ Espace Administration     : http://localhost:{PORT}/admin")
    print("═" * 60)
    print("  Appuyez sur Ctrl+C pour arrêter le serveur.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur...")
        httpd.server_close()


if __name__ == "__main__":
    run()
