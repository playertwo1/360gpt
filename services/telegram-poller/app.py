"""Adaptador de transporte Telegram do Diretor 360.

Este processo não contém regra de negócio. Ele busca updates por long polling,
entrega-os ao webhook interno do n8n e só avança o offset após confirmação.
Também oferece envio/action apenas à rede Docker, autenticados pelo segredo de
transporte. O token do bot nunca é entregue aos workflows.
"""

from __future__ import annotations

import json
import logging
import os
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOG = logging.getLogger("director360.telegram_poller")

HOST = "0.0.0.0"
PORT = 8790
STATE_FILE = Path("/var/lib/director360/offset.json")
POLLING_ENABLED = os.getenv("TELEGRAM_POLLING_ENABLED", "false").lower() == "true"
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
INGRESS_URL = os.getenv("N8N_TELEGRAM_INGRESS_URL", "").strip()
TRANSPORT_SECRET = (os.getenv("DIRECTOR360_TRANSPORT_SECRET", "").strip() or os.getenv("BRIDGE_SHARED_SECRET", "").strip())
LONG_POLL_SECONDS = max(1, min(50, int(os.getenv("TELEGRAM_LONG_POLL_SECONDS", "25"))))
RETRY_SECONDS = max(1, int(os.getenv("TELEGRAM_RETRY_SECONDS", "5")))
ALLOWED_CHAT_IDS = {
    value.strip()
    for value in os.getenv("TELEGRAM_ALLOWED_CHAT_IDS", "").split(",")
    if value.strip()
}


def json_request(url: str, payload: dict[str, Any] | None = None, timeout: int = 35,
                 headers: dict[str, str] | None = None) -> dict[str, Any]:
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request_headers = {"Accept": "application/json"}
    if data is not None:
        request_headers["Content-Type"] = "application/json; charset=utf-8"
    request_headers.update(headers or {})
    request = urllib.request.Request(url, data=data, headers=request_headers, method="POST" if data is not None else "GET")
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read().decode("utf-8")
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}")
        return json.loads(body) if body else {"ok": True}


def telegram_api(method: str, payload: dict[str, Any], timeout: int = 15) -> dict[str, Any]:
    if not BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN não configurado")
    result = json_request(f"https://api.telegram.org/bot{BOT_TOKEN}/{method}", payload, timeout)
    if not result.get("ok"):
        raise RuntimeError(f"Telegram recusou {method}")
    return result


def read_offset() -> int:
    try:
        return int(json.loads(STATE_FILE.read_text(encoding="utf-8")).get("next_offset", 0))
    except (FileNotFoundError, ValueError, TypeError, json.JSONDecodeError):
        return 0


def write_offset(next_offset: int) -> None:
    temporary = STATE_FILE.with_suffix(".tmp")
    temporary.write_text(json.dumps({"next_offset": next_offset}), encoding="utf-8")
    temporary.replace(STATE_FILE)


def extract_chat_id(update: dict[str, Any]) -> str | None:
    for key in ("message", "edited_message", "channel_post", "callback_query"):
        value = update.get(key)
        if key == "callback_query" and isinstance(value, dict):
            value = value.get("message")
        if isinstance(value, dict) and isinstance(value.get("chat"), dict):
            return str(value["chat"].get("id"))
    return None


def deliver_to_n8n(update: dict[str, Any]) -> None:
    if not INGRESS_URL or not TRANSPORT_SECRET:
        raise RuntimeError("ingress ou segredo de transporte não configurado")
    chat_id = extract_chat_id(update)
    if ALLOWED_CHAT_IDS and chat_id not in ALLOWED_CHAT_IDS:
        LOG.warning("update %s ignorado por allowlist", update.get("update_id"))
        return
    result = json_request(
        INGRESS_URL,
        update,
        timeout=15,
        headers={"X-Director360-Transport": TRANSPORT_SECRET},
    )
    if not result.get("accepted"):
        raise RuntimeError("n8n não confirmou persistência do update")
    dispatcher_url = INGRESS_URL.replace("/telegram/inbound", "/dispatcher/trigger")
    try:
        json_request(
            dispatcher_url,
            {"trigger": "inbound_received", "update_id": update.get("update_id")},
            timeout=5,
            headers={"X-Director360-Transport": TRANSPORT_SECRET},
        )
    except Exception as exc:
        LOG.warning("falha ao despertar dispatcher imediato: %s", exc)


