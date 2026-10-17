

from fastapi import APIRouter, Depends, HTTPException, status,Response
from app.core.config import settings
from app.api.dependencies import get_current_user
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

# Database session provide karne ke liye
from app.db.database import get_db

# User database model
from app.models.user import User

# Request aur response validation schemas
from app.schemas.auth import (
    UserRegister,
    UserResponse,
    UserLogin,

)

# Password hashing aur JWT functions
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


# Authentication endpoints ka common router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================
# 1. USER REGISTRATION
# ==========================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    # Check karo ki email pehle se registered toh nahi
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    # Original password ko hash karke user object banao
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )

    try:
        # User ko database mein save karo
        db.add(new_user)
        db.commit()

        # Database-generated ID aur values refresh karo
        db.refresh(new_user)

        # Response schema password ko expose nahi karega
        return new_user

    except Exception:
        # Database operation fail ho toh transaction rollback karo
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not register user"
        )


# ==========================================
# 2. USER LOGIN
# ==========================================


@router.post("/login", )
def login_user(
    response:Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # OAuth2 form mein username field use hoti hai.
    # Hum username field mein user's email bhej rahe hain.
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    # User missing ho ya password incorrect ho
    if not user or not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Login successful: JWT access token generate karo
    access_token = create_access_token(
        subject=str(user.id)
    )
    response.set_cookie(

        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Local HTTP development only
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",

    )
 
    return {"message": "Login successful"}



@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    # Valid JWT se identify hua logged-in user return karo
    return current_user

@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=False,  # Local HTTP development only
        samesite="lax",
    )
    return {"message": "Logged out successfully"}
