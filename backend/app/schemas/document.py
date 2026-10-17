
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class DocumentSearchRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    limit: int = Field(default=5, ge=1, le=10)
    chat_history: list[ChatMessage] = Field(
        default_factory=list,
        max_length=12
    )


class SearchResult(BaseModel):
    document_id: int
    source_filename: str
    chunk_index: int
    content: str
    distance: float


class DocumentSearchResponse(BaseModel):
    question: str
    answer: str
    results: list[SearchResult]
