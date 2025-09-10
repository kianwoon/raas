
# Docker Configuration for Responsible AI Platform

## Development Environment Setup

### docker-compose.yml Structure
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: rai_platform
      POSTGRES_USER: rai_user
      POSTGRES_PASSWORD: rai_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - rai_network

  # Redis for Caching and Task Queue
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - rai_network

  # MinIO for Object Storage
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - rai_network

  # Elasticsearch for Search
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - rai_network

  # Temporal for Workflow Engine
  temporal:
    image: temporalio/auto-setup:1.22
    environment:
      - DB=postgresql
      - DB_PORT=5432
      - POSTGRES_USER=rai_user
      - POSTGRES_PWD=rai_password
      - POSTGRES_SEEDS=postgres
      - DYNAMIC_CONFIG_FILE_PATH=config/dynamicconfig/development.yaml
    ports:
      - "7233:7233"
    depends_on:
      - postgres
    networks:
      - rai_network

  # immudb for Immutable Audit Storage
  immudb:
    image: codenotary/immudb:latest
    ports:
      - "3322:3322"
      - "9497:9497"
    volumes:
      - immudb_data:/var/lib/immudb
    networks:
      - rai_network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://rai_user:rai_password@postgres:5432/rai_platform
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - TEMPORAL_ADDRESS=temporal:7233
      - IMMUDB_ADDRESS=immudb:3322
      - JWT_SECRET_KEY=your-secret-key-here
      - OIDC_CLIENT_ID=your-oidc-client-id
      - OIDC_CLIENT_SECRET=your-oidc-client-secret
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./shared:/app/shared
    depends_on:
      - postgres
      - redis
      - minio
      - elasticsearch
      - temporal
      - immudb
    networks:
      - rai_network
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Celery Worker
  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://rai_user:rai_password@postgres:5432/rai_platform
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    volumes:
      - ./backend:/app
      - ./shared:/app/shared
    depends_on:
      - postgres
      - redis
    networks:
      - rai_network
    command: celery -A app.celery_app worker --loglevel=