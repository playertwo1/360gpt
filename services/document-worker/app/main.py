from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import time
from typing import Annotated, Any

import fitz
import httpx
import pytesseract
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from openpyxl import load_workbook
from PIL import Image, ImageOps
from pydantic import BaseModel, ConfigDict, Field

MAX_FILE_BYTES = int(os.getenv("DOCUMENT_MAX_BYTES", str(20 * 1024 * 1024)))
MAX_PDF_PAGES = int(os.getenv("DOCUMENT_MAX_PDF_PAGES", "80"))
MAX_TEXT_CHARS = int(os.getenv("DOCUMENT_MAX_TEXT_CHARS", "200000"))
MIN_NATIVE_TEXT_CHARS = int(os.getenv("DOCUMENT_MIN_NATIVE_TEXT_CHARS", "80"))
OCR_LANGUAGE = os.getenv("DOCUMENT_OCR_LANGUAGE", "por+eng")
MINERU_ENABLED = os.getenv("DOCUMENT_MINERU_ENABLED", "false").lower() == "true"
MINERU_API_URL = os.getenv("MINERU_API_URL", "http://mineru:8000").rstrip("/")
MINERU_BACKEND = os.getenv("MINERU_BACKEND", "hybrid-engine")
MINERU_EFFORT = os.getenv("MINERU_EFFORT", "medium")
MINERU_TIMEOUT_SECONDS = float(os.getenv("MINERU_TIMEOUT_SECONDS", "330"))
SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

app = FastAPI(title="Diretor 360 Document Worker", version="1.1.0", docs_url=None, redoc_url=None)


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    locator: str
    text: str
    extraction_method: str
    confidence: float | None = Field(default=None, ge=0, le=1)


class Extraction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_type: str
    mime_type: str
    file_name: str
    content_hash: str
    text: str
    page_count: int | None = None
    extraction_method: str
    evidence: list[Evidence]
    warnings: list[str]


class WorkerResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ok: bool
    schema_version: str = "1.0.0"
    worker_version: str = "1.1.0"
    job_id: str
    duration_ms: int
    security: dict[str, Any]
    extraction: Extraction


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "service": "document-worker",
        "version": "1.1.0",
        "mineru_enabled": MINERU_ENABLED,
    }


@app.post("/v1/process", response_model=WorkerResponse)
async def process_document(
    document: Annotated[UploadFile, File()],
    metadata: Annotated[str, Form()],
    x_job_id: Annotated[str | None, Header()] = None,
    x_content_trust: Annotated[str | None, Header()] = None,
) -> WorkerResponse:
    started = time.monotonic()
    job = parse_metadata(metadata)
    job_id = x_job_id or str(job.get("job_id", ""))
    if not job_id or len(job_id) > 160:
        raise HTTPException(400, "invalid_job_id")
    if x_content_trust != "UNTRUSTED" or job.get("security", {}).get("external_effects_allowed") is not False:
        raise HTTPException(400, "invalid_security_context")

    mime = (document.content_type or "").lower()
    if mime not in SUPPORTED_MIME_TYPES:
        raise HTTPException(415, "unsupported_media_type")
    content = await read_bounded(document)
    validate_signature(content, mime)
    digest = f"sha256:{hashlib.sha256(content).hexdigest()}"
    expected_hash = str(job.get("document", {}).get("content_hash") or "")
    if expected_hash and expected_hash != digest:
        raise HTTPException(422, "content_hash_mismatch")

    file_name = safe_name(document.filename or job.get("document", {}).get("file_name") or "documento")
    if mime == "application/pdf":
        extracted = await extract_pdf_routed(content, file_name, digest)
    elif mime in {"image/jpeg", "image/png"}:
        extracted = await extract_image_routed(content, file_name, mime, digest)
    elif mime == "text/csv":
        extracted = extract_csv(content, file_name, digest)
    else:
        extracted = extract_xlsx(content, file_name, digest)

    duration_ms = round((time.monotonic() - started) * 1000)
    return WorkerResponse(
        ok=True,
        job_id=job_id,
        duration_ms=duration_ms,
        security={
            "content_trust": "UNTRUSTED",
            "instructions_in_document_ignored": True,
            "external_effects_allowed": False,
        },
        extraction=extracted,
    )


async def extract_pdf_routed(content: bytes, file_name: str, digest: str) -> Extraction:
    if MINERU_ENABLED:
        try:
            return await extract_with_mineru(content, file_name, "application/pdf", digest)
        except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
            fallback = extract_pdf(content, file_name, digest)
            fallback.warnings.insert(0, f"mineru_fallback:{type(error).__name__}")
            return fallback
    return extract_pdf(content, file_name, digest)


