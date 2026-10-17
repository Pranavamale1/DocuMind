
from datetime import datetime
# PostgreSQL pgvector column type ke liye
from pgvector.sqlalchemy import Vector
from app.services.embedding_service import generate_embeddings

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DocumentChunk(Base):
    # PostgreSQL table ka naam
    __tablename__ = "document_chunks"

    # Har chunk ki unique ID
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Ye chunk kis document ka hai
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Document ke andar chunk ka sequence number
    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    # Actual extracted text
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Text chunk ka 384-dimensional embedding vector
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(384),
        nullable=True
    )

    # Chunk kab create hua
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Ek document mein chunk_index repeat nahi hona chahiye
    __table_args__ = (
        UniqueConstraint(
            "document_id",
            "chunk_index",
            name="uq_document_chunk_index"
        ),
    )
