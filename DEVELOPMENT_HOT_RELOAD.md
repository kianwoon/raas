# Hot Reload Development Guide

## Overview
This guide explains how to use the hot reloading feature for both frontend and backend development, allowing code changes to take effect immediately without restarting the servers.

## Backend Hot Reload (FastAPI)

### How it works
- FastAPI uses `uvicorn` with the `--reload` flag
- The `--reload-dir /app` parameter specifies which directory to watch for changes
- Any changes to Python files in the `/app` directory will trigger automatic restart

### Configuration
The backend is configured with:
```yaml
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir /app
```

### Volume Mounting
The Docker container mounts your local backend directory:
```yaml
volumes:
  - ./backend:/app
  - ./shared:/app/shared
```

### What triggers reload
- Changes to any `.py` files in the backend directory
- Changes to requirements.txt (manual restart required for new dependencies)
- Changes to configuration files

### Development workflow
1. Make changes to your Python code
2. Save the file
3. FastAPI will automatically detect the change and restart
4. The restart typically takes 1-2 seconds
5. Your API will be available at the same endpoint with the new code

## Frontend Hot Reload (Next.js)

### How it works
- Next.js has built-in hot module replacement (HMR)
- The development server watches for file changes
- Changes are applied instantly without full page refresh

### Configuration
The frontend is configured with:
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
command: npm run dev
```

### Volume Mounting
The Docker container mounts your local frontend directory:
```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules
  - /app/.next
```

### What triggers reload
- Changes to React components (`.tsx`, `.ts` files)
- Changes to CSS/Tailwind classes
- Changes to API routes
- Changes to configuration files

### Development workflow
1. Make changes to your React/TypeScript code
2. Save the file
3. Next.js will automatically apply the changes
4. The browser will update instantly without losing state
5. Your application will reflect the changes immediately

## Starting Development

### Using Docker Compose (Recommended)
```bash
# Start all services with hot reload
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Backend only
docker-compose up -d app

# Frontend only  
docker-compose up -d web

# View specific service logs
docker-compose logs -f app
docker-compose logs -f web
```

## Troubleshooting Hot Reload

### Backend not reloading
1. Check if the `--reload` flag is present in the command
2. Verify volume mounting is correct
3. Check Docker logs: `docker-compose logs app`
4. Ensure file permissions allow Docker to watch files

### Frontend not reloading
1. Check if `CHOKIDAR_USEPOLLING=true` is set
2. Verify volume mounting excludes `node_modules` and `.next`
3. Check Docker logs: `docker-compose logs web`
4. Try clearing Next.js cache: `rm -rf frontend/.next`

### Performance issues
- Hot reload may be slower in Docker compared to native development
- Consider using native development for faster iteration during intensive development
- Use Docker for consistent environment testing

## Best Practices

1. **File organization**: Keep related files together to minimize reload scope
2. **State management**: Use React state management to preserve state during reloads
3. **Error handling**: Add proper error boundaries to handle reload failures gracefully
4. **Testing**: Test both hot reload scenarios regularly
5. **Documentation**: Document any special reload behaviors in your code

## Development Tips

### Backend
- Use `print()` statements or logging for debugging - they'll appear in Docker logs
- Test API endpoints using the Swagger UI at `http://localhost:8000/api/docs`
- Use the health check endpoint to verify the service is running

### Frontend
- Use React Developer Tools for debugging
- Check the browser console for hot reload messages
- Use the Network tab to monitor API calls to the backend

## Switching to Production
When ready for production, the hot reload features are automatically disabled:
- Backend: Remove `--reload` flag
- Frontend: Use `npm run build` and `npm start` instead of `npm run dev`
- Environment: Set `ENVIRONMENT=production`