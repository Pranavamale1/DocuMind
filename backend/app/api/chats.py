
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.chat import Chat, ChatMessage
from app.models.user import User

router = APIRouter(prefix="/chats", tags=["Chats"])


class ChatCreate(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=200)


class MessageCreate(BaseModel):
    role: str
    content: str = Field(min_length=1)


def owned_chat(db: Session, chat_id: int, user_id: int):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.user_id == user_id)
        .first()
    )
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.post("", status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: ChatCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = Chat(user_id=user.id, title=payload.title.strip() or "New Chat")
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at,
        "updated_at": chat.updated_at,
    }


@router.get("")
def list_chats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.updated_at.desc(), Chat.id.desc())
        .all()
    )
    return [
        {
            "id": chat.id,
            "title": chat.title,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
        }
        for chat in chats
    ]


@router.get("/{chat_id}")
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = owned_chat(db, chat_id, user.id)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat.id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )
    return {
        "id": chat.id,
        "title": chat.title,
        "messages": [
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at,
            }
            for message in messages
        ],
    }


@router.post("/{chat_id}/messages", status_code=status.HTTP_201_CREATED)
def add_message(
    chat_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.role not in {"user", "assistant"}:
        raise HTTPException(status_code=422, detail="Invalid message role")

    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    chat = owned_chat(db, chat_id, user.id)

    try:
        message = ChatMessage(
            chat_id=chat.id,
            role=payload.role,
            content=content,
        )
        db.add(message)

        if payload.role == "user" and chat.title == "New Chat":
            chat.title = content[:80]

        chat.updated_at = datetime.now().astimezone()
        db.commit()
        db.refresh(message)
        db.refresh(chat)

        return {
            "id": message.id,
            "chat_id": chat.id,
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at,
        }
    except Exception:
        db.rollback()
        raise


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chat = owned_chat(db, chat_id, user.id)
    try:
        db.query(ChatMessage).filter(
            ChatMessage.chat_id == chat.id
        ).delete(synchronize_session=False)
        db.delete(chat)
        db.commit()
    except Exception:
        db.rollback()
        raise
