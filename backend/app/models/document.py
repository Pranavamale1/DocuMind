
from datetime import datetime

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    BigInteger,
    func
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Document(Base):
    # PostgreSQL table ka naam
    __tablename__ = "documents"

    # Har document ki unique ID
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Document upload karne wale user ki ID
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # User ko dikhne wala original filename
    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # Disk par save hui actual UUID filename
    # Nullable rakha hai taaki existing records kaam karte rahein
    stored_filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    # File ka size bytes mein
    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )

    # Document create hone ka timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
