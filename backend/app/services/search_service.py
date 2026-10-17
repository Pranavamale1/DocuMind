
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.services.embedding_service import generate_embedding


def search_similar_chunks(
    db: Session,
    question: str,
    user_id: int,
    limit: int = 3
) -> list[dict]:

    # Step 1: Validate question
    if not question.strip():
        raise ValueError("Question cannot be empty")

    print("\n========== DOCUMIND SEARCH DEBUG ==========")
    print("DEBUG: search_similar_chunks() called")
    print(f"DEBUG: user_id = {user_id}")
    print(f"DEBUG: question = {question}")

    # Step 2: Check user's documents
    document_count = db.execute(
        text("""
            SELECT COUNT(*)
            FROM documents
            WHERE user_id = :user_id
        """),
        {"user_id": user_id}
    ).scalar()

    # Step 3: Check chunks and embeddings
    chunk_stats = db.execute(
        text("""
            SELECT
                COUNT(*) AS total_chunks,
                COUNT(dc.embedding) AS embedded_chunks
            FROM document_chunks AS dc
            JOIN documents AS d
                ON d.id = dc.document_id
            WHERE d.user_id = :user_id
        """),
        {"user_id": user_id}
    ).mappings().one()

    print(f"DEBUG: User documents = {document_count}")
    print(f"DEBUG: Total chunks = {chunk_stats['total_chunks']}")
    print(
        "DEBUG: Chunks with embeddings = "
        f"{chunk_stats['embedded_chunks']}"
    )

    # Step 4: Generate question embedding
    question_vector = generate_embedding(question)

    print(
        f"DEBUG: Question embedding dimensions = "
        f"{len(question_vector)}"
    )

    # Step 5: Convert embedding to pgvector format
    vector_text = "[" + ",".join(
        str(value) for value in question_vector
    ) + "]"

    # Step 6: Search similar chunks belonging to this user
    query = text("""
        SELECT
            dc.id,
            dc.document_id,
            d.filename AS source_filename,
            dc.chunk_index,
            dc.content,
            dc.embedding <=> CAST(:question_vector AS vector) AS distance
        FROM document_chunks AS dc
        JOIN documents AS d
            ON d.id = dc.document_id
        WHERE dc.embedding IS NOT NULL
          AND d.user_id = :user_id
        ORDER BY dc.embedding <=> CAST(:question_vector AS vector)
        LIMIT :result_limit
    """)

    # Step 7: Execute semantic search
    results = db.execute(
        query,
        {
            "question_vector": vector_text,
            "user_id": user_id,
            "result_limit": limit
        }
    ).mappings().all()

    print(f"DEBUG: Retrieved chunks = {len(results)}")

    for result in results:
        print(
            f"Document: {result['source_filename']} | "
            f"Chunk: {result['chunk_index']} | "
            f"Distance: {result['distance']:.4f}"
        )

    # Step 8: Filter results by configured distance threshold
    filtered_results = [
        dict(result)
        for result in results
        if result["distance"] <= settings.RAG_MAX_DISTANCE
    ]

    print(f"DEBUG: RAG_MAX_DISTANCE = {settings.RAG_MAX_DISTANCE}")
    print(f"DEBUG: Filtered chunks = {len(filtered_results)}")
    print("========== END SEARCH DEBUG ==========\n")

    return filtered_results
