from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from app.services.google_oauth_service import GoogleOAuthService

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    auth_service = AuthService(db)
    user = await auth_service.create_user(user_create)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login user and return access token."""
    auth_service = AuthService(db)
    token = await auth_service.authenticate_user(
        form_data.username,
        form_data.password
    )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    auth_service = AuthService(db)
    token = await auth_service.refresh_access_token(refresh_token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.post("/logout")
async def logout(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Logout user and invalidate token."""
    auth_service = AuthService(db)
    await auth_service.logout_user(token)
    return {"message": "Successfully logged out"}


@router.get("/google/callback")
async def google_oauth_callback(
    request: Request,
    code: str,
    state: str = None,
    error: str = None,
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback."""
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {error}"
        )
    
    try:
        # Initialize OAuth service
        oauth_service = GoogleOAuthService()
        auth_service = AuthService(db)
        
        # Exchange code for tokens
        tokens = await oauth_service.exchange_code_for_tokens(code)
        
        # Verify ID token and get user info
        id_info = await oauth_service.verify_id_token(tokens["id_token"])
        
        # Get additional user info
        user_info = await oauth_service.get_user_info(tokens["access_token"])
        
        # Combine user data
        user_data = {
            "sub": id_info["sub"],
            "email": id_info["email"],
            "name": id_info.get("name", ""),
            "picture": id_info.get("picture", ""),
            "email_verified": id_info.get("email_verified", False)
        }
        
        # Authenticate user and create JWT tokens
        token = await auth_service.authenticate_oauth_user(user_data, "google")
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate user"
            )
        
        # Redirect back to frontend with tokens
        frontend_url = "http://localhost:3001"
        token_params = {
            "access_token": token.access_token,
            "refresh_token": token.refresh_token,
            "token_type": token.token_type,
            "expires_in": token.expires_in,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data["picture"]
        }
        
        redirect_url = f"{frontend_url}/auth/success?{'&'.join(f'{k}={v}' for k, v in token_params.items())}"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth authentication failed: {str(e)}"
        )


@router.get("/google/authorize")
async def google_oauth_authorize():
    """Get Google OAuth authorization URL."""
    try:
        oauth_service = GoogleOAuthService()
        auth_url = oauth_service.get_authorization_url()
        return {"authorization_url": auth_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authorization URL: {str(e)}"
        )