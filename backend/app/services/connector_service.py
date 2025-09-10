import structlog
from typing import Optional, List, Dict, Any, Tuple
import uuid
import asyncio
from datetime import datetime
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceNotFoundError, ClientAuthenticationError
import requests
from requests.exceptions import RequestException

from app.models.data_source import DataSource, DataSourceType, DataSourceStatus, DataType
from app.schemas.data_source import (
    S3ConnectorConfig, AzureBlobConfig, SharePointConfig, 
    ConnectorTestResponse, DataSourceCreate
)
from app.core.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()

class ConnectorService:
    """Service for managing external data source connectors."""
    
    def __init__(self):
        self.supported_connector_types = {
            DataSourceType.S3_CONNECTOR: self._connect_s3,
            DataSourceType.AZURE_BLOB_CONNECTOR: self._connect_azure_blob,
            DataSourceType.SHAREPOINT_CONNECTOR: self._connect_sharepoint,
            DataSourceType.API_CONNECTOR: self._connect_api
        }
    
    async def test_connector(
        self, 
        connector_type: DataSourceType, 
        config: Dict[str, Any]
    ) -> ConnectorTestResponse:
        """Test connector configuration."""
        try:
            if connector_type not in self.supported_connector_types:
                raise ValueError(f"Unsupported connector type: {connector_type}")
            
            connector_func = self.supported_connector_types[connector_type]
            result = await connector_func(config, test_only=True)
            
            return ConnectorTestResponse(
                success=True,
                message="Connector test successful",
                connection_info=result.get("connection_info"),
                available_files=result.get("available_files")
            )
            
        except Exception as e:
            logger.error(f"Connector test failed for {connector_type}: {e}")
            return ConnectorTestResponse(
                success=False,
                message=f"Connector test failed: {str(e)}"
            )
    
    async def create_data_source_from_connector(
        self,
        connector_type: DataSourceType,
        config: Dict[str, Any],
        name: str,
        description: Optional[str] = None,
        user_id: Optional[uuid.UUID] = None,
        organization_id: Optional[uuid.UUID] = None,
        protected_attributes: Optional[List[str]] = None
    ) -> DataSource:
        """Create data source from external connector."""
        try:
            # Test connection first
            test_result = await self.test_connector(connector_type, config)
            if not test_result.success:
                raise ValueError(f"Connection test failed: {test_result.message}")
            
            # Create data source record
            async with AsyncSessionLocal() as session:
                data_source = DataSource(
                    name=name,
                    description=description,
                    source_type=connector_type,
                    status=DataSourceStatus.ACTIVE,
                    connection_config=config,
                    connector_metadata=test_result.connection_info,
                    protected_attributes=protected_attributes or [],
                    created_by=user_id,
                    organization_id=organization_id
                )
                
                session.add(data_source)
                await session.commit()
                await session.refresh(data_source)
                
                logger.info(f"Created data source from connector: {name}", data_source_id=str(data_source.id))
                return data_source
                
        except Exception as e:
            logger.error(f"Failed to create data source from connector: {e}")
            raise
    
    async def _connect_s3(self, config: Dict[str, Any], test_only: bool = False) -> Dict[str, Any]:
        """Connect to S3 data source."""
        try:
            s3_config = S3ConnectorConfig(**config)
            
            # Initialize S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=s3_config.access_key,
                aws_secret_access_key=s3_config.secret_key,
                region_name=s3_config.region,
                endpoint_url=s3_config.endpoint_url
            )
            
            # Test connection by listing buckets
            buckets = s3_client.list_buckets()
            
            connection_info = {
                "bucket_name": s3_config.bucket_name,
                "region": s3_config.region,
                "endpoint_url": s3_config.endpoint_url,
                "available_buckets": [bucket['Name'] for bucket in buckets.get('Buckets', [])]
            }
            
            available_files = []
            if not test_only:
                # List files in bucket
                try:
                    response = s3_client.list_objects_v2(Bucket=s3_config.bucket_name)
                    available_files = [obj['Key'] for obj in response.get('Contents', [])]
                    
                    # Filter by file path or pattern if specified
                    if s3_config.file_path:
                        available_files = [f for f in available_files if f.startswith(s3_config.file_path)]
                    if s3_config.file_pattern:
                        import fnmatch
                        available_files = [f for f in available_files if fnmatch.fnmatch(f, s3_config.file_pattern)]
                        
                except ClientError as e:
                    logger.warning(f"Could not list files in bucket {s3_config.bucket_name}: {e}")
            
            return {
                "connection_info": connection_info,
                "available_files": available_files
            }
            
        except (NoCredentialsError, ClientError) as e:
            raise ValueError(f"S3 connection failed: {str(e)}")
    
    async def _connect_azure_blob(self, config: Dict[str, Any], test_only: bool = False) -> Dict[str, Any]:
        """Connect to Azure Blob Storage."""
        try:
            azure_config = AzureBlobConfig(**config)
            
            # Initialize Blob Service Client
            blob_service_client = BlobServiceClient.from_connection_string(azure_config.connection_string)
            
            # Test connection by listing containers
            containers = blob_service_client.list_containers()
            
            connection_info = {
                "container_name": azure_config.container_name,
                "account_name": blob_service_client.account_name,
                "available_containers": [container.name for container in containers]
            }
            
            available_files = []
            if not test_only:
                # List blobs in container
                try:
                    container_client = blob_service_client.get_container_client(azure_config.container_name)
                    blobs = container_client.list_blobs()
                    available_files = [blob.name for blob in blobs]
                    
                    # Filter by file path or pattern if specified
                    if azure_config.file_path:
                        available_files = [f for f in available_files if f.startswith(azure_config.file_path)]
                    if azure_config.file_pattern:
                        import fnmatch
                        available_files = [f for f in available_files if fnmatch.fnmatch(f, azure_config.file_pattern)]
                        
                except ResourceNotFoundError as e:
                    logger.warning(f"Could not access container {azure_config.container_name}: {e}")
                except ClientAuthenticationError as e:
                    raise ValueError(f"Azure authentication failed: {str(e)}")
            
            return {
                "connection_info": connection_info,
                "available_files": available_files
            }
            
        except Exception as e:
            raise ValueError(f"Azure Blob connection failed: {str(e)}")
    
    async def _connect_sharepoint(self, config: Dict[str, Any], test_only: bool = False) -> Dict[str, Any]:
        """Connect to SharePoint."""
        try:
            sharepoint_config = SharePointConfig(**config)
            
            # Get access token using client credentials
            token_url = f"https://login.microsoftonline.com/{sharepoint_config.tenant_id}/oauth2/v2.0/token"
            token_data = {
                "client_id": sharepoint_config.client_id,
                "client_secret": sharepoint_config.client_secret,
                "scope": f"{sharepoint_config.site_url}/.default",
                "grant_type": "client_credentials"
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            
            access_token = token_response.json().get("access_token")
            
            # Test connection by accessing site
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
            
            site_response = requests.get(f"{sharepoint_config.site_url}/_api/web", headers=headers)
            site_response.raise_for_status()
            
            connection_info = {
                "site_url": sharepoint_config.site_url,
                "site_title": site_response.json().get("Title"),
                "tenant_id": sharepoint_config.tenant_id
            }
            
            available_files = []
            if not test_only:
                # List files in site
                try:
                    files_response = requests.get(
                        f"{sharepoint_config.site_url}/_api/web/GetFolderByServerRelativeUrl('Shared Documents')/Files",
                        headers=headers
                    )
                    files_response.raise_for_status()
                    
                    files_data = files_response.json()
                    available_files = [file.get("Name") for file in files_data.get("value", [])]
                    
                    # Filter by file path or pattern if specified
                    if sharepoint_config.file_path:
                        available_files = [f for f in available_files if sharepoint_config.file_path in f]
                    if sharepoint_config.file_pattern:
                        import fnmatch
                        available_files = [f for f in available_files if fnmatch.fnmatch(f, sharepoint_config.file_pattern)]
                        
                except RequestException as e:
                    logger.warning(f"Could not list files from SharePoint: {e}")
            
            return {
                "connection_info": connection_info,
                "available_files": available_files
            }
            
        except Exception as e:
            raise ValueError(f"SharePoint connection failed: {str(e)}")
    
    async def _connect_api(self, config: Dict[str, Any], test_only: bool = False) -> Dict[str, Any]:
        """Connect to API data source."""
        try:
            api_url = config.get("api_url")
            api_key = config.get("api_key")
            headers = config.get("headers", {})
            
            if not api_url:
                raise ValueError("API URL is required")
            
            # Set up headers
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
            
            # Test connection
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()
            
            connection_info = {
                "api_url": api_url,
                "status_code": response.status_code,
                "response_format": "json" if "application/json" in response.headers.get("content-type", "") else "unknown"
            }
            
            available_files = []
            if not test_only:
                # For API connectors, we don't typically have "files"
                # Instead, we might have available endpoints or datasets
                try:
                    data = response.json()
                    if isinstance(data, dict) and "data" in data:
                        available_files = ["api_response"]
                    elif isinstance(data, list):
                        available_files = ["api_response"]
                except ValueError:
                    available_files = ["api_response"]
            
            return {
                "connection_info": connection_info,
                "available_files": available_files
            }
            
        except Exception as e:
            raise ValueError(f"API connection failed: {str(e)}")
    
    async def get_connector_config_schema(self, connector_type: DataSourceType) -> Dict[str, Any]:
        """Get configuration schema for a connector type."""
        schemas = {
            DataSourceType.S3_CONNECTOR: {
                "type": "object",
                "properties": {
                    "bucket_name": {"type": "string", "description": "S3 bucket name"},
                    "access_key": {"type": "string", "description": "AWS access key"},
                    "secret_key": {"type": "string", "description": "AWS secret key"},
                    "region": {"type": "string", "description": "AWS region"},
                    "endpoint_url": {"type": "string", "description": "Custom endpoint URL (optional)"},
                    "file_path": {"type": "string", "description": "Specific file path (optional)"},
                    "file_pattern": {"type": "string", "description": "File pattern to match (optional)"}
                },
                "required": ["bucket_name", "access_key", "secret_key", "region"]
            },
            DataSourceType.AZURE_BLOB_CONNECTOR: {
                "type": "object",
                "properties": {
                    "connection_string": {"type": "string", "description": "Azure storage connection string"},
                    "container_name": {"type": "string", "description": "Container name"},
                    "file_path": {"type": "string", "description": "Specific file path (optional)"},
                    "file_pattern": {"type": "string", "description": "File pattern to match (optional)"}
                },
                "required": ["connection_string", "container_name"]
            },
            DataSourceType.SHAREPOINT_CONNECTOR: {
                "type": "object",
                "properties": {
                    "site_url": {"type": "string", "description": "SharePoint site URL"},
                    "client_id": {"type": "string", "description": "Azure AD client ID"},
                    "client_secret": {"type": "string", "description": "Azure AD client secret"},
                    "tenant_id": {"type": "string", "description": "Azure AD tenant ID"},
                    "file_path": {"type": "string", "description": "Specific file path (optional)"},
                    "file_pattern": {"type": "string", "description": "File pattern to match (optional)"}
                },
                "required": ["site_url", "client_id", "client_secret", "tenant_id"]
            },
            DataSourceType.API_CONNECTOR: {
                "type": "object",
                "properties": {
                    "api_url": {"type": "string", "description": "API endpoint URL"},
                    "api_key": {"type": "string", "description": "API key (optional)"},
                    "headers": {"type": "object", "description": "Additional headers (optional)"}
                },
                "required": ["api_url"]
            }
        }
        
        return schemas.get(connector_type, {})
    
    async def get_supported_connector_types(self) -> List[str]:
        """Get list of supported connector types."""
        return [connector_type.value for connector_type in DataSourceType if connector_type != DataSourceType.FILE_UPLOAD]