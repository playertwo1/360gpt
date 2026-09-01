from __future__ import annotations

import asyncio
import hashlib
import json
import sys
import time

from app.main import extract_pdf_routed


async def main(path: str) -> None:
    with open(path, "rb") as source:
        content = source.read()
    started = time.monotonic()
    result = await extract_pdf_routed(content, path.rsplit("/", 1)[-1], f"sha256:{hashlib.sha256(content).hexdigest()}")
    print(json.dumps({
        "file": result.file_name,
        "method": result.extraction_method,
        "duration_ms": round((time.monotonic() - started) * 1000),
        "page_count": result.page_count,
        "table_count": len(result.tables),
        "headers": [table.headers for table in result.tables],
        "row_counts": [len(table.rows) for table in result.tables],
        "samples": [table.rows[:3] for table in result.tables],
        "warnings": result.warnings,
    }, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
