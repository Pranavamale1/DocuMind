
from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    status,
    HTTPException,
)
from app.services.embedding_service import generate_embeddings
from sqlalchemy.orm import Session
from pathlib import Path
from app.db.database import get_db
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.user import User

from app.api.dependencies import get_current_user

from app.schemas.document import (
    DocumentResponse,
    DocumentSearchRequest,
    DocumentSearchResponse,
)

from app.services.document_service import (
    save_pdf,
    extract_pdf_text,
    chunk_text,
    UPLOAD_DIR,
)

from app.services.search_service import search_similar_chunks
from app.services.llm_service import generate_answer


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# -----------------------------------------------
# Upload PDF
# -----------------------------------------------
@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # PDF validate karke disk par save karo
    stored_name, file_size = await save_pdf(file)

    # Saved PDF ka actual path
    file_path = UPLOAD_DIR / stored_name

    # PDF se text extract karo
    extracted_text = extract_pdf_text(file_path)

    print(f"Extracted text length: {len(extracted_text)} characters")
    print(f"Extracted text preview: {extracted_text[:200]}")

    # Extracted text ko chunks mein divide karo
    chunks = chunk_text(extracted_text)

    print(f"Total chunks created: {len(chunks)}")

    if chunks:
        print(f"First chunk preview: {chunks[0][:200]}")

    # Document metadata mein logged-in user ki ID save karo
    document = Document(
        user_id=current_user.id,
        filename=file.filename or stored_name,
         stored_filename=stored_name,            # Actual UUID filename
        file_size=file_size
    )

    try:
        # Document database mein add karo
        db.add(document)
        db.flush()  # Document ki ID generate hogi

        # Har chunk ko document ID ke saath link karo
        embeddings = generate_embeddings(chunks)
        chunk_records = [
    DocumentChunk(
        document_id=document.id,
        chunk_index=index,
        content=chunk,
        embedding=embedding
    )
    for index, (chunk, embedding) in enumerate(
        zip(chunks, embeddings)
    )
]

        print(f"DEBUG: Chunks prepared for saving = {len(chunk_records)}")

        # Saare chunks database mein add karo
        db.add_all(chunk_records)

        # Document aur chunks commit karo
        db.commit()
        db.refresh(document)

        print(f"Saved {len(chunk_records)} chunks to database")

        return document

    except Exception:
        db.rollback()
        raise


# -----------------------------------------------
# Semantic Search + Gemini AI Answer
# -----------------------------------------------


@router.post(
    "/search",
    response_model=DocumentSearchResponse
)
def search_documents(
    request: DocumentSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = request.question.strip()
    normalized = question.lower().strip("!.,? ")

    # Convert recent conversation into text for Gemini
    history_text = "\n".join(
        f"{message.role}: {message.content}"
        for message in request.chat_history[-12:]
    )

    # Simple greetings can be answered directly
    greetings = {
        "hi", "hello", "hey", "hii", "hiii",
        "good morning", "good afternoon", "good evening",
        "how are you", "how are you doing",
        "what's up", "whats up"
    }

    if normalized in greetings:
        return {
            "question": question,
            "answer": (
                "Hello! 👋 I'm DocuMind, your AI document assistant. "
                "I can summarize PDFs, find key points, answer questions "
                "about your documents, and explain concepts. "
                "What would you like to explore?"
            ),
            "results": []
        }

    # Identify broad document-summary requests
    summary_phrases = (
        "summarize", "summary", "key points", "main points",
        "important points", "overview", "summarise",
        "summarize my document", "summarize my resume",
        "explain this document", "explain the document",
        "what is this document about", "what is this pdf about",
        "find key points", "important topics"
    )

    wants_summary = any(
        phrase in normalized for phrase in summary_phrases
    )

    # Search semantically for specific questions
    results = search_similar_chunks(
        db=db,
        question=question,
        user_id=current_user.id,
        limit=request.limit
    )

    # For broad summaries, or when semantic search finds nothing,
    # load the user's document chunks as a recovery strategy.
    fallback_chunks = []

    if wants_summary or not results:
        fallback_chunks = (
            db.query(DocumentChunk, Document.filename)
            .join(
                Document,
                Document.id == DocumentChunk.document_id
            )
            .filter(Document.user_id == current_user.id)
            .order_by(
                Document.id,
                DocumentChunk.chunk_index
            )
            .limit(40)
            .all()
        )

    if wants_summary or not results:
        context_parts = [
            chunk.content
            for chunk, filename in fallback_chunks
            if chunk.content and chunk.content.strip()
        ]

        context = "\n\n".join(context_parts)

        # Return source metadata for the chunks used as fallback
        if fallback_chunks:
            results = [
                {
                    "document_id": chunk.document_id,
                    "source_filename": filename,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "distance": 1.0
                }
                for chunk, filename in fallback_chunks
                if chunk.content and chunk.content.strip()
            ]
    else:
        context = "\n\n".join(
            result["content"]
            for result in results
            if result.get("content")
        )

    # Gemini can still answer general questions without PDF context.
    # For document-specific questions, the prompt must not invent facts.
    try:
        answer = generate_answer(
            question=question,
            context=context,
            chat_history=history_text
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        ) from exc

    return {
        "question": question,
        "answer": answer,
        "results": results
    }



# -----------------------------------------------
# List logged-in user's documents
# -----------------------------------------------
@router.get(
    "",
    response_model=list[DocumentResponse]
)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Sirf current user ke documents fetch karo
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )

    return documents


# -----------------------------------------------
# Delete a user's document

@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Sirf current user ka document find karo
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Actual UUID filename se PDF ka path banao
    pdf_path = (
        UPLOAD_DIR / document.stored_filename
        if document.stored_filename
        else None
    )

    # Pehle database records delete karo
    try:
        db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document.id
        ).delete(synchronize_session=False)

        db.delete(document)
        db.commit()

    except Exception:
        db.rollback()
        raise

    # Database commit ke baad physical PDF delete karo
    if pdf_path is not None:
        try:
            pdf_path.unlink(missing_ok=True)
        except OSError:
            # Database deletion ho chuki hai;
            # disk cleanup failure terminal mein log karo.
            print(f"Warning: Could not delete PDF file: {pdf_path}")

    return None
