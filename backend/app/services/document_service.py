
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader
from io import BytesIO
from fastapi import HTTPException, UploadFile

from pypdf import PdfReader

# Project root ke andar uploads directory
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"

# Maximum PDF size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024


async def save_pdf(file: UploadFile) -> tuple[str, int]:
    # Sirf PDF extension accept karo
    if Path(file.filename or "").suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )

    # File content ko memory mein unlimited load karne ke bajaye
    # chunks mein read karo aur 10 MB limit enforce karo.
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid4().hex}.pdf"
    destination = UPLOAD_DIR / stored_name
    total_size = 0

    try:
        with destination.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="PDF must be 10 MB or smaller"
                    )

                output.write(chunk)

        if total_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )

        return stored_name, total_size

    except Exception:
        # Failed upload par incomplete file delete karo
        destination.unlink(missing_ok=True)
        raise

    finally:
        await file.close()



def extract_pdf_text(file_path: Path) -> str:
    """Saved PDF se readable text extract karta hai."""

    try:
        reader = PdfReader(str(file_path))
        extracted_pages = []

        for page in reader.pages:
            page_text = page.extract_text() or ""
            extracted_pages.append(page_text)

        full_text = "\n\n".join(extracted_pages).strip()

        if not full_text:
            raise HTTPException(
                status_code=422,
                detail="No readable text found in PDF"
            )

        return full_text

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Could not read this PDF file"
        )


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50
) -> list[str]:
    """
    Text ko chhote chunks mein divide karta hai.
    chunk_size = har chunk mein maximum 500 characters
    overlap = consecutive chunks mein 50 characters repeat
    """

    # Empty text ya invalid settings check karo
    if not text.strip():
        return []

    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise ValueError(
            "overlap must be non-negative and smaller than chunk_size"
        )

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # Current text ka chunk banao
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        # Next chunk mein overlap maintain karo
        start += chunk_size - overlap

    return chunks
