
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

# Common Base class import
from app.db.base import Base


class User(Base):
    # PostgreSQL table ka naam
    __tablename__ = "users"

    # Unique user ID
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # User ka full name
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # Har user ka email unique hona chahiye
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    # Password ka hash store hoga, original password nahi
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # Account creation ka timestamp
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
