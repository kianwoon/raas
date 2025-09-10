
# Responsible AI Platform - Development Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm/yarn
- Python 3.11+ and pip
- Git

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd rai-platform

# Create environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start infrastructure services
docker-compose up -d postgres redis minio elasticsearch temporal immudb

# Setup database
cd backend
alembic upgrade head
```

### 2. Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run Celery worker (separate terminal)
celery -A app.celery_app worker --loglevel=info
```

### 3. Frontend Development
```bash
cd frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical fixes

### Code Standards
- **Frontend**: ESLint, Prettier, TypeScript strict mode
- **Backend**: Black, isort, mypy, pylint
- **Commits**: Conventional commits format
- **PRs**: Require reviews, pass all tests

### Testing Strategy
- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows
- **Performance Tests**: Load testing

## Project Structure Details

### Frontend Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public routes
│   │   ├── (admin)/           # Admin routes
│   │   ├── (auditor)/         # Auditor routes
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── assessment/        # Assessment components
│   │   ├── diagnostics/       # Diagnostics components
│   │   └── common/            # Shared components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/                    # Static assets
└── tests/                     # Test files
```

### Backend Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── models/        # Model management
│   │   │   ├── assessments/   # Assessment endpoints
│   │   │   ├── diagnostics/   # Diagnostics endpoints
│   │   │   └── disclosures/   # Disclosure endpoints
│   │   └── dependencies.py    # FastAPI dependencies
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   ├── security.py        # Security utilities
│   │   └── database.py        # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   ├── model.py           # AI Model model
│   │   ├── assessment.py      # Assessment model
│   │   └── evidence.py        # Evidence model
│   ├── schemas/
│   │   ├── user.py            # User schemas
│   │   ├── model.py           # Model schemas
│   │   └── assessment.py      # Assessment schemas
│   ├── services/
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── assessment_service.py # Assessment business logic
│   │   └── diagnostics_service.py # Diagnostics logic
│   ├── utils/
│   │   ├── fairness_metrics.py # Fairness calculations
│   │   ├── explainability.py  # SHAP and other explanations
│   │   └── audit_logger.py    # Audit logging
│   └── main.py                # FastAPI app entry point
├── alembic/                   # Database migrations
├── tests/                     # Test files
└── requirements.txt           # Python dependencies
```

## Key Features Implementation