async def extract_image_routed(content: bytes, file_name: str, mime: str, digest: str) -> Extraction:
    if MINERU_ENABLED:
        try:
            return await extract_with_mineru(content, file_name, mime, digest)
        except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
            fallback = extract_image(content, file_name, mime, digest)
            fallback.warnings.insert(0, f"mineru_fallback:{type(error).__name__}")
            return fallback
    return extract_image(content, file_name, mime, digest)


async def extract_with_mineru(content: bytes, file_name: str, mime: str, digest: str) -> Extraction:
    if MINERU_BACKEND not in {"pipeline", "hybrid-engine"}:
        raise ValueError("unsupported_mineru_backend")
    request_data = {
        "backend": MINERU_BACKEND,
        "effort": MINERU_EFFORT,
        "parse_method": "auto",
        "formula_enable": "false",
        "table_enable": "true",
        "image_analysis": "false",
        "return_md": "true",
        "return_middle_json": "false",
        "return_model_output": "false",
        "return_content_list": "true",
        "return_images": "false",
        "response_format_zip": "false",
    }
    timeout = httpx.Timeout(MINERU_TIMEOUT_SECONDS, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            f"{MINERU_API_URL}/file_parse",
            data=request_data,
            files=[("files", (file_name, content, mime))],
        )
        response.raise_for_status()
        payload = response.json()
    if payload.get("status") != "completed" or payload.get("error"):
        raise ValueError("mineru_processing_failed")
    results = payload.get("results")
    if not isinstance(results, dict) or not results:
        raise ValueError("mineru_result_missing")
    result = next(iter(results.values()))
    if not isinstance(result, dict):
        raise TypeError("mineru_result_invalid")
    markdown_warnings: list[str] = []
    markdown = bounded_text(str(result.get("md_content") or ""), markdown_warnings)
    content_list = result.get("content_list") or []
    if isinstance(content_list, str):
        content_list = json.loads(content_list)
    if not isinstance(content_list, list):
        raise TypeError("mineru_content_list_invalid")

    method = "MINERU_HYBRID" if MINERU_BACKEND == "hybrid-engine" else "MINERU_PIPELINE"
    evidence: list[Evidence] = []
    page_indexes: list[int] = []
    for index, block in enumerate(content_list):
        if not isinstance(block, dict):
            continue
        page_index = int(block.get("page_idx", 0))
        page_indexes.append(page_index)
        block_text = str(block.get("text") or block.get("table_body") or "").strip()
        if not block_text:
            continue
        evidence.append(
            Evidence(
                locator=f"page:{page_index + 1};block:{index + 1};type:{block.get('type', 'unknown')}",
                text=block_text,
                extraction_method=method,
                confidence=None,
            )
        )
    warnings: list[str] = list(markdown_warnings)
    if not markdown:
        warnings.append("mineru_without_useful_text")
    if not evidence:
        warnings.append("mineru_without_structured_evidence")
    page_count = max(page_indexes) + 1 if page_indexes else (1 if mime.startswith("image/") else None)
    return Extraction(
        document_type="PDF" if mime == "application/pdf" else "IMAGE",
        mime_type=mime,
        file_name=file_name,
        content_hash=digest,
        text=markdown,
        page_count=page_count,
        extraction_method=method,
        evidence=evidence,
        warnings=warnings,
    )


def parse_metadata(value: str) -> dict[str, Any]:
    try:
        parsed = json.loads(value)
    except (json.JSONDecodeError, TypeError) as error:
        raise HTTPException(400, "invalid_metadata") from error
    if not isinstance(parsed, dict):
        raise HTTPException(400, "invalid_metadata")
    return parsed


async def read_bounded(upload: UploadFile) -> bytes:
    content = await upload.read(MAX_FILE_BYTES + 1)
    if not content or len(content) > MAX_FILE_BYTES:
        raise HTTPException(413, "invalid_file_size")
    return content


