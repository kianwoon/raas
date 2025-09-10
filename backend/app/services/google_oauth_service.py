import json
from typing import Optional, Dict, Any
import requests
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from google.auth.exceptions import GoogleAuthError

from app.core.config import settings
from app.schemas.user import UserCreate
from app.models.user import User, UserRole


class GoogleOAuthService:
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.token_url = "https://oauth2.googleapis.com/token"
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    
    def get_authorization_url(self) -> str:
        """Generate Google OAuth authorization URL."""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "email profile openid",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        auth_url = f"{self.auth_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
        return auth_url
    
    async def exchange_code_for_tokens(self, code: str) -> Dict[str, str]:
        """Exchange authorization code for access token and ID token."""
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        try:
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            tokens = response.json()
            
            return {
                "access_token": tokens.get("access_token"),
                "refresh_token": tokens.get("refresh_token"),
                "id_token": tokens.get("id_token"),
                "token_type": tokens.get("token_type"),
                "expires_in": tokens.get("expires_in")
            }
        except requests.RequestException as e:
            raise Exception(f"Failed to exchange code for tokens: {str(e)}")
    
    async def verify_id_token(self, id_token_str: str) -> Dict[str, Any]:
        """Verify Google ID token and return user info."""
        try:
            # Verify the ID token
            id_info = google_id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                self.client_id
            )
            
            # Check if the issuer is correct
            if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Invalid issuer")
            
            return id_info
            
        except (ValueError, GoogleAuthError) as e:
            raise Exception(f"Failed to verify ID token: {str(e)}")
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user info from Google People API."""
        try:
            # Get user info from Google
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            response = requests.get(user_info_url, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            raise Exception(f"Failed to get user info: {str(e)}")
    
    def create_user_from_google_info(self, google_info: Dict[str, Any]) -> UserCreate:
        """Create UserCreate object from Google user info."""
        return UserCreate(
            email=google_info.get("email", ""),
            username=google_info.get("email", "").split("@")[0],
            password="",  # OAuth users don't have passwords
            first_name=google_info.get("given_name", ""),
            last_name=google_info.get("family_name", ""),
            is_active=True,
            is_verified=True  # Google verified emails
        )
    
    def get_default_role(self) -> UserRole:
        """Get default role for OAuth users."""
        return UserRole.model_owner