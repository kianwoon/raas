# MinIO Docker Setup

This directory contains a separate Docker Compose configuration for running MinIO object storage.

## Why Separate MinIO?

MinIO is separated from the main application to:
- Keep the main docker-compose.yml cleaner and more focused
- Allow MinIO to be optional (the app can run without it)
- Make it easier to scale or manage storage independently
- Reduce resource usage when MinIO is not needed

## Quick Start

To start MinIO:

```bash
docker-compose -f docker-compose.minio.yml up -d
```

To stop MinIO:

```bash
docker-compose -f docker-compose.minio.yml down
```

## Accessing MinIO

Once started, MinIO will be available at:

- **API Endpoint**: http://localhost:9000
- **Console (Web UI)**: http://localhost:9001
- **Username**: minioadmin
- **Password**: minioadmin

## Integration with Main Application

The main application is configured to use MinIO at `minio:9000` (Docker internal hostname). When you start the MinIO container, it will join the same Docker network as the main application.

## Volume Management

MinIO data is persisted in the `minio_data` volume. To remove all data:

```bash
docker-compose -f docker-compose.minio.yml down -v
```

## Health Checks

The MinIO container includes health checks that monitor the API endpoint. You can check the status:

```bash
docker ps | grep raas-minio
```

## Troubleshooting

If you encounter connection issues:

1. Ensure MinIO is running: `docker-compose -f docker-compose.minio.yml ps`
2. Check logs: `docker-compose -f docker-compose.minio.yml logs minio`
3. Verify port availability: `netstat -an | grep 9000`
4. Check network connectivity: `docker exec raas-app ping minio`

## Configuration

You can modify MinIO settings in `docker-compose.minio.yml`:

- Change credentials by updating environment variables
- Modify ports if there are conflicts
- Adjust storage volume location if needed
- Change resource limits (CPU/memory) for production use