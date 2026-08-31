from __future__ import annotations

import hashlib
import io
import json
import urllib.request
import uuid

import fitz
from PIL import Image, ImageDraw, ImageFont

from app.main import Evidence, Extraction, extract_image, extract_pdf, requires_hybrid_escalation


def test_ocr_image() -> None:
    image = Image.new("RGB", (1500, 320), "white")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 72)
    draw.text((40, 80), "META 100 REALIZADO 75", fill="black", font=font)
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=95)
    content = buffer.getvalue()
    digest = f"sha256:{hashlib.sha256(content).hexdigest()}"
    result = extract_image(content, "ocr-smoke.jpg", "image/jpeg", digest)
    normalized = result.text.upper()
    assert "META" in normalized and "100" in normalized and "75" in normalized, result.text
    assert result.evidence[0].locator == "image:1"


def test_native_pdf() -> None:
    document = fitz.open()
    page = document.new_page()
    for index in range(5):
        page.insert_text((72, 80 + index * 28), f"INDICADOR CONSORCIO META 100 REALIZADO 80 PERIODO AGOSTO LINHA {index + 1}", fontsize=11)
    content = document.tobytes()
    digest = f"sha256:{hashlib.sha256(content).hexdigest()}"
    result = extract_pdf(content, "native-smoke.pdf", digest)
    assert result.extraction_method == "PDF_NATIVE_TEXT", result.extraction_method
    assert "CONSORCIO" in result.text
    assert result.evidence[0].locator == "page:1"


def test_adaptive_mineru_routing() -> None:
    common = {
        "document_type": "PDF",
        "mime_type": "application/pdf",
        "file_name": "routing.pdf",
        "content_hash": "sha256:" + "0" * 64,
        "page_count": 1,
        "extraction_method": "MINERU_PIPELINE",
        "warnings": [],
    }
    simple = Extraction(
        **common,
        text="Documento simples com conteúdo suficiente.",
        evidence=[Evidence(locator="page:1;block:1;type:text", text="Conteúdo", extraction_method="MINERU_PIPELINE")],
    )
    table_html = "<table>" + "".join("<tr>" + "<td>x</td>" * 6 + "</tr>" for _ in range(8)) + "</table>"
    complex_table = Extraction(
        **common,
        text=table_html,
        evidence=[Evidence(locator="page:1;block:1;type:table", text=table_html, extraction_method="MINERU_PIPELINE")],
    )
    assert requires_hybrid_escalation(simple) is False
    assert requires_hybrid_escalation(complex_table) is True


def test_http_endpoint() -> None:
    image = Image.new("RGB", (1200, 260), "white")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 58)
    draw.text((30, 70), "PONTUACAO 42 META 100", fill="black", font=font)
    image_buffer = io.BytesIO()
    image.save(image_buffer, format="JPEG", quality=95)
    content = image_buffer.getvalue()
    digest = f"sha256:{hashlib.sha256(content).hexdigest()}"
    job_id = "smoke-http-job"
    metadata = json.dumps({
        "job_id": job_id,
        "document": {"content_hash": digest, "file_name": "http-smoke.jpg"},
        "security": {"external_effects_allowed": False},
    })
    boundary = f"----diretor360{uuid.uuid4().hex}"
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"metadata\"\r\n\r\n{metadata}\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"document\"; filename=\"http-smoke.jpg\"\r\n"
        "Content-Type: image/jpeg\r\n\r\n"
    ).encode() + content + f"\r\n--{boundary}--\r\n".encode()
    request = urllib.request.Request(
        "http://127.0.0.1:8787/v1/process",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "X-Job-Id": job_id,
            "X-Content-Trust": "UNTRUSTED",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=360) as response:
        result = json.load(response)
    assert result["ok"] is True
    assert result["job_id"] == job_id
    assert "PONTUACAO" in result["extraction"]["text"].upper()


if __name__ == "__main__":
    test_ocr_image()
    test_native_pdf()
    test_adaptive_mineru_routing()
    test_http_endpoint()
    print("DOCUMENT_WORKER_EXTRACTION: PASS")