def polling_loop() -> None:
    if not POLLING_ENABLED:
        LOG.info("polling desativado; adaptador disponível somente para health/send/action")
        return
    if not BOT_TOKEN or not INGRESS_URL or not TRANSPORT_SECRET:
        LOG.error("polling solicitado, mas configuração obrigatória está ausente")
        return
    offset = read_offset()
    LOG.info("polling iniciado a partir do offset %s", offset)
    while True:
        try:
            query = urllib.parse.urlencode({
                "timeout": LONG_POLL_SECONDS,
                "offset": offset,
                "allowed_updates": json.dumps(["message", "edited_message", "callback_query"]),
            })
            response = json_request(
                f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?{query}",
                timeout=LONG_POLL_SECONDS + 10,
            )
            for update in response.get("result", []):
                update_id = int(update["update_id"])
                deliver_to_n8n(update)
                offset = update_id + 1
                write_offset(offset)
        except (urllib.error.URLError, TimeoutError, RuntimeError, ValueError, KeyError) as error:
            LOG.warning("polling pausado após falha recuperável: %s", type(error).__name__)
            time.sleep(RETRY_SECONDS)


def check_system_health() -> dict[str, Any]:
    now_iso = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    services: dict[str, Any] = {
        "telegram_poller": {"status": "ONLINE", "latency_ms": 0.1, "polling_enabled": POLLING_ENABLED}
    }

    # 1. Document Worker (FastAPI)
    t0 = time.time()
    try:
        dw_resp = json_request("http://document-worker:8787/health", timeout=3)
        services["document_worker"] = {
            "status": "ONLINE",
            "latency_ms": round((time.time() - t0) * 1000, 1),
            "docling_enabled": dw_resp.get("docling_enabled", False)
        }
    except Exception as exc:
        services["document_worker"] = {"status": "OFFLINE", "error": type(exc).__name__}

    # 2. Docling TableFormer
    t0 = time.time()
    try:
        doc_resp = json_request("http://docling:5001/health", timeout=3)
        services["docling"] = {
            "status": "ONLINE",
            "latency_ms": round((time.time() - t0) * 1000, 1),
            "details": doc_resp.get("status", "ok")
        }
    except Exception as exc:
        services["docling"] = {"status": "OFFLINE", "error": type(exc).__name__}

    return {"ok": True, "timestamp": now_iso, "services": services}


class Handler(BaseHTTPRequestHandler):
    server_version = "Director360Transport/1.0"

    def log_message(self, format: str, *args: Any) -> None:
        LOG.info("http " + format, *args)

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_json(200, {"ok": True, "polling_enabled": POLLING_ENABLED})
            return
        if self.path == "/health/system":
            self.send_json(200, check_system_health())
            return
        self.send_json(404, {"ok": False})

    def do_POST(self) -> None:
        if self.headers.get("X-Director360-Transport", "") != TRANSPORT_SECRET or not TRANSPORT_SECRET:
            self.send_json(401, {"ok": False})
            return
        try:
            length = min(int(self.headers.get("Content-Length", "0")), 1_000_000)
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if self.path == "/send":
                result = telegram_api("sendMessage", payload)
                self.send_json(200, {"ok": True, "result": result.get("result")})
            elif self.path == "/action":
                result = telegram_api("sendChatAction", payload)
                self.send_json(200, {"ok": True, "result": result.get("result")})
            elif self.path == "/file":
                file_id = str(payload.get("file_id", "")).strip()
                if not file_id:
                    self.send_json(400, {"ok": False, "error": "MISSING_FILE_ID"})
                    return
                file_info = telegram_api("getFile", {"file_id": file_id})
                file_path = file_info.get("result", {}).get("file_path")
                if not file_path:
                    self.send_json(404, {"ok": False, "error": "FILE_PATH_NOT_FOUND"})
                    return
                url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=60) as resp:
                    data = resp.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            else:
                self.send_json(404, {"ok": False})
                return
        except (ValueError, json.JSONDecodeError, RuntimeError, urllib.error.URLError) as error:
            LOG.warning("requisição de saída rejeitada: %s", type(error).__name__)
            self.send_json(502, {"ok": False, "error": "TRANSPORT_FAILURE"})


if __name__ == "__main__":
    threading.Thread(target=polling_loop, daemon=True).start()
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
