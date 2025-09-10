
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import structlog

from app.core.config import settings
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, Token, User as UserSchema

logger = structlog.get_logger()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash password."""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt
    
    async def create_user(self, user_create: UserCreate) -> User:
        """Create new user."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_create.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        existing_user = await self.get_user_by_username(user_create.username)
        if existing_user:
            raise ValueError("User with this username already exists")
        
        # Hash password
        hashed_password = self.get_password_hash(user_create.password)
        
        # Create user
        user = User(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            hashed_password=hashed_password,
            role=user_create.role,
            organization=user_create.organization,
            department=user_create.department,
            job_title=user_create.job_title,
            bio=user_create.bio,
            avatar_url=user_create.avatar_url,
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info("User created", user_id=str(user.id), username=user.username)
        return user
    
    async def authenticate_user(self, username: str, password: str) -> Optional[Token]:
        """Authenticate user and return tokens."""
        # Get user by username or email
        user = await self.get_user_by_username(username)
        if not user:
            user = await self.get_user_by_email(username)
        
        if not user or not self.verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await self.db.commit()
        
        # Create tokens
        token_data = {"sub": str(user.id), "username": user.username}
        access_token = self.create_access_token(token_data)
        refresh_token = self.create_refresh_token(token_data)
        
        logger.info("User authenticated", user_id=str(user.id), username=user.username)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def refresh_access_token(self, refresh_token: str) -> Optional[Token]:
        """Refresh access token using refresh token."""
        try:
            payload = jwt.decode(
                refresh_token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            if payload.get("type") != "refresh":
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            user = await self.get_user_by_id(user_id)
            if not user or not user.is_active:
                return None
            
            # Create new tokens
            token_data = {"sub": str(user.id), "username": user.username}
            access_token = self.create_access_token(token_data)
            new_refresh_token = self.create_refresh_token(token_data)
            
            logger.info("Access token refreshed", user_id=str(user.id))
            
            return Token(
                access_token=access_token,
                refresh_token=new_refresh_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
            
        except JWTError:
            logger.warning("Refresh token expired or invalid")
            return None
            logger.error("Invalid refresh token", error=str(e))
            return None
    
    async def logout_user(self, token: str) -> None:
        """Logout user and invalidate token."""
        # TODO: Implement token blacklisting
        logger.info("User logout attempted")
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
    
    async def create_or_update_oauth_user(self, user_data: dict, provider: str = "google") -> User:
        """Create or update user from OAuth provider."""
        email = user_data.get("email")
        if not email:
            raise ValueError("Email is required for OAuth users")
        
        # Check if user exists
        user = await self.get_user_by_email(email)
        
        if user:
            # Update existing user
            update_data = {
                "full_name": user_data.get("name", user.full_name),
                "avatar_url": user_data.get("picture", user.avatar_url),
                "is_verified": True,  # OAuth users are verified
                "is_active": True
            }
            
            for field, value in update_data.items():
                if value is not None:
                    setattr(user, field, value)
            
            await self.db.commit()
            await self.db.refresh(user)
            logger.info("OAuth user updated", user_id=str(user.id), provider=provider)
        else:
            # Create new user
            username = email.split("@")[0]
            counter = 1
            original_username = username
            
            # Ensure unique username
            while await self.get_user_by_username(username):
                username = f"{original_username}_{counter}"
                counter += 1
            
            user = User(
                email=email,
                username=username,
                full_name=user_data.get("name", ""),
                hashed_password="",  # OAuth users don't have passwords
                role="model_owner",  # Default role as string
                avatar_url=user_data.get("picture"),
                is_verified=True,
                is_active=True,
                provider=provider,
                provider_id=user_data.get("sub")  # Google's unique user ID
            )
            
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
            logger.info("OAuth user created", user_id=str(user.id), provider=provider)
        
        return user
    
    async def authenticate_oauth_user(self, user_data: dict, provider: str = "google") -> Optional[Token]:
        """Authenticate OAuth user and return tokens."""
        try:
            # Create or update user
            user = await self.create_or_update_oauth_user(user_data, provider)
            
            # Create tokens
            access_token = self.create_access_token(data={"sub": str(user.id)})
            refresh_token = self.create_refresh_token(data={"sub": str(user.id)})
            
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
            
        except Exception as e:
            logger.error("OAuth authentication failed", error=str(e))
            return None
