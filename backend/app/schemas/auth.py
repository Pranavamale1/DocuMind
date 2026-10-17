
from pydantic import BaseModel, EmailStr, Field


# Registration request mein user se aane wala data
class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# Successful registration par client ko kya response dena hai
# Ismein password ya password hash expose nahi hoga
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


# Login request mein user ka email aur password aayega
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# Successful login par token ka response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
