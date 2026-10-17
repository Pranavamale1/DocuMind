
# SQLAlchemy database session ke liye
from sqlalchemy.orm import Session

# Database mein saved document chunks ke liye
from app.models.document_chunk import DocumentChunk

# Embeddings generate karne wali service
from app.services.embedding_service import generate_embeddings
# Document model load karo taaki SQLAlchemy foreign key resolve kar sake
from app.models.document import Documents


def generate_and_save_embeddings(db: Session) -> int:
    """
    Database mein un chunks ke embeddings generate karta hai
    jinke embedding column mein abhi value nahi hai.
    """

    # Sirf un chunks ko fetch karo jinke embeddings missing hain
    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.embedding.is_(None))
        .order_by(
            DocumentChunk.document_id,
            DocumentChunk.chunk_index
        )
        .all()
    )

    # Agar koi pending chunk nahi hai, toh kaam khatam
    if not chunks:
        return 0

    # Saare chunk texts ki list banao
    texts = [chunk.content for chunk in chunks]

    # Local embedding model se vectors generate karo
    vectors = generate_embeddings(texts)

    try:
        # Har vector ko uske corresponding chunk se associate karo
        for chunk, vector in zip(chunks, vectors):
            chunk.embedding = vector

        # Saare embeddings database mein save karo
        db.commit()

        return len(chunks)

    except Exception:
        # Error aane par database changes rollback karo
        db.rollback()
        raise
