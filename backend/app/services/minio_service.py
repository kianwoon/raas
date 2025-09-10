from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import structlog
import os
from typing import Optional, List, Dict, Any
from datetime import datetime
import io

logger = structlog.get_logger()

class MinioService:
    """Service for managing MinIO file storage operations."""
    
    def __init__(self):
        self.client = None
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._initialized = False
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize MinIO client lazily."""
        if not self._initialized:
            try:
                self.client = Minio(
                    settings.MINIO_ENDPOINT,
                    access_key=settings.MINIO_ACCESS_KEY,
                    secret_key=settings.MINIO_SECRET_KEY,
                    secure=settings.MINIO_SECURE
                )
                self._ensure_bucket_exists()
                self._initialized = True
            except Exception as e:
                logger.warning(f"Failed to initialize MinIO client: {e}")
                self.client = None
    
    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create it if it doesn't."""
        try:
            if self.client and not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
        except Exception as e:
            logger.error(f"Failed to ensure bucket exists: {e}")
            # Don't raise - allow application to start without MinIO
    
    def upload_file(self, file_path: str, object_name: str, content_type: Optional[str] = None) -> str:
        """Upload a file to MinIO and return the URL."""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Determine content type
            if content_type is None:
                content_type = self._get_content_type(object_name)
            
            # Upload file
            self.client.fput_object(
                self.bucket_name,
                object_name,
                file_path,
                content_type=content_type
            )
            
            # Generate URL
            url = self._get_object_url(object_name)
            logger.info(f"Uploaded file to MinIO: {object_name}")
            return url
            
        except S3Error as e:
            logger.error(f"Failed to upload file {file_path}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error uploading file {file_path}: {e}")
            raise
    
    def upload_file_content(self, content: bytes, object_name: str, content_type: Optional[str] = None) -> str:
        """Upload file content directly to MinIO and return the URL."""
        try:
            # Determine content type
            if content_type is None:
                content_type = self._get_content_type(object_name)
            
            # Create a file-like object from bytes
            content_stream = io.BytesIO(content)
            
            # Upload content
            self.client.put_object(
                self.bucket_name,
                object_name,
                content_stream,
                length=len(content),
                content_type=content_type
            )
            
            # Generate URL
            url = self._get_object_url(object_name)
            logger.info(f"Uploaded content to MinIO: {object_name}")
            return url
            
        except S3Error as e:
            logger.error(f"Failed to upload content for {object_name}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error uploading content for {object_name}: {e}")
            raise
    
    def download_file(self, object_name: str, file_path: str) -> None:
        """Download a file from MinIO."""
        try:
            self.client.fget_object(self.bucket_name, object_name, file_path)
            logger.info(f"Downloaded file from MinIO: {object_name}")
        except S3Error as e:
            logger.error(f"Failed to download file {object_name}: {e}")
            raise
    
    def download_file_content(self, object_name: str) -> bytes:
        """Download file content from MinIO as bytes."""
        try:
            response = self.client.get_object(self.bucket_name, object_name)
            content = response.read()
            response.close()
            response.release_conn()
            return content
        except S3Error as e:
            logger.error(f"Failed to download content for {object_name}: {e}")
            raise
    
    def delete_file(self, object_name: str) -> None:
        """Delete a file from MinIO."""
        try:
            self.client.remove_object(self.bucket_name, object_name)
            logger.info(f"Deleted file from MinIO: {object_name}")
        except S3Error as e:
            logger.error(f"Failed to delete file {object_name}: {e}")
            raise
    
    def list_files(self, prefix: str = "") -> List[Dict[str, Any]]:
        """List files in MinIO bucket with optional prefix."""
        try:
            objects = self.client.list_objects(self.bucket_name, prefix=prefix)
            files = []
            
            for obj in objects:
                files.append({
                    "name": obj.object_name,
                    "size": obj.size,
                    "last_modified": obj.last_modified,
                    "etag": obj.etag,
                    "url": self._get_object_url(obj.object_name)
                })
            
            return files
        except S3Error as e:
            logger.error(f"Failed to list files with prefix {prefix}: {e}")
            raise
    
    def file_exists(self, object_name: str) -> bool:
        """Check if a file exists in MinIO."""
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error as e:
            if e.code == "NoSuchKey":
                return False
            logger.error(f"Failed to check if file exists {object_name}: {e}")
            raise
    
    def get_file_info(self, object_name: str) -> Dict[str, Any]:
        """Get file information from MinIO."""
        try:
            stat = self.client.stat_object(self.bucket_name, object_name)
            return {
                "name": stat.object_name,
                "size": stat.size,
                "last_modified": stat.last_modified,
                "etag": stat.etag,
                "content_type": stat.content_type,
                "url": self._get_object_url(object_name)
            }
        except S3Error as e:
            logger.error(f"Failed to get file info for {object_name}: {e}")
            raise
    
    def generate_presigned_url(self, object_name: str, expires: int = 3600) -> str:
        """Generate a presigned URL for downloading a file."""
        try:
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=expires
            )
            return url
        except S3Error as e:
            logger.error(f"Failed to generate presigned URL for {object_name}: {e}")
            raise
    
    def _get_object_url(self, object_name: str) -> str:
        """Generate a URL for an object."""
        protocol = "https" if settings.MINIO_SECURE else "http"
        return f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{object_name}"
    
    def _get_content_type(self, filename: str) -> str:
        """Determine content type based on file extension."""
        extension = filename.lower().split('.')[-1] if '.' in filename else ''
        
        content_types = {
            'pdf': 'application/pdf',
            'json': 'application/json',
            'csv': 'text/csv',
            'txt': 'text/plain',
            'ipynb': 'application/x-ipynb+json',
            'pkl': 'application/octet-stream',
            'pickle': 'application/octet-stream',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'py': 'text/plain',
            'md': 'text/markdown',
        }
        
        return content_types.get(extension, 'application/octet-stream')
    
    def upload_job_artifacts(self, job_id: str, artifacts: List[Dict[str, Any]]) -> List[str]:
        """Upload multiple artifacts for a job and return their URLs."""
        urls = []
        
        for artifact in artifacts:
            try:
                artifact_name = artifact.get("name", f"artifact_{len(urls)}")
                artifact_path = artifact.get("path")
                artifact_content = artifact.get("content")
                content_type = artifact.get("content_type")
                
                if artifact_path:
                    # Upload from file path
                    object_name = f"jobs/{job_id}/{artifact_name}"
                    url = self.upload_file(artifact_path, object_name, content_type)
                elif artifact_content:
                    # Upload from content
                    object_name = f"jobs/{job_id}/{artifact_name}"
                    url = self.upload_file_content(artifact_content, object_name, content_type)
                else:
                    logger.warning(f"Artifact missing path and content: {artifact_name}")
                    continue
                
                urls.append(url)
                
            except Exception as e:
                logger.error(f"Failed to upload artifact {artifact}: {e}")
                continue
        
        return urls
    
    def download_job_artifacts(self, job_id: str, download_dir: str) -> List[str]:
        """Download all artifacts for a job to a directory."""
        if not os.path.exists(download_dir):
            os.makedirs(download_dir)
        
        prefix = f"jobs/{job_id}/"
        files = self.list_files(prefix)
        downloaded_files = []
        
        for file_info in files:
            try:
                object_name = file_info["name"]
                filename = object_name.split("/")[-1]
                file_path = os.path.join(download_dir, filename)
                
                self.download_file(object_name, file_path)
                downloaded_files.append(file_path)
                
            except Exception as e:
                logger.error(f"Failed to download artifact {object_name}: {e}")
                continue
        
        return downloaded_files
    
    def delete_job_artifacts(self, job_id: str) -> None:
        """Delete all artifacts for a job."""
        prefix = f"jobs/{job_id}/"
        files = self.list_files(prefix)
        
        for file_info in files:
            try:
                object_name = file_info["name"]
                self.delete_file(object_name)
            except Exception as e:
                logger.error(f"Failed to delete artifact {object_name}: {e}")
                continue