def validate_signature(content: bytes, mime: str) -> None:
    valid = {
        "application/pdf": content.startswith(b"%PDF-"),
        "image/jpeg": content.startswith(b"\xff\xd8\xff"),
        "image/png": content.startswith(b"\x89PNG\r\n\x1a\n"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": content.startswith(b"PK\x03\x04"),
        "text/csv": b"\x00" not in content[:8192],
    }.get(mime, False)
    if not valid:
        raise HTTPException(422, "file_content_mismatch")


def extract_pdf(content: bytes, file_name: str, digest: str) -> Extraction:
    document = fitz.open(stream=content, filetype="pdf")
    if document.page_count > MAX_PDF_PAGES:
        raise HTTPException(422, "pdf_page_limit_exceeded")
    evidence: list[Evidence] = []
    warnings: list[str] = []
    methods: set[str] = set()
    for page_number, page in enumerate(document, start=1):
        native_text = normalize_text(page.get_text("text"))
        if len(native_text) >= MIN_NATIVE_TEXT_CHARS:
            text = native_text
            method = "PDF_NATIVE_TEXT"
            confidence = None
        else:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image = Image.open(io.BytesIO(pixmap.tobytes("png")))
            text, confidence = ocr_image(image)
            method = "OCR_TESSERACT"
            if not text:
                warnings.append(f"page_{page_number}_without_useful_text")
        methods.add(method)
        if text:
            evidence.append(Evidence(locator=f"page:{page_number}", text=text, extraction_method=method, confidence=confidence))
    full_text = bounded_text("\n\n".join(item.text for item in evidence), warnings)
    return Extraction(
        document_type="PDF", mime_type="application/pdf", file_name=file_name, content_hash=digest,
        text=full_text, page_count=document.page_count,
        extraction_method="HYBRID" if len(methods) > 1 else (next(iter(methods)) if methods else "NO_TEXT"),
        evidence=evidence, warnings=warnings,
    )


def extract_image(content: bytes, file_name: str, mime: str, digest: str) -> Extraction:
    image = Image.open(io.BytesIO(content))
    text, confidence = ocr_image(image)
    warnings = [] if text else ["image_without_useful_text"]
    evidence = [Evidence(locator="image:1", text=text, extraction_method="OCR_TESSERACT", confidence=confidence)] if text else []
    return Extraction(document_type="IMAGE", mime_type=mime, file_name=file_name, content_hash=digest, text=text,
                      page_count=1, extraction_method="OCR_TESSERACT", evidence=evidence, warnings=warnings)


def extract_csv(content: bytes, file_name: str, digest: str) -> Extraction:
    decoded = content.decode("utf-8-sig", errors="replace")
    rows = list(csv.reader(io.StringIO(decoded)))[:5000]
    lines = [" | ".join(cell.strip() for cell in row) for row in rows if any(cell.strip() for cell in row)]
    text = bounded_text("\n".join(lines), [])
    evidence = [Evidence(locator=f"row:{index}", text=line, extraction_method="CSV_NATIVE") for index, line in enumerate(lines, start=1)]
    return Extraction(document_type="CSV", mime_type="text/csv", file_name=file_name, content_hash=digest, text=text,
                      extraction_method="CSV_NATIVE", evidence=evidence[:1000], warnings=[])


def extract_xlsx(content: bytes, file_name: str, digest: str) -> Extraction:
    workbook = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    evidence: list[Evidence] = []
    lines: list[str] = []
    for sheet in workbook.worksheets[:20]:
        for row_index, row in enumerate(sheet.iter_rows(values_only=True), start=1):
            values = [str(value).strip() for value in row if value is not None and str(value).strip()]
            if not values:
                continue
            line = " | ".join(values)
            lines.append(line)
            if len(evidence) < 5000:
                evidence.append(Evidence(locator=f"sheet:{sheet.title};row:{row_index}", text=line, extraction_method="XLSX_NATIVE"))
            if len(lines) >= 10000:
                break
    warnings: list[str] = []
    text = bounded_text("\n".join(lines), warnings)
    return Extraction(document_type="XLSX", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      file_name=file_name, content_hash=digest, text=text, extraction_method="XLSX_NATIVE",
                      evidence=evidence, warnings=warnings)


def ocr_image(image: Image.Image) -> tuple[str, float | None]:
    normalized = ImageOps.autocontrast(ImageOps.grayscale(image))
    data = pytesseract.image_to_data(normalized, lang=OCR_LANGUAGE, config="--psm 6", output_type=pytesseract.Output.DICT)
    words: list[str] = []
    confidences: list[float] = []
    for word, raw_confidence in zip(data.get("text", []), data.get("conf", [])):
        word = str(word).strip()
        try:
            confidence = float(raw_confidence)
        except (TypeError, ValueError):
            confidence = -1
        if word:
            words.append(word)
            if confidence >= 0:
                confidences.append(confidence)
    text = normalize_text(" ".join(words))
    average = round(sum(confidences) / len(confidences) / 100, 4) if confidences else None
    return text, average


def bounded_text(value: str, warnings: list[str]) -> str:
    if len(value) <= MAX_TEXT_CHARS:
        return value
    warnings.append("text_truncated")
    return value[:MAX_TEXT_CHARS]


def normalize_text(value: str) -> str:
    return "\n".join(" ".join(line.split()) for line in value.splitlines() if line.strip())


def safe_name(value: str) -> str:
    return "".join("_" if char in "\\/\x00" or ord(char) < 32 else char for char in value)[:120